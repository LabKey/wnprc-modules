package org.labkey.wnprc_compliance.schema.tables;

import org.jetbrains.annotations.Nullable;
import org.jooq.Select;
import org.labkey.api.data.*;
import org.labkey.api.query.ExprColumn;
import org.labkey.api.query.UserSchema;
import org.labkey.dbutils.jooq.jOOQConnection;
import org.labkey.wnprc_compliance.WNPRC_ComplianceSchema;

import static org.labkey.wnprc_compliance.model.jooq.Tables.PROTOCOLS;
import static org.labkey.wnprc_compliance.model.jooq.Tables.PROTOCOL_REVISIONS;

/**
 * Created by jon on 3/27/17.
 */
public class MostRecentProtocolRevision extends AbstractTableInfo {
    public static String NAME = "MostRecentProtocolRevision";
    private UserSchema schema;

    public MostRecentProtocolRevision(@Nullable UserSchema userSchema) {
        super(DbSchema.get(WNPRC_ComplianceSchema.NAME), NAME);
        schema = userSchema;

        this.addColumn(new ExprColumn(this, PROTOCOL_REVISIONS.PROTOCOL_ID.getName(), new SQLFragment(ExprColumn.STR_TABLE_ALIAS + "." + PROTOCOL_REVISIONS.PROTOCOL_ID.getName().toString()), JdbcType.VARCHAR));
        this.addColumn(new ExprColumn(this, PROTOCOL_REVISIONS.APPROVAL_DATE.getName(), new SQLFragment(ExprColumn.STR_TABLE_ALIAS + "." + PROTOCOL_REVISIONS.APPROVAL_DATE.getName().toString()), JdbcType.DATE));
    }


    @Override
    public SQLFragment getFromSQL() {
        SQLFragment sql = new SQLFragment();


        try (jOOQConnection jOOQConnection = new jOOQConnection(WNPRC_ComplianceSchema.NAME)) {
            String query = jOOQConnection.create().select(PROTOCOL_REVISIONS.PROTOCOL_ID, PROTOCOL_REVISIONS.APPROVAL_DATE)
                    .from(PROTOCOL_REVISIONS)
                    .getSQL();

            sql.append(query);
        }

        return sql;
    }

    @Nullable
    @Override
    public UserSchema getUserSchema() {
        return schema;
    }
}
