package org.labkey.wnprc_compliance;

import org.jetbrains.annotations.Nullable;
import org.labkey.api.data.Container;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.DbSchemaType;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.dialect.SqlDialect;
import org.labkey.api.query.SimpleUserSchema;
import org.labkey.api.security.User;
import org.labkey.wnprc_compliance.schema.tables.MostRecentProtocolRevision;

import java.util.HashSet;
import java.util.Set;

public class WNPRC_ComplianceSchema extends SimpleUserSchema {
    public static final String NAME = "wnprc_compliance";
    public static final String DESCRIPTION = "";

    public WNPRC_ComplianceSchema(User user, Container container) {
        super(NAME, DESCRIPTION, user, container, DbSchema.get(NAME, DbSchemaType.Module));
    }

    @Nullable
    @Override
    public TableInfo createTable(String name) {
        if (name.equalsIgnoreCase(MostRecentProtocolRevision.NAME)) {
            return new MostRecentProtocolRevision(this);
        }

        return super.createTable(name);
    }

    @Override
    public Set<String> getTableNames() {
        Set<String> tableNames = new HashSet<>();
        tableNames.addAll(super.getTableNames());

        tableNames.add(MostRecentProtocolRevision.NAME);

        return tableNames;
    }

    public SqlDialect getSqlDialect() {
        return getDbSchema().getSqlDialect();
    }
}
