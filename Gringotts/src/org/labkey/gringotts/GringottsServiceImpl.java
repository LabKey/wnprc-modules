package org.labkey.gringotts;

import com.google.common.reflect.TypeToken;
import org.apache.commons.collections4.map.CaseInsensitiveMap;
import org.jooq.DSLContext;
import org.jooq.SQLDialect;
import org.jooq.impl.DSL;
import org.labkey.gringotts.api.GringottsService;
import org.labkey.gringotts.api.annotation.SerializeField;
import org.labkey.gringotts.api.exception.InvalidVaultException;
import org.labkey.gringotts.api.model.Vault;
import org.labkey.gringotts.api.model.ValueType;
import org.labkey.gringotts.model.Transaction;
import org.labkey.gringotts.model.VaultSerializationInfo;
import org.labkey.gringotts.model.jooq.tables.VaultColumns;
import org.labkey.gringotts.model.jooq.tables.Vaults;

import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CountDownLatch;

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


    private CaseInsensitiveMap<String, RowInfo> getRowMap(Class clazz) {
        CaseInsensitiveMap<String, RowInfo>  map = new CaseInsensitiveMap<>();

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

        try(Transaction transaction = new Transaction(VaultSerializationInfo.getInfo(record.getVault().getTypeToken()))) {


        }
        catch (InvalidVaultException e) {
            e.printStackTrace();
        }
        catch (Exception e) {
            e.printStackTrace();
        }


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

    @Override
    public void bindRecord(Vault.Record record) {

    }

    private Map<TypeToken, CountDownLatch> _validationLatches = new HashMap<>();
    private Map<TypeToken, VaultSerializationInfo> _vaultInfoMap = new HashMap<>();

    public synchronized VaultSerializationInfo validateVault(Vault vault) throws InvalidVaultException {
        TypeToken recordType = vault.getTypeToken();

        // If there's already a validation under way for this record type, await it's completion
        if (_validationLatches.containsKey(recordType)) {
            CountDownLatch latch = _validationLatches.get(vault.getTypeToken());
            try {
                latch.await();
            }
            catch (InterruptedException e) {
                throw new InvalidVaultException("Vault timed out during validation");
            }
        // Otherwise, set a latch and start working on validating the Vault.
        }
        else {
            // Set the latch
            CountDownLatch latch = new CountDownLatch(1);
            _validationLatches.put(recordType, latch);

            // Generate the vault info
            //_vaultInfoMap.put(recordType, VaultUtils.generateVaultInfo(vault));

            // Release the latch
            latch.countDown();
        }

        return _vaultInfoMap.get(recordType);
    }
}
