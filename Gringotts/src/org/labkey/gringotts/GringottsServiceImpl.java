package org.labkey.gringotts;

import org.apache.commons.collections15.map.CaseInsensitiveMap;
import org.jooq.DSLContext;
import org.jooq.SQLDialect;
import org.jooq.impl.DSL;
import org.labkey.gringotts.api.GringottsService;
import org.labkey.gringotts.api.annotation.SerializeField;
import org.labkey.gringotts.api.model.Vault;
import org.labkey.gringotts.model.ValueType;
import org.labkey.gringotts.model.raw.tables.VaultColumns;
import org.labkey.gringotts.model.raw.tables.Vaults;

import java.lang.reflect.Field;

/**
 * Created by jon on 10/19/16.
 */
public class GringottsServiceImpl extends GringottsService {
    private DSLContext getSQLConnection() {
        return DSL.using(SQLDialect.POSTGRES);
    }

    private class RowInfo {
        public final Field field;
        public final ValueType type;

        public RowInfo(Field field, ValueType type) {
            this.field = field;
            this.type = type;
        }
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

    @Override
    public void saveRecord(Vault.Record record) {
        // Initialize our tables
        Vaults vaults = new Vaults();
        VaultColumns columns = new VaultColumns();


        /*  Just some exampley code to show how to interact with the record.
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
        */
    }

    @Override
    public void deleteRecord(Vault.Record record) {

    }
}
