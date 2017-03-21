/**
 * This class is generated by jOOQ
 */
package org.labkey.wnprc_compliance.model.jooq.tables;


import java.sql.Timestamp;
import java.util.Arrays;
import java.util.List;

import javax.annotation.Generated;

import org.jooq.Field;
import org.jooq.Schema;
import org.jooq.Table;
import org.jooq.TableField;
import org.jooq.UniqueKey;
import org.jooq.impl.TableImpl;
import org.labkey.wnprc_compliance.model.jooq.Keys;
import org.labkey.wnprc_compliance.model.jooq.WnprcCompliance;
import org.labkey.wnprc_compliance.model.jooq.tables.records.ProtocolRenewalsRecord;


/**
 * This class is generated by jOOQ.
 */
@Generated(
    value = {
        "http://www.jooq.org",
        "jOOQ version:3.8.4"
    },
    comments = "This class is generated by jOOQ"
)
@SuppressWarnings({ "all", "unchecked", "rawtypes" })
public class ProtocolRenewals extends TableImpl<ProtocolRenewalsRecord> {

    private static final long serialVersionUID = -2084902126;

    /**
     * The reference instance of <code>wnprc_compliance.protocol_renewals</code>
     */
    public static final ProtocolRenewals PROTOCOL_RENEWALS = new ProtocolRenewals();

    /**
     * The class holding records for this type
     */
    @Override
    public Class<ProtocolRenewalsRecord> getRecordType() {
        return ProtocolRenewalsRecord.class;
    }

    /**
     * The column <code>wnprc_compliance.protocol_renewals.expired_protocol</code>.
     */
    public final TableField<ProtocolRenewalsRecord, String> EXPIRED_PROTOCOL = createField("expired_protocol", org.jooq.impl.SQLDataType.CLOB, this, "");

    /**
     * The column <code>wnprc_compliance.protocol_renewals.renewed_protocol</code>.
     */
    public final TableField<ProtocolRenewalsRecord, String> RENEWED_PROTOCOL = createField("renewed_protocol", org.jooq.impl.SQLDataType.CLOB.nullable(false), this, "");

    /**
     * The column <code>wnprc_compliance.protocol_renewals.createdby</code>.
     */
    public final TableField<ProtocolRenewalsRecord, Integer> CREATEDBY = createField("createdby", org.jooq.impl.SQLDataType.INTEGER, this, "");

    /**
     * The column <code>wnprc_compliance.protocol_renewals.created</code>.
     */
    public final TableField<ProtocolRenewalsRecord, Timestamp> CREATED = createField("created", org.jooq.impl.SQLDataType.TIMESTAMP, this, "");

    /**
     * The column <code>wnprc_compliance.protocol_renewals.modifiedby</code>.
     */
    public final TableField<ProtocolRenewalsRecord, Integer> MODIFIEDBY = createField("modifiedby", org.jooq.impl.SQLDataType.INTEGER, this, "");

    /**
     * The column <code>wnprc_compliance.protocol_renewals.modified</code>.
     */
    public final TableField<ProtocolRenewalsRecord, Timestamp> MODIFIED = createField("modified", org.jooq.impl.SQLDataType.TIMESTAMP, this, "");

    /**
     * Create a <code>wnprc_compliance.protocol_renewals</code> table reference
     */
    public ProtocolRenewals() {
        this("protocol_renewals", null);
    }

    /**
     * Create an aliased <code>wnprc_compliance.protocol_renewals</code> table reference
     */
    public ProtocolRenewals(String alias) {
        this(alias, PROTOCOL_RENEWALS);
    }

    private ProtocolRenewals(String alias, Table<ProtocolRenewalsRecord> aliased) {
        this(alias, aliased, null);
    }

    private ProtocolRenewals(String alias, Table<ProtocolRenewalsRecord> aliased, Field<?>[] parameters) {
        super(alias, null, aliased, parameters, "");
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Schema getSchema() {
        return WnprcCompliance.WNPRC_COMPLIANCE;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public UniqueKey<ProtocolRenewalsRecord> getPrimaryKey() {
        return Keys.PK_PROTOCOL_RENEWALS;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public List<UniqueKey<ProtocolRenewalsRecord>> getKeys() {
        return Arrays.<UniqueKey<ProtocolRenewalsRecord>>asList(Keys.PK_PROTOCOL_RENEWALS);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public ProtocolRenewals as(String alias) {
        return new ProtocolRenewals(alias, this);
    }

    /**
     * Rename this table
     */
    public ProtocolRenewals rename(String name) {
        return new ProtocolRenewals(name, null);
    }
}
