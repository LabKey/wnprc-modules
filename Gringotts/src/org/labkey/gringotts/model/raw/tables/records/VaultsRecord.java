/**
 * This class is generated by jOOQ
 */
package org.labkey.gringotts.model.raw.tables.records;


import java.sql.Timestamp;

import javax.annotation.Generated;

import org.jooq.Field;
import org.jooq.Record1;
import org.jooq.Record6;
import org.jooq.Row6;
import org.jooq.impl.UpdatableRecordImpl;
import org.labkey.gringotts.model.raw.tables.Vaults;


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
public class VaultsRecord extends UpdatableRecordImpl<VaultsRecord> implements Record6<String, String, Integer, Timestamp, Integer, Timestamp> {

    private static final long serialVersionUID = -443142014;

    /**
     * Setter for <code>gringotts.vaults.vaultid</code>.
     */
    public void setVaultid(String value) {
        set(0, value);
    }

    /**
     * Getter for <code>gringotts.vaults.vaultid</code>.
     */
    public String getVaultid() {
        return (String) get(0);
    }

    /**
     * Setter for <code>gringotts.vaults.vaultname</code>.
     */
    public void setVaultname(String value) {
        set(1, value);
    }

    /**
     * Getter for <code>gringotts.vaults.vaultname</code>.
     */
    public String getVaultname() {
        return (String) get(1);
    }

    /**
     * Setter for <code>gringotts.vaults.createdby</code>.
     */
    public void setCreatedby(Integer value) {
        set(2, value);
    }

    /**
     * Getter for <code>gringotts.vaults.createdby</code>.
     */
    public Integer getCreatedby() {
        return (Integer) get(2);
    }

    /**
     * Setter for <code>gringotts.vaults.created</code>.
     */
    public void setCreated(Timestamp value) {
        set(3, value);
    }

    /**
     * Getter for <code>gringotts.vaults.created</code>.
     */
    public Timestamp getCreated() {
        return (Timestamp) get(3);
    }

    /**
     * Setter for <code>gringotts.vaults.modifiedby</code>.
     */
    public void setModifiedby(Integer value) {
        set(4, value);
    }

    /**
     * Getter for <code>gringotts.vaults.modifiedby</code>.
     */
    public Integer getModifiedby() {
        return (Integer) get(4);
    }

    /**
     * Setter for <code>gringotts.vaults.modified</code>.
     */
    public void setModified(Timestamp value) {
        set(5, value);
    }

    /**
     * Getter for <code>gringotts.vaults.modified</code>.
     */
    public Timestamp getModified() {
        return (Timestamp) get(5);
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
    // Record6 type implementation
    // -------------------------------------------------------------------------

    /**
     * {@inheritDoc}
     */
    @Override
    public Row6<String, String, Integer, Timestamp, Integer, Timestamp> fieldsRow() {
        return (Row6) super.fieldsRow();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Row6<String, String, Integer, Timestamp, Integer, Timestamp> valuesRow() {
        return (Row6) super.valuesRow();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Field<String> field1() {
        return Vaults.VAULTS.VAULTID;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Field<String> field2() {
        return Vaults.VAULTS.VAULTNAME;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Field<Integer> field3() {
        return Vaults.VAULTS.CREATEDBY;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Field<Timestamp> field4() {
        return Vaults.VAULTS.CREATED;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Field<Integer> field5() {
        return Vaults.VAULTS.MODIFIEDBY;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Field<Timestamp> field6() {
        return Vaults.VAULTS.MODIFIED;
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
        return getVaultname();
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
        return getCreated();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Integer value5() {
        return getModifiedby();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Timestamp value6() {
        return getModified();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public VaultsRecord value1(String value) {
        setVaultid(value);
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public VaultsRecord value2(String value) {
        setVaultname(value);
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public VaultsRecord value3(Integer value) {
        setCreatedby(value);
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public VaultsRecord value4(Timestamp value) {
        setCreated(value);
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public VaultsRecord value5(Integer value) {
        setModifiedby(value);
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public VaultsRecord value6(Timestamp value) {
        setModified(value);
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public VaultsRecord values(String value1, String value2, Integer value3, Timestamp value4, Integer value5, Timestamp value6) {
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
     * Create a detached VaultsRecord
     */
    public VaultsRecord() {
        super(Vaults.VAULTS);
    }

    /**
     * Create a detached, initialised VaultsRecord
     */
    public VaultsRecord(String vaultid, String vaultname, Integer createdby, Timestamp created, Integer modifiedby, Timestamp modified) {
        super(Vaults.VAULTS);

        set(0, vaultid);
        set(1, vaultname);
        set(2, createdby);
        set(3, created);
        set(4, modifiedby);
        set(5, modified);
    }
}
