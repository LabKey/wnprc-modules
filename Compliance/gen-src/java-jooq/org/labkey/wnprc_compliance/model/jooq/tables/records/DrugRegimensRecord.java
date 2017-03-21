/**
 * This class is generated by jOOQ
 */
package org.labkey.wnprc_compliance.model.jooq.tables.records;


import java.sql.Timestamp;

import javax.annotation.Generated;

import org.jooq.Field;
import org.jooq.Record1;
import org.jooq.Record8;
import org.jooq.Row8;
import org.jooq.impl.UpdatableRecordImpl;
import org.labkey.wnprc_compliance.model.jooq.tables.DrugRegimens;


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
public class DrugRegimensRecord extends UpdatableRecordImpl<DrugRegimensRecord> implements Record8<String, String, String, String, Integer, Timestamp, Integer, Timestamp> {

    private static final long serialVersionUID = 1901168751;

    /**
     * Setter for <code>wnprc_compliance.drug_regimens.id</code>.
     */
    public void setId(String value) {
        set(0, value);
    }

    /**
     * Getter for <code>wnprc_compliance.drug_regimens.id</code>.
     */
    public String getId() {
        return (String) get(0);
    }

    /**
     * Setter for <code>wnprc_compliance.drug_regimens.regimen_name</code>.
     */
    public void setRegimenName(String value) {
        set(1, value);
    }

    /**
     * Getter for <code>wnprc_compliance.drug_regimens.regimen_name</code>.
     */
    public String getRegimenName() {
        return (String) get(1);
    }

    /**
     * Setter for <code>wnprc_compliance.drug_regimens.frequency_description</code>.
     */
    public void setFrequencyDescription(String value) {
        set(2, value);
    }

    /**
     * Getter for <code>wnprc_compliance.drug_regimens.frequency_description</code>.
     */
    public String getFrequencyDescription() {
        return (String) get(2);
    }

    /**
     * Setter for <code>wnprc_compliance.drug_regimens.substance_type</code>.
     */
    public void setSubstanceType(String value) {
        set(3, value);
    }

    /**
     * Getter for <code>wnprc_compliance.drug_regimens.substance_type</code>.
     */
    public String getSubstanceType() {
        return (String) get(3);
    }

    /**
     * Setter for <code>wnprc_compliance.drug_regimens.createdby</code>.
     */
    public void setCreatedby(Integer value) {
        set(4, value);
    }

    /**
     * Getter for <code>wnprc_compliance.drug_regimens.createdby</code>.
     */
    public Integer getCreatedby() {
        return (Integer) get(4);
    }

    /**
     * Setter for <code>wnprc_compliance.drug_regimens.created</code>.
     */
    public void setCreated(Timestamp value) {
        set(5, value);
    }

    /**
     * Getter for <code>wnprc_compliance.drug_regimens.created</code>.
     */
    public Timestamp getCreated() {
        return (Timestamp) get(5);
    }

    /**
     * Setter for <code>wnprc_compliance.drug_regimens.modifiedby</code>.
     */
    public void setModifiedby(Integer value) {
        set(6, value);
    }

    /**
     * Getter for <code>wnprc_compliance.drug_regimens.modifiedby</code>.
     */
    public Integer getModifiedby() {
        return (Integer) get(6);
    }

    /**
     * Setter for <code>wnprc_compliance.drug_regimens.modified</code>.
     */
    public void setModified(Timestamp value) {
        set(7, value);
    }

    /**
     * Getter for <code>wnprc_compliance.drug_regimens.modified</code>.
     */
    public Timestamp getModified() {
        return (Timestamp) get(7);
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
    // Record8 type implementation
    // -------------------------------------------------------------------------

    /**
     * {@inheritDoc}
     */
    @Override
    public Row8<String, String, String, String, Integer, Timestamp, Integer, Timestamp> fieldsRow() {
        return (Row8) super.fieldsRow();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Row8<String, String, String, String, Integer, Timestamp, Integer, Timestamp> valuesRow() {
        return (Row8) super.valuesRow();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Field<String> field1() {
        return DrugRegimens.DRUG_REGIMENS.ID;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Field<String> field2() {
        return DrugRegimens.DRUG_REGIMENS.REGIMEN_NAME;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Field<String> field3() {
        return DrugRegimens.DRUG_REGIMENS.FREQUENCY_DESCRIPTION;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Field<String> field4() {
        return DrugRegimens.DRUG_REGIMENS.SUBSTANCE_TYPE;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Field<Integer> field5() {
        return DrugRegimens.DRUG_REGIMENS.CREATEDBY;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Field<Timestamp> field6() {
        return DrugRegimens.DRUG_REGIMENS.CREATED;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Field<Integer> field7() {
        return DrugRegimens.DRUG_REGIMENS.MODIFIEDBY;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Field<Timestamp> field8() {
        return DrugRegimens.DRUG_REGIMENS.MODIFIED;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public String value1() {
        return getId();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public String value2() {
        return getRegimenName();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public String value3() {
        return getFrequencyDescription();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public String value4() {
        return getSubstanceType();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Integer value5() {
        return getCreatedby();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Timestamp value6() {
        return getCreated();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Integer value7() {
        return getModifiedby();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Timestamp value8() {
        return getModified();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public DrugRegimensRecord value1(String value) {
        setId(value);
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public DrugRegimensRecord value2(String value) {
        setRegimenName(value);
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public DrugRegimensRecord value3(String value) {
        setFrequencyDescription(value);
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public DrugRegimensRecord value4(String value) {
        setSubstanceType(value);
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public DrugRegimensRecord value5(Integer value) {
        setCreatedby(value);
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public DrugRegimensRecord value6(Timestamp value) {
        setCreated(value);
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public DrugRegimensRecord value7(Integer value) {
        setModifiedby(value);
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public DrugRegimensRecord value8(Timestamp value) {
        setModified(value);
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public DrugRegimensRecord values(String value1, String value2, String value3, String value4, Integer value5, Timestamp value6, Integer value7, Timestamp value8) {
        value1(value1);
        value2(value2);
        value3(value3);
        value4(value4);
        value5(value5);
        value6(value6);
        value7(value7);
        value8(value8);
        return this;
    }

    // -------------------------------------------------------------------------
    // Constructors
    // -------------------------------------------------------------------------

    /**
     * Create a detached DrugRegimensRecord
     */
    public DrugRegimensRecord() {
        super(DrugRegimens.DRUG_REGIMENS);
    }

    /**
     * Create a detached, initialised DrugRegimensRecord
     */
    public DrugRegimensRecord(String id, String regimenName, String frequencyDescription, String substanceType, Integer createdby, Timestamp created, Integer modifiedby, Timestamp modified) {
        super(DrugRegimens.DRUG_REGIMENS);

        set(0, id);
        set(1, regimenName);
        set(2, frequencyDescription);
        set(3, substanceType);
        set(4, createdby);
        set(5, created);
        set(6, modifiedby);
        set(7, modified);
    }
}
