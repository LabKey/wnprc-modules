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
package org.labkey.ehr.table;

import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.Logger;
import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.DataColumn;
import org.labkey.api.data.RenderContext;
import org.labkey.api.query.FieldKey;
import org.labkey.api.view.template.ClientDependency;

import java.io.IOException;
import java.io.Writer;
import java.util.Collections;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;

/**
 * User: bimber
 * Date: 10/23/13
 * Time: 3:49 PM
 */
public class SNOMEDCodesDisplayColumn extends DataColumn
{
    private static final Logger _log = Logger.getLogger(SNOMEDCodesDisplayColumn.class);

    public SNOMEDCodesDisplayColumn(ColumnInfo col)
    {
        super(col);
    }

    public void renderGridCellContents(RenderContext ctx, Writer out) throws IOException
    {
        Object o = getValue(ctx);
        if (o != null)
        {
            String val = o.toString();
            String[] parts = val.split("\\n");
            Map<Integer, String> ret = new TreeMap<>();
            for (String part : parts)
            {
                part = StringUtils.trimToNull(part);
                String[] tokens = part.split(": ");
                if (tokens.length == 2 && StringUtils.trimToNull(tokens[0]) != null)
                {
                    Integer sort = Integer.parseInt(tokens[0]);
                    if (ret.containsKey(sort))
                    {
                        Object objectid = ctx.get(FieldKey.fromString("objectid"));
                        _log.error("Duplicate sort for snomed: " + sort + (objectid == null ? "" : ".  objectid: " + objectid));
                        ret.put(sort, ret.get(sort) + "<br>" + part);
                    }
                    else
                    {
                        ret.put(sort, part);
                    }

                }
                else
                {
                    _log.error("Invalid SNOMED string: " + val);
                }
            }

            String text;
            String delim = "";
            for (Integer sort : ret.keySet())
            {
                text = ret.get(sort).replaceAll("\\r?\\n", "<br>");
                out.write(delim);
                delim = "<br>";
                out.write(text);
            }
        }
    }

    @Override
    public @NotNull Set<ClientDependency> getClientDependencies()
    {
        return Collections.singleton(ClientDependency.fromPath("ehr/ehr_api.lib.xml"));
    }
}
