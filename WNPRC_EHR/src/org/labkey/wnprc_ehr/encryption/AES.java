package org.labkey.wnprc_ehr.encryption;

import org.apache.commons.codec.DecoderException;
import org.apache.commons.codec.binary.Hex;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.CharBuffer;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Base64;

public class AES
{
    public static byte[] decrypt(String encryptedPassword, String keyString, String ivString) {
        return decrypt(encryptedPassword.getBytes(StandardCharsets.UTF_8), keyString.getBytes(StandardCharsets.UTF_8), ivString.getBytes(StandardCharsets.UTF_8));
    }

    public static byte[] decrypt(String[] bytes, byte[] keyBytes, byte[] ivBytes) {
        return decrypt(stringArrayToBytes(bytes), keyBytes, ivBytes);
    }

    public static byte[] decrypt(byte[] password, byte[] keyBytes, byte[] ivBytes) {
        int enc_len = password.length;
        byte[] decrypted = new byte[enc_len];
        try
        {
            SecretKeySpec key = new SecretKeySpec(keyBytes, "AES");
            IvParameterSpec ivSpec = new IvParameterSpec(ivBytes);
            Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");

            cipher.init(Cipher.DECRYPT_MODE, key, ivSpec);
            int dec_len = cipher.update(password, 0, enc_len, decrypted, 0);
            dec_len += cipher.doFinal(decrypted, dec_len);
        } catch (Exception e) {
            int x = 3;
            //TODO add error handling
        }
        return decrypted;
    }

    public static byte[] encrypt(String password, String keyString, String ivString) {
        return encrypt(password.getBytes(StandardCharsets.UTF_8), keyString.getBytes(StandardCharsets.UTF_8), ivString.getBytes(StandardCharsets.UTF_8));
    }

    public static byte[] encrypt(char[] password, byte[] keyBytes, byte[] ivBytes) {
        return encrypt(charsToBytes(password), keyBytes, ivBytes);
    }

    public static byte[] encrypt(String password, byte[] keyBytes, byte[] ivBytes) {
        return encrypt(password.getBytes(StandardCharsets.UTF_8), keyBytes, ivBytes);
    }

    public static byte[] encrypt(byte[] password, byte[] keyBytes, byte[] ivBytes) {
        byte[] encrypted = new byte[password.length];
        try {
            SecretKeySpec key = new SecretKeySpec(keyBytes, "AES");
            IvParameterSpec ivSpec = new IvParameterSpec(ivBytes);
            Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");

            cipher.init(Cipher.ENCRYPT_MODE, key, ivSpec);
            encrypted = new byte[cipher.getOutputSize(password.length)];
            int enc_len = cipher.update(password, 0, password.length, encrypted, 0);
            enc_len += cipher.doFinal(encrypted, enc_len);
        } catch (Exception e) {
            int x = 3;
            //TODO add error handling
        }
        return encrypted;
    }

    private static byte[] charsToBytes(char[] chars) {
        CharBuffer charBuffer = CharBuffer.wrap(chars);
        ByteBuffer byteBuffer = StandardCharsets.UTF_8.encode(charBuffer);
        byte[] bytes = Arrays.copyOfRange(byteBuffer.array(), byteBuffer.position(), byteBuffer.limit());
        Arrays.fill(charBuffer.array(), '\u0000'); // clear sensitive data
        Arrays.fill(byteBuffer.array(), (byte) 0); // clear sensitive data
        return bytes;
    }

    private static char[] bytesToChars(byte[] bytes){
        ByteBuffer byteBuffer = ByteBuffer.wrap(bytes);
        CharBuffer charBuffer = StandardCharsets.UTF_8.decode(byteBuffer);
        char[] chars = Arrays.copyOfRange(charBuffer.array(), charBuffer.position(), charBuffer.limit());
        Arrays.fill(charBuffer.array(), '\u0000'); // clear sensitive data
        Arrays.fill(byteBuffer.array(), (byte) 0); // clear sensitive data
        return chars;
    }

    private static byte[] stringArrayToBytes(String[] bytes) {
        int enc_len = bytes.length;
        byte[] pw = new byte[enc_len];
        for(int i = 0; i < bytes.length; i++) {
            pw[i] = Byte.parseByte(bytes[i]);
        }
        return pw;
    }

    public static byte[] hexStringToByteArray(String hexString) throws DecoderException {
        return Hex.decodeHex(hexString.toCharArray());
    }

    public static byte[] base64StringToByteArray(String base64String) {
        return Base64.getDecoder().decode(new String(base64String.getBytes(StandardCharsets.UTF_8), StandardCharsets.UTF_8));
    }
}
