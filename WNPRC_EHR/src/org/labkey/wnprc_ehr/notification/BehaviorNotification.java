/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.labkey.wnprc_ehr.notification;

import org.apache.commons.lang3.time.DateUtils;
import org.json.JSONObject;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.Selector;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.Sort;
import org.labkey.api.data.SqlSelector;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.module.Module;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryDefinition;
import org.labkey.api.query.QueryException;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.User;
import org.labkey.api.util.PageFlowUtil;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * User: bimber
 * Date: 4/5/13
 * Time: 2:25 PM
 */
public class BehaviorNotification extends ColonyAlertsNotification
{
    public BehaviorNotification(Module owner)
    {
        super(owner);
    }

    @Override
    public String getName()
    {
        return "Behavior Notification";
    }

    @Override
    public String getEmailSubject(Container c)
    {
        return "Behavior Alerts: " + _dateTimeFormat.format(new Date());
    }

    @Override
    public String getCronString()
    {
        return "0 0 5 * * ?";
    }

    @Override
    public String getScheduleDescription()
    {
        return "every day at 5:00AM";
    }

    @Override
    public String getDescription()
    {
        return "The report is designed to provide a daily summary of issues related to behavior management, such as housing, pairing, and behavior cases";
    }

    @Override
    public String getMessageBodyHTML(Container c, User u)
    {
        Map<String, String> saved = getSavedValues(c);
        Map<String, String> toSave = new HashMap<String, String>();

        StringBuilder msg = new StringBuilder();

        msg.append(getDescription()).append("<hr>");

        colonyHousingSummary(c, u, msg, saved, toSave);
        behaviorCaseSummary(c, u, msg);
        getFlaggedPairs(c, u, msg);
        changedPairs(c, u, msg);
        singleHousedAnimals(c, u, msg);
        transfersYesterday(c, u, msg);
        surgeryCasesRecentlyClosed(c, u, msg);
        pairIdConflicts(c, u , msg);

        notesEndingToday(c, u, msg, Arrays.asList("BSU Notes"), null);

        saveValues(c, toSave);

        return msg.toString();
    }

    private void behaviorCaseSummary(Container c, User u, final StringBuilder msg)
    {
        TableInfo ti = getStudySchema(c, u).getTable("cases");
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("isActive"), true);
        filter.addCondition(FieldKey.fromString("category"), "Behavior");

