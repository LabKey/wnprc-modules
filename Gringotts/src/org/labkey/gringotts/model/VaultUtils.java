package org.labkey.gringotts.model;

import org.apache.commons.collections15.map.CaseInsensitiveMap;
import org.apache.xerces.impl.dv.util.Base64;
import org.jooq.DSLContext;
import org.jooq.Result;
import org.labkey.gringotts.GringottsSchema;
import org.labkey.gringotts.api.GringottsService;
import org.labkey.gringotts.api.annotation.SerializeField;
import org.labkey.gringotts.api.exception.InvalidVaultException;
import org.labkey.gringotts.api.model.ColumnInfo;
import org.labkey.gringotts.api.model.ValueType;
import org.labkey.gringotts.api.model.Vault;
import org.labkey.gringotts.api.model.VaultInfo;
import org.labkey.gringotts.model.jooq.tables.records.VaultColumnsRecord;
import org.labkey.gringotts.model.jooq.tables.records.VaultsRecord;

import java.lang.reflect.Field;
import java.nio.ByteBuffer;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import static org.labkey.gringotts.model.jooq.tables.Vaults.VAULTS;
import static org.labkey.gringotts.model.jooq.tables.VaultColumns.VAULT_COLUMNS;

/**
 * Created by jon on 10/19/16.
 */
public class VaultUtils {
    public static Timestamp now() {
        return new Timestamp(System.currentTimeMillis());
    }

    public static String getNewId() {
        UUID uuid = UUID.randomUUID();

        // Adapted from http://stackoverflow.com/questions/2983065/guid-to-bytearray
        ByteBuffer bb = ByteBuffer.wrap(new byte[16]);
        bb.putLong(uuid.getMostSignificantBits());
        bb.putLong(uuid.getLeastSignificantBits());
        byte[] bytes = bb.array();

        // Encode the bytes...
        return Base64.encode(bytes);
    }

    public static VaultInfo generateVaultInfo(Vault vault) throws InvalidVaultException {
        DSLContext conn = GringottsSchema.getSQLConnection();

        // Get the vault rows that match this vault's id
        Result<VaultsRecord> result = conn.fetch(VAULTS, VAULTS.VAULTCLASSNAME.eq(vault.getId()));

        String id;
        if (result.isEmpty()) {
            VaultsRecord vaultsRecord = conn.newRecord(VAULTS);

            // Generate a new id
            id = GringottsService.getNewId();

            // Set the new values
            vaultsRecord.setVaultid(id);
            vaultsRecord.setVaultclassname(vault.getId());
            vaultsRecord.setCreatedby(vault.getUser().getUserId());
            vaultsRecord.setCreated(now());

            // Add the new record to the database
            vaultsRecord.store();
        }
        else {
            VaultsRecord mostRecentRecord = null;
            for (VaultsRecord curRecord : result) {
                if (mostRecentRecord == null || curRecord.getCreated().after(mostRecentRecord.getCreated())) {
                    mostRecentRecord = curRecord;
                }
            }

            id = mostRecentRecord.getVaultid();
        }

        // Create the vault info.
        VaultInfo vaultInfo = new VaultInfo(id);

        // Fetch a map of previous column maps
        Map<Integer, Result<VaultColumnsRecord>> versionColumnMap = conn.selectFrom(VAULT_COLUMNS).fetch().intoGroups(VAULT_COLUMNS.VERSION);

        List<CaseInsensitiveMap<ColumnInfo>> versions = new ArrayList<>();

        int highestIndex = Collections.max(versionColumnMap.keySet()).intValue();

        for (int i = 0; i <= highestIndex; i++) {
            CaseInsensitiveMap<ColumnInfo> columnMap = new CaseInsensitiveMap();
            versions.add(columnMap);

            for(VaultColumnsRecord columnRecord : versionColumnMap.get(i)) {
                ColumnInfo info = new ColumnInfo(
                        columnRecord.getType(),
                        columnRecord.getColumnname(),
                        columnRecord.getColumnid()
                );

                columnMap.put(info.columnName, info);
            }
        }


        return vaultInfo;
    }

    private CaseInsensitiveMap<ColumnInfo> getColumnMapForClass(Class clazz) {
        CaseInsensitiveMap<ColumnInfo> columnMap = new CaseInsensitiveMap();

        for (Field field : clazz.getFields()) {
            if (field.isAnnotationPresent(SerializeField.class)) {
                SerializeField fieldInfo = field.getAnnotation(SerializeField.class);

                String columnName = fieldInfo.columnName().equals("") ? field.getName().toLowerCase() : fieldInfo.columnName();

                
            }
        }

        return columnMap;
    }

    private boolean columnMapsAreEqual(CaseInsensitiveMap<ColumnInfo> map1, CaseInsensitiveMap<ColumnInfo> map2) {
        Set<String> map1KeySet = map1.keySet();
        Set<String> map2KeySet = map2.keySet();

        // Make sure both sets contain the same keys
        if (!map1KeySet.containsAll(map2KeySet) || !map2KeySet.containsAll(map1KeySet)) {
            return false;
        }

        // Make sure that the value pointed to by each key is equal
        for (String key : map1KeySet) {
            if (!map1.get(key).equals(map2.get(key))) {
                return false;
            }
        }

        return true;
    }
}
