
package org.labkey.enterweights;

import org.labkey.api.data.DbSchema;
import org.labkey.api.data.DbSchemaType;
import org.labkey.api.data.dialect.SqlDialect;

public class EnterWeightsSchema
{
    private static final EnterWeightsSchema _instance = new EnterWeightsSchema();
    public static final String NAME = "enterweights";

    public static EnterWeightsSchema getInstance()
    {
        return _instance;
    }

    private EnterWeightsSchema()
    {
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
