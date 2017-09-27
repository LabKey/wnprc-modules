/*
 * Copyright (c) 2013-2015 LabKey Corporation
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
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.Results;
import org.labkey.api.data.ResultsImpl;
import org.labkey.api.data.Selector;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.ehr.history.HistoryRow;
import org.labkey.api.ehr.history.AbstractDataSource;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryForeignKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.security.User;
import org.labkey.api.util.PageFlowUtil;
import org.labkey.ehr.EHRSchema;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;

/**
 * User: bimber
 * Date: 2/17/13
 * Time: 4:52 PM
 */
public class DefaultEncountersDataSource extends AbstractDataSource
{
    private Map<String, Map<Integer, Map<Integer, String>>> _snomedResults = null;

    public DefaultEncountersDataSource()
    {
        super("study", "Clinical Encounters", "Encounter", "Clinical");
        setShowTime(true);
    }

    @Override
    protected @NotNull List<HistoryRow> getRows(Container c, User u, SimpleFilter filter, boolean redacted)
    {
        Date start = new Date();

        _snomedResults = getSnomedTags(c, u, filter);

        long duration = ((new Date()).getTime() - start.getTime()) / 1000;
        if (duration > 3)
            _log.error("Loaded snomed tags in: " + duration + " seconds");

        return super.getRows(c, u, filter, redacted);
    }

    @Override
    protected String getHtml(Container c, Results rs, boolean redacted) throws SQLException
    {
        StringBuilder sb = new StringBuilder();

        sb.append(safeAppend(rs, "Title", "title"));

        if (!redacted)
            sb.append(safeAppend(rs, "Case #", "caseno"));

        sb.append(safeAppend(rs, "Procedure", "procedureid/name"));

        String categoryText = getCategoryText(rs);
        if (!redacted && !"Necropsy".equalsIgnoreCase(categoryText))
            sb.append(safeAppend(rs, "Remarks", "remark"));

        if (!redacted)
            sb.append(safeAppend(rs, "Charge Unit", "chargetype"));

        if (rs.hasColumn(FieldKey.fromString("major")) && rs.getObject("major") != null)
        {
            Boolean value = rs.getBoolean("major");
            sb.append("Major Surgery? ").append(value).append("\n");
        }

        if (!redacted)
            sb.append(safeAppend(rs, null, "participants/participants", "\n"));

        sb.append(safeAppend(rs, "Summary", "summaries/summary", "\n"));

        String category = rs.getString("type");
        String objectid = rs.getString(FieldKey.fromString("objectid"));
        if (_snomedResults != null && _snomedResults.get(objectid) != null)
        {
            sb.append("SNOMED Codes:\n\n");

            Map<Integer, Map<Integer, String>> snomedRows = _snomedResults.get(objectid);
            for (Map<Integer, String> group : snomedRows.values())
            {
                for (String value : group.values())
                {
                    sb.append(value).append("\n");
                }

                sb.append("\n");
            }
        }

        if (sb.length() > 0)
        {
            return sb.toString();
        }

        return null;
    }

    @Override
    protected String getCategoryText(Results rs) throws SQLException
    {
        String category = rs.getString("type");
        return category == null ? "Encounter" : category;
    }

    @Override
    protected String getPrimaryGroup(Results rs) throws SQLException
    {
        return getCategoryText(rs);
    }

    @Override
    protected Set<String> getColumnNames()
    {
        return PageFlowUtil.set("Id", "date", "enddate", "major", "caseno", "type", "title", "procedureid", "objectid", "procedureid/name", "summaries/summary", "participants/participants", "chargetype", "remark");
    }

    protected Map<String, Map<Integer, Map<Integer, String>>> getSnomedTags(Container c, User u, SimpleFilter filter)
    {
        final TableInfo dataset = getTableInfo(c, u);
        if (dataset == null)
            return null;

        final TableInfo snomed = QueryService.get().getUserSchema(u, c, "ehr").getTable(EHRSchema.TABLE_SNOMED_TAGS);
        snomed.getColumn("recordid").setFk(new QueryForeignKey("study", c, null, u, "Clinical Encounters", "objectid", "objectid"));

        SimpleFilter newFilter = new SimpleFilter();
        for (SimpleFilter.FilterClause fc : filter.getClauses())
        {
            if (fc instanceof CompareType.CompareClause)
            {
                CompareType.CompareClause cc = (CompareType.CompareClause)fc;
                Object val = (cc.getParamVals() != null && cc.getParamVals().length > 0) ? cc.getParamVals()[0] : null;
                FieldKey fk = FieldKey.fromParts(FieldKey.fromString("recordid"), cc.getFieldKeys().get(0));
                newFilter.addCondition(fk, val, cc.getCompareType());
            }
            else
            {
                _log.error("Unknown filter clause type: " + fc.getClass().getName());
            }
        }

        Set<FieldKey> colKeys = new HashSet<>();
        colKeys.add(FieldKey.fromString("recordid"));
        colKeys.add(FieldKey.fromString("set_number"));
        colKeys.add(FieldKey.fromString("code"));
        colKeys.add(FieldKey.fromString("code/meaning"));
        colKeys.add(FieldKey.fromString("sort"));
        final Map<FieldKey, ColumnInfo> columns = QueryService.get().getColumns(snomed, colKeys);

        TableSelector ts = new TableSelector(snomed, columns.values(), newFilter, null);
        final Map<String, Map<Integer, Map<Integer, String>>> snomedMap = new HashMap<>();

        ts.forEach(new Selector.ForEachBlock<ResultSet>()
        {
            @Override
            public void exec(ResultSet object) throws SQLException
            {
                Results rs = new ResultsImpl(object, columns);

                String objectid = rs.getString(FieldKey.fromString("recordid"));
                Integer set_number = rs.getInt(FieldKey.fromString("set_number"));
                Integer sort_order = rs.getInt(FieldKey.fromString("sort"));
                String code = rs.getString(FieldKey.fromString("code"));
                String meaning = rs.getString(FieldKey.fromString("code/meaning"));

                Map<Integer, Map<Integer, String>> codes = snomedMap.get(objectid);
                if (codes == null)
                    codes = new TreeMap<>();

                Map<Integer, String> setMap = codes.get(set_number);
                if (setMap == null)
                    setMap = new TreeMap<>();

                String text = "";
//                if (set_number != null)
//                    text += set_number +") ";
                if (meaning != null)
                    text += meaning;
                if (code != null)
                    text += " (" + code + ")";

                setMap.put(sort_order, text);
                codes.put(set_number, setMap);
                snomedMap.put(objectid, codes);
            }
        });

        return snomedMap;
    }
}
