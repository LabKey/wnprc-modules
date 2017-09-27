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
package org.labkey.ehr.query;

import org.apache.commons.lang3.StringUtils;
import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.Container;
import org.labkey.api.data.SchemaTableInfo;
import org.labkey.api.dataiterator.DataIterator;
import org.labkey.api.dataiterator.DataIteratorBuilder;
import org.labkey.api.dataiterator.DataIteratorContext;
import org.labkey.api.dataiterator.SimpleTranslator;
import org.labkey.api.ldk.LDKService;
import org.labkey.api.ldk.table.AbstractDataDefinedTable;
import org.labkey.api.query.DuplicateKeyException;
import org.labkey.api.query.InvalidKeyException;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.QueryUpdateServiceException;
import org.labkey.api.query.SimpleUserSchema;
import org.labkey.api.query.UserSchema;
import org.labkey.api.query.ValidationException;
import org.labkey.api.security.User;

import java.sql.SQLException;
import java.util.Map;
import java.util.concurrent.Callable;

/**
 * User: bimber
 * Date: 3/27/13
 * Time: 6:20 PM
 */
public class LabworkTypeTable extends AbstractDataDefinedTable
{
    public static final String CACHE_KEY = LabworkTypeTable.class.getName() + "||types";

    private static final String FILTER_FIELD = "testid";
    private static final String TYPE_FIELD = "type";

    public LabworkTypeTable(UserSchema schema, SchemaTableInfo table, String tableName, String filterValue)
    {
        super(schema, table, TYPE_FIELD, FILTER_FIELD, tableName, filterValue);
        setTitleColumn("testid");
    }

    @Override
    public LabworkTypeTable init()
    {
        LabworkTypeTable result = (LabworkTypeTable) super.init();
        LDKService.get().getDefaultTableCustomizer().customize(this);
        return result;
    }

    private void normalizeAliases(Map<String, Object> map)
    {
        if (map.get("aliases") != null)
        {
            String aliases = (String)map.get("aliases");
            aliases = normalizeAliasString(aliases);

            map.put("aliases", aliases);
        }
    }

    private String normalizeAliasString(String aliases)
    {
        if (aliases != null)
        {
            //remove whitespace and punctutation
            aliases = aliases.replaceAll("\\s", "");
            aliases = aliases.replaceAll(";", ",");
            aliases = aliases.replaceAll(",+", ",");
        }

        return aliases;
    }

    @Override
    public QueryUpdateService getUpdateService()
    {
        return new LabWorkTableUpdateService(this);
    }

    private class LabWorkTableUpdateService extends UpdateService
    {
        public LabWorkTableUpdateService(SimpleUserSchema.SimpleTable ti)
        {
            super(ti);
        }

        //NOTE: this code should never be called, now that we have migrated to ETL
        @Override
        protected Map<String, Object> insertRow(User user, Container container, Map<String, Object> row) throws DuplicateKeyException, ValidationException, QueryUpdateServiceException, SQLException
        {
            normalizeAliases(row);
            return super.insertRow(user, container, row);
        }

        @Override
        protected Map<String, Object> updateRow(User user, Container container, Map<String, Object> row, @NotNull Map<String, Object> oldRow) throws InvalidKeyException, ValidationException, QueryUpdateServiceException, SQLException
        {
            normalizeAliases(row);
            return super.updateRow(user, container, row, oldRow);
        }
    }

    @Override
    public DataIteratorBuilder persistRows(DataIteratorBuilder data, DataIteratorContext context)
    {
        data = new LabworkDataIteratorBuilder(data, context);
        return super.persistRows(data, context);
    }

    protected class LabworkDataIteratorBuilder extends _DataIteratorBuilder
    {
        LabworkDataIteratorBuilder(@NotNull DataIteratorBuilder in, DataIteratorContext context)
        {
            super(in, context);
        }

        @Override
        protected void configureTranslator(DataIterator input, final SimpleTranslator it)
        {
            super.configureTranslator(input, it);

            final String aliasColName = "aliases";
            int aliasInputIdx = 0;
            for (int idx = 1; idx <= input.getColumnCount(); idx++)
            {
                ColumnInfo col = input.getColumnInfo(idx);
                if (StringUtils.equalsIgnoreCase(aliasColName, col.getName()))
                {
                    aliasInputIdx = idx;
                }
            }

            //only add this column if the input has aliases
            if (aliasInputIdx > 0)
            {
                //remove column from output if it exist, so we can replace it
                int outputIdx = 0;
                for (int idx = 1; idx <= it.getColumnCount(); idx++)
                {
                    ColumnInfo col = it.getColumnInfo(idx);
                    if (StringUtils.equalsIgnoreCase(aliasColName, col.getName()))
                    {
                        outputIdx = idx;
                    }
                }

                if (outputIdx > 0)
                    it.removeColumn(outputIdx);

                //append a column that will normalize whitespace in aliases
                ColumnInfo aliasColInfo = getRealTable().getColumn(aliasColName);
                final int inputIdx = aliasInputIdx;
                it.addColumn(aliasColInfo, new Callable()
                {
                    @Override
                    public Object call() throws Exception
                    {
                        Object val = it.getInputColumnValue(inputIdx);
                        if (val != null && val instanceof String)
                        {
                            val = normalizeAliasString((String)val);
                        }

                        return val;
                    }
                });
            }
        }
    }
}
