package org.labkey.gringotts.model;

import com.google.common.reflect.TypeToken;
import org.apache.xerces.impl.dv.util.Base64;
import org.jooq.DSLContext;
import org.jooq.Result;
import org.labkey.api.security.User;
import org.labkey.gringotts.GringottsSchema;
import org.labkey.gringotts.api.GringottsService;
import org.labkey.gringotts.api.exception.InvalidVaultException;
import org.labkey.gringotts.api.model.Vault;
import org.labkey.gringotts.model.jooq.tables.records.VaultsRecord;

import java.nio.ByteBuffer;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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

    public static Map<TypeToken, String> _idCache = new HashMap<>();
    public static synchronized String getInternalId(TypeToken token) {
        DSLContext sqlConn = GringottsSchema.getSQLConnection();

        String className = token.getRawType().getCanonicalName();

        // Get the vault rows that match this vault's id
        Result<VaultsRecord> result = sqlConn.fetch(VAULTS, VAULTS.VAULTCLASSNAME.eq(className));

        String id;
        if (result.isEmpty()) {
            VaultsRecord vaultsRecord = sqlConn.newRecord(VAULTS);

            // Generate a new id
            id = GringottsService.getNewId();

            // Set the new values
            vaultsRecord.setVaultid(id);
            vaultsRecord.setVaultclassname(className);
            //vaultsRecord.setCreatedby(user.getUserId());
            vaultsRecord.setCreated(GringottsSchema.now());

            // Add the new record to the database
            //vaultsRecord.store();
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

        _idCache.put(token, id);

        return id;
    }

    public static void bindRecord(Vault.Record record) throws InvalidVaultException {
        TypeToken typeToken = record.getVault().getTypeToken();

        List<TypeToken> classes = new ArrayList<>();
        TypeToken currentTypeToken = typeToken;

        // Get the chain, not including Vault.Record
        while(!currentTypeToken.equals(TypeToken.of(Vault.Record.class))) {
            classes.add(currentTypeToken);
            currentTypeToken = TypeToken.of(currentTypeToken.getRawType().getSuperclass());
        }

        // Reverse the list, since we want to start at the root record
        Collections.reverse(classes);

        for (TypeToken token : classes) {
            VaultSerializationInfo.getInfo(token).bind(record);
        }
    }
}
