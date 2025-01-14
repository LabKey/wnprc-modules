/*
 * Copyright (c) 2025 LabKey Corporation
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

package org.labkey.cageui;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.jetbrains.annotations.Nullable;
import org.json.JSONArray;
import org.json.JSONObject;
import org.labkey.api.data.Container;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.DbSchemaType;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.dialect.SqlDialect;
import org.labkey.api.query.SimpleUserSchema;
import org.labkey.api.security.User;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;


public class CageUISchema extends SimpleUserSchema {

    private static Logger _log = LogManager.getLogger(CageUISchema.class);
    public static final String NAME = "cageui";
    public static String DESCRIPTION = "Schema for CageUI specific data.";
    public Container _container;

    /*
     * This should reflect the list of tables.
     */
    public enum TABLE {
        RACKS    ("racks"),
        LAYOUT_HISTORY   ("layout_history")
        ;

        String tableName;

        TABLE(String tableName) {
            this.tableName = tableName;
        }

        public String getTableName() {
            return this.tableName;
        }
    }

    public CageUISchema(User user, Container container) {
        super(NAME, DESCRIPTION, user, container, DbSchema.get(NAME, DbSchemaType.Module));
        _container = container;
    }
    @Override
    public Set<String> getTableNames() {
        // Grab the ones that are defined in SQL
        Set<String> tables = new HashSet<>();

        tables.addAll(super.getTableNames());
        tables.addAll(getEnumTables().keySet());

        return tables;
    }

    private Map<String, TableInfo> _enumTables = null;
    protected Map<String, TableInfo> getEnumTables() {
        if (_enumTables == null) {
            _enumTables = new HashMap<>();
        }

        return _enumTables;
    }


    public DbSchema getSchema()
    {
        return DbSchema.get(NAME, DbSchemaType.Module);
    }


}
