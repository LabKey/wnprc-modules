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

import org.labkey.api.data.Container;
import org.labkey.api.data.Results;
import org.labkey.api.ehr.history.AbstractDataSource;
import org.labkey.api.query.FieldKey;
import org.labkey.api.util.DateUtil;
import org.labkey.api.util.PageFlowUtil;

import java.sql.SQLException;
import java.util.Set;

/**
 * User: bimber
 * Date: 2/17/13
 * Time: 4:52 PM
 */
public class DefaultTreatmentOrdersDataSource extends AbstractDataSource
{
    public DefaultTreatmentOrdersDataSource()
    {
        super("study", "Treatment Orders", "Medication Ordered", "Clinical");
        setShowTime(true);
    }

    @Override
    protected String getHtml(Container c, Results rs, boolean redacted) throws SQLException
    {
        StringBuilder sb = new StringBuilder();
        sb.append(snomedToString(rs, FieldKey.fromString("code"), FieldKey.fromString("code/meaning")));
        sb.append(safeAppend(rs, "Remark", "remark"));
        sb.append(safeAppend(rs, "Frequency", "frequency/meaning"));
        sb.append(safeAppend(rs, "Reason", "reason"));
        sb.append(safeAppend(rs, "Route", "route"));

//        if (rs.hasColumn(FieldKey.fromString("concentration")) && rs.getObject("concentration") != null)
//        {
//            sb.append("Concentration: " + rs.getString("concentration"));
//
//            if (rs.hasColumn(FieldKey.fromString("conc_units")) && rs.getObject("conc_units") != null)
//            {
//                sb.append(" " + rs.getString("conc_units"));
//            }
//
//            sb.append("\n");
//        }
//
//        if (rs.hasColumn(FieldKey.fromString("dosage")) && rs.getObject("dosage") != null)
//        {
//            sb.append("Dosage: " + rs.getString("dosage"));
//
//            if (rs.hasColumn(FieldKey.fromString("dosage_units")) && rs.getObject("dosage_units") != null)
//                sb.append(" " + rs.getString("dosage_units"));
//
//            sb.append("\n");
//        }

        if (rs.hasColumn(FieldKey.fromString("volume")) && rs.getObject("volume") != null)
        {
            sb.append("Volume: " + rs.getString("volume"));

            if (rs.hasColumn(FieldKey.fromString("vol_units")) && rs.getObject("vol_units") != null)
                sb.append(" " + rs.getString("vol_units"));

            sb.append("\n");
        }

        if (rs.hasColumn(FieldKey.fromString("amount")) && rs.getObject("amount") != null)
        {
            sb.append("Amount: " + rs.getString("amount"));

            if (rs.hasColumn(FieldKey.fromString("amount_units")) && rs.getObject("amount_units") != null)
                sb.append(" " + rs.getString("amount_units"));

            sb.append("\n");
        }

        //TODO: conditional based on whether it has ended or not?  maybe a note for 'ending in X days?'
        if (rs.hasColumn(FieldKey.fromString("enddate")) && rs.getObject("enddate") != null)
        {
            sb.append("End: ").append(DateUtil.formatDate(c, rs.getDate("enddate")));

            if (rs.hasColumn(FieldKey.fromString("duration")))
            {
                int duration = rs.getInt("duration");
                sb.append(" (duration: ").append(duration).append(" day").append(duration == 1 ? "" : "s").append(")").append("\n");
            }
        }

        return sb.toString();
    }

    @Override
    protected String getCategoryText(Results rs) throws SQLException
    {
        String category = rs.hasColumn(FieldKey.fromString("category")) ? rs.getString("category") : null;
        return category == null ?  "Medication Ordered" : category + " Medication Ordered";
    }

    @Override
    protected String getPrimaryGroup(Results rs) throws SQLException
    {
        String category = rs.getString("category");
        return category == null ?  "Clinical" : "Surgical".equals(category) ? "Surgery" : category;
    }

    @Override
    protected Set<String> getColumnNames()
    {
        return PageFlowUtil.set("Id", "date", "enddate", "route", "volume", "vol_units", "amount", "amount_units", "code", "code/meaning", "duration", "frequency/meaning", "category", "reason", "remark");
    }
}
