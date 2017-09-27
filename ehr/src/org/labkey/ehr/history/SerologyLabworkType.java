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
public class SerologyLabworkType extends DefaultLabworkType
{
    private String _sampleTypeField = "tissue/meaning";
    private String _methodField = "method";
    private String _numericResultsField = "numericresult";

    public SerologyLabworkType(Module module)
    {
        super("Serology", "study", "Serology Results", module);
        _testIdField = "agent/meaning";
    }

    @Override
    protected Set<String> getColumnNames()
    {
        return PageFlowUtil.set(_lsidField, _idField, _dateField, _runIdField, _testIdField, _remarkField, _resultField, _sampleTypeField, _methodField, _unitsField, _numericResultsField);
    }

    @Override
    protected String getLine(Results rs, boolean redacted) throws SQLException
    {
        StringBuilder sb = new StringBuilder();
        sb.append("<span style='line-height: 110%;'>");

        String agent = rs.getString(FieldKey.fromString(_testIdField));
        String tissue = rs.getString(FieldKey.fromString(_sampleTypeField));
        String result = rs.getString(FieldKey.fromString(_resultField));
        String method = rs.getString(FieldKey.fromString(_methodField));

        String numericResult = rs.getString(FieldKey.fromString(_numericResultsField));
        String units = rs.getString(FieldKey.fromString(_unitsField));
        String remark = rs.getString(FieldKey.fromString(_remarkField));

        String delim = "";

        if (method != null)
        {
            sb.append(delim).append("Method: ").append(method);
            delim = "\n";
        }

        if (tissue != null)
        {
            sb.append(delim).append("Tissue: ").append(tissue);
            delim = "\n";
        }

        if (agent != null)
        {
            sb.append(delim).append("Agent: ").append(agent);
            delim = "\n";
        }

        if (result != null)
        {
            String style = "";
            if ("Positive".equalsIgnoreCase(result))
                style = " style='margin-top: 2px;background-color: yellow;'";

            sb.append(delim).append("Result: ");
            sb.append("<span " + style + ">");
            sb.append(result);
            sb.append("</span>");
            delim = "\n";
        }

        if (numericResult != null)
        {
            sb.append(delim).append("Numeric Result: ").append(numericResult);
            if (units != null)
                sb.append(" ").append(units);

            delim = "\n";
        }

        if (remark != null)
        {
            sb.append(delim).append("Remark: ").append(remark);
            delim = "\n";
        }
        sb.append("</span>");
        sb.append(delim);
        sb.append(delim);

        return sb.toString();
    }
}
