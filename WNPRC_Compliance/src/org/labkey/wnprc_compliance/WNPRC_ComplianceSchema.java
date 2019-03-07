package org.labkey.wnprc_compliance;

import org.labkey.api.data.Container;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.DbSchemaType;
import org.labkey.api.data.dialect.SqlDialect;
import org.labkey.api.query.SimpleUserSchema;
import org.labkey.api.security.User;

public class WNPRC_ComplianceSchema extends SimpleUserSchema {
    public static final String NAME = "wnprc_compliance";
    public static final String DESCRIPTION = "";

    public WNPRC_ComplianceSchema(User user, Container container) {
        super(NAME, DESCRIPTION, user, container, DbSchema.get(NAME, DbSchemaType.Module));
    }

    public SqlDialect getSqlDialect() {
        return getDbSchema().getSqlDialect();
    }
}
