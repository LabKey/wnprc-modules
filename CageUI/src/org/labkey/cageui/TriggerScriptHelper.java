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
import org.labkey.api.query.QueryUpdateServiceException;
import org.labkey.api.security.User;
import org.labkey.api.security.UserManager;
import org.labkey.cageui.action.CageHistoryForm;
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

    public List<Map<String, String>> updateRackHistory(final Map<String, Object> rackRow, final String historyId) {
        List<Map<String, String>> errorStrings = new ArrayList<>();
        RackHistoryForm form = new RackHistoryForm();
        form.setObjectId(rackRow.get("objectid").toString());
        form.setHistoryId(historyId);
        if(rackRow.get("room") != null){
            form.setRoom(rackRow.get("room").toString());
        }
        form.setCondition((int) rackRow.get("condition"));

        try {
            insertRows(convertToMapList(form), "cageui", "rack_history");
        } catch (Exception e) {
            errorStrings.add(getError("rack_history", e.getMessage(), "error"));
        }

        return errorStrings;
    }

    public List<Map<String, String>> updateCageHistory(final Map<String, Object> cageRow, final String historyId, final Map<String, Object> extraContext) {
        List<Map<String, String>> errorStrings = new ArrayList<>();
        CageHistoryForm form = new CageHistoryForm();
        form.setHistoryId(historyId);
        form.setRackGroup(findLastNumberAfterDash(extraContext.get("rackGroup").toString()));
        form.setGroupRotation((int)extraContext.get("groupRotation"));
        form.setCage(cageRow.get("objectid").toString());
        form.setCageNumber((int)cageRow.get("cage_number"));
        form.setLength(((BigDecimal)cageRow.get("length")).doubleValue());
        form.setWidth(((BigDecimal)cageRow.get("width")).doubleValue());
        form.setHeight(((BigDecimal)cageRow.get("height")).doubleValue());
        form.setSqft(((BigDecimal)cageRow.get("sqft")).doubleValue());

        try {
            insertRows(convertToMapList(form), "cageui", "cage_history");
        } catch (Exception e) {
            errorStrings.add(getError("cage_history", e.getMessage(), "error"));
        }
        return errorStrings;
    }

}