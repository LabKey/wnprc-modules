package org.labkey.dbutils.jooq;

import org.jetbrains.annotations.Nullable;
import org.jooq.DataType;
import org.jooq.Field;
import org.jooq.Record;
import org.jooq.Table;
import org.labkey.api.data.*;
import org.labkey.api.query.ExprColumn;
import org.labkey.api.query.UserSchema;

/**
 * Created by jon on 3/28/17.
 */
public abstract class jOOQTableInfo<RecordType extends Record> extends AbstractTableInfo {
    protected UserSchema userSchema;

    public jOOQTableInfo(String tableName, String dbSchema, UserSchema userSchema) {
        super(DbSchema.get(dbSchema, DbSchemaType.Module), tableName);
        this.userSchema = userSchema;

        registerColumns();
    }

    protected void registerColumns() {
        for (Field field : getjOOQTable().fields()) {
            this.registerColumn(field);
        }
    }

    protected void registerColumn(Field field) {
        DataType fieldType = field.getDataType();
        JdbcType jdbcType = JdbcType.valueOf(fieldType.getSQLType());
        String name = field.getName();

        this.addColumn(new ExprColumn(this, name, new SQLFragment(ExprColumn.STR_TABLE_ALIAS + ".\"" + name + "\""), jdbcType));
    }

    @Override
    protected SQLFragment getFromSQL() {
        SQLFragment sql = new SQLFragment();

        try (jOOQConnection jOOQConnection = new jOOQConnection(userSchema.getSchemaName(), userSchema.getContainer(), userSchema.getUser())) {
            sql.append(jOOQConnection.create().selectFrom(getjOOQTable()).getSQL());
        }

        return sql;
    }

    @Nullable
    @Override
    public UserSchema getUserSchema() {
        return this.userSchema;
    }

    public abstract Table<RecordType> getjOOQTable();
}
