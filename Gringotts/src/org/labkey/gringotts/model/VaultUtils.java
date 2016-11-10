package org.labkey.gringotts.model;

import org.apache.xerces.impl.dv.util.Base64;
import org.jooq.DSLContext;
import org.jooq.Result;
import org.labkey.gringotts.GringottsSchema;
import org.labkey.gringotts.api.GringottsService;
import org.labkey.gringotts.api.model.Vault;
import org.labkey.gringotts.model.jooq.tables.records.VaultsRecord;

import java.nio.ByteBuffer;
import java.util.UUID;

import static org.labkey.gringotts.model.jooq.tables.Vaults.VAULTS;

/**
 * Created by jon on 10/19/16.
 */
public class VaultUtils {
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

    public static String getInternalId(Vault vault) {
        DSLContext sqlConn = GringottsSchema.getSQLConnection();

        // Get the vault rows that match this vault's id
        Result<VaultsRecord> result = sqlConn.fetch(VAULTS, VAULTS.VAULTCLASSNAME.eq(vault.getId()));

        String id;
        if (result.isEmpty()) {
            VaultsRecord vaultsRecord = sqlConn.newRecord(VAULTS);

            // Generate a new id
            id = GringottsService.getNewId();

            // Set the new values
            vaultsRecord.setVaultid(id);
            vaultsRecord.setVaultclassname(vault.getId());
            vaultsRecord.setCreatedby(vault.getUser().getUserId());
            vaultsRecord.setCreated(GringottsSchema.now());

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

        return id;
    }
}
