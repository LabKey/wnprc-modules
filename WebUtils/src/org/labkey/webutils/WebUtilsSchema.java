package org.labkey.webutils;

import org.labkey.api.data.DbSchema;
import org.labkey.api.data.DbSchemaType;
import org.labkey.api.data.dialect.SqlDialect;

public class WebUtilsSchema
{
    private static final WebUtilsSchema _instance = new WebUtilsSchema();
    public static final String NAME = "webutils";

    public static WebUtilsSchema getInstance()
    {
        return _instance;
    }

    private WebUtilsSchema()
    {
        // private constructor to prevent instantiation from
        // outside this class: this singleton should only be
        // accessed via org.labkey.webutils.WebUtilsSchema.getInstance()
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
