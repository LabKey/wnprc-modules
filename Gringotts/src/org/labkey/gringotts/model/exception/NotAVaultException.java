package org.labkey.gringotts.model.exception;

/**
 * Created by jon on 10/20/16.
 */
public class NotAVaultException extends Exception {
    public NotAVaultException() {
        super("Vaults need to implement the @VaultInfo annotation");
    }
}