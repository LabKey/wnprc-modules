package org.labkey.deviceproxy.model.jooq;

import org.jooq.DSLContext;
import org.jooq.SQLDialect;
import org.jooq.impl.DSL;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.DbSchemaType;
import org.labkey.api.data.DbScope;
import org.labkey.deviceproxy.DeviceProxyModule;
import org.labkey.deviceproxy.DeviceProxySchema;

import java.sql.Connection;
import java.sql.SQLException;

/**
 * Created by jon on 11/16/16.
 */
public class jOOQConnection implements AutoCloseable {
    private final DSLContext _context;
    private Connection _connection;
    private DbScope _scope;

    public jOOQConnection() {
        this._scope = DbSchema.get(DeviceProxySchema.getInstance().NAME, DbSchemaType.Module).getScope();
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