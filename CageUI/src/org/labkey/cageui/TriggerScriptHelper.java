/*
 *
 *  * Copyright (c) 2026 Board of Regents of the University of Wisconsin System
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
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.jetbrains.annotations.NotNull;
import org.json.JSONArray;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.ldk.notification.NotificationService;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.DuplicateKeyException;
import org.labkey.api.query.InvalidKeyException;
import org.labkey.api.query.QueryUpdateServiceException;
import org.labkey.api.security.User;
import org.labkey.api.security.UserManager;
import org.labkey.cageui.action.CageHistoryForm;
import org.labkey.cageui.action.CagesForm;
import org.labkey.cageui.action.RackHistoryForm;
import org.labkey.cageui.action.RacksForm;
import org.labkey.dbutils.api.SimpleQueryUpdater;

import java.math.BigDecimal;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class TriggerScriptHelper
{
    protected final Container container;
    protected final User user;
    protected static final Logger _log = LogManager.getLogger(TriggerScriptHelper.class);
    public static JSONArray _aliasRow;

    private TriggerScriptHelper(int userId, String containerId)
    {
        user = UserManager.getUser(userId);
        if (user == null)
        {
            throw new RuntimeException("User does not exist: " + userId);
        }

        container = ContainerManager.getForId(containerId);
        if (container == null)
        {
            throw new RuntimeException("Container does not exist: " + containerId);
        }

    }

    public static TriggerScriptHelper create(int userId, String containerId) {
        return new TriggerScriptHelper(userId, containerId);
    }

    public void insertRows(List<Map<String, Object>> insertRows, String schema, String table) throws QueryUpdateServiceException, SQLException, BatchValidationException, DuplicateKeyException
    {
        SimpleQueryUpdater queryUpdater = new SimpleQueryUpdater(user, container, schema, table);
        queryUpdater.insert(insertRows);
    }
    public void updateRows(List<Map<String, Object>> updateRows, String schema, String table) throws QueryUpdateServiceException, SQLException, BatchValidationException, DuplicateKeyException, InvalidKeyException
    {
        SimpleQueryUpdater queryUpdater = new SimpleQueryUpdater(user, container, schema, table);
        queryUpdater.update(updateRows);
    }

    private Map<String, String> getError(String field, String message, String severity) {
        Map<String, String> error = new HashMap<>();
        error.put("field", field);
        error.put("message", message);
        error.put("severity", severity);
        return error;
    }

    public <E> List<Map<String, Object>> convertToMapList(E object)
    {
        if (object == null)
        {
            return Arrays.asList((Map<String, Object>) null);
        }

        try
        {
            ObjectMapper objectMapper = new ObjectMapper();
            Map<String, Object> map = objectMapper.convertValue(object, new TypeReference<Map<String, Object>>()
            {
            });
            return Arrays.asList(map);
        }
        catch (Exception e)
        {
            throw new RuntimeException("Error converting object to map list", e);
        }
    }

    public static int findLastNumberAfterDash(String input)
    {
        if (input == null || input.isEmpty())
        {
            throw new IllegalArgumentException("Input string cannot be null or empty");
        }

        int lastDashIndex = input.lastIndexOf('-');

        if (lastDashIndex == -1)
        {
            throw new IllegalArgumentException("No '-' found in the string");
        }

        String afterLastDash = input.substring(lastDashIndex + 1);

        // Parse the entire number
        try
        {
            return Integer.parseInt(afterLastDash);
        }
        catch (NumberFormatException e)
        {
            throw new IllegalArgumentException("No valid number found after the last '-'");
        }
    }

    @NotNull
    private User getUser()
    {
        return user;
    }

    @NotNull
    private Container getContainer()
    {
        return container;
    }

    public List<Map<String, String>> removeRacksFromRoom(final List<Map<String, Object>> racksToRemove) {
        List<Map<String, String>> errorStrings = new ArrayList<>();
        ArrayList<RacksForm> rackFormsToRemove = new ArrayList<>();

        for(Map<String, Object> rack : racksToRemove){
            RacksForm prevRack = CageUIManager.getRackForm((String) rack.get("objectid"));
            prevRack.setRoom(null);
            if(rack.containsKey("prevCondition")){
                prevRack.setCondition((Integer) rack.get("prevCondition"));
            }
            rackFormsToRemove.add(prevRack);
        }

        try {
            updateRows(CageUIManager.get().convertToMapList(rackFormsToRemove), "cageui", "racks");
        } catch (Exception e) {
            errorStrings.add(getError("racks", e.getMessage(), "error"));
        }

        return errorStrings;
    }


    /*
        TODO on updateRacks.

        1. Check if rack is new/should be inserted into racks table
            1. Insert if new
            2. Update if old
        2. If updating, determine the scope of the update.
            1. Update all rack specific properties
        3. extra context might contain racks that are not in the history row. For example, racks that were removed from the room won't be in the history.
            1. We will need to do a cleanup of these racks. Potentially in a finally of the trigger script.
     */

    public List<Map<String, String>> updateRacks(final Map<String, Object> rackHistoryRow, final Map<String,Map<String, Object>> extraRacksContext) {
        List<Map<String, String>> errorStrings = new ArrayList<>();
        RacksForm prevRack = CageUIManager.getRackForm((String) rackHistoryRow.get("objectid"));
        RacksForm newRack = new RacksForm();
        Map<String, Object> rackContext = extraRacksContext.get(rackHistoryRow.get("objectid"));
        // Add rack
        if(prevRack == null){
            newRack.setObjectId((String) rackHistoryRow.get("objectid"));
            newRack.setRackId((Integer) rackContext.get("rackId"));
            newRack.setRoom((String) rackHistoryRow.get("room"));
            newRack.setCondition(0); // Set condition to operational "0"
            newRack.setRackType((Integer) rackContext.get("rackType"));
        }else{
            prevRack.setRoom((String) rackHistoryRow.get("room"));
            /*else{ // rack exists
            if(rackContext.containsKey("removeRackFromRoom")){ // If it has the key it is true
                prevRack.setRoom(null);
            }
            if(rackContext.containsKey("prevCondition")){
                prevRack.setCondition((Integer) rackContext.get("prevCondition"));
            }
        }*/
        }

        try {
            if(prevRack != null){
                updateRows(convertToMapList(prevRack), "cageui", "racks");
            }else{
                insertRows(convertToMapList(newRack), "cageui", "racks");
            }
        } catch (Exception e) {
            errorStrings.add(getError("racks", e.getMessage(), "error"));
        }

        return errorStrings;
    }

    public List<Map<String, String>> updateCages(final Map<String, Object> cageHistoryRow, final Map<String, Object> extraContext) {
        List<Map<String, String>> errorStrings = new ArrayList<>();

        CagesForm prevCageForm = CageUIManager.getCageForm((String) cageHistoryRow.get("cage"));
        CagesForm newCageForm = new CagesForm();

        newCageForm.setObjectId((String) cageHistoryRow.get("cage"));
        newCageForm.setRack((String) extraContext.get("rack"));
        newCageForm.setPositionId((int)extraContext.get("positionId"));
        newCageForm.setCageNumber((int)cageHistoryRow.get("cage_number"));
        newCageForm.setLength(((BigDecimal)cageHistoryRow.get("length")).doubleValue());
        newCageForm.setWidth(((BigDecimal)cageHistoryRow.get("width")).doubleValue());
        newCageForm.setHeight(((BigDecimal)cageHistoryRow.get("height")).doubleValue());
        newCageForm.setSqft(((BigDecimal)cageHistoryRow.get("sqft")).doubleValue());

        try {
            if(prevCageForm != null){
                updateRows(convertToMapList(newCageForm), "cageui", "cages");
            }else{
                insertRows(convertToMapList(newCageForm), "cageui", "cages");
            }
        } catch (Exception e) {
            errorStrings.add(getError("cages", e.getMessage(), "error"));
        }
        return errorStrings;
    }
}