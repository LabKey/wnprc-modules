package org.labkey.dbutils.jooq;

import org.jooq.Configuration;
import org.jooq.DSLContext;
import org.jooq.SQLDialect;
import org.jooq.impl.DSL;
import org.jooq.impl.DefaultConfiguration;
import org.jooq.impl.DefaultRecordListenerProvider;
import org.labkey.api.data.Container;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.DbSchemaType;
import org.labkey.api.data.DbScope;
import org.labkey.api.security.User;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.UUID;

/**
 * Created by jon on 11/12/16.
 */
public class jOOQConnection implements AutoCloseable {
    private final DSLContext _context;
    private Connection _connection;
    private DbScope _scope;

    public jOOQConnection(String dbSchemaName, Container container, User user) {
        this._scope = DbSchema.get(dbSchemaName, DbSchemaType.Module).getScope();
        this._connection = null;
        try {
            this._connection = this._scope.getConnection();
        }
        catch (SQLException e) {
            e.printStackTrace();
        }

        RecordListener recordListener = new RecordListener(container, user);

        Configuration config = new DefaultConfiguration().set(_connection).set(SQLDialect.POSTGRES);
        config.set(new DefaultRecordListenerProvider(recordListener));

        _context = DSL.using(config);
    }

    public DSLContext create() {
        return _context;
    }

    @Override
    public void close() {
        _scope.releaseConnection(_connection);
    }

    /**
     * Since LabKey doesn't support UUIDs for private keys, we'll use UUID-like strings.  It'll cause a bit of
     * storage overhead, and indexing won't be as fast, but it works well at the scale that we operate at.
     *
     * @return
     */
    public static String getNewUUID() {
        return UUID.randomUUID().toString().toUpperCase();
    }
}