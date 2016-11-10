package org.labkey.gringotts.model;

import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.joda.time.DateTime;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;
import org.labkey.gringotts.GringottsSchema;
import org.labkey.gringotts.model.jooq.tables.records.VaultDatetimeValuesRecord;
import org.labkey.gringotts.model.jooq.tables.records.VaultIntValuesRecord;
import org.labkey.gringotts.model.jooq.tables.records.VaultTextValuesRecord;
import org.labkey.gringotts.model.jooq.tables.records.VaultsRecord;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import static org.labkey.gringotts.model.jooq.tables.VaultTextValues.VAULT_TEXT_VALUES;
import static org.labkey.gringotts.model.jooq.tables.VaultDatetimeValues.VAULT_DATETIME_VALUES;
import static org.labkey.gringotts.model.jooq.tables.VaultIntValues.VAULT_INT_VALUES;

/**
 * Created by jon on 11/8/16.
 */
public class Transaction implements AutoCloseable {
    private final VaultSerializationInfo vaultInfo;
    private final String transactionId = VaultUtils.getNewId();
    private final DSLContext sqlConnection = GringottsSchema.getSQLConnection();

    // Table metadata
    private List<VaultsRecord> _vaultsRecords = new ArrayList<>();

    // Now for the actual record values
    private List<VaultTextValuesRecord>     _textValuesRecords     = new ArrayList<>();
    private List<VaultDatetimeValuesRecord> _dateTimeValuesRecords = new ArrayList<>();
    private List<VaultIntValuesRecord>      _intValuesRecords      = new ArrayList<>();

    public Transaction(VaultSerializationInfo vault) {
        this.vaultInfo = vault;
    }

    public void addTextValueRecord(@NotNull String recordId, @NotNull String internalColumnId, @NotNull String value) {
        this.addTextValueRecord(recordId, internalColumnId, value, null);
    }

    public void addTextValueRecord(@NotNull String recordId, @NotNull String internalColumnId, @NotNull String value, @Nullable DateTime effectiveDate) {
        VaultTextValuesRecord record = sqlConnection.newRecord(VAULT_TEXT_VALUES);

        // Set generic identifiers
        record.setVaultid(vaultInfo.getInternalId());
        record.setTransactionid(transactionId);

        // Set specific identifiers
        record.setRecordid(recordId);
        record.setColumnid(internalColumnId);

        // Set value and effective date
        record.setEffectivedate(convertTime(effectiveDate));
        record.setValue(value);

        _textValuesRecords.add(record);
    }

    public void addDateTimeValueRecord(@NotNull String recordId, @NotNull String internalColumnId, @NotNull DateTime value) {
        this.addDateTimeValueRecord(recordId, internalColumnId, value, null);
    }

    public void addDateTimeValueRecord(@NotNull String recordId, @NotNull String internalColumnId, @NotNull DateTime value, @Nullable DateTime effectiveDate) {
        VaultDatetimeValuesRecord record = sqlConnection.newRecord(VAULT_DATETIME_VALUES);

        // Set generic identifiers
        record.setVaultid(vaultInfo.getInternalId());
        record.setTransactionid(transactionId);

        // Set specific identifiers
        record.setRecordid(recordId);
        record.setColumnid(internalColumnId);

        // Set value and effective date
        //record.setEffectivedate(new Timestamp(effectiveDate.getMillis()));
        record.setValue(convertTime(value));

        _dateTimeValuesRecords.add(record);
    }

    public void addIntValueRecord(@NotNull String recordId, @NotNull String internalColumnId, @NotNull Integer value) {
        this.addIntValueRecord(recordId, internalColumnId, value, null);
    }

    public void addIntValueRecord(@NotNull String recordId, @NotNull String internalColumnId, @NotNull Integer value, @Nullable DateTime effectiveDate) {
        VaultIntValuesRecord record = sqlConnection.newRecord(VAULT_INT_VALUES);

        // Set generic identifiers
        record.setVaultid(vaultInfo.getInternalId());
        record.setTransactionid(transactionId);

        // Set specific identifiers
        record.setRecordid(recordId);
        record.setColumnid(internalColumnId);

        // Set value and effective date
        //record.setEffectivedate(new Timestamp(effectiveDate.getMillis()));
        record.setValue(value);

        _intValuesRecords.add(record);
    }

    public boolean hasChanges() {
        return (_dateTimeValuesRecords.size() != 0)
                || (_textValuesRecords.size() != 0)
                || (_intValuesRecords.size()  != 0);
    }

    @Nullable
    private Timestamp convertTime(DateTime dateTime) {
        if (dateTime == null) {
            return null;
        }

        return new Timestamp(dateTime.getMillis());
    }

    @Override
    public void close() throws Exception {
        // Don't do anything if we have no changes to write.
        if (!hasChanges()) {
            return;
        }

        sqlConnection.transaction(config -> {
            if (!_vaultsRecords.isEmpty()) {
                DSL.using(config).batchInsert(_vaultsRecords).execute();
            }

            if (!_textValuesRecords.isEmpty()) {
                DSL.using(config).batchInsert(_textValuesRecords).execute();
            }

            if (!_intValuesRecords.isEmpty()) {
                DSL.using(config).batchInsert(_intValuesRecords).execute();
            }

            if (!_dateTimeValuesRecords.isEmpty()) {
                DSL.using(config).batchInsert(_dateTimeValuesRecords).execute();
            }
        });
    }
}
