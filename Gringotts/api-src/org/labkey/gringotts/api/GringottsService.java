package org.labkey.gringotts.api;

import org.apache.xerces.impl.dv.util.Base64;
import org.jetbrains.annotations.NotNull;
import org.labkey.api.security.User;
import org.labkey.gringotts.api.exception.InvalidVaultException;
import org.labkey.gringotts.api.model.Vault;

import java.nio.ByteBuffer;
import java.util.UUID;

/**
 * Created by jon on 10/19/16.
 */
public abstract class GringottsService {
    private static GringottsService _gringottsService;

    public static GringottsService get() {
        return _gringottsService;
    }

    public static void set(@NotNull GringottsService gringottsService) {
        _gringottsService = gringottsService;
    }

    public static String getNewId() {
        UUID uuid = UUID.randomUUID();

        return base64EncodeUUID(uuid);
    }

    public static String base64EncodeUUID(UUID uuid) {
        // Adapted from http://stackoverflow.com/questions/2983065/guid-to-bytearray
        ByteBuffer bb = ByteBuffer.wrap(new byte[16]);
        bb.putLong(uuid.getMostSignificantBits());
        bb.putLong(uuid.getLeastSignificantBits());
        byte[] bytes = bb.array();

        // Encode the bytes...
        return Base64.encode(bytes);
    }

    abstract public void saveRecord(Vault.Record record);
    abstract public void deleteRecord(Vault.Record record);
    abstract public void bindRecord(Vault.Record record);
}
