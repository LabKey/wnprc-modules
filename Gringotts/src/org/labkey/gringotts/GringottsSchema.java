/*
 * Copyright (c) 2015 LabKey Corporation
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

package org.labkey.gringotts;

import org.jooq.DSLContext;
import org.jooq.SQLDialect;
import org.jooq.impl.DSL;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.DbSchemaType;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.dialect.SqlDialect;

import java.sql.Timestamp;

public class GringottsSchema {
    private static final GringottsSchema _instance = new GringottsSchema();
    public static final String NAME = "gringotts";

    public static GringottsSchema getInstance()
    {
        return _instance;
    }

    private GringottsSchema() {
        // private constructor to prevent instantiation from
        // outside this class: this singleton should only be
        // accessed via org.labkey.gringotts.GringottsSchema.getInstance()
    }

    public DbSchema getSchema() {
        return DbSchema.get(NAME, DbSchemaType.Module);
    }

    public TableInfo getVaultTableInfo() {
        return this.getSchema().getTable("vaults");
    }

    public SqlDialect getSqlDialect() {
        return getSchema().getSqlDialect();
    }

    static public DSLContext getSQLConnection() {
        return DSL.using(SQLDialect.POSTGRES);
    }

    public static Timestamp now() {
        return new Timestamp(System.currentTimeMillis());
    }
}