        TableSelector ts = new TableSelector(ti, PageFlowUtil.set("Id"), filter, null);
        long total = ts.getRowCount();
        msg.append("<b>Behavior Cases:</b><p>");
        msg.append("There are " + total + " active behavior cases.  ");
        String url = getExecuteQueryUrl(c, "study", "cases", "Active Behavior Cases");
        msg.append("<a href='" + url + "'>Click here to view them</a>");
        msg.append("<hr>");
    }

    private void pairIdConflicts(Container c, User u, final StringBuilder msg)
    {
        TableInfo ti = getStudySchema(c, u).getTable("pairingIdConflicts");
        TableSelector ts = new TableSelector(ti);
        long total = ts.getRowCount();
        if (total > 0)
        {
            msg.append("<b>Conflicting Pair IDs:</b><p>");
            msg.append("There are " + total + " pairing records with conflicting pairIds.  If this occurs, there is a bug in data entry which could cause unusual results when viewing the data.  If you see this, please contact the site administrator.  ");
            String url = getExecuteQueryUrl(c, "study", "pairingIdConflicts", null);
            msg.append("<a href='" + url + "'>Click here to view them</a>");
            msg.append("<hr>");
        }
    }

    private void singleHousedAnimals(Container c, User u, final StringBuilder msg)
    {
        TableInfo ti = getStudySchema(c, u).getTable("demographicsDaysAlone");
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("cagemates"), 0, CompareType.EQUAL);
        filter.addCondition(FieldKey.fromString("daysAlone"), 30, CompareType.GT);

        TableSelector ts = new TableSelector(ti, PageFlowUtil.set("Id"), filter, null);
        long total = ts.getRowCount();
        msg.append("<b>Single Housed Animals:</b><p>");
        msg.append("There are " + total + " animals that have been single housed for at least 30 days.  ");
        String url = getExecuteQueryUrl(c, "study", "demographicsDaysAlone", null, filter) + "&query.sort=-DaysAlone";
        msg.append("<a href='" + url + "'>Click here to view them</a>");
        msg.append("<hr>");
    }

    private void getFlaggedPairs(Container c, User u, final StringBuilder msg)
    {
        TableInfo ti = getStudySchema(c, u).getTable("pairingSeparations");
        TableSelector ts = new TableSelector(ti, PageFlowUtil.set("Id"));
        long total = ts.getRowCount();
        if (total > 0)
        {
            msg.append("<b>There are " + total + " animals with temporary separations, but there is no subsequent pairing observation to indicate a reunite, permanent separation, new pair formation, etc.  These may need attention.</b><p>");
            String url = getExecuteQueryUrl(c, "study", "pairingSeparations", null);
            msg.append("<a href='" + url + "'>Click here to view them</a>");
            msg.append("<hr>");
        }
    }

    private void changedPairs(Container c, User u, final StringBuilder msg)
    {
        Calendar date1 = Calendar.getInstance();
        date1.setTime(new Date());
        date1 = DateUtils.truncate(date1, Calendar.DATE);

        Calendar date2 = Calendar.getInstance();
        date2.setTime(new Date());
        date2 = DateUtils.truncate(date2, Calendar.DATE);
        date2.add(Calendar.DATE, -1);

        UserSchema us = getStudySchema(c, u);
        QueryDefinition qd = us.getQueryDefForTable("pairDifferences");
        List<QueryException> errors = new ArrayList<>();
        TableInfo ti = qd.getTable(us, errors, true);
        Map<String, Object> params = new HashMap<>();
        params.put("Date1", date1.getTime());
        params.put("Date2", date2.getTime());

        SQLFragment sql = ti.getFromSQL("t");
        QueryService.get().bindNamedParameters(sql, params);

        sql = new SQLFragment("SELECT * FROM " + sql.getSQL() + " WHERE (t.changeType IS NOT NULL AND t.changeType != 'Group Members Changed') ORDER BY ldk.naturalize(t.room1), ldk.naturalize(t.cage1)", sql.getParams());
        QueryService.get().bindNamedParameters(sql, params);
        SqlSelector ss = new SqlSelector(ti.getSchema(), sql);
        Collection<Map<String, Object>> rows = ss.getMapCollection();

        if (rows.size() > 0)
        {
            msg.append("<b>There are " + rows.size() + " animals with differences in pairing since the previous day.  Note, this considers full pairs vs. non-full pairs only (ie. grooming contact is treated as non-paired).  It considers housing at midnight of the days in question.</b>  ");
            String url = getExecuteQueryUrl(c, "study", "pairDifferences", null) + "&query.changeType~isnonblank&query.changeType~neq=Group Members Changed&query.param.Date1=" + _dateFormat.format(date1.getTime()) + "&query.param.Date2=" + _dateFormat.format(date2.getTime());

            msg.append("<a href='" + url + "'>Click here to view them</a><p>");

            msg.append("<table border=1 style='border-collapse: collapse;'>");
            msg.append("<tr style='font-weight: bold;'><td>Id</td><td>Animals In Cage</td><td>Current Room</td><td>Current Cage</td><td>Change Type</td><td>Previous Room</td><td>Previous Cage</td><td>Pair Observations Entered On Date</td></tr>");

            for (Map<String, Object> row : rows)
            {
                String animalUrl = getParticipantURL(c, (String)row.get("Id"));
                msg.append("<tr><td><a href='" + animalUrl + "'>" + row.get("Id") + "</a></td><td>" + (row.get("animalsInCage1") == null ? "" : row.get("animalsInCage1")) + "</td><td>" + row.get("room1") + "</td><td>" + (row.get("cage1") == null ? "" : row.get("cage1")) + "</td><td>" + row.get("changeType") + "</td><td>" + (row.get("room2") == null ? "" : row.get("room2")) + "</td><td>" + (row.get("cage2") == null ? "" : row.get("cage2")) + "</td><td>" + row.get("pairObservations") + "</td></tr>");
            }

            msg.append("</table>");
        }
        else
        {
            msg.append("<b>No pairs changed yesterday</b>");
        }

        msg.append("<hr>");
    }

    private void colonyHousingSummary(final Container c, User u, final StringBuilder msg, Map<String, String> saved, Map<String, String> toSave)
    {
        final String colonyHousingSummary = "colonyHousingSummary";
        final JSONObject oldValueMap = saved.containsKey(colonyHousingSummary) ? new JSONObject(saved.get(colonyHousingSummary)) : new JSONObject();
        final JSONObject newValueMap = new JSONObject();
        Date lastRunDate = saved.containsKey(lastSave) ? new Date(Long.parseLong(saved.get(lastSave))) : null;

        TableInfo ti = getStudySchema(c, u).getTable("housingPairingSummary");
        TableSelector ts = new TableSelector(ti, PageFlowUtil.set("category", "totalAnimals"), null, new Sort("category"));
        msg.append("<b>Housing summary:</b><p>");
        msg.append("<table border=1 style='border-collapse: collapse;'>");
        msg.append("<tr style='font-weight: bold;'><td>Category</td><td># Animals</td><td>Previous Value " + (lastRunDate == null ? "" : "(" + _dateFormat.format(lastRunDate) + ")") + "</td></tr>");
        final String urlBase = getExecuteQueryUrl(c, "study", "demographics", "By Location");

        ts.forEach(new Selector.ForEachBlock<ResultSet>()
        {
            @Override
            public void exec(ResultSet rs) throws SQLException
            {
                String category = rs.getString("category");
                msg.append("<tr><td>" + category + "</td><td><a href='" + urlBase + "&query.Id/numPaired/category~eq=" + category + "'>" + rs.getInt("totalAnimals") + "</a></td><td>");
                if (oldValueMap.has(category))
                {
                    msg.append(oldValueMap.get(category));
                }
                msg.append("</td></tr>");

                newValueMap.put(category, rs.getInt("totalAnimals"));
            }
        });

        msg.append("</table>");
        msg.append("<hr>");

        toSave.put(colonyHousingSummary, newValueMap.toString());
    }
}
