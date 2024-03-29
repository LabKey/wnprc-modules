/**
 * This class is generated by jOOQ
 */
package org.labkey.apikey.model.jooq.tables;


import jakarta.annotation.Generated;
import org.jooq.Field;
import org.jooq.Schema;
import org.jooq.Table;
import org.jooq.TableField;
import org.jooq.UniqueKey;
import org.jooq.impl.TableImpl;
import org.labkey.apikey.model.jooq.Apikey;
import org.labkey.apikey.model.jooq.Keys;
import org.labkey.apikey.model.jooq.tables.records.ApikeysRecord;

import java.sql.Timestamp;
import java.util.Arrays;
import java.util.List;


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
public class Apikeys extends TableImpl<ApikeysRecord> {

    private static final long serialVersionUID = 1747545426;

    /**
     * The reference instance of <code>apikey.apikeys</code>
     */
    public static final Apikeys APIKEYS = new Apikeys();

    /**
     * The class holding records for this type
     */
    @Override
    public Class<ApikeysRecord> getRecordType() {
        return ApikeysRecord.class;
    }

    /**
     * The column <code>apikey.apikeys.apikey</code>.
     */
    public final TableField<ApikeysRecord, String> APIKEY = createField("apikey", org.jooq.impl.SQLDataType.CLOB.nullable(false), this, "");

    /**
     * The column <code>apikey.apikeys.note</code>.
     */
    public final TableField<ApikeysRecord, String> NOTE = createField("note", org.jooq.impl.SQLDataType.CLOB, this, "");

    /**
     * The column <code>apikey.apikeys.issuperkey</code>.
     */
    public final TableField<ApikeysRecord, Boolean> ISSUPERKEY = createField("issuperkey", org.jooq.impl.SQLDataType.BOOLEAN.nullable(false).defaultValue(org.jooq.impl.DSL.field("false", org.jooq.impl.SQLDataType.BOOLEAN)), this, "");

    /**
     * The column <code>apikey.apikeys.owner</code>.
     */
    public final TableField<ApikeysRecord, Integer> OWNER = createField("owner", org.jooq.impl.SQLDataType.INTEGER.nullable(false), this, "");

    /**
     * The column <code>apikey.apikeys.starts</code>.
     */
    public final TableField<ApikeysRecord, Timestamp> STARTS = createField("starts", org.jooq.impl.SQLDataType.TIMESTAMP, this, "");

    /**
     * The column <code>apikey.apikeys.expires</code>.
     */
    public final TableField<ApikeysRecord, Timestamp> EXPIRES = createField("expires", org.jooq.impl.SQLDataType.TIMESTAMP, this, "");

    /**
     * Create a <code>apikey.apikeys</code> table reference
     */
    public Apikeys() {
        this("apikeys", null);
    }

    /**
     * Create an aliased <code>apikey.apikeys</code> table reference
     */
    public Apikeys(String alias) {
        this(alias, APIKEYS);
    }

    private Apikeys(String alias, Table<ApikeysRecord> aliased) {
        this(alias, aliased, null);
    }

    private Apikeys(String alias, Table<ApikeysRecord> aliased, Field<?>[] parameters) {
        super(alias, null, aliased, parameters, "");
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Schema getSchema() {
        return Apikey.APIKEY;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public UniqueKey<ApikeysRecord> getPrimaryKey() {
        return Keys.PK_APIKEYS;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public List<UniqueKey<ApikeysRecord>> getKeys() {
        return Arrays.<UniqueKey<ApikeysRecord>>asList(Keys.PK_APIKEYS);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Apikeys as(String alias) {
        return new Apikeys(alias, this);
    }

    /**
     * Rename this table
     */
    public Apikeys rename(String name) {
        return new Apikeys(name, null);
    }
}
