/**
 * This class is generated by jOOQ
 */
package org.labkey.deviceproxy.model.jooq.tables.records;


import java.sql.Timestamp;

import javax.annotation.Generated;

import org.jooq.Field;
import org.jooq.Record2;
import org.jooq.Record6;
import org.jooq.Row6;
import org.jooq.impl.UpdatableRecordImpl;
import org.labkey.deviceproxy.model.jooq.tables.Lease;


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
public class LeaseRecord extends UpdatableRecordImpl<LeaseRecord> implements Record6<String, Timestamp, Integer, Timestamp, Integer, Timestamp> {

    private static final long serialVersionUID = 486193435;

    /**
     * Setter for <code>deviceproxy.lease.public_key</code>.
     */
    public void setPublicKey(String value) {
        set(0, value);
    }

    /**
     * Getter for <code>deviceproxy.lease.public_key</code>.
     */
    public String getPublicKey() {
        return (String) get(0);
    }

    /**
     * Setter for <code>deviceproxy.lease.start_time</code>.
     */
    public void setStartTime(Timestamp value) {
        set(1, value);
    }

    /**
     * Getter for <code>deviceproxy.lease.start_time</code>.
     */
    public Timestamp getStartTime() {
        return (Timestamp) get(1);
    }

    /**
     * Setter for <code>deviceproxy.lease.createdby</code>.
     */
    public void setCreatedby(Integer value) {
        set(2, value);
    }

    /**
     * Getter for <code>deviceproxy.lease.createdby</code>.
     */
    public Integer getCreatedby() {
        return (Integer) get(2);
    }

    /**
     * Setter for <code>deviceproxy.lease.end_time</code>.
     */
    public void setEndTime(Timestamp value) {
        set(3, value);
    }

    /**
     * Getter for <code>deviceproxy.lease.end_time</code>.
     */
    public Timestamp getEndTime() {
        return (Timestamp) get(3);
    }

    /**
     * Setter for <code>deviceproxy.lease.endedby</code>.
     */
    public void setEndedby(Integer value) {
        set(4, value);
    }

    /**
     * Getter for <code>deviceproxy.lease.endedby</code>.
     */
    public Integer getEndedby() {
        return (Integer) get(4);
    }

    /**
     * Setter for <code>deviceproxy.lease.endedon</code>.
     */
    public void setEndedon(Timestamp value) {
        set(5, value);
    }

    /**
     * Getter for <code>deviceproxy.lease.endedon</code>.
     */
    public Timestamp getEndedon() {
        return (Timestamp) get(5);
    }

    // -------------------------------------------------------------------------
    // Primary key information
    // -------------------------------------------------------------------------

    /**
     * {@inheritDoc}
     */
    @Override
    public Record2<String, Timestamp> key() {
        return (Record2) super.key();
    }

    // -------------------------------------------------------------------------
    // Record6 type implementation
    // -------------------------------------------------------------------------

    /**
     * {@inheritDoc}
     */
    @Override
    public Row6<String, Timestamp, Integer, Timestamp, Integer, Timestamp> fieldsRow() {
        return (Row6) super.fieldsRow();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Row6<String, Timestamp, Integer, Timestamp, Integer, Timestamp> valuesRow() {
        return (Row6) super.valuesRow();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Field<String> field1() {
        return Lease.LEASE.PUBLIC_KEY;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Field<Timestamp> field2() {
        return Lease.LEASE.START_TIME;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Field<Integer> field3() {
        return Lease.LEASE.CREATEDBY;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Field<Timestamp> field4() {
        return Lease.LEASE.END_TIME;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Field<Integer> field5() {
        return Lease.LEASE.ENDEDBY;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Field<Timestamp> field6() {
        return Lease.LEASE.ENDEDON;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public String value1() {
        return getPublicKey();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Timestamp value2() {
        return getStartTime();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Integer value3() {
        return getCreatedby();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Timestamp value4() {
        return getEndTime();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Integer value5() {
        return getEndedby();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Timestamp value6() {
        return getEndedon();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public LeaseRecord value1(String value) {
        setPublicKey(value);
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public LeaseRecord value2(Timestamp value) {
        setStartTime(value);
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public LeaseRecord value3(Integer value) {
        setCreatedby(value);
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public LeaseRecord value4(Timestamp value) {
        setEndTime(value);
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public LeaseRecord value5(Integer value) {
        setEndedby(value);
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public LeaseRecord value6(Timestamp value) {
        setEndedon(value);
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public LeaseRecord values(String value1, Timestamp value2, Integer value3, Timestamp value4, Integer value5, Timestamp value6) {
        value1(value1);
        value2(value2);
        value3(value3);
        value4(value4);
        value5(value5);
        value6(value6);
        return this;
    }

    // -------------------------------------------------------------------------
    // Constructors
    // -------------------------------------------------------------------------

    /**
     * Create a detached LeaseRecord
     */
    public LeaseRecord() {
        super(Lease.LEASE);
    }

    /**
     * Create a detached, initialised LeaseRecord
     */
    public LeaseRecord(String publicKey, Timestamp startTime, Integer createdby, Timestamp endTime, Integer endedby, Timestamp endedon) {
        super(Lease.LEASE);

        set(0, publicKey);
        set(1, startTime);
        set(2, createdby);
        set(3, endTime);
        set(4, endedby);
        set(5, endedon);
    }
}
