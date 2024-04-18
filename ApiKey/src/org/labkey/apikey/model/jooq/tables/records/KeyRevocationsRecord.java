/**
 * This class is generated by jOOQ
 */
package org.labkey.apikey.model.jooq.tables.records;


import jakarta.annotation.Generated;
import org.jooq.Field;
import org.jooq.Record1;
import org.jooq.Record4;
import org.jooq.Row4;
import org.jooq.impl.UpdatableRecordImpl;
import org.labkey.apikey.model.jooq.tables.KeyRevocations;

import java.sql.Timestamp;


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
public class KeyRevocationsRecord extends UpdatableRecordImpl<KeyRevocationsRecord> implements Record4<String, Timestamp, Integer, String> {

    private static final long serialVersionUID = 1218411480;

    /**
     * Setter for <code>apikey.key_revocations.apikey</code>.
     */
    public void setApikey(String value) {
        set(0, value);
    }

    /**
     * Getter for <code>apikey.key_revocations.apikey</code>.
     */
    public String getApikey() {
        return (String) get(0);
    }

    /**
     * Setter for <code>apikey.key_revocations.revokedon</code>.
     */
    public void setRevokedon(Timestamp value) {
        set(1, value);
    }

    /**
     * Getter for <code>apikey.key_revocations.revokedon</code>.
     */
    public Timestamp getRevokedon() {
        return (Timestamp) get(1);
    }

    /**
     * Setter for <code>apikey.key_revocations.revokedby</code>.
     */
    public void setRevokedby(Integer value) {
        set(2, value);
    }

    /**
     * Getter for <code>apikey.key_revocations.revokedby</code>.
     */
    public Integer getRevokedby() {
        return (Integer) get(2);
    }

    /**
     * Setter for <code>apikey.key_revocations.reason</code>.
     */
    public void setReason(String value) {
        set(3, value);
    }

    /**
     * Getter for <code>apikey.key_revocations.reason</code>.
     */
    public String getReason() {
        return (String) get(3);
    }

    // -------------------------------------------------------------------------
    // Primary key information
    // -------------------------------------------------------------------------

    /**
     * {@inheritDoc}
     */
    @Override
    public Record1<String> key() {
        return (Record1) super.key();
    }

    // -------------------------------------------------------------------------
    // Record4 type implementation
    // -------------------------------------------------------------------------

    /**
     * {@inheritDoc}
     */
    @Override
    public Row4<String, Timestamp, Integer, String> fieldsRow() {
        return (Row4) super.fieldsRow();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Row4<String, Timestamp, Integer, String> valuesRow() {
        return (Row4) super.valuesRow();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Field<String> field1() {
        return KeyRevocations.KEY_REVOCATIONS.APIKEY;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Field<Timestamp> field2() {
        return KeyRevocations.KEY_REVOCATIONS.REVOKEDON;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Field<Integer> field3() {
        return KeyRevocations.KEY_REVOCATIONS.REVOKEDBY;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Field<String> field4() {
        return KeyRevocations.KEY_REVOCATIONS.REASON;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public String value1() {
        return getApikey();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Timestamp value2() {
        return getRevokedon();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Integer value3() {
        return getRevokedby();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public String value4() {
        return getReason();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public KeyRevocationsRecord value1(String value) {
        setApikey(value);
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public KeyRevocationsRecord value2(Timestamp value) {
        setRevokedon(value);
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public KeyRevocationsRecord value3(Integer value) {
        setRevokedby(value);
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public KeyRevocationsRecord value4(String value) {
        setReason(value);
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public KeyRevocationsRecord values(String value1, Timestamp value2, Integer value3, String value4) {
        value1(value1);
        value2(value2);
        value3(value3);
        value4(value4);
        return this;
    }

    // -------------------------------------------------------------------------
    // Constructors
    // -------------------------------------------------------------------------

    /**
     * Create a detached KeyRevocationsRecord
     */
    public KeyRevocationsRecord() {
        super(KeyRevocations.KEY_REVOCATIONS);
    }

    /**
     * Create a detached, initialised KeyRevocationsRecord
     */
    public KeyRevocationsRecord(String apikey, Timestamp revokedon, Integer revokedby, String reason) {
        super(KeyRevocations.KEY_REVOCATIONS);

        set(0, apikey);
        set(1, revokedon);
        set(2, revokedby);
        set(3, reason);
    }
}
