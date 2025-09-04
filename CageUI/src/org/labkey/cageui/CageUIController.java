/*
 *
 *  * Copyright (c) 2025 Board of Regents of the University of Wisconsin System
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *     http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
 */

package org.labkey.cageui;

import org.json.JSONArray;
import org.json.JSONObject;
import org.labkey.api.action.ApiSimpleResponse;
import org.labkey.api.action.MutatingApiAction;
import org.labkey.api.action.SimpleApiJsonForm;
import org.labkey.api.action.SimpleViewAction;
import org.labkey.api.action.SpringActionController;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.DbScope;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.DuplicateKeyException;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.QueryUpdateServiceException;
import org.labkey.api.query.UserSchema;
import org.labkey.api.query.ValidationException;
import org.labkey.api.security.RequiresAnyOf;
import org.labkey.api.security.RequiresPermission;
import org.labkey.api.security.permissions.ReadPermission;
import org.labkey.api.util.JsonUtil;
import org.labkey.api.view.JspView;
import org.labkey.api.view.NavTree;
import org.labkey.cageui.action.CageModificationHistoryForm;
import org.labkey.cageui.security.permissions.CageUILayoutEditorAccessPermission;
import org.labkey.cageui.security.permissions.CageUIRoomCreatorPermission;
import org.labkey.cageui.security.permissions.CageUITemplateCreatorPermission;
import org.springframework.validation.BindException;
import org.springframework.validation.Errors;
import org.springframework.web.servlet.ModelAndView;

import java.sql.SQLException;
import java.util.Date;
import java.util.List;
import java.util.Map;

public class CageUIController extends SpringActionController
{
    private static final DefaultActionResolver _actionResolver = new DefaultActionResolver(CageUIController.class);
    public static final String NAME = "cageui";

    public CageUIController()
    {
        setActionResolver(_actionResolver);
    }

    @RequiresPermission(ReadPermission.class)
    public class BeginAction extends SimpleViewAction
    {
        public ModelAndView getView(Object o, BindException errors)
        {
            return new JspView("/org/labkey/cageui/view/hello.jsp");
        }

        public void addNavTrail(NavTree root) { }
    }


    //APIs here

    // this api action saves cage modification history from the layout editor to initiate the default cage mods
    @RequiresAnyOf({CageUILayoutEditorAccessPermission.class, CageUIRoomCreatorPermission.class, CageUITemplateCreatorPermission.class})
    public static class SaveCageModificationHistoryLayoutEditorAction extends MutatingApiAction<SimpleApiJsonForm>
    {

        @Override
        public void validateForm(SimpleApiJsonForm form, Errors errors)
        {
            /*if (form.getRoom().isEmpty())
            {
                errors.reject(ERROR_MSG, "Must have a room");
            }*/
        }

        @Override
        public Object execute(SimpleApiJsonForm form, BindException errors) throws Exception
        {
            JSONObject json = form.getJsonObject();
            JSONArray jsonModsArray = json.getJSONArray("mods");
            List<Map<String, Object>> modList = JsonUtil.toMapList(jsonModsArray);
            Date newEndDate = new Date();
            BatchValidationException batchErrors = new BatchValidationException();

            UserSchema schema = QueryService.get().getUserSchema(getUser(), getContainer(), "cageui");
            TableInfo historyTable = schema.getTable("cage_modifications_history");

            QueryUpdateService qus = historyTable.getUpdateService();

            if (qus == null)
            {
                throw new IllegalStateException(historyTable.getName() + " query update service");
            }

            ApiSimpleResponse response = new ApiSimpleResponse();

            SimpleFilter filter = new SimpleFilter();
            filter.addCondition(FieldKey.fromParts("room"),modList.get(0).get("room"), CompareType.EQUAL);
            filter.addCondition(FieldKey.fromParts("endDate"),null, CompareType.ISBLANK);
            TableSelector selector = new TableSelector(historyTable, filter, null);


            List<CageModificationHistoryForm> formData = selector.getArrayList(CageModificationHistoryForm.class);
            JSONArray jsonData = new JSONArray();
            for (CageModificationHistoryForm data : formData)
            {
                data.setEndDate(newEndDate);
                jsonData.put(data.toJSON());
            }
            List<Map<String, Object>> oldRowsToUpdate = JsonUtil.toMapList(jsonData);

            try (DbScope.Transaction tx = historyTable.getSchema().getScope().ensureTransaction())
            {
                if(!oldRowsToUpdate.isEmpty()){
                    qus.updateRows(getUser(), getContainer(), oldRowsToUpdate, null, batchErrors, null, null);
                }
                qus.insertRows(getUser(), getContainer(), modList, batchErrors, null, null);
                if(batchErrors.hasErrors()){
                    response.put("success", false);
                    response.put("errors", batchErrors);
                    return response;
                }
                tx.commit();
                response.put("success", true);
            }
            catch (QueryUpdateServiceException | BatchValidationException | DuplicateKeyException | SQLException e)
            {
                throw new ValidationException(e.getMessage());
            }

            return response;
        }
    }

}
