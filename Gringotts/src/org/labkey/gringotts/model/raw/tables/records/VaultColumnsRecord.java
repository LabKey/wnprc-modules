/**
 * This class is generated by jOOQ
 */
package org.labkey.gringotts.model.raw.tables.records;


import javax.annotation.Generated;

import org.jooq.Field;
import org.jooq.Record3;
import org.jooq.Record5;
import org.jooq.Row5;
import org.jooq.impl.UpdatableRecordImpl;
import org.labkey.gringotts.model.raw.tables.VaultColumns;


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
public class VaultColumnsRecord extends UpdatableRecordImpl<VaultColumnsRecord> implements Record5<String, Integer, String, String, String> {

    private static final long serialVersionUID = 168179033;

    /**
     * Setter for <code>gringotts.vault_columns.vaultid</code>.
     */
    public void setVaultid(String value) {
        set(0, value);
    }

    /**
     * Getter for <code>gringotts.vault_columns.vaultid</code>.
     */
    public String getVaultid() {
        return (String) get(0);
    }

    /**
     * Setter for <code>gringotts.vault_columns.version</code>.
     */
    public void setVersion(Integer value) {
        set(1, value);
    }

    /**
     * Getter for <code>gringotts.vault_columns.version</code>.
     */
    public Integer getVersion() {
        return (Integer) get(1);
    }

    /**
     * Setter for <code>gringotts.vault_columns.columnname</code>.
     */
    public void setColumnname(String value) {
        set(2, value);
    }

    /**
     * Getter for <code>gringotts.vault_columns.columnname</code>.
     */
    public String getColumnname() {
        return (String) get(2);
    }

    /**
     * Setter for <code>gringotts.vault_columns.type</code>.
     */
    public void setType(String value) {
        set(3, value);
    }

    /**
     * Getter for <code>gringotts.vault_columns.type</code>.
     */
    public String getType() {
        return (String) get(3);
    }

    /**
     * Setter for <code>gringotts.vault_columns.columnid</code>.
     */
    public void setColumnid(String value) {
        set(4, value);
    }

    /**
     * Getter for <code>gringotts.vault_columns.columnid</code>.
     */
    public String getColumnid() {
        return (String) get(4);
    }

    // -------------------------------------------------------------------------
    // Primary key information
    // -------------------------------------------------------------------------

    /**
     * {@inheritDoc}
     */
    @Override
    public Record3<String, Integer, String> key() {
        return (Record3) super.key();
    }

    // -------------------------------------------------------------------------
    // Record5 type implementation
    // -------------------------------------------------------------------------

    /**
     * {@inheritDoc}
     */
    @Override
    public Row5<String, Integer, String, String, String> fieldsRow() {
        return (Row5) super.fieldsRow();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Row5<String, Integer, String, String, String> valuesRow() {
        return (Row5) super.valuesRow();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Field<String> field1() {
        return VaultColumns.VAULT_COLUMNS.VAULTID;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Field<Integer> field2() {
        return VaultColumns.VAULT_COLUMNS.VERSION;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Field<String> field3() {
        return VaultColumns.VAULT_COLUMNS.COLUMNNAME;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Field<String> field4() {
        return VaultColumns.VAULT_COLUMNS.TYPE;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Field<String> field5() {
        return VaultColumns.VAULT_COLUMNS.COLUMNID;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public String value1() {
        return getVaultid();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Integer value2() {
        return getVersion();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public String value3() {
        return getColumnname();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public String value4() {
        return getType();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public String value5() {
        return getColumnid();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public VaultColumnsRecord value1(String value) {
        setVaultid(value);
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public VaultColumnsRecord value2(Integer value) {
        setVersion(value);
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public VaultColumnsRecord value3(String value) {
        setColumnname(value);
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public VaultColumnsRecord value4(String value) {
        setType(value);
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public VaultColumnsRecord value5(String value) {
        setColumnid(value);
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public VaultColumnsRecord values(String value1, Integer value2, String value3, String value4, String value5) {
        value1(value1);
        value2(value2);
        value3(value3);
        value4(value4);
        value5(value5);
        return this;
    }

    // -------------------------------------------------------------------------
    // Constructors
    // -------------------------------------------------------------------------

    /**
     * Create a detached VaultColumnsRecord
     */
    public VaultColumnsRecord() {
        super(VaultColumns.VAULT_COLUMNS);
    }

    /**
     * Create a detached, initialised VaultColumnsRecord
     */
    public VaultColumnsRecord(String vaultid, Integer version, String columnname, String type, String columnid) {
        super(VaultColumns.VAULT_COLUMNS);

        set(0, vaultid);
        set(1, version);
        set(2, columnname);
        set(3, type);
        set(4, columnid);
    }
}
