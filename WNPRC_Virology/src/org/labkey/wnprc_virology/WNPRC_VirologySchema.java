package org.labkey.wnprc_virology;

import org.labkey.api.data.Container;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.DbSchemaType;
import org.labkey.api.data.dialect.SqlDialect;
import org.labkey.api.query.SimpleUserSchema;
import org.labkey.api.security.User;

public class WNPRC_VirologySchema extends SimpleUserSchema
{
    public static final String NAME = "wnprc_virology";
    public Container _container;

    public WNPRC_VirologySchema(User user, Container container) {
        super(NAME, "WNPRC VIROLOGY SCHEMA FOR ETLS", user, container, DbSchema.get(NAME, DbSchemaType.Module));
        _container = container;
    }

    public DbSchema getSchema()
    {
        return DbSchema.get(NAME, DbSchemaType.Module);
    }

    public SqlDialect getSqlDialect()
    {
        return getSchema().getSqlDialect();
    }
}
