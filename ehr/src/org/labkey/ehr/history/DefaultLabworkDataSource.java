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

import org.apache.commons.lang3.StringUtils;
import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.Results;
import org.labkey.api.data.Selector;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.ehr.history.HistoryRow;
import org.labkey.api.ehr.history.AbstractDataSource;
import org.labkey.api.ehr.history.LabworkType;
import org.labkey.api.query.FieldKey;
import org.labkey.api.security.User;
import org.labkey.api.util.PageFlowUtil;
import org.labkey.ehr.EHRSchema;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * User: bimber
 * Date: 2/17/13
 * Time: 4:52 PM
 */
public class DefaultLabworkDataSource extends AbstractDataSource
{
    private Map<String, List<String>> _results;
    private Map<String, List<String>> _flags;

    public DefaultLabworkDataSource()
    {
        super("study", "Clinpath Runs", "Labwork", "Labwork");
    }

    @Override
    protected String getHtml(Container c, Results rs, boolean redacted) throws SQLException
    {
        StringBuilder sb = new StringBuilder();

        if (!redacted)
            sb.append(safeAppend(rs, "Performed By", "performedby"));

        //sb.append(safeAppend(rs, "Type", "type"));
        sb.append(safeAppend(rs, "Service/Panel", "servicerequested"));

        //Modified 9-9-2015 Blasa
        sb.append(safeAppend(rs, "Testing Performed by", "chargetype"));

        sb.append(safeAppend(rs, "Sample Type", "sampletype"));

        if (rs.hasColumn(FieldKey.fromString("tissue")) && rs.getObject("tissue") != null)
            sb.append("Sample/Tissue: ").append(snomedToString(rs, FieldKey.fromString("tissue"), FieldKey.fromString("tissue/meaning")));

        sb.append(safeAppend(rs, "Method", "method"));
        sb.append(safeAppend(rs, "Collection Method", "collectionMethod"));
        sb.append(safeAppend(rs, "Remark", "remark"));

        String runId = rs.getString("objectid");
        if (runId != null)
        {
            List<String> flags = _flags.get(runId);
            if (flags != null)
            {
                sb.append("Flags:\n");
                sb.append("<div style='margin-top:3px;'>");
                sb.append(StringUtils.join(flags, "\n"));
                sb.append("</div>").append("\n");
            }

            List<String> results = _results.get(runId);
            if (results != null)
            {
                sb.append("Results:\n");
                sb.append("<div style='margin-top:3px;'>");
                sb.append(StringUtils.join(results, "\n"));
                sb.append("</div>");
            }
        }

        return sb.toString();
    }

    @Override
    protected Set<String> getColumnNames()
    {
        //return PageFlowUtil.set("Id", "date", "enddate", "objectid", "type", "performedby", "sampletype", "tissue/meaning", "tissue", "collectionmethod", "method", "servicerequested", "remark");
            //Modified 9-9-2015  Added chargetype
        return PageFlowUtil.set("Id", "date", "enddate", "objectid", "type", "performedby", "sampletype", "tissue/meaning", "tissue", "collectionmethod", "method", "servicerequested", "chargetype","remark");
    }

    @Override
    public @NotNull List<HistoryRow> getRows(Container c, User u, final String subjectId, Date minDate, Date maxDate, boolean redacted)
    {
        Date start = new Date();

        _results = LabworkManager.get().getResults(c, u, subjectId, minDate, maxDate, redacted);

        long duration = ((new Date()).getTime() - start.getTime()) / 1000;
        if (duration > 6)
            _log.error("Loaded lab results for: " + subjectId + " in " + duration + " seconds");

        start = new Date();
        _flags = getFlags(c, u, subjectId, minDate, maxDate);
        duration = ((new Date()).getTime() - start.getTime()) / 1000;
        if (duration > 4)
            _log.error("Loaded clinpath flags for: " + subjectId + " in " + duration + " seconds");

        return super.getRows(c, u, subjectId, minDate, maxDate, redacted);
    }

    public Map<String, List<String>> getFlags(Container c, User u, String id, Date minDate, Date maxDate)
    {
        TableInfo ti = EHRSchema.getInstance().getSchema().getTable(EHRSchema.TABLE_ENCOUNTER_FLAGS);

        SimpleFilter filter = new SimpleFilter();
        if (id != null)
            filter.addCondition(FieldKey.fromString("id"), id, CompareType.EQUAL);
        if (minDate != null)
            filter.addCondition(FieldKey.fromString("date"), minDate, CompareType.DATE_GTE);
        if (maxDate != null)
            filter.addCondition(FieldKey.fromString("date"), maxDate, CompareType.DATE_LTE);

        TableSelector ts = new TableSelector(ti, PageFlowUtil.set("parentid", "flag", "value"), filter, null);
        final Map<String, List<String>> map = new HashMap<>();

        ts.forEach(new Selector.ForEachBlock<ResultSet>()
        {
            @Override
            public void exec(ResultSet rs) throws SQLException
            {
                String runId = rs.getString("parentid");
                if (runId != null)
                {
                    List<String> rows = map.get(runId);
                    if (rows == null)
                        rows = new ArrayList<>();

                    String flag = rs.getString("flag");
                    String value = rs.getString("value");
                    rows.add(flag + ": " + value + "\n");

                    map.put(runId, rows);
                }
            }
        });

        return map;
    }

    @Override
    protected String getCategoryText(Results rs) throws SQLException
    {
        String category = rs.getString("type");
        return category == null ? super.getCategoryText(rs) : category;
    }

    @Override
    protected String getPrimaryGroup(Results rs) throws SQLException
    {
        return getCategoryText(rs);
    }

    @Override
    public Set<String> getAllowableCategoryGroups(Container c, User u)
    {
        Set<String> types = new HashSet<>();
        types.add("Labwork");
        for (LabworkType type : LabworkManager.get().getTypes(c))
        {
            types.add(type.getName());
        }

        return types;
    }
}
