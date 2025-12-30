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
import org.labkey.api.data.DbScope;
import org.labkey.api.data.TableInfo;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.RequiresAnyOf;
import org.labkey.api.security.RequiresPermission;
import org.labkey.api.security.permissions.ReadPermission;
import org.labkey.api.util.JsonUtil;
import org.labkey.api.view.JspView;
import org.labkey.api.view.NavTree;
import org.labkey.cageui.action.AllHistoryForm;
import org.labkey.cageui.action.BundledForms;
import org.labkey.cageui.action.CageHistoryForm;
import org.labkey.cageui.action.CageModificationHistoryForm;
import org.labkey.cageui.action.CagesForm;
import org.labkey.cageui.action.LayoutHistoryForm;
import org.labkey.cageui.action.RackTypesForm;
import org.labkey.cageui.action.RacksForm;
import org.labkey.cageui.action.RoomHistoryForm;
import org.labkey.cageui.action.TemplateLayoutHistoryForm;
import org.labkey.cageui.model.Cage;
import org.labkey.cageui.model.ModData;
import org.labkey.cageui.model.Rack;
import org.labkey.cageui.model.RackGroup;
import org.labkey.cageui.model.Room;
import org.labkey.cageui.model.RoomObject;
import org.labkey.cageui.security.permissions.CageUILayoutEditorAccessPermission;
import org.labkey.cageui.security.permissions.CageUIModificationEditorPermission;
import org.labkey.cageui.security.permissions.CageUIRoomCreatorPermission;
import org.labkey.cageui.security.permissions.CageUITemplateCreatorPermission;
import org.springframework.validation.BindException;
import org.springframework.validation.Errors;
import org.springframework.web.servlet.ModelAndView;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

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

        public void addNavTrail(NavTree root) { }
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
            if(json == null){
                errors.reject(ERROR_MSG, "Missing json parameter.");
                return;
            }
            JSONObject jsonRoom = json.getJSONObject("room");
            JSONArray jsonModsArray = json.getJSONArray("mods");
            String prevRoomName = json.get("prevRoomName").toString();
            ObjectMapper mapper = JsonUtil.createDefaultMapper();
            mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
            try {
                Room room = mapper.readValue(jsonRoom.toString(), mapper.getTypeFactory().constructType(Room.class));
                if(room != null){
                    setRoom(room);
                }
                else{
                    errors.reject(ERROR_MSG, "Missing room parameter.");
                }
            } catch (JsonProcessingException e) {
                errors.reject(ERROR_MSG, e.getMessage());
            }

            try {
                TypeReference<ArrayList<ModData>> typeRef = new TypeReference<ArrayList<ModData>>() {};
                ArrayList<ModData> defaultMods = mapper.readValue(jsonModsArray.toString(), typeRef);
                if(defaultMods != null && !defaultMods.isEmpty()){
                    setRoomDefaultMods(defaultMods);
                }
            } catch (JsonProcessingException e) {
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

            /*

            Date newEndAndStartDate = new Date();

            UserSchema ehrLookupsSchema = QueryService.get().getUserSchema(getUser(), getContainer(), "ehr_lookups");
            TableInfo roomsTable = ehrLookupsSchema.getTable("rooms");*/


            /*// 1. get row in allHistory to end the current room.
            AllHistoryForm allHistoryToEnd = CageUIManager.get().endPreviousAllHistory(prevRoomName, newEndAndStartDate);

            // 2. Create new all history record
            AllHistoryForm allHistoryToStart = CageUIManager.get().startNewAllHistory(getRoom().getName(), isTemplateSave, newEndAndStartDate);
            String newHistoryId = allHistoryToStart.getHistoryId();
            newSubmissionForms.setNewAllHistoryForm(allHistoryToStart);

            if(allHistoryToEnd != null){
                newSubmissionForms.setPrevAllHistoryForm(allHistoryToEnd);
            }

            // Create new room history form
            RoomHistoryForm newRoomHistory = new RoomHistoryForm();
            newRoomHistory.setHistoryId(newHistoryId);
            newRoomHistory.setScale(getRoom().getLayoutData().getScale());
            newRoomHistory.setBorderHeight(getRoom().getLayoutData().getBorderHeight());
            newRoomHistory.setBorderWidth(getRoom().getLayoutData().getBorderWidth());

            newSubmissionForms.setRoomHistoryForm(newRoomHistory);

            if(isTemplateSave){
                ArrayList<TemplateLayoutHistoryForm> newTemplateLayoutHistoryData = new ArrayList<>();
                // loop through rack groups -> racks -> cages, adding each cage to the template layout history table.
                for (int i = 0; i < getRoom().getRackGroups().size(); i++)
                {
                    RackGroup rackGroup = getRoom().getRackGroups().get(i);
                    for (int j = 0; j < rackGroup.getRacks().size(); j++)
                    {
                        Rack rack = rackGroup.getRacks().get(j);
                        for (int k = 0; k < rack.getCages().size(); k++)
                        {
                            TemplateLayoutHistoryForm currRowData = new TemplateLayoutHistoryForm();
                            Cage cage = rack.getCages().get(k);

                            currRowData.setHistoryId(newHistoryId);
                            currRowData.setCage(CageUIManager.get().findLastNumberAfterDash(cage.getCageNum()));
                            currRowData.setRackGroup(CageUIManager.get().findLastNumberAfterDash(rackGroup.getGroupId()));
                            currRowData.setRack(rack.getItemId());
                            if(cage.getExtraContext() != null){
                                ObjectMapper objectMapper = new ObjectMapper();
                                String extraContextJson = objectMapper.writeValueAsString(cage.getExtraContext());
                                currRowData.setExtraContext(extraContextJson);
                            }
                            currRowData.setxCoord(rackGroup.getX() + rack.getX() + cage.getX());
                            currRowData.setyCoord(rackGroup.getY() + rack.getY() + cage.getY());
                            currRowData.setObjectType(rack.getType().getEffectiveRackType().getNumericValue());
                            newTemplateLayoutHistoryData.add(currRowData);
                        }
                    }
                }

                // loop through room objects adding each object to the template layout history table.
                for (int i = 0; i < getRoom().getObjects().size(); i++){
                    TemplateLayoutHistoryForm currRowData = new TemplateLayoutHistoryForm();
                    RoomObject roomObject = getRoom().getObjects().get(i);
                    currRowData.setHistoryId(newHistoryId);
                    currRowData.setObjectType(roomObject.getType().getNumericValue());
                    if(roomObject.getExtraContext() != null){
                        ObjectMapper objectMapper = new ObjectMapper();
                        String extraContextJson = objectMapper.writeValueAsString(roomObject.getExtraContext());
                        currRowData.setExtraContext(extraContextJson);
                    }
                    currRowData.setxCoord(roomObject.getX());
                    currRowData.setyCoord(roomObject.getY());
                    newTemplateLayoutHistoryData.add(currRowData);
                }
                newSubmissionForms.setTemplateLayoutHistoryForm(newTemplateLayoutHistoryData);
            }else{
                ArrayList<LayoutHistoryForm> newLayoutHistoryData = new ArrayList<>();
                ArrayList<LayoutHistoryForm> prevLayoutHistoryData = new ArrayList<>();
                ArrayList<CageHistoryForm> newCageHistoryData = new ArrayList<>();
                ArrayList<CageHistoryForm> prevCageHistoryData = new ArrayList<>();
                ArrayList<CageModificationHistoryForm> newModHistoryData = new ArrayList<>();
                ArrayList<CageModificationHistoryForm> prevModHistoryData = new ArrayList<>();
                ArrayList<RacksForm> newRacksData = new ArrayList<>();
                ArrayList<CagesForm> newCagesData = new ArrayList<>();
                ArrayList<CagesForm> updatedCagesData = new ArrayList<>();
                if(allHistoryToEnd != null && allHistoryToEnd.getHistoryType().equals("real")){
                    prevCageHistoryData = CageUIManager.get().getCageHistory(allHistoryToEnd.getHistoryId());
                    prevLayoutHistoryData = CageUIManager.get().getRealLayoutHistory(allHistoryToEnd.getHistoryId());
                }
                // create new history forms
                for (int i = 0; i < getRoom().getRackGroups().size(); i++)
                {
                    RackGroup rackGroup = getRoom().getRackGroups().get(i);
                    for (int j = 0; j < rackGroup.getRacks().size(); j++)
                    {
                        Rack rack = rackGroup.getRacks().get(j);
                        RacksForm newRackToSubmit = new RacksForm();
                        RackTypesForm rackType = CageUIManager.get().getRackType(rack.getType().getRowId());
                        if(rack.getIsNew()){
                            newRackToSubmit.setRackId(rack.getItemId());
                            newRackToSubmit.setRackType(rack.getType().getRowId());
                            newRackToSubmit.setRoom(getRoom().getName());
                            newRackToSubmit.setObjectId(UUID.randomUUID().toString().toUpperCase());
                            newRacksData.add(newRackToSubmit);
                        }else{
                            //todo add racks previous objectid here
                        }
                        for (int k = 0; k < rack.getCages().size(); k++)
                        {
                            LayoutHistoryForm newLayoutHistoryRow = new LayoutHistoryForm();
                            CageHistoryForm newCageHistoryRow = new CageHistoryForm();
                            CageModificationHistoryForm prevModHistoryRow = new CageModificationHistoryForm();
                            Cage cage = rack.getCages().get(k);
                            Optional<CageHistoryForm> prevCageHistoryRow = prevCageHistoryData.stream()
                                    .filter(p -> p.getCage().equals(cage.getObjectId()))
                                    .findFirst();
                            boolean wasCageChanged = false;
                            boolean wasLayoutChanged = false;
                            // if rack is new then also add new cages to the cages table.
                            CagesForm newCageForNewRack = new CagesForm();
                            if(rack.getIsNew()){
                                wasCageChanged = true;
                                wasLayoutChanged = true;
                                //create new cage for new rack
                                newCageForNewRack.setRack(newRackToSubmit.getObjectId());
                                newCageForNewRack.setCageNumber(CageUIManager.get().findLastNumberAfterDash(cage.getCageNum()));
                                newCageForNewRack.setObjectId(cage.getObjectId());
                                newCageForNewRack.setWidth(rackType.getWidth());
                                newCageForNewRack.setHeight(rackType.getHeight());
                                newCageForNewRack.setLength(rackType.getLength());
                                newCagesData.add(newCageForNewRack);
                                // add new cage to cage history
                                newCageHistoryRow.setCage(newCageForNewRack.getObjectId());
                                newCageHistoryRow.setCageNumber(newCageForNewRack.getCageNumber());
                                newCageHistoryRow.setHeight(newCageForNewRack.getHeight());
                                newCageHistoryRow.setLength(newCageForNewRack.getLength());
                                newCageHistoryRow.setWidth(newCageForNewRack.getWidth());
                                // add new default mods for new cage if required
                                List<ModData> cageMod = getRoomDefaultMods().stream()
                                        .filter(mod ->
                                                mod.getCage().equals(cage.getCageNum())
                                                && mod.getRack().equals(rack.getObjectId()))
                                        .toList();
                                if(!cageMod.isEmpty()){
                                    cageMod.forEach(mod -> {
                                        CageModificationHistoryForm newModHistoryRow = new CageModificationHistoryForm();
                                        newModHistoryRow.setHistoryId(newHistoryId);
                                        newModHistoryRow.setModId(mod.getModId());
                                        newModHistoryRow.setCage(cage.getObjectId());
                                        newModHistoryRow.setParentModId(mod.getParentModId());
                                        newModHistoryRow.setModification(mod.getModification().toString());
                                        newModHistoryRow.setLocation(mod.getLocation().toInt());
                                        newModHistoryRow.setSubId(mod.getSubId());
                                        // Add data to cage modifications history
                                        newModHistoryData.add(newModHistoryRow);
                                    });
                                }
                            }else{

                                if(prevCageHistoryRow.isPresent()){
                                    CagesForm updatedPrevCage = CageUIManager.get().getCageForm(prevCageHistoryRow.get().getCage());
                                    RacksForm prevRack = CageUIManager.get().getRackFromCage(prevCageHistoryRow.get().getCage());
                                    RackTypesForm prevRackType = CageUIManager.get().getRackType(prevRack.getRackType());
                                    int cageNum = CageUIManager.get().findLastNumberAfterDash(cage.getCageNum());

                                    // TODO this might need to be edited in the future to carry over the mods from previous rack and update to correct dims
                                    // Rack changed between previous and current cage.
                                    if(!rack.getObjectId().equals(prevRack.getObjectId()))
                                    {
                                        newCageHistoryRow.setWidth(rackType.getWidth());
                                        newCageHistoryRow.setLength(rackType.getLength());
                                        newCageHistoryRow.setHeight(rackType.getHeight());

                                        // add mods for new cage in rack
                                        List<ModData> cageMod = getRoomDefaultMods().stream()
                                                .filter(mod ->
                                                        mod.getCage().equals(cage.getCageNum())
                                                                && mod.getRack().equals(rack.getObjectId()))
                                                .toList();

                                        if(!cageMod.isEmpty()){
                                            cageMod.forEach(mod -> {
                                                CageModificationHistoryForm newModHistoryRow = new CageModificationHistoryForm();
                                                newModHistoryRow.setHistoryId(newHistoryId);
                                                newModHistoryRow.setModId(mod.getModId());
                                                newModHistoryRow.setParentModId(mod.getParentModId());
                                                newModHistoryRow.setModification(mod.getModification().toString());
                                                newModHistoryRow.setLocation(mod.getLocation().toInt());
                                                newModHistoryRow.setSubId(mod.getSubId());
                                                newModHistoryRow.setCage(cage.getObjectId());
                                                // Add data to cage modifications history
                                                newModHistoryData.add(newModHistoryRow);
                                            });
                                        }
                                        wasCageChanged = true;
                                    }
                                    // TODO Might be better to be in a trigger script for the cage history table to updates in cages table
                                    // if the cage number changed then update it here, add new number to history and update in cages table.
                                    if(cageNum != prevCageHistoryRow.get().getCageNumber()){
                                        newCageHistoryRow.setCageNumber(CageUIManager.get().findLastNumberAfterDash(cage.getCageNum()));
                                        cageNum = newCageHistoryRow.getCageNumber();
                                        updatedCagesData.add(updatedPrevCage);
                                        wasCageChanged = true;
                                    }
                                    newCageHistoryRow.setCage(prevCageHistoryRow.get().getCage());
                                    newCageHistoryRow.setCageNumber(cageNum);
                                }

                            }

                            // Add data to cage history
                            if(wasCageChanged){
                                wasLayoutChanged = true;
                                newCageHistoryRow.setHistoryId(newHistoryId);
                                newCageHistoryRow.setRackGroup(CageUIManager.get().findLastNumberAfterDash(rackGroup.getGroupId()));
                                newCageHistoryData.add(newCageHistoryRow);

                            }

                            // determine if the layout has changed for this row.
                            if(prevLayoutHistoryData != null && !prevLayoutHistoryData.isEmpty() && prevCageHistoryRow.isPresent()){
                                Optional<LayoutHistoryForm> prevLayoutHistoryRow = prevLayoutHistoryData.stream()
                                    .filter(p -> p.getHistoryId().equals(prevCageHistoryRow.get().getHistoryId()))
                                    .findFirst();
                                if(prevLayoutHistoryRow.isPresent()){
                                    int newX = rackGroup.getX() + rack.getX() + cage.getX();
                                    int newY = rackGroup.getY() + rack.getY() + cage.getY();
                                    if(newX != prevLayoutHistoryRow.get().getxCoord() || newY != prevLayoutHistoryRow.get().getyCoord()){
                                        wasLayoutChanged = true;
                                    }
                                }
                            }

                            // Add data to layout history
                            if(wasLayoutChanged){
                                newLayoutHistoryRow.setHistoryId(newHistoryId);
                                newLayoutHistoryRow.setCage(cage.getObjectId());
                                newLayoutHistoryRow.setObjectType(rack.getType().getEffectiveRackType().getNumericValue());
                                newLayoutHistoryRow.setxCoord(rackGroup.getX() + rack.getX() + cage.getX());
                                newLayoutHistoryRow.setyCoord(rackGroup.getY() + rack.getY() + cage.getY());
                                if(cage.getExtraContext() != null){
                                    ObjectMapper objectMapper = new ObjectMapper();
                                    String extraContextJson = objectMapper.writeValueAsString(cage.getExtraContext());
                                    newLayoutHistoryRow.setExtraContext(extraContextJson);
                                }
                                newLayoutHistoryData.add(newLayoutHistoryRow);
                            }
                        }
                    }
                }



                for (int i = 0; i < getRoom().getObjects().size(); i++){
                    LayoutHistoryForm currRowData = new LayoutHistoryForm();
                    RoomObject roomObject = getRoom().getObjects().get(i);
                    currRowData.setHistoryId(newHistoryId);
                    currRowData.setObjectType(roomObject.getType().getNumericValue());
                    if(roomObject.getExtraContext() != null){
                        ObjectMapper objectMapper = new ObjectMapper();
                        String extraContextJson = objectMapper.writeValueAsString(roomObject.getExtraContext());
                        currRowData.setExtraContext(extraContextJson);
                    }
                    currRowData.setxCoord(roomObject.getX());
                    currRowData.setyCoord(roomObject.getY());
                    newLayoutHistoryData.add(currRowData);
                }

                newSubmissionForms.setLayoutHistoryForm(newLayoutHistoryData);
                newSubmissionForms.setCageHistoryForm(newCageHistoryData);
                newSubmissionForms.setNewCagesForm(newCagesData);
                newSubmissionForms.setPrevCagesForm(updatedCagesData);
                newSubmissionForms.setRacksForm(newRacksData);
                newSubmissionForms.setCageModificationHistoryForm(newModHistoryData);

            }*/

            //return new ApiSimpleResponse();
            return CageUIManager.get().submitLayoutHistory(newSubmissionForms, getUser(), getContainer());
        }
    }
}
