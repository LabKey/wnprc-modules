package org.labkey.animalrequests;

import org.labkey.api.data.DbSchema;
import org.labkey.api.data.DbSchemaType;
import org.labkey.api.data.dialect.SqlDialect;

public class AnimalRequestsSchema
{
    private static final AnimalRequestsSchema _instance = new AnimalRequestsSchema();
    public static final String NAME = "animalrequests";

    public static AnimalRequestsSchema getInstance()
    {
        return _instance;
    }

    //this schema is never used and is actually defined in the wnprc schema
    private AnimalRequestsSchema()
    {
        // private constructor to prevent instantiation from
        // outside this class: this singleton should only be
        // accessed via org.labkey.animalrequests.AnimalRequestsSchema.getInstance()
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
