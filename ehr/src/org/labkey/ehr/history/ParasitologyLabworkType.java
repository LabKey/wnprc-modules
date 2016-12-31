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

import org.labkey.api.data.Results;
import org.labkey.api.ehr.history.DefaultLabworkType;
import org.labkey.api.module.Module;
import org.labkey.api.query.FieldKey;
import org.labkey.api.util.PageFlowUtil;

import java.sql.SQLException;
import java.util.Set;

/**
 * User: bimber
 * Date: 3/6/13
 * Time: 12:27 PM
 */
public class ParasitologyLabworkType extends DefaultLabworkType
{
    private String _methodField = "method";

    public ParasitologyLabworkType(Module module)
    {
        super("Parasitology", "study", "Parasitology Results", module);
        _testIdField = "organism/meaning";
    }

    @Override
    protected Set<String> getColumnNames()
    {
        return PageFlowUtil.set(_lsidField, _idField, _dateField, _runIdField, _testIdField, _resultField, _methodField);
    }

    @Override
    protected String getLine(Results rs, boolean redacted) throws SQLException
    {
        StringBuilder sb = new StringBuilder();

        Double result = rs.getDouble(FieldKey.fromString(_resultField));
        String organism = rs.getString(FieldKey.fromString(_testIdField));
        String method = rs.getString(FieldKey.fromString(_methodField));

        String delim = "";

        if (method != null)
        {
            sb.append(delim).append("Method: ").append(method);
            delim = "\n";
        }

        if (organism != null)
        {
            sb.append(delim).append("Organism: ").append(organism);
            delim = "\n";
        }

        sb.append(delim);

        return sb.toString();
    }
}
