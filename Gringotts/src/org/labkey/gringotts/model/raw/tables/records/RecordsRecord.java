/**
 * This class is generated by jOOQ
 */
package org.labkey.gringotts.model.raw.tables.records;


import javax.annotation.Generated;

import org.jooq.Field;
import org.jooq.Record4;
import org.jooq.Record5;
import org.jooq.Row5;
import org.jooq.impl.UpdatableRecordImpl;
import org.labkey.gringotts.model.raw.tables.Records;


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
public class RecordsRecord extends UpdatableRecordImpl<RecordsRecord> implements Record5<String, String, String, Integer, String> {

    private static final long serialVersionUID = -152404127;

    /**
     * Setter for <code>gringotts.records.vaultid</code>.
     */
    public void setVaultid(String value) {
        set(0, value);
    }

    /**
     * Getter for <code>gringotts.records.vaultid</code>.
     */
    public String getVaultid() {
        return (String) get(0);
    }

    /**
     * Setter for <code>gringotts.records.recordid</code>.
     */
    public void setRecordid(String value) {
        set(1, value);
    }

    /**
     * Getter for <code>gringotts.records.recordid</code>.
     */
    public String getRecordid() {
        return (String) get(1);
    }

    /**
     * Setter for <code>gringotts.records.container</code>.
     */
    public void setContainer(String value) {
        set(2, value);
    }

    /**
     * Getter for <code>gringotts.records.container</code>.
     */
    public String getContainer() {
        return (String) get(2);
    }

    /**
     * Setter for <code>gringotts.records.version</code>.
     */
    public void setVersion(Integer value) {
        set(3, value);
    }

    /**
     * Getter for <code>gringotts.records.version</code>.
     */
    public Integer getVersion() {
        return (Integer) get(3);
    }

    /**
     * Setter for <code>gringotts.records.transactionid</code>.
     */
    public void setTransactionid(String value) {
        set(4, value);
    }

    /**
     * Getter for <code>gringotts.records.transactionid</code>.
     */
    public String getTransactionid() {
        return (String) get(4);
    }

    // -------------------------------------------------------------------------
    // Primary key information
    // -------------------------------------------------------------------------

    /**
     * {@inheritDoc}
     */
    @Override
    public Record4<String, String, String, Integer> key() {
        return (Record4) super.key();
    }

    // -------------------------------------------------------------------------
    // Record5 type implementation
    // -------------------------------------------------------------------------

    /**
     * {@inheritDoc}
     */
    @Override
    public Row5<String, String, String, Integer, String> fieldsRow() {
        return (Row5) super.fieldsRow();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Row5<String, String, String, Integer, String> valuesRow() {
        return (Row5) super.valuesRow();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Field<String> field1() {
        return Records.RECORDS.VAULTID;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Field<String> field2() {
        return Records.RECORDS.RECORDID;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Field<String> field3() {
        return Records.RECORDS.CONTAINER;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Field<Integer> field4() {
        return Records.RECORDS.VERSION;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Field<String> field5() {
        return Records.RECORDS.TRANSACTIONID;
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
    public String value2() {
        return getRecordid();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public String value3() {
        return getContainer();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Integer value4() {
        return getVersion();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public String value5() {
        return getTransactionid();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public RecordsRecord value1(String value) {
        setVaultid(value);
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public RecordsRecord value2(String value) {
        setRecordid(value);
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public RecordsRecord value3(String value) {
        setContainer(value);
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public RecordsRecord value4(Integer value) {
        setVersion(value);
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public RecordsRecord value5(String value) {
        setTransactionid(value);
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public RecordsRecord values(String value1, String value2, String value3, Integer value4, String value5) {
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
     * Create a detached RecordsRecord
     */
    public RecordsRecord() {
        super(Records.RECORDS);
    }

    /**
     * Create a detached, initialised RecordsRecord
     */
    public RecordsRecord(String vaultid, String recordid, String container, Integer version, String transactionid) {
        super(Records.RECORDS);

        set(0, vaultid);
        set(1, recordid);
        set(2, container);
        set(3, version);
        set(4, transactionid);
    }
}
