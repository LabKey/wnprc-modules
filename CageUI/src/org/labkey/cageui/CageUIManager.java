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
import org.labkey.api.cache.Cache;
import org.labkey.api.cache.CacheManager;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.query.FieldKey;
import org.labkey.api.util.JsonUtil;
import org.labkey.cageui.action.AllHistoryForm;
import org.labkey.cageui.action.RoomHistoryForm;

import java.util.Date;
import java.util.Map;
import java.util.UUID;

public class CageUIManager
{
    private static final CageUIManager _instance = new CageUIManager();

    private final Cache<String, Map<String, Map<String,  Map<String, Object>>>> _cache;

    private CageUIManager()
    {
        // prevent external construction with a private default constructor
        _cache = CacheManager.getStringKeyCache(1000, CacheManager.UNLIMITED, "CageUICache");
    }

    public static CageUIManager get()
    {
        return _instance;
    }

    public Cache<String, Map<String, Map<String,  Map<String, Object>>>> getCache()
    {
        return _cache;
    }

    public AllHistoryForm getAllHistory(String room)
    {
        TableInfo table = CageUISchema.getInstance().getAllHistoryTable();
        SimpleFilter filter = new SimpleFilter();
        filter.addCondition(FieldKey.fromString("room"), room, CompareType.EQUAL);
        filter.addCondition(FieldKey.fromString("end_date"),null, CompareType.ISBLANK);
        TableSelector selector = new TableSelector(table, filter, null);

        ObjectMapper mapper = JsonUtil.createDefaultMapper();
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        AllHistoryForm allHistory = mapper.convertValue(selector.getMap(), AllHistoryForm.class);
        return allHistory;
    }

    public RoomHistoryForm getRoomHistory(String historyid)
    {
        TableInfo table = CageUISchema.getInstance().getRoomHistoryTable();
        SimpleFilter filter = new SimpleFilter();
        filter.addCondition(FieldKey.fromString("historyid"), historyid, CompareType.EQUAL);
        TableSelector selector = new TableSelector(table, filter, null);

        ObjectMapper mapper = JsonUtil.createDefaultMapper();
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        RoomHistoryForm roomHistory = mapper.convertValue(selector.getMap(), RoomHistoryForm.class);
        return roomHistory;
    }

    // ends an all history row
    public AllHistoryForm endPreviousAllHistory(String room, Date endDate)
    {
        AllHistoryForm allHistory = getAllHistory(room);
        allHistory.setEndDate(endDate);
        return allHistory;
    }

    // Sets up the new all history row to save, not including history ids
    public AllHistoryForm startNewAllHistory(String room, boolean isDefault, Date startDate)
    {
        AllHistoryForm allHistoryToStart = new AllHistoryForm();
        allHistoryToStart.setStartDate(startDate);
        allHistoryToStart.setRoom(room);
        if(isDefault){
            allHistoryToStart.setValid(false);
            allHistoryToStart.setHistoryType("template");
        }
        return allHistoryToStart;
    }

    /*
        This method checks for room history (layout) changes

        @param room the name of the room
        @param newRoomHistory the layout data for the new layout submission
        @return current historyId if no changes, new historyId otherwise
     */
    public String checkRoomHistoryChanges(String room, RoomHistoryForm newRoomHistory)
    {

        AllHistoryForm allHistory = getAllHistory(room);
        String historyid = UUID.randomUUID().toString();

        if(allHistory != null){
            RoomHistoryForm roomHistory = getRoomHistory(allHistory.getRoomHistoryId());
            if(roomHistory.getBorderHeight() == newRoomHistory.getBorderHeight()
            && roomHistory.getBorderWidth() == newRoomHistory.getBorderWidth()
            && roomHistory.getScale() == newRoomHistory.getScale()){
                historyid = roomHistory.getHistoryId();
            }
        }

        return historyid;
    }

}