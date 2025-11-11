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

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.json.JSONObject;
import org.labkey.api.action.ApiSimpleResponse;
import org.labkey.api.cache.Cache;
import org.labkey.api.cache.CacheManager;
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
import org.labkey.api.security.User;
import org.labkey.api.util.JsonUtil;
import org.labkey.cageui.action.AllHistoryForm;
import org.labkey.cageui.action.BundledForms;
import org.labkey.cageui.action.CageHistoryForm;
import org.labkey.cageui.action.CagesForm;
import org.labkey.cageui.action.LayoutHistoryForm;
import org.labkey.cageui.action.RackTypesForm;
import org.labkey.cageui.action.RoomHistoryForm;
import org.labkey.cageui.action.TemplateLayoutHistoryForm;
import org.labkey.cageui.model.RackGroup;
import org.labkey.cageui.model.RoomObject;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class CageUIManager
{
    private static final CageUIManager _instance = new CageUIManager();

    private final Cache<String, Map<String, Map<String, Map<String, Object>>>> _cache;

    private CageUIManager()
    {
        // prevent external construction with a private default constructor
        _cache = CacheManager.getStringKeyCache(1000, CacheManager.UNLIMITED, "CageUICache");
    }

    public static CageUIManager get()
    {
        return _instance;
    }

    public Cache<String, Map<String, Map<String, Map<String, Object>>>> getCache()
    {
        return _cache;
    }

    // Helper function to wrap arraylist to labkeys List<Map<String, Object>> for data submission
    public <E> List<Map<String, Object>> convertToMapList(ArrayList<E> objects)
    {
        if (objects == null)
        {
            return new ArrayList<>();
        }

        try
        {
            ObjectMapper objectMapper = new ObjectMapper();
            List<Map<String, Object>> result = new ArrayList<>();

            for (E object : objects)
            {
                if (object != null)
                {
                    Map<String, Object> map = objectMapper.convertValue(object, new TypeReference<Map<String, Object>>()
                    {
                    });
                    result.add(map);
                }
                else
                {
                    result.add(null);
                }
            }

            return result;
        }
        catch (Exception e)
        {
            throw new RuntimeException("Error converting objects to map list", e);
        }
    }

    // Helper function to wrap class object to labkeys List<Map<String, Object>> for data submission
    public <E> List<Map<String, Object>> convertToMapList(E object) {
        if (object == null) {
            return Arrays.asList((Map<String, Object>) null);
        }

        try {
            ObjectMapper objectMapper = new ObjectMapper();
            Map<String, Object> map = objectMapper.convertValue(object, new TypeReference<Map<String, Object>>() {});
            return Arrays.asList(map);
        } catch (Exception e) {
            throw new RuntimeException("Error converting object to map list", e);
        }
    }

    /*
        Helper function that takes the bundled forms and submits them to the appropriate tables

        @param newForms the bundled forms to submit
        @param user the user submitting the forms
        @param container the container the forms are being submitted in
        @return ApiSimpleResponse with success or failure
     */
    public ApiSimpleResponse submitLayoutHistory(BundledForms newForms, User user, Container container) throws Exception
    {
        BatchValidationException batchErrors = new BatchValidationException();
        ApiSimpleResponse response = new ApiSimpleResponse();
        UserSchema cageUISchema = QueryService.get().getUserSchema(user, container, "cageui");

        TableInfo templateLayoutHistoryTable = cageUISchema.getTable("template_layout_history");
        QueryUpdateService templateQus = templateLayoutHistoryTable.getUpdateService();
        if (templateQus == null)
        {
            throw new IllegalStateException(templateLayoutHistoryTable.getName() + " query update service");
        }

        TableInfo allHistoryTable = cageUISchema.getTable("all_history");
        QueryUpdateService allHistoryQus = allHistoryTable.getUpdateService();
        if (allHistoryQus == null)
        {
            throw new IllegalStateException(allHistoryTable.getName() + " query update service");
        }

        TableInfo layoutHistoryTable = cageUISchema.getTable("layout_history");
        QueryUpdateService layoutHistoryQus = layoutHistoryTable.getUpdateService();
        if (layoutHistoryQus == null)
        {
            throw new IllegalStateException(layoutHistoryTable.getName() + " query update service");
        }

        TableInfo roomHistoryTable = cageUISchema.getTable("room_history");
        QueryUpdateService roomHistoryQus = roomHistoryTable.getUpdateService();
        if (roomHistoryQus == null)
        {
            throw new IllegalStateException(roomHistoryTable.getName() + " query update service");
        }

        TableInfo cageModHistoryTable = cageUISchema.getTable("cage_modifications_history");
        QueryUpdateService cageModHistoryQus = cageModHistoryTable.getUpdateService();
        if (cageModHistoryQus == null)
        {
            throw new IllegalStateException(cageModHistoryTable.getName() + " query update service");
        }

        TableInfo cageHistoryTable = cageUISchema.getTable("cage_history");
        QueryUpdateService cageHistoryQus = cageHistoryTable.getUpdateService();
        if (cageHistoryQus == null)
        {
            throw new IllegalStateException(cageHistoryTable.getName() + " query update service");
        }

        TableInfo cagesTable = cageUISchema.getTable("cages");
        QueryUpdateService cagesQus = cagesTable.getUpdateService();
        if (cagesQus == null)
        {
            throw new IllegalStateException(cagesTable.getName() + " query update service");
        }

        TableInfo racksTable = cageUISchema.getTable("racks");
        QueryUpdateService racksQus = racksTable.getUpdateService();
        if (racksQus == null)
        {
            throw new IllegalStateException(racksTable.getName() + " query update service");
        }

        try (DbScope.Transaction tx = CageUISchema.getInstance().getSchema().getScope().ensureTransaction())
        {


            if (newForms.getTemplateLayoutHistoryForm() != null)
            {
                templateQus.insertRows(user, container, convertToMapList(newForms.getTemplateLayoutHistoryForm()), batchErrors, null, null);
            }

            if (newForms.getNewAllHistoryForm() != null)
            {
                allHistoryQus.insertRows(user, container, convertToMapList(newForms.getNewAllHistoryForm()), batchErrors, null, null);
            }

            if (newForms.getPrevAllHistoryForm() != null)
            {
                allHistoryQus.updateRows(user, container, convertToMapList(newForms.getPrevAllHistoryForm()),null, batchErrors, null, null);
            }

            if(newForms.getLayoutHistoryForm() != null){
                layoutHistoryQus.insertRows(user, container, convertToMapList(newForms.getLayoutHistoryForm()), batchErrors, null, null);
            }

            if(newForms.getRoomHistoryForm() != null){
                roomHistoryQus.insertRows(user, container, convertToMapList(newForms.getRoomHistoryForm()), batchErrors, null, null);
            }

            if(newForms.getCageModificationHistoryForm() != null){
                cageModHistoryQus.insertRows(user, container, convertToMapList(newForms.getCageModificationHistoryForm()), batchErrors, null, null);
            }

            if(newForms.getCagesForm() != null){
                cagesQus.insertRows(user, container, convertToMapList(newForms.getCagesForm()), batchErrors, null, null);
            }

            if(newForms.getRacksForm() != null){
                racksQus.insertRows(user, container, convertToMapList(newForms.getRacksForm()), batchErrors, null, null);
            }

            if(newForms.getCageHistoryForm() != null){
                cageHistoryQus.insertRows(user, container, convertToMapList(newForms.getCageHistoryForm()), batchErrors, null, null);
            }

            if (batchErrors.hasErrors())
            {
                response.put("success", false);
                response.put("errors", batchErrors);
                return response;
            }
            tx.commit();
            response.put("success", true);
        }
        catch (QueryUpdateServiceException | BatchValidationException | DuplicateKeyException | RuntimeException |
               SQLException e)
        {
            throw new ValidationException(e.getMessage());
        }
        return response;
    }

    public int findLastNumberAfterDash(String input) {
        if (input == null || input.isEmpty()) {
            throw new IllegalArgumentException("Input string cannot be null or empty");
        }

        int lastDashIndex = input.lastIndexOf('-');

        if (lastDashIndex == -1) {
            throw new IllegalArgumentException("No '-' found in the string");
        }

        String afterLastDash = input.substring(lastDashIndex + 1);

        // Parse the entire number
        try {
            return Integer.parseInt(afterLastDash);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("No valid number found after the last '-'");
        }
    }

    public ArrayList<TemplateLayoutHistoryForm> getTemplateLayoutHistory(String historyId)
    {
        TableInfo table = CageUISchema.getInstance().getTemplateLayoutHistoryTable();
        SimpleFilter filter = new SimpleFilter();
        filter.addCondition(FieldKey.fromString("historyid"), historyId, CompareType.EQUAL);
        TableSelector selector = new TableSelector(table, filter, null);

        ObjectMapper mapper = JsonUtil.createDefaultMapper();
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        TypeReference<ArrayList<TemplateLayoutHistoryForm>> typeRef = new TypeReference<ArrayList<TemplateLayoutHistoryForm>>() {};
        ArrayList<TemplateLayoutHistoryForm> history = mapper.convertValue(selector.getMapArray(), typeRef);
        return history;
    }

    public AllHistoryForm getAllHistory(String room)
    {
        TableInfo table = CageUISchema.getInstance().getAllHistoryTable();
        SimpleFilter filter = new SimpleFilter();
        filter.addCondition(FieldKey.fromString("room"), room, CompareType.EQUAL);
        filter.addCondition(FieldKey.fromString("end_date"), null, CompareType.ISBLANK);
        TableSelector selector = new TableSelector(table, filter, null);

        ObjectMapper mapper = JsonUtil.createDefaultMapper();
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        AllHistoryForm allHistory = mapper.convertValue(selector.getMap(), AllHistoryForm.class);
        return allHistory;
    }

    public RoomHistoryForm getRoomHistory(String historyId)
    {
        TableInfo table = CageUISchema.getInstance().getRoomHistoryTable();
        SimpleFilter filter = new SimpleFilter();
        filter.addCondition(FieldKey.fromString("historyid"), historyId, CompareType.EQUAL);
        TableSelector selector = new TableSelector(table, filter, null);

        ObjectMapper mapper = JsonUtil.createDefaultMapper();
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        RoomHistoryForm roomHistory = mapper.convertValue(selector.getMap(), RoomHistoryForm.class);
        return roomHistory;
    }

    public RackTypesForm getRackType(int rowid)
    {
        TableInfo table = CageUISchema.getInstance().getRackTypesTable();
        SimpleFilter filter = new SimpleFilter();
        filter.addCondition(FieldKey.fromString("rowid"), rowid, CompareType.EQUAL);
        TableSelector selector = new TableSelector(table, filter, null);

        ObjectMapper mapper = JsonUtil.createDefaultMapper();
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        RackTypesForm rackType = mapper.convertValue(selector.getMap(), RackTypesForm.class);
        return rackType;
    }

    public CagesForm getCageForm(String rackObjectId)
    {
        TableInfo table = CageUISchema.getInstance().getRackTypesTable();
        SimpleFilter filter = new SimpleFilter();
        filter.addCondition(FieldKey.fromString("rack"), rackObjectId, CompareType.EQUAL);
        TableSelector selector = new TableSelector(table, filter, null);

        ObjectMapper mapper = JsonUtil.createDefaultMapper();
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        CagesForm cage = mapper.convertValue(selector.getMap(), CagesForm.class);
        return cage;
    }

    // Gets all the cage history for a real layout given that layouts historyId
    public ArrayList<CageHistoryForm> getCageHistory(String historyId)
    {
        // First, find all cages within the layout history table given the historyId
        TableInfo layoutHistoryTable = CageUISchema.getInstance().getLayoutHistoryTable();
        SimpleFilter layoutHistoryFilter = new SimpleFilter();
        layoutHistoryFilter.addCondition(FieldKey.fromString("historyid"), historyId, CompareType.EQUAL);
        layoutHistoryFilter.addCondition(FieldKey.fromString("cage_historyid"), null, CompareType.NONBLANK);
        TableSelector layoutHistorySelector = new TableSelector(layoutHistoryTable, layoutHistoryFilter, null);

        ObjectMapper mapper = JsonUtil.createDefaultMapper();
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        TypeReference<ArrayList<LayoutHistoryForm>> layoutHistoryTypeRef = new TypeReference<ArrayList<LayoutHistoryForm>>() {};
        ArrayList<LayoutHistoryForm> layoutHistory = mapper.convertValue(layoutHistorySelector.getMapArray(), layoutHistoryTypeRef);

        ArrayList<String> cageHistoryIds = new ArrayList<>();
        for (int i = 0; i < layoutHistory.size(); i++)
        {
            cageHistoryIds.add(layoutHistory.get(i).getCageHistoryId());
        }


        TableInfo cageHistoryTable = CageUISchema.getInstance().getCageHistoryTable();
        SimpleFilter cageHistoryFilter = new SimpleFilter();
        cageHistoryFilter.addCondition(FieldKey.fromString("historyid"), cageHistoryIds, CompareType.IN);
        TableSelector cageHistorySelector = new TableSelector(cageHistoryTable, cageHistoryFilter, null);
        TypeReference<ArrayList<CageHistoryForm>> cageHistoryTypeRef = new TypeReference<ArrayList<CageHistoryForm>>() {};
        ArrayList<CageHistoryForm> cageHistory = mapper.convertValue(cageHistorySelector.getMapArray(), cageHistoryTypeRef);

        return cageHistory;
    }

    // ends an all history row
    public AllHistoryForm endPreviousAllHistory(String room, Date endDate)
    {
        AllHistoryForm allHistory = getAllHistory(room);
        if(allHistory == null) return null;
        allHistory.setEndDate(endDate);
        return allHistory;
    }

    // Sets up the new all history row to save, not including history ids
    public AllHistoryForm startNewAllHistory(String room, boolean isDefault, Date startDate)
    {
        AllHistoryForm allHistoryToStart = new AllHistoryForm();
        allHistoryToStart.setStartDate(startDate);
        allHistoryToStart.setRoom(room);
        if (isDefault)
        {
            allHistoryToStart.setValid(false);
            allHistoryToStart.setHistoryType("template");
        }else{
            allHistoryToStart.setHistoryType("real");
        }
        return allHistoryToStart;
    }

    /*
        This method checks for room history (layout) changes

        @param room the name of the room
        @param newRoomHistory the layout data for the new layout submission
        @return current historyId if no changes, new historyId otherwise
     */
    public String checkRoomHistoryChanges(String roomName, RoomHistoryForm newRoomHistory)
    {

        AllHistoryForm allHistory = getAllHistory(roomName);
        String historyid = UUID.randomUUID().toString();

        if (allHistory != null)
        {
            RoomHistoryForm roomHistory = getRoomHistory(allHistory.getRoomHistoryId());
            if (roomHistory.getBorderHeight() == newRoomHistory.getBorderHeight()
                    && roomHistory.getBorderWidth() == newRoomHistory.getBorderWidth()
                    && roomHistory.getScale() == newRoomHistory.getScale())
            {
                historyid = roomHistory.getHistoryId();
            }
        }

        return historyid;
    }

    /*
        TODO
        1. When checking room layout changes four things can happen.
            1. Saving template room as a real room: (prevHistoryType = template, newHistoryType = real) and (prevRoomName != newRoomName) or (prevRoomName = newRoomName)
            2. Saving a real room as a template room: (prevHistoryType = real, newHistoryType = template) and (prevRoomName != newRoomName)
            3. Saving a template room as a template room: (prevHistoryType = template, newHistoryType = template) and (prevRoomName = newRoomName) or (prevRoomName != newRoomName)
            4. Saving a real room as a real room (prevHistoryType = real, newHistoryType = real) and (prevRoomName = newRoomName)
     */

    /*
        This method checks for layout object changes.

        @param room the name of the room
        @return current historyId if no changes, new historyId otherwise
     */
    public String checkRoomLayoutChanges(String roomName, boolean isNewRoomTemplate, List<RackGroup> newRackGroups, List<RoomObject> newRoomObjects)
    {
        String historyid = UUID.randomUUID().toString();
        AllHistoryForm allHistory = getAllHistory(roomName);

        // The room previously exists, so we must check for updated changes.
        if(allHistory != null){
            boolean isPrevRoomTemplate = allHistory.getHistoryType().equals("template");
            // Saving new room as template from a previous template room
            if(isNewRoomTemplate && isPrevRoomTemplate){
                ArrayList<TemplateLayoutHistoryForm> templateHistory = getTemplateLayoutHistory(allHistory.getTemplateHistoryId());
                System.out.println("Saving new room as template from a previous template room");
                //TODO determine if changes were made, if not then reuse old historyid, otherwise use new historyid
            }else if(!isNewRoomTemplate && isPrevRoomTemplate){ // Saving new room as real room from previous template room
                System.out.println("Saving new room as real room from previous template room");
            }else if(isNewRoomTemplate && !isPrevRoomTemplate){ // Saving new room as template from previous real room
                //TODO needs more testing with templates and renaming (starting new rooms entirely)
                System.out.println("Saving new room as template from previous real room");
            }else{ // Saving new room as real room from previous real room
                System.out.println("Saving new room as real room from previous real room");
            }
        }

        return historyid;
    }

}