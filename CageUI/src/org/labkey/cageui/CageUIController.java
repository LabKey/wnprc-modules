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

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.module.SimpleModule;
import org.json.JSONArray;
import org.json.JSONObject;
import org.labkey.api.action.ApiSimpleResponse;
import org.labkey.api.action.MutatingApiAction;
import org.labkey.api.action.SimpleApiJsonForm;
import org.labkey.api.action.SimpleViewAction;
import org.labkey.api.action.SpringActionController;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
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
import org.labkey.api.security.User;
import org.labkey.api.security.permissions.ReadPermission;
import org.labkey.api.util.JsonUtil;
import org.labkey.api.view.JspView;
import org.labkey.api.view.NavTree;
import org.labkey.cageui.action.CageModificationHistoryForm;
import org.labkey.cageui.action.LayoutHistoryForm;
import org.labkey.cageui.model.RackGroup;
import org.labkey.cageui.model.Room;
import org.labkey.cageui.security.permissions.CageUILayoutEditorAccessPermission;
import org.labkey.cageui.security.permissions.CageUIRoomCreatorPermission;
import org.labkey.cageui.security.permissions.CageUITemplateCreatorPermission;
import org.springframework.validation.BindException;
import org.springframework.validation.Errors;
import org.springframework.web.servlet.ModelAndView;

import java.sql.SQLException;
import java.util.ArrayList;
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
            BatchValidationException batchErrors = new BatchValidationException();
            JSONObject json = form.getJsonObject();
            Date newEndDate = new Date();
            ApiSimpleResponse response = new ApiSimpleResponse();

            JSONArray jsonModsArray = json.getJSONArray("mods");
            JSONObject jsonRoom = json.getJSONObject("room");

            ObjectMapper mapper = JsonUtil.createDefaultMapper();
            mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
            Room room = mapper.readValue(jsonRoom.toString(), mapper.getTypeFactory().constructType(Room.class));
            String prevRoomName = json.get("prevRoomName").toString();
            UserSchema cageuiSchema = QueryService.get().getUserSchema(getUser(), getContainer(), "cageui");
            UserSchema ehrLookupsSchema = QueryService.get().getUserSchema(getUser(), getContainer(), "ehr_lookups");
            TableInfo layoutHistoryTable = cageuiSchema.getTable("layout_history");

            // Get previous room data
            SimpleFilter prevRoomFilter = new SimpleFilter();
            prevRoomFilter.addCondition(FieldKey.fromString("room"), prevRoomName, CompareType.EQUAL);
            prevRoomFilter.addCondition(FieldKey.fromString("end_date"),null, CompareType.ISBLANK);
            TableSelector prevRoomSelector = new TableSelector(layoutHistoryTable, prevRoomFilter, null);
            List<LayoutHistoryForm> prevRoomFormData = prevRoomSelector.getArrayList(LayoutHistoryForm.class);

            boolean savingTemplate = room.getName().toLowerCase().contains("template");


            /*
                First check if the room is saving as one of following:
                1. Room save from blank editor
                  - Check if room name has data, end previous room then if it does.
                 - submit new room
                2. Room save from previous room
                - End previous room data
                - submit new room
                3. Template save
                -
                - End previous template data
                - Update template name in ehr_lookups.rooms
                - submit new template data
                4. Room save from template
                - Treat room as in 1.
             */
            
            // Save layout data to ehr_lookups.rooms
            List<Map<String, Object>> newEhrRoom = new ArrayList<>();
            TableInfo roomsTable = ehrLookupsSchema.getTable("rooms");
            SimpleFilter roomFilter = new SimpleFilter();
            roomFilter.addCondition(FieldKey.fromString("room"), prevRoomName, CompareType.EQUAL);
            TableSelector roomSelector = new TableSelector(roomsTable, roomFilter, null);
            Map<String, Object> result = roomSelector.getMap();
            // update old name with new name if it changed
            if(savingTemplate && !prevRoomName.equals(room.getName())){
                result.put("room", room.getName());
            }
            result.put("border_width", room.getLayoutData().getBorderWidth());
            result.put("border_height", room.getLayoutData().getBorderHeight());
            result.put("layout_scale", room.getLayoutData().getScale());
            result.put("status", room.getLayoutData().getStatus());
            newEhrRoom.add(result);
            QueryUpdateService roomQus = roomsTable.getUpdateService();
            if (roomQus == null)
            {
                throw new IllegalStateException(roomsTable.getName() + " query update service");
            }




            // table info/filters/selectors for cage_modifications_history
            List<Map<String, Object>> modsToInsert = JsonUtil.toMapList(jsonModsArray);
            TableInfo modHistoryTable = cageuiSchema.getTable("cage_modifications_history");
            SimpleFilter modFilter = new SimpleFilter();
            modFilter.addCondition(FieldKey.fromString("room"), room.getName(), CompareType.EQUAL);
            modFilter.addCondition(FieldKey.fromString("endDate"),null, CompareType.ISBLANK);
            TableSelector modSelector = new TableSelector(modHistoryTable, modFilter, null);

            QueryUpdateService modQus = modHistoryTable.getUpdateService();
            if (modQus == null)
            {
                throw new IllegalStateException(modHistoryTable.getName() + " query update service");
            }

            List<CageModificationHistoryForm> modHistoryFormData = modSelector.getArrayList(CageModificationHistoryForm.class);
            JSONArray modJsonData = new JSONArray();
            for (CageModificationHistoryForm data : modHistoryFormData)
            {
                data.setEndDate(newEndDate);
                modJsonData.put(data.toJSON());
            }
            List<Map<String, Object>> oldModRowsToUpdate = JsonUtil.toMapList(modJsonData);

            // table info/filters/selectors for layout_history
            QueryUpdateService layoutHistoryQus = layoutHistoryTable.getUpdateService();
            if (layoutHistoryQus == null)
            {
                throw new IllegalStateException(layoutHistoryTable.getName() + " query update service");
            }

            // End previous data forms for prev room name, if any.
            List<LayoutHistoryForm> layoutHistoryFormData = prevRoomSelector.getArrayList(LayoutHistoryForm.class);
            JSONArray oldLayoutHistoryJsonData = new JSONArray();
            for (LayoutHistoryForm data : layoutHistoryFormData)
            {
                data.setEndDate(newEndDate);
                oldLayoutHistoryJsonData.put(data.toJSON());
            }
            List<Map<String, Object>> oldlayoutHistoryRowsToUpdate = JsonUtil.toMapList(oldLayoutHistoryJsonData);


            try (DbScope.Transaction tx = modHistoryTable.getSchema().getScope().ensureTransaction())
            {
                if(!oldModRowsToUpdate.isEmpty()){
                    modQus.updateRows(getUser(), getContainer(), oldModRowsToUpdate, null, batchErrors, null, null);
                }
                modQus.insertRows(getUser(), getContainer(), modsToInsert, batchErrors, null, null);

                // update ehr_lookups.rooms with new layout data and possible template name change.
                if(!newEhrRoom.isEmpty()){
                    roomQus.updateRows(getUser(), getContainer(), newEhrRoom, null, batchErrors, null, null);
                }
                //
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
