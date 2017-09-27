/*
 * Copyright (c) 2013-2016 LabKey Corporation
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

import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.Selector;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.Sort;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.ehr.EHRService;
import org.labkey.api.ehr.dataentry.DataEntryForm;
import org.labkey.api.exp.api.StorageProvisioner;
import org.labkey.api.ldk.notification.NotificationSection;
import org.labkey.api.query.DetailsURL;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.User;
import org.labkey.api.settings.AppProps;
import org.labkey.api.study.Dataset;
import org.labkey.api.study.Study;
import org.labkey.api.study.StudyService;
import org.labkey.ehr.EHRManager;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.Set;

/**
 * User: bimber
 * Date: 9/23/13
 * Time: 9:11 PM
 */
public class DataEntrySummary implements NotificationSection
{
    public DataEntrySummary()
    {

    }

    public String getMessage(Container c, User u)
    {
        final StringBuilder msg = new StringBuilder();

        Set<Study> studies = EHRManager.get().getEhrStudies(u);
        if (studies == null || studies.isEmpty())
            return null;

        msg.append("<b>EHR Data Entry Summary:</b><p>");

        getTaskSummary(c, u, msg, studies);
        getRequestSummary(c, u, msg, studies);
        getDatasetRowsSummary(c, u, msg, studies);

        msg.append("<hr>");

        return msg.toString();
    }

    protected Date getYesterday()
    {
        Calendar yesterday = Calendar.getInstance();
        yesterday.setTime(new Date());
        yesterday.add(Calendar.DATE, -1);
        return yesterday.getTime();
    }

    protected void getRequestSummary(Container c, final User u, StringBuilder msg, Set<Study> studies)
    {
        final StringBuilder requestTable  = new StringBuilder();

        requestTable.append("Requests created yesterday:<br>");
        requestTable.append("<table border=1 style='border-collapse: collapse;'><tr style='font-weight: bold;'><td>Form Type</td><td>Total</td></tr>");
        boolean hasRequests = false;

        for (final Study s : studies)
        {
            UserSchema us = QueryService.get().getUserSchema(u, s.getContainer(), "ehr");
            if (us == null)
                continue;

            TableInfo requestSummary = us.getTable("requestSummary");
            if (requestSummary == null)
                continue;

            TableSelector tsRequest = new TableSelector(requestSummary, new SimpleFilter(FieldKey.fromString("created"), getYesterday(), CompareType.DATE_EQUAL), new Sort("-total"));
            if (tsRequest.exists())
            {
                hasRequests = true;
                tsRequest.forEach(new Selector.ForEachBlock<ResultSet>()
                {
                    @Override
                    public void exec(ResultSet rs) throws SQLException
                    {
                        DataEntryForm form = EHRService.get().getDataEntryForm(rs.getString("formType"), s.getContainer(), u);
                        String label = form == null ? rs.getString("formType") + "*" : form.getLabel();

                        requestTable.append("<tr><td>" + label + "</td><td>" + rs.getInt("total") + "</td></tr>");
                    }
                });
            }
        }

        requestTable.append("</table><p>");

        if (hasRequests)
        {
            msg.append(requestTable);
        }
        else
        {
            msg.append("No requests were created yesterday<p>");
        }
    }

