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
import org.labkey.api.cache.Cache;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.DbScope;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.RequiresAnyOf;
import org.labkey.api.security.RequiresPermission;
import org.labkey.api.security.User;
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
import org.labkey.cageui.model.RackTypes;
import org.labkey.cageui.model.Room;
import org.labkey.cageui.model.RoomObject;
import org.labkey.cageui.security.permissions.CageUILayoutEditorAccessPermission;
import org.labkey.cageui.security.permissions.CageUIModificationEditorPermission;
import org.labkey.cageui.security.permissions.CageUIRoomCreatorPermission;
import org.labkey.cageui.security.permissions.CageUITemplateCreatorPermission;
import org.labkey.pipeline.xml.Option;
import org.springframework.validation.BindException;
import org.springframework.validation.Errors;
import org.springframework.web.servlet.ModelAndView;

import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

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


    //APIs here

    // This api action saves the modifications for a given room.
    // Completely saves a new room by closing it out and re-opening it with new modifications, even ones that didn't change.?
    @RequiresPermission(CageUIModificationEditorPermission.class)
    public static class SaveCageModificationAction extends MutatingApiAction<SimpleApiJsonForm>
    {
        @Override
        public void validateForm(SimpleApiJsonForm form, Errors errors)
        {
            JSONObject json = form.getJsonObject();

            if (json == null)
            {
                errors.reject(ERROR_MSG, "Missing json parameter.");
            }
        }

        @Override
        public Object execute(SimpleApiJsonForm form, BindException errors) throws Exception
        {
            ApiSimpleResponse response = new ApiSimpleResponse();
            BatchValidationException batchErrors = new BatchValidationException();
            JSONObject json = form.getJsonObject();

            ObjectMapper mapper = JsonUtil.createDefaultMapper();
            mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
            Room room = mapper.readValue(json.get("room").toString(), mapper.getTypeFactory().constructType(Room.class));
            Object prevRoomMods = json.get("prevMods");
            Date newEndDate = new Date();

            UserSchema cageuiSchema = QueryService.get().getUserSchema(getUser(), getContainer(), "cageui");
            TableInfo modHistoryTable = cageuiSchema.getTable("cage_modifications_history");
            //List<Map<String, Object>> oldModRowsToUpdate = getModsToEnd(room.getName(), newEndDate, getUser(), getContainer());


            for (RackGroup rackGroup : room.getRackGroups()){
                for(Rack rack : rackGroup.getRacks()){
                    for (Cage cage : rack.getCages()){
                        Cage.CageModKeyMap currCageMods = cage.getMods();

                    }
                }
            }









            QueryUpdateService modQus = modHistoryTable.getUpdateService();
            if (modQus == null){
                throw new IllegalStateException(modHistoryTable.getName() + " query update service");
            }

            try (DbScope.Transaction tx = modHistoryTable.getSchema().getScope().ensureTransaction()){
               /* if(!oldModRowsToUpdate.isEmpty()){
                    //modQus.updateRows(getUser(), getContainer(), oldModRowsToUpdate, null, batchErrors, null, null);
                }*/

                if(batchErrors.hasErrors()){
                    response.put("success", false);
                    response.put("errors", batchErrors);
                    return response;
                }
            }

            response.put("success", false);
            return response;
        }
    }


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
            Date newEndAndStartDate = new Date();

            UserSchema ehrLookupsSchema = QueryService.get().getUserSchema(getUser(), getContainer(), "ehr_lookups");
            TableInfo roomsTable = ehrLookupsSchema.getTable("rooms");

            BundledForms newSubmissionForms = new BundledForms();

            // 1. get row in allHistory to end the current room.

            AllHistoryForm allHistoryToEnd = CageUIManager.get().endPreviousAllHistory(prevRoomName, newEndAndStartDate);

            // 2. Create new all history record
            AllHistoryForm allHistoryToStart = CageUIManager.get().startNewAllHistory(getRoom().getName(), isTemplateSave, newEndAndStartDate);

            // Generate ids for linking history tables together
            String roomHistoryId = CageUIManager.get().checkRoomHistoryChanges(getRoom().getName(), getRoom().getLayoutData());
            // layout history id will always change between submissions.
            String layoutHistoryId = UUID.randomUUID().toString();//CageUIManager.get().checkRoomLayoutChanges(room.getName(), isTemplateSave, room.getRackGroups(), room.getObjects());

            // Populate new all history with correct IDs
            allHistoryToStart.setRoomHistoryId(roomHistoryId);
            if(isTemplateSave){
                allHistoryToStart.setTemplateHistoryId(layoutHistoryId);
            }else{
                allHistoryToStart.setRealHistoryId(layoutHistoryId);
            }
            newSubmissionForms.setNewAllHistoryForm(allHistoryToStart);

            if(allHistoryToEnd != null){
                newSubmissionForms.setPrevAllHistoryForm(allHistoryToEnd);
            }

            // If no previous room exists OR room history changed, create new room history
            if (allHistoryToEnd == null || !allHistoryToEnd.getRoomHistoryId().equals(roomHistoryId))
            {
                RoomHistoryForm newRoomHistory = new RoomHistoryForm();
                newRoomHistory.setHistoryId(roomHistoryId);
                newRoomHistory.setScale(getRoom().getLayoutData().getScale());
                newRoomHistory.setBorderHeight(getRoom().getLayoutData().getBorderHeight());
                newRoomHistory.setBorderWidth(getRoom().getLayoutData().getBorderWidth());

                newSubmissionForms.setRoomHistoryForm(newRoomHistory);
            }

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

                            currRowData.setHistoryId(layoutHistoryId);
                            currRowData.setCage(CageUIManager.get().findLastNumberAfterDash(cage.getCageNum()));
                            currRowData.setRackGroup(CageUIManager.get().findLastNumberAfterDash(rackGroup.getGroupId()));
                            currRowData.setRack(CageUIManager.get().findLastNumberAfterDash(rack.getItemId()));
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
                    currRowData.setHistoryId(layoutHistoryId);
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
                ArrayList<CageHistoryForm> newCageHistoryData = new ArrayList<>();
                ArrayList<CageHistoryForm> prevCageHistoryData = new ArrayList<>();
                ArrayList<RacksForm> newRacksData = new ArrayList<>();
                ArrayList<CagesForm> newCagesData = new ArrayList<>();
                ArrayList<CageModificationHistoryForm> newModHistoryData = new ArrayList<>();
                if(allHistoryToEnd != null && allHistoryToEnd.getRealHistoryId() != null){
                    prevCageHistoryData = CageUIManager.get().getCageHistory(allHistoryToEnd.getRealHistoryId());
                }
                for (int i = 0; i < getRoom().getRackGroups().size(); i++)
                {
                    RackGroup rackGroup = getRoom().getRackGroups().get(i);
                    for (int j = 0; j < rackGroup.getRacks().size(); j++)
                    {
                        Rack rack = rackGroup.getRacks().get(j);
                        RacksForm newRackToSubmit = new RacksForm();
                        RackTypesForm rackType = CageUIManager.get().getRackType(rack.getType().getRowId());
                        if(rack.getRowid() == 0){ // rack is new
                            newRackToSubmit.setRackId(CageUIManager.get().findLastNumberAfterDash(rack.getItemId()));
                            newRackToSubmit.setRackType(rack.getType().getRowId());
                            newRackToSubmit.setRoom(getRoom().getName());
                            newRackToSubmit.setObjectId(UUID.randomUUID().toString());
                            newRacksData.add(newRackToSubmit);
                        }else{
                            //todo add racks previous objectid here
                        }
                        for (int k = 0; k < rack.getCages().size(); k++)
                        {
                            LayoutHistoryForm newLayoutHistoryRow = new LayoutHistoryForm();
                            CageHistoryForm newCageHistoryRow = new CageHistoryForm();
                            Cage cage = rack.getCages().get(k);
                            // if rack is new then also add new cages to the cages table.
                            CagesForm newCageForNewRack = new CagesForm();
                            if(rack.getRowid() == 0){
                                //create new cage for new rack
                                newCageForNewRack.setRack(newRackToSubmit.getObjectId());
                                newCageForNewRack.setCageNumber(CageUIManager.get().findLastNumberAfterDash(cage.getCageNum()));
                                newCageForNewRack.setObjectId(UUID.randomUUID().toString());
                                newCageForNewRack.setWidth(rackType.getWidth());
                                newCageForNewRack.setHeight(rackType.getHeight());
                                newCageForNewRack.setLength(rackType.getLength());
                                newCagesData.add(newCageForNewRack);
                                // add new cage to cage history
                                newCageHistoryRow.setCage(newCageForNewRack.getObjectId());
                                // add new default mods for new cage if required
                                List<ModData> cageMod = getRoomDefaultMods().stream()
                                        .filter(mod ->
                                                mod.getCage().equals(cage.getCageNum())
                                                && mod.getRack().equals(rack.getItemId()))
                                        .toList();
                                if(!cageMod.isEmpty()){
                                    String modHistoryId = UUID.randomUUID().toString();
                                    cageMod.forEach(mod -> {
                                        CageModificationHistoryForm newModHistoryRow = new CageModificationHistoryForm();
                                        newModHistoryRow.setHistoryId(modHistoryId);
                                        newModHistoryRow.setModId(mod.getModId());
                                        newModHistoryRow.setParentModId(mod.getParentModId());
                                        newModHistoryRow.setModification(mod.getModification().toString());
                                        newModHistoryRow.setLocation(mod.getLocation().toInt());
                                        newModHistoryRow.setSubId(mod.getSubId());
                                        // Add data to cage modifications history
                                        newModHistoryData.add(newModHistoryRow);
                                    });
                                }
                            }else{
                                //todo like racks, add cages objectid here from previous one
                            }

                            // Add data to cage history
                            newCageHistoryRow.setHistoryId(UUID.randomUUID().toString());
                            newCageHistoryRow.setRackGroup(CageUIManager.get().findLastNumberAfterDash(rackGroup.getGroupId()));
                            newCageHistoryData.add(newCageHistoryRow);

                            // Add data to layout history
                            newLayoutHistoryRow.setHistoryId(layoutHistoryId);
                            newLayoutHistoryRow.setCageHistoryId(newCageHistoryRow.getHistoryId());
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
                for (int i = 0; i < getRoom().getObjects().size(); i++){
                    LayoutHistoryForm currRowData = new LayoutHistoryForm();
                    RoomObject roomObject = getRoom().getObjects().get(i);
                    currRowData.setHistoryId(layoutHistoryId);
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
                newSubmissionForms.setCagesForm(newCagesData);
                newSubmissionForms.setRacksForm(newRacksData);
                newSubmissionForms.setCageModificationHistoryForm(newModHistoryData);

            }




           /* // Determine which history table to use
            TableInfo prevLayoutHistoryTable;
            if (isDefaultSave) {
                prevLayoutHistoryTable = CageUISchema.getInstance().getTemplateLayoutHistoryTable();
            }else{
                prevLayoutHistoryTable = CageUISchema.getInstance().getLayoutHistoryTable();
            }

            SimpleFilter prevRoomFilter = new SimpleFilter();
            prevRoomFilter.addCondition(FieldKey.fromString("room"), prevRoomName, CompareType.EQUAL);
            prevRoomFilter.addCondition(FieldKey.fromString("end_date"),null, CompareType.ISBLANK);
            TableSelector prevRoomSelector = new TableSelector(prevLayoutHistoryTable, prevRoomFilter, null);

            List<LayoutHistoryForm> layoutHistoryFormData = prevRoomSelector.getArrayList(LayoutHistoryForm.class);
            JSONArray oldLayoutHistoryJsonData = new JSONArray();
            for (LayoutHistoryForm data : layoutHistoryFormData)
            {
                data.setEnd_date(newEndDate);
                oldLayoutHistoryJsonData.put(data.toJSON());
            }
            List<Map<String, Object>> oldlayoutHistoryRowsToUpdate = JsonUtil.toMapList(oldLayoutHistoryJsonData);

            // Save layout data to ehr_lookups.rooms
            List<Map<String, Object>> oldRoomToUpdate = new ArrayList<>();
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
            oldRoomToUpdate.add(result);
            QueryUpdateService roomQus = roomsTable.getUpdateService();
            if (roomQus == null)
            {
                throw new IllegalStateException(roomsTable.getName() + " query update service");
            }
            List<Map<String, Object>> modsToInsert = JsonUtil.toMapList(jsonModsArray);
            //List<Map<String, Object>> oldModRowsToUpdate = getModsToEnd(, newEndDate, getUser(), getContainer());
            TableInfo modHistoryTable = CageUISchema.getInstance().getCageModificationsHistoryTable();

            TableSelector modSelector = new TableSelector(modHistoryTable, null);

            List<CageModificationHistoryForm> modHistoryFormData = modSelector.getArrayList(CageModificationHistoryForm.class);
*/
            /*
            // Get previous room data





            // table info/filters/selectors for cage_modifications_history

            QueryUpdateService modQus = modHistoryTable.getUpdateService();
            if (modQus == null)
            {
                throw new IllegalStateException(modHistoryTable.getName() + " query update service");
            }

            // table info/filters/selectors for layout_history
            QueryUpdateService layoutHistoryQus = layoutHistoryTable.getUpdateService();
            if (layoutHistoryQus == null)
            {
                throw new IllegalStateException(layoutHistoryTable.getName() + " query update service");
            }

            // End previous data forms for prev room name, if any.



            try (DbScope.Transaction tx = modHistoryTable.getSchema().getScope().ensureTransaction())
            {
                // closes out previous mods and inserts new mods for the room
                */
/*if(!oldModRowsToUpdate.isEmpty()){
                    modQus.updateRows(getUser(), getContainer(), oldModRowsToUpdate, null, batchErrors, null, null);
                }*//*

                modQus.insertRows(getUser(), getContainer(), modsToInsert, batchErrors, null, null);

                // update ehr_lookups.rooms with new layout data and possible template name change.
                if(!oldRoomToUpdate.isEmpty()){
                    roomQus.updateRows(getUser(), getContainer(), oldRoomToUpdate, null, batchErrors, null, null);
                }
                // close out previous layout data and submit new layout data for room.
                if(!oldlayoutHistoryRowsToUpdate.isEmpty()){
                    layoutHistoryQus.updateRows(getUser(), getContainer(), oldlayoutHistoryRowsToUpdate, null, batchErrors, null, null);
                }
                layoutHistoryQus.insertRows(getUser(), getContainer(), newLayoutHistoryData,  batchErrors, null, null);

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
*/
            //return new ApiSimpleResponse();
            return CageUIManager.get().submitLayoutHistory(newSubmissionForms, getUser(), getContainer());
        }


    }

}
