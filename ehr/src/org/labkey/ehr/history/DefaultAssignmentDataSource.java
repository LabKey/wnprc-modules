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
public class DefaultAssignmentDataSource extends AbstractDataSource
{
    public DefaultAssignmentDataSource()
    {
        super("study", "Assignment", "Assignment", "Assignments");
    }

    @Override
    protected String getHtml(Container c, Results rs, boolean redacted) throws SQLException
    {
        StringBuilder sb = new StringBuilder();

        if (rs.hasColumn(FieldKey.fromString("date")) && rs.getObject("date") != null)
            sb.append("Assignment Start: ").append(DateUtil.formatDate(c, rs.getDate("date"))).append("\n");

        FieldKey projname = FieldKey.fromString("project/name");
        if (rs.hasColumn(projname) && rs.getObject(projname) != null)
        {
            sb.append("Project: ").append(rs.getString(projname)).append("\n");

            if (!redacted)
            {
                FieldKey inves = FieldKey.fromString("project/investigatorId/lastname");
                if (rs.hasColumn(inves) && rs.getObject(inves) != null)
                    sb.append("Investigator: ").append(rs.getString(inves)).append("\n");
            }

            FieldKey title = FieldKey.fromString("project/title");
            if (rs.hasColumn(title) && rs.getObject(title) != null)
                sb.append("Title: ").append(rs.getString(title)).append("\n");
        }

        if (rs.hasColumn(FieldKey.fromString("enddate")) && rs.getObject("enddate") != null)
            sb.append("Removal Date: ").append(DateUtil.formatDate(c, rs.getDate("enddate"))).append("\n");

        return sb.toString();
    }

    @Override
    protected Set<String> getColumnNames()
    {
        return PageFlowUtil.set("Id", "date", "enddate", "project", "project/name", "project/investigatorId", "project/investigatorId/lastname", "project/title");
    }
}
