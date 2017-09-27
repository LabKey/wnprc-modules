/*
 * Copyright (c) 2012-2016 LabKey Corporation
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
package org.labkey.ehr.notification;

import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.Results;
import org.labkey.api.data.ResultsImpl;
import org.labkey.api.data.RuntimeSQLException;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.Sort;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryHelper;
import org.labkey.api.query.QueryService;
import org.labkey.api.security.User;
import org.labkey.api.settings.AppProps;
import org.labkey.api.util.ResultSetUtil;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * User: bbimber
 * Date: 8/4/12
 * Time: 8:28 PM
 */
public class OverdueWeightsNotification extends AbstractEHRNotification
{
    @Override
    public String getName()
    {
        return "Overdue Weight Alerts";
    }

    @Override
    public String getEmailSubject(Container c)
    {
        return "Overdue Weight Alerts: " + _dateTimeFormat.format(new Date());
    }

    @Override
    public String getCronString()
    {
        return "0 10 10 * * ?";
    }

    @Override
    public String getScheduleDescription()
    {
        return "every day at 10:10AM";
    }

    @Override
    public String getDescription()
    {
        return "The report sends alerts for any animal in caged locations without a weight or not weighted within the past 60 days.";
    }

    @Override
    public String getMessageBodyHTML(Container c, User u)
    {
        final StringBuilder msg = new StringBuilder();
        msg.append("This email contains alerts of animals in cage locations not weighed in the past 60 days.  It was run on: " + _dateTimeFormat.format(new Date())+ ".<p>");

        getLivingWithoutWeight(c, u, msg);
        animalsNotWeightedInPast60Days(c, u, msg);

        return msg.toString();
    }

    /**
     * find animals not weighed in the past 60 days
     * @param msg
     */
    private void animalsNotWeightedInPast60Days(Container c, User u, StringBuilder msg)
    {
        Results rs = null;

        try
        {
            SimpleFilter filter = new SimpleFilter(FieldKey.fromString("calculated_status"), "Alive");
            filter.addCondition(FieldKey.fromString("Id/MostRecentWeight/DaysSinceWeight"), 60, CompareType.GT);
            filter.addCondition(FieldKey.fromString("Id/curLocation/Cage"), null, CompareType.NONBLANK);

            QueryHelper qh = new QueryHelper(c, u, "study", "Demographics", "Weight Detail");
            rs = qh.select(filter);

            if (rs.next())
            {
                msg.append("<b>WARNING: The following animals are in cage locations and have not been weighed in the past 60 days:</b><br>");
                msg.append("<p><a href='" + AppProps.getInstance().getBaseServerUrl() + AppProps.getInstance().getContextPath() + "/query" + c.getPath() + "/executeQuery.view?schemaName=study&query.viewName=By Location&query.queryName=Demographics&query.Id/MostRecentWeight/DaysSinceWeight~gt=60&query.calculated_status~eq=Alive&query.Id/curLocation/Cage~isnonblank'>Click here to view them</a><p>\n");

                Map<String, Map<String, Map<String, Object>>> summary = new HashMap<>();
                do
                {
                    String area = rs.getString(FieldKey.fromString("Id/curLocation/Area"));
                    if (area == null)
                        area = "No Area";

                    String room = rs.getString(FieldKey.fromString("Id/curLocation/Room"));
                    if (room == null)
                        room = "No Room";

                    Map<String, Map<String, Object>> areaNode = summary.get(area);
                    if (areaNode == null)
                        areaNode = new HashMap<>();

                    Map<String, Object> roomNode = areaNode.get(room);
                    if (roomNode == null)
                    {
                        roomNode = new HashMap<>();
                        roomNode.put("incomplete", 0);
                        roomNode.put("complete", 0);
                        roomNode.put("html", new StringBuilder());
                    }

                    roomNode.put("incomplete", (((Integer)roomNode.get("incomplete")) + 1));
                    StringBuilder html = (StringBuilder)roomNode.get("html");
                    html.append("<tr><td>" + appendField("Id/curLocation/cage", rs) + "</td><td>" + appendField("Id", rs) + "</td><td>" + appendField("Id/MostRecentWeight/DaysSinceWeight", rs) + "</td></tr>");

                    areaNode.put(room, roomNode);
                    summary.put(area, areaNode);
                }
                while (rs.next());

                for (String area : summary.keySet())
                {
                    msg.append("<b>Area: " + area + "</b><br><br>\n");
                    Map<String, Map<String, Object>> areaNode = summary.get(area);
                    for (String room : areaNode.keySet())
                    {
                        Map<String, Object> roomNode = areaNode.get(room);
                        msg.append("Room: " + room + "<br>\n");
                        msg.append("<table border=1><tr><td>Cage</td><td>Id</td><td>Days Since Weight</td></tr>");
                        msg.append((StringBuilder)roomNode.get("html"));
                        msg.append("</table><p>\n");
                    }
                    msg.append("<p>");
                }
                msg.append("<hr>\n");
            }
        }
        catch (SQLException e)
        {
            throw new RuntimeSQLException(e);
        }
        finally
        {
            ResultSetUtil.close(rs);
        }
    }

    protected String appendField(String name, Results rs) throws SQLException
    {
        FieldKey key = FieldKey.fromString(name);
        return rs.getString(key) == null ? "" : rs.getString(key);
    }

    private void getLivingWithoutWeight(final Container c, User u, final StringBuilder msg)
    {
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("calculated_status"), "Alive");
        filter.addCondition(FieldKey.fromString("Id/MostRecentWeight/MostRecentWeightDate"), null, CompareType.ISBLANK);
        Sort sort = new Sort(getStudy(c).getSubjectColumnName());

        TableInfo ti = getStudySchema(c, u).getTable("Demographics");
        List<FieldKey> colKeys = new ArrayList<>();
        colKeys.add(FieldKey.fromString(getStudy(c).getSubjectColumnName()));
        colKeys.add(FieldKey.fromString("Id/age/AgeFriendly"));
        final Map<FieldKey, ColumnInfo> columns = QueryService.get().getColumns(ti, colKeys);

        TableSelector ts = new TableSelector(ti, columns.values(), filter, sort);
        if (ts.getRowCount() > 0)
        {
            msg.append("<b>WARNING: The following animals do not have a weight:</b><br>\n");
            ts.forEach(new TableSelector.ForEachBlock<ResultSet>(){
                public void exec(ResultSet rs) throws SQLException
                {
                    Results results = new ResultsImpl(rs, columns);
                    msg.append(rs.getString(getStudy(c).getSubjectColumnName()));
                    String age = results.getString(FieldKey.fromString("Id/age/AgeFriendly"));
                    if (age != null)
                        msg.append(" (Age: " + age + ")");

                    msg.append("<br>\n");
                }
            });

            msg.append("<p><a href='" + AppProps.getInstance().getBaseServerUrl() + AppProps.getInstance().getContextPath() + "/query" + c.getPath() + "/executeQuery.view?schemaName=study&query.queryName=Demographics&query.calculated_status~eq=Alive&query.Id/MostRecentWeight/MostRecentWeightDate~isblank'>Click here to view these animals</a></p>\n");
            msg.append("<hr>\n");
        }
    }
}
