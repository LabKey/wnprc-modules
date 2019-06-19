package org.labkey.wnprc_ehr.encryption;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.CharBuffer;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Arrays;

public class AES
{
    public static byte[] decrypt(String[] bytes) {
        return decrypt(stringArrayToBytes(bytes));
    }

    public static byte[] decrypt(byte[] password) {
        int enc_len = password.length;
        byte[] decrypted = new byte[enc_len];
        try
        {
            byte[] keyBytes = Files.readAllBytes(Paths.get(System.getProperty("key.file")));
            byte[] ivBytes = Files.readAllBytes(Paths.get(System.getProperty("iv.file")));

            SecretKeySpec key = new SecretKeySpec(keyBytes, "AES");
            IvParameterSpec ivSpec = new IvParameterSpec(ivBytes);
            Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");

            cipher.init(Cipher.DECRYPT_MODE, key, ivSpec);
            int dec_len = cipher.update(password, 0, enc_len, decrypted, 0);
            dec_len += cipher.doFinal(decrypted, dec_len);
        } catch (Exception e) {
            //TODO add error handling
        }
        return decrypted;
    }

    public static byte[] encrypt(char[] password) {
        return encrypt(charsToBytes(password));
    }

    public static byte[] encrypt(String password) {
        return encrypt(password.getBytes(StandardCharsets.UTF_8));
    }

    public static byte[] encrypt(byte[] password) {
        byte[] encrypted = new byte[password.length];
        try {
            byte[] keyBytes = Files.readAllBytes(Paths.get(System.getProperty("key.file")));
            byte[] ivBytes = Files.readAllBytes(Paths.get(System.getProperty("iv.file")));

            SecretKeySpec key = new SecretKeySpec(keyBytes, "AES");
            IvParameterSpec ivSpec = new IvParameterSpec(ivBytes);
            Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");

            cipher.init(Cipher.ENCRYPT_MODE, key, ivSpec);
            encrypted = new byte[cipher.getOutputSize(password.length)];
            int enc_len = cipher.update(password, 0, password.length, encrypted, 0);
            enc_len += cipher.doFinal(encrypted, enc_len);
        } catch (Exception e) {
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
}
