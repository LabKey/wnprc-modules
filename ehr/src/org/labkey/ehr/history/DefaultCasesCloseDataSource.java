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

import org.apache.commons.lang3.time.DateUtils;
import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.Results;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.ehr.history.AbstractDataSource;
import org.labkey.api.ehr.history.HistoryRow;
import org.labkey.api.query.FieldKey;
import org.labkey.api.security.User;
import org.labkey.api.util.DateUtil;
import org.labkey.api.util.PageFlowUtil;

import java.sql.Date;
import java.sql.SQLException;
import java.util.List;
import java.util.Set;

/**
 * User: bimber
 * Date: 2/17/13
 * Time: 4:52 PM
 */
public class DefaultCasesCloseDataSource extends AbstractDataSource
{
    public DefaultCasesCloseDataSource()
    {
        super("study", "Cases", "Case Closed", "Clinical");
    }

    @Override
    protected String getHtml(Container c, Results rs, boolean redacted) throws SQLException
    {
        Date start = rs.getDate(FieldKey.fromString("date"));
        Date end = rs.getDate(FieldKey.fromString("enddate"));
        if (DateUtils.isSameDay(start, end))
        {
            return null;
        }
        StringBuilder sb = new StringBuilder();

        sb.append(safeAppend(rs, "Category", "category"));
        sb.append(safeAppend(rs, "Case #", "caseno"));
        sb.append("Opened On: ").append(DateUtil.formatDate(c, start));

        return sb.toString();
    }

    @Override
    protected String getDateField()
    {
        return "enddate";
    }

    @Override
    protected @NotNull List<HistoryRow> getRows(Container c, User u, SimpleFilter filter, boolean redacted)
    {
        filter.addCondition(FieldKey.fromString(getDateField()), null, CompareType.NONBLANK);
        return super.getRows(c, u, filter, redacted);
    }

    @Override
    protected Set<String> getColumnNames()
    {
        return PageFlowUtil.set("Id", "date", "enddate", "caseno", "category", "objectid", "performedby");
    }
}