    protected void getTaskSummary(Container c, final User u, StringBuilder msg, Set<Study> studies)
    {
        boolean hasTasks = false;
        final StringBuilder taskTable = new StringBuilder();

        taskTable.append("Tasks created yesterday:<br>");
        taskTable.append("<table border=1 style='border-collapse: collapse;'><tr style='font-weight: bold;'><td>Folder</td><td>Form Type</td><td>Total</td></tr>");

        for (final Study s : studies)
        {
            UserSchema us = QueryService.get().getUserSchema(u, s.getContainer(), "ehr");
            if (us == null)
                continue;

            TableInfo taskSummary = us.getTable("taskSummary");
            if (taskSummary == null)
                continue;

            TableSelector tsTasks = new TableSelector(taskSummary, new SimpleFilter(FieldKey.fromString("created"), getYesterday(), CompareType.DATE_EQUAL), new Sort("-total"));
            if (tsTasks.exists())
            {
                hasTasks = true;
                tsTasks.forEach(new Selector.ForEachBlock<ResultSet>()
                {
                    @Override
                    public void exec(ResultSet rs) throws SQLException
                    {
                        DataEntryForm form = EHRService.get().getDataEntryForm(rs.getString("formType"), s.getContainer(), u);
                        String label = form == null ? rs.getString("formType") + "*" : form.getLabel();

                        taskTable.append("<tr><td>" + s.getContainer().getPath() + "</td><td>" + label + "</td><td>" + rs.getInt("total") + "</td></tr>");
                    }
                });
            }
        }

        taskTable.append("</table><p>");

        if (hasTasks)
        {
            msg.append(taskTable);
        }
        else
        {
            msg.append("No tasks were created yesterday<p>");
        }
    }

    public boolean isAvailable(Container c, User u)
    {
        return true;
    }

    protected void getDatasetRowsSummary(Container c, User u, StringBuilder msg, Set<Study> studies)
    {
        StringBuilder results = new StringBuilder();
        boolean hasResults = false;
        results.append("Records created yesterday:<br>");
        results.append("<table border=1 style='border-collapse: collapse;'><tr style='font-weight: bold;'><td>Folder</td><td>Dataset Name</td><td>Rows Not Created By Admin</td><td>Public Records Modified</td></tr>");

        for (final Study s : studies)
        {
            List<Dataset> datasets = new ArrayList<>();
            datasets.addAll(s.getDatasets());
            Collections.sort(datasets, new Comparator<Dataset>()
            {
                @Override
                public int compare(Dataset o1, Dataset o2)
                {
                    return o1.getLabel().toLowerCase().compareTo(o2.getLabel().toLowerCase());
                }
            });

            for (Dataset ds : datasets)
            {
                TableInfo ti = StorageProvisioner.createTableInfo(ds.getDomain());

                long rowCount = 0;
                SimpleFilter filter = new SimpleFilter(FieldKey.fromString("created"), getYesterday(), CompareType.DATE_EQUAL);
                if (ti.getColumn("createdby") != null)
                {
                    TableSelector ts2 = new TableSelector(ti, Collections.singleton("lsid"), filter, null);
                    rowCount = ts2.getRowCount();
                }

                //public records, modified yesterday, but not created yesterday
                SimpleFilter filter3 = new SimpleFilter(FieldKey.fromString("created"), getYesterday(), CompareType.DATE_NOT_EQUAL);
                filter3.addCondition(FieldKey.fromString("modified"), getYesterday(), CompareType.DATE_EQUAL);
                filter3.addCondition(FieldKey.fromString("qcstate/publicdata"), true, CompareType.EQUAL);
                TableSelector ts3 = new TableSelector(ds.getTableInfo(u), Collections.singleton("lsid"), filter3, null);
                long publicModified = ts3.getRowCount();

                if (rowCount > 0 || publicModified > 0)
                {
                    results.append("<tr><td>" + s.getContainer().getPath() + "</td><td>" + ds.getLabel() + "</td><td><a href='" + generateUrl(ds, filter) + "'>" + rowCount + "</a></td><td><a href='" + generateUrl(ds, filter3) + "'>" + publicModified + "</a></td></tr>");
                    hasResults = true;
                }
            }
        }

        results.append("</table>");

        if (hasResults)
        {
            msg.append(results);
        }
        else
        {
            msg.append("No records were created yesterday<br>");
        }

        msg.append("<hr>");
    }

    private String generateUrl(Dataset ds, SimpleFilter filter)
    {
        DetailsURL url = DetailsURL.fromString("/query/executeQuery.view", ds.getContainer());
        String ret = AppProps.getInstance().getBaseServerUrl() + url.getActionURL().toString();
        ret += "schemaName=study&query.queryName=" + ds.getName();
        if (filter != null)
            ret += "&" + filter.toQueryString("query");

        return ret;
    }
}
