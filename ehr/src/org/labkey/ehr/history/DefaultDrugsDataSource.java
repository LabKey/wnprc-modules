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
package org.labkey.ehr.history;

import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.Container;
import org.labkey.api.data.Results;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.ehr.history.HistoryRow;
import org.labkey.api.ehr.history.AbstractDataSource;
import org.labkey.api.ehr.history.HistoryRowImpl;
import org.labkey.api.query.FieldKey;
import org.labkey.api.security.User;
import org.labkey.api.util.Formats;
import org.labkey.api.util.PageFlowUtil;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * User: bimber
 * Date: 2/17/13
 * Time: 4:52 PM
 */
public class DefaultDrugsDataSource extends AbstractDataSource
{
    public DefaultDrugsDataSource()
    {
        super("study", "Drug Administration", "Medication Given", "Clinical");
        setShowTime(true);
    }

    @Override
    protected String getHtml(Container c, Results rs, boolean redacted) throws SQLException
    {
        StringBuilder sb = new StringBuilder();
        String category = rs.getString("category");

        //if this record is a scheduled treatment, skip it unless this instance is flagged as not normal
        if (rs.getObject("treatmentid") != null && (rs.getObject("outcome") == null || "Normal".equals(rs.getObject("outcome"))))
            return null;

        sb.append(safeAppend(rs, "Category", "category"));

        if (rs.hasColumn(FieldKey.fromString("code")) && rs.getObject("code") != null)
            sb.append(snomedToString(rs, FieldKey.fromString("code"), FieldKey.fromString("code/meaning")));

        if (rs.hasColumn(FieldKey.fromString("route")) && rs.getObject("route") != null)
            sb.append("Route: " + rs.getString("route")).append("\n");

        if (rs.hasColumn(FieldKey.fromString("volume")) && rs.getObject("volume") != null)
        {
            double serverVolume  = rs.getDouble("volume");
            sb.append("Volume: " + Formats.f2.format(serverVolume));

            if (rs.hasColumn(FieldKey.fromString("vol_units")) && rs.getObject("vol_units") != null)
                sb.append(" " + rs.getString("vol_units"));

            sb.append("\n");
        }

        if (rs.hasColumn(FieldKey.fromString("amount")) && rs.getObject("amount") != null)
        {
            double serverAmount = rs.getDouble("amount");
            sb.append("Amount: " + Formats.f2.format(serverAmount));

            if (rs.hasColumn(FieldKey.fromString("amount_units")) && rs.getObject("amount_units") != null)
                sb.append(" " + rs.getString("amount_units"));

            sb.append("\n");
        }

        if (!redacted)
        {
            sb.append(safeAppend(rs, "Performed By", "performedby"));
        }

        sb.append(safeAppend(rs, "Reason", "reason"));
        sb.append(safeAppend(rs, "Outcome", "outcome"));
        sb.append(safeAppend(rs, "Remark", "remark"));

        return sb.toString();
    }

    @Override
    protected String getCategoryText(Results rs) throws SQLException
    {
        String category = rs.getString("category");
        return category == null ?  "Medication Given" : category + " Medication";
    }

    @Override
    protected Set<String> getColumnNames()
    {
        return PageFlowUtil.set("Id", "date", "enddate", "route", "volume", "vol_units", "amount", "amount_units", "code", "code/meaning", "category", "caseid", "treatmentid", "outcome", "remark", "performedby", "reason");
    }

    @Override
    public @NotNull List<HistoryRow> getRows(Container c, User u, SimpleFilter filter, boolean redacted)
    {
        List<HistoryRow> rows = super.getRows(c, u, filter, redacted);
        Map<String, List<HistoryRowImpl>> groupedRowMap = new HashMap<>();
        for (HistoryRow r : rows)
        {
            if (r instanceof HistoryRowImpl)
            {
                HistoryRowImpl row = (HistoryRowImpl)r;
                String key = row.getSubjectId() + "<>" + row.getSortDateString() + "<>" + row.getTimeString();

                List<HistoryRowImpl> existing = groupedRowMap.get(key);
                if (existing == null)
                    existing = new ArrayList<>();

                existing.add(row);

                groupedRowMap.put(key, existing);
            }
        }

        List<HistoryRow> newRows = new ArrayList<>();

        for (List<HistoryRowImpl> records : groupedRowMap.values())
        {
            StringBuilder sb = new StringBuilder();
            String delim = "";
            for (HistoryRowImpl r : records)
            {
                String html = r.getHtml();
                if (html != null)
                {
                    sb.append(delim).append(html);
                    delim = "\n\n";
                }
            }

            HistoryRowImpl rec = records.get(0);
            HistoryRowImpl newRow = new HistoryRowImpl(this, rec.getCategoryText(), rec.getPrimaryGroup(), rec.getCategoryColor(), rec.getSubjectId(), rec.getDate(), sb.toString(), rec.getQcStateLabel(), rec.getPublicData(), rec.getTaskId(), rec.getTaskRowId(), rec.getFormType(), rec.getObjectId());
            newRow.setShowTime(true);
            newRows.add(newRow);
        }

        return newRows;
    }
}
