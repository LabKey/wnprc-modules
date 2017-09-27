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

import java.sql.SQLException;

/**
 * User: bimber
 * Date: 2/17/13
 * Time: 4:52 PM
 */
public class DefaultDeathsDataSource extends AbstractDataSource
{
    public DefaultDeathsDataSource()
    {
        super("study", "Deaths", "Death", "Deaths");
    }

    @Override
    protected String getHtml(Container c, Results rs, boolean redacted) throws SQLException
    {
        StringBuilder sb = new StringBuilder();
        sb.append(safeAppend(rs, "Cause", "cause"));

        if (!redacted)
        {
            sb.append(safeAppend(rs, "Manner", "manner"));
            sb.append(safeAppend(rs, "Necropsy #", "necropsy"));
        }

        return sb.toString();
    }
}
