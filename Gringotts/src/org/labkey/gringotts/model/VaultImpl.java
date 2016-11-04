package org.labkey.gringotts.model;

import org.jooq.DSLContext;
import org.jooq.SQLDialect;
import org.apache.commons.collections15.map.CaseInsensitiveMap;
import org.labkey.gringotts.annotation.AnnotationUtil;
import org.labkey.gringotts.api.GringottsService;
import org.labkey.gringotts.api.annotation.SerializeField;
import org.labkey.gringotts.api.annotation.VaultInfo;
import org.labkey.gringotts.api.model.Record;
import org.labkey.gringotts.api.model.Vault;
import org.labkey.gringotts.model.exception.NotAVaultException;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.jooq.impl.DSL;
import org.labkey.gringotts.model.raw.tables.VaultColumns;
import org.labkey.gringotts.model.raw.tables.Vaults;
import org.labkey.gringotts.model.raw.tables.records.VaultColumnsRecord;
import org.labkey.gringotts.model.raw.tables.records.VaultsRecord;

/**
 * Created by jon on 10/19/16.
 */
public class VaultImpl<RecordType extends VaultImpl.RecordImpl> implements Vault<RecordType> {
    private final VaultInfo vaultInfo;
    private final VaultsRecord vaultRecord;
    private final Class<? extends RecordType> clazz;
    private List<CaseInsensitiveMap<ValueType>> versions = new ArrayList<>();

    public VaultImpl(Class<RecordType> clazz) throws NotAVaultException {
        this(clazz, true);
    }

    public VaultImpl(Class<RecordType> clazz, boolean createIfNotExists) throws NotAVaultException {
        this.clazz = clazz;

        // Initialize jOOQ
        DSLContext create = DSL.using(SQLDialect.POSTGRES);

        // Initialize our tables
        Vaults vaults = new Vaults();
        VaultColumns columns = new VaultColumns();

        // Grab the vault info
        this.vaultInfo = AnnotationUtil.getVaultInfo(clazz);
        if (this.vaultInfo == null) {
            throw new NotAVaultException();
        }

        VaultsRecord tempVaultRecord = create.fetchOne(vaults, vaults.VAULTNAME.eq(vaultInfo.name()));
        if (tempVaultRecord != null) {
            this.vaultRecord = tempVaultRecord;
        }
        else {
            if (createIfNotExists) {
                this.vaultRecord = vaults.newRecord();
                this.vaultRecord.setVaultname(this.getName());
                this.vaultRecord.store();
            }
            else {
                throw new NotAVaultException();
            }
        }

        /*
        for(VaultColumnsRecord column : create.fetch(columns, columns.VAULTID.eq(id))) {
            // Build Version table.
            column.getColumnname();
            column.setColumnid("hello");
        }
        */
    }

    private CaseInsensitiveMap<RowInfo> getRowMap(Class clazz) {
        CaseInsensitiveMap<RowInfo>  map = new CaseInsensitiveMap<>();

        for (Field field : clazz.getDeclaredFields()) {
            if (field.isAnnotationPresent(SerializeField.class)) {
                SerializeField fieldAnnotation = field.getAnnotation(SerializeField.class);

                String fieldName = fieldAnnotation.columnName();

                // Default to using the actual field name from the class as the column name
                if ("".equals(fieldName)) {
                    fieldName = field.getName();
                }

                map.put(fieldName, new RowInfo(field, ValueType.TEXT));
            }
        }

        return map;
    }

    private class RowInfo {
        public final Field field;
        public final ValueType type;

        public RowInfo(Field field, ValueType type) {
            this.field = field;
            this.type = type;
        }
    }

    public int getCurrentVersion() {
        return 0; // TODO implement versions
    }

    @Override
    public String getId() {
        return this.vaultRecord.getVaultid();
    }

    @Override
    public String getName() {
        return this.vaultRecord.getVaultname();
    }

    @Override
    public RecordType getRecord(String id) {
        return null;
    }

    @Override
    public void saveRecord(VaultImpl.RecordImpl record) {

    }

    public class RecordOriginalValues {
        // This maps the classes in the hierarchy to their record ids
        private UUID id;

        // Store the values
        private CaseInsensitiveMap<String> stringValues = new CaseInsensitiveMap<>();

        public RecordOriginalValues(UUID id) {
            this.id = id;
        }
    }

    public class RecordImpl implements Record {
        protected final Map<Class, String> idMap = new HashMap<>();

        public RecordImpl() {
            this(UUID.randomUUID());
        }

        public RecordImpl(UUID uuid) {
            this.idMap.put(this.getClass(), GringottsService.base64EncodeUUID(uuid));
        }

        @Override
        public void save() {
            VaultImpl.this.saveRecord(this);
        }

        @Override
        public void delete() {

        }
    }
}
