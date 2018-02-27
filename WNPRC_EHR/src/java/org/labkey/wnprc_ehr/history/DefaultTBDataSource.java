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
package org.labkey.wnprc_ehr.history;

import org.labkey.api.data.Container;
import org.labkey.api.data.Results;
import org.labkey.api.ehr.history.AbstractDataSource;
import org.labkey.api.module.Module;
import org.labkey.wnprc_ehr.WNPRC_EHRModule;

import java.sql.SQLException;

/**
 * User: bimber
 * Date: 2/17/13
 * Time: 4:52 PM
 */
public class DefaultTBDataSource extends AbstractDataSource
{
    public DefaultTBDataSource(Module module)
    {
        super("study", "TB Tests", "TB Tests", module);
    }

    @Override
    protected String getHtml(Container c, Results rs, boolean redacted) throws SQLException
    {
        StringBuilder sb = new StringBuilder();

        sb.append("TB Test Performed\n");
        sb.append(safeAppend(rs, "Lot", "lot"));
        sb.append(safeAppend(rs, "Result", "result"));
        sb.append(safeAppend(rs, "Remark", "remark"));

        return sb.toString();
    }
}
