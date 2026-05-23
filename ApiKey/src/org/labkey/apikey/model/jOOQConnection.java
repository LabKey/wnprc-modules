/*
 * Copyright (c) 2016-2026 Board of Regents of the University of Wisconsin System
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
package org.labkey.apikey.model;

import org.jooq.DSLContext;
import org.jooq.SQLDialect;
import org.jooq.impl.DSL;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.DbSchemaType;
import org.labkey.api.data.DbScope;
import org.labkey.apikey.ApiKeySchema;

import java.sql.Connection;
import java.sql.SQLException;

/**
 * Created by jon on 11/12/16.
 */
public class jOOQConnection implements AutoCloseable {
    private final DSLContext _context;
    private Connection _connection;
    private DbScope _scope;

    public jOOQConnection() {
        this._scope = DbSchema.get(ApiKeySchema.getInstance().NAME, DbSchemaType.Module).getScope();
        this._connection = null;
        try {
            this._connection = this._scope.getConnection();
        }
        catch (SQLException e) {
            e.printStackTrace();
        }

        _context = DSL.using(_connection, SQLDialect.POSTGRES);
    }

    public DSLContext create() {
        return _context;
    }

    @Override
    public void close() {
        _scope.releaseConnection(_connection);
    }
}
