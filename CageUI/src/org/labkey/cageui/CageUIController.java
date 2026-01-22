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

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.json.JSONArray;
import org.json.JSONObject;
import org.labkey.api.action.ApiSimpleResponse;
import org.labkey.api.action.MutatingApiAction;
import org.labkey.api.action.SimpleApiJsonForm;
import org.labkey.api.action.SimpleViewAction;
import org.labkey.api.action.SpringActionController;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.security.RequiresAnyOf;
import org.labkey.api.security.RequiresPermission;
import org.labkey.api.security.permissions.ReadPermission;
import org.labkey.api.util.JsonUtil;
import org.labkey.api.view.JspView;
import org.labkey.api.view.NavTree;
import org.labkey.cageui.action.BundledForms;
import org.labkey.cageui.model.ModData;
import org.labkey.cageui.model.Room;
import org.labkey.cageui.security.permissions.CageUILayoutEditorAccessPermission;
import org.labkey.cageui.security.permissions.CageUIRoomCreatorPermission;
import org.labkey.cageui.security.permissions.CageUITemplateCreatorPermission;
import org.springframework.validation.BindException;
import org.springframework.validation.Errors;
import org.springframework.web.servlet.ModelAndView;

import java.util.ArrayList;

public class CageUIController extends SpringActionController
{
    private static final DefaultActionResolver _actionResolver = new DefaultActionResolver(CageUIController.class);
    public static final String NAME = "cageui";

    public CageUIController()
    {
        setActionResolver(_actionResolver);
    }

    // todo fix this method to use array of cage ids to end. currently does not
    // todo move helper functions to CageUIManager
/*    private static List<Map<String, Object>> getModsToEnd(int[] cages, Date newEndDate, User user, Container container)
    {
        UserSchema cageuiSchema = QueryService.get().getUserSchema(user, container, "cageui");
        TableInfo modHistoryTable = cageuiSchema.getTable("cage_modifications_history");
        SimpleFilter modFilter = new SimpleFilter();
        modFilter.addCondition(FieldKey.fromString("cage"), cages, CompareType.CONTAINS_ONE_OF);
        modFilter.addCondition(FieldKey.fromString("endDate"),null, CompareType.ISBLANK);
        TableSelector modSelector = new TableSelector(modHistoryTable, modFilter, null);
        List<CageModificationHistoryForm> modHistoryFormData = modSelector.getArrayList(CageModificationHistoryForm.class);
        JSONArray modJsonData = new JSONArray();
        for (CageModificationHistoryForm data : modHistoryFormData){
            data.setEndDate(newEndDate);
            modJsonData.put(data.toJSON());
        }
        List<Map<String, Object>> oldModRowsToUpdate = JsonUtil.toMapList(modJsonData);
        return oldModRowsToUpdate;
    }*/

    @RequiresPermission(ReadPermission.class)
    public class BeginAction extends SimpleViewAction
    {
        public ModelAndView getView(Object o, BindException errors)
        {
            return new JspView("/org/labkey/cageui/view/hello.jsp");
        }

        public void addNavTrail(NavTree root)
        {
        }
    }


    //APIS Here


    // this api action saves the layout for a given room
    @RequiresAnyOf({CageUILayoutEditorAccessPermission.class, CageUIRoomCreatorPermission.class, CageUITemplateCreatorPermission.class})
    public static class SaveLayoutHistoryAction extends MutatingApiAction<SimpleApiJsonForm>
    {

        private Room _room;
        private ArrayList<ModData> _roomDefaultMods;

        public Room getRoom()
        {
            return _room;
        }

        public void setRoom(Room room)
        {
            _room = room;
        }

        public ArrayList<ModData> getRoomDefaultMods()
        {
            return _roomDefaultMods;
        }

        public void setRoomDefaultMods(ArrayList<ModData> roomDefaultMods)
        {
            _roomDefaultMods = roomDefaultMods;
        }

        //todo add room name validation to prevent template saving without template in the name
        // todo add validation to prevent room from being save with default cages, and templates being saved with real cages.
        @Override
        public void validateForm(SimpleApiJsonForm form, Errors errors)
        {
            JSONObject json = form.getJsonObject();
            if (json == null)
            {
                errors.reject(ERROR_MSG, "Missing json parameter.");
                return;
            }
            JSONObject jsonRoom = json.getJSONObject("room");
            JSONArray jsonModsArray = json.getJSONArray("mods");
            String prevRoomName = json.get("prevRoomName").toString();
            ObjectMapper mapper = JsonUtil.createDefaultMapper();
            mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
            try
            {
                Room room = mapper.readValue(jsonRoom.toString(), mapper.getTypeFactory().constructType(Room.class));
                if (room != null)
                {
                    setRoom(room);
                }
                else
                {
                    errors.reject(ERROR_MSG, "Missing room parameter.");
                }
            }
            catch (JsonProcessingException e)
            {
                errors.reject(ERROR_MSG, e.getMessage());
            }

            try
            {
                TypeReference<ArrayList<ModData>> typeRef = new TypeReference<ArrayList<ModData>>()
                {
                };
                ArrayList<ModData> defaultMods = mapper.readValue(jsonModsArray.toString(), typeRef);
                if (defaultMods != null && !defaultMods.isEmpty())
                {
                    setRoomDefaultMods(defaultMods);
                }
            }
            catch (JsonProcessingException e)
            {
                errors.reject(ERROR_MSG, e.getMessage());
            }

     /*       List<Map<String, Object>> newLayoutHistoryData = JsonUtil.toMapList(json.getJSONArray("newRoomData"));

            Set<String> seenCageNumByType = new HashSet<>();
            for (Map<String, Object> map : newLayoutHistoryData) {
                if(map.get("cage") == null){continue;}// ignore room objects

                RackTypes typeObj = RackTypes.fromNumericValue((Integer) map.get("object_type"));
                Object nameObj = map.get("cage");

                if (nameObj == null) {
                    continue;
                }

                String compositeKey = typeObj + ":" + nameObj;

                if (!seenCageNumByType.add(compositeKey)) {
                    errors.reject(ERROR_MSG, "Duplicate numbers found in layout: " + RackTypes.getName(typeObj) + ": " + nameObj);
                }
            }*/
        }

        @Override
        public Object execute(SimpleApiJsonForm form, BindException errors) throws Exception
        {
            BatchValidationException batchErrors = new BatchValidationException();
            JSONObject json = form.getJsonObject();

            //List<Map<String, Object>> newLayoutHistoryData = JsonUtil.toMapList(json.getJSONArray("newRoomData"));

            boolean savingTemplate = getRoom().getName().toLowerCase().contains("template");
            String prevRoomName = json.get("prevRoomName").toString();
            boolean isDefaultSave = json.get("isDefault").toString().equals("true");
            boolean isTemplateSave = savingTemplate || isDefaultSave;

            CageUIManager.RoomSubmissionService submissionService = new CageUIManager.RoomSubmissionService(
                    getContainer(),
                    getUser(),
                    isTemplateSave,
                    prevRoomName,
                    getRoom(),
                    getRoomDefaultMods()
            );
            BundledForms newSubmissionForms = submissionService.submitRoom();

            //return new ApiSimpleResponse();
            return CageUIManager.get().submitLayoutHistory(newSubmissionForms, getUser(), getContainer());
        }
    }
}
