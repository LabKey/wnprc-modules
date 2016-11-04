package org.labkey.gringotts.model;

import org.apache.xerces.impl.dv.util.Base64;

import java.nio.ByteBuffer;
import java.util.UUID;

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
}
