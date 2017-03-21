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
import org.labkey.wnprc_compliance.model.jooq.tables.records.PersonsRecord;


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
public class Persons extends TableImpl<PersonsRecord> {

    private static final long serialVersionUID = -841949496;

    /**
     * The reference instance of <code>wnprc_compliance.persons</code>
     */
    public static final Persons PERSONS = new Persons();

    /**
     * The class holding records for this type
     */
    @Override
    public Class<PersonsRecord> getRecordType() {
        return PersonsRecord.class;
    }

    /**
     * The column <code>wnprc_compliance.persons.personid</code>.
     */
    public final TableField<PersonsRecord, String> PERSONID = createField("personid", org.jooq.impl.SQLDataType.CLOB.nullable(false), this, "");

    /**
     * The column <code>wnprc_compliance.persons.first_name</code>.
     */
    public final TableField<PersonsRecord, String> FIRST_NAME = createField("first_name", org.jooq.impl.SQLDataType.CLOB, this, "");

    /**
     * The column <code>wnprc_compliance.persons.middle_name</code>.
     */
    public final TableField<PersonsRecord, String> MIDDLE_NAME = createField("middle_name", org.jooq.impl.SQLDataType.CLOB, this, "");

    /**
     * The column <code>wnprc_compliance.persons.last_name</code>.
     */
    public final TableField<PersonsRecord, String> LAST_NAME = createField("last_name", org.jooq.impl.SQLDataType.CLOB, this, "");

    /**
     * The column <code>wnprc_compliance.persons.notes</code>.
     */
    public final TableField<PersonsRecord, String> NOTES = createField("notes", org.jooq.impl.SQLDataType.CLOB, this, "");

    /**
     * The column <code>wnprc_compliance.persons.container</code>.
     */
    public final TableField<PersonsRecord, String> CONTAINER = createField("container", org.jooq.impl.SQLDataType.VARCHAR.length(36).nullable(false), this, "");

    /**
     * The column <code>wnprc_compliance.persons.createdby</code>.
     */
    public final TableField<PersonsRecord, Integer> CREATEDBY = createField("createdby", org.jooq.impl.SQLDataType.INTEGER, this, "");

    /**
     * The column <code>wnprc_compliance.persons.created</code>.
     */
    public final TableField<PersonsRecord, Timestamp> CREATED = createField("created", org.jooq.impl.SQLDataType.TIMESTAMP, this, "");

    /**
     * The column <code>wnprc_compliance.persons.modifiedby</code>.
     */
    public final TableField<PersonsRecord, Integer> MODIFIEDBY = createField("modifiedby", org.jooq.impl.SQLDataType.INTEGER, this, "");

    /**
     * The column <code>wnprc_compliance.persons.modified</code>.
     */
    public final TableField<PersonsRecord, Timestamp> MODIFIED = createField("modified", org.jooq.impl.SQLDataType.TIMESTAMP, this, "");

    /**
     * Create a <code>wnprc_compliance.persons</code> table reference
     */
    public Persons() {
        this("persons", null);
    }

    /**
     * Create an aliased <code>wnprc_compliance.persons</code> table reference
     */
    public Persons(String alias) {
        this(alias, PERSONS);
    }

    private Persons(String alias, Table<PersonsRecord> aliased) {
        this(alias, aliased, null);
    }

    private Persons(String alias, Table<PersonsRecord> aliased, Field<?>[] parameters) {
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
    public UniqueKey<PersonsRecord> getPrimaryKey() {
        return Keys.PK_PERSONS;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public List<UniqueKey<PersonsRecord>> getKeys() {
        return Arrays.<UniqueKey<PersonsRecord>>asList(Keys.PK_PERSONS);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Persons as(String alias) {
        return new Persons(alias, this);
    }

    /**
     * Rename this table
     */
    public Persons rename(String name) {
        return new Persons(name, null);
    }
}
