package org.labkey.gringotts.api.model;

import com.google.common.reflect.TypeToken;
import org.labkey.api.data.Container;
import org.labkey.api.security.User;

import java.util.HashMap;
import java.util.Map;

/**
 * A Vault is a type-safe persisted object store.  To use it, you extend the
 * vault as well as the Record class, and then just instantiate the Vault, and
 * it's records, saving and deleting them using the methods exposed by Record.
 *
 * Advantages to using vaults include:
 * <ul>
 *     <li>
 *         A simple, type-safe API for interacting with records
 *     </li>
 *     <li>
 *         Automatic handling of relationships between records
 *     </li>
 *     <li>
 *         A full audit log/ledger of all changes to the record, tracking both
 *         changes over time and QC edits made by administrators.  This also
 *         allows
 *     </li>
 * </ul>
 *
 *
 * @param <RecordType> The class that represents the data record.
 *
 * Created by Jon Richardson on 10/19/16.
 */
public abstract class Vault<RecordType extends Vault.Record> {
    protected Container _container;
    protected User _user;

    /**
     * Vaults are not scoped to containers (unlike the Study module), but
     * the individual records in a vault ARE scoped to containers, so you
     * need to indicate the container view that the vault should expose.
     *
     * @param container The container to look at for vault records.
     * @throws InvalidVaultException
     */
    public Vault(Container container) throws InvalidVaultException {
        _container = container;
    }

    /**
     * This is the String that is used in the underlying DB to identify
     * the vault, which should NOT conflict with other vaults.  By default,
     * this is set to the fully qualified canonical name.
     *
     * You should only need to override this if you want to move an existing
     * vault's defining class to a different package or rename it.  In that
     * case, you'll need to change this to return the old canonical name, otherwise,
     * Gringotts will treat it as a new vault, and the vault will lose access
     * to all of it's old records.
     *
     * @return A unique String to identify the Vault.
     */
    public String getId() {
        return this.getClass().getCanonicalName();
    }

    /**
     * Return a pretty display name.  Often, this is very similar to the class name.
     *
     * @return A string to display as the name of the Vault in UIs, debugs, etc.
     */
    public abstract String getDisplayName();

    private void saveRecord(Record record) {

    }

    private void deleteRecord(Record record) {

    }

    public abstract class Record {
        private Map<TypeToken<? extends Record>, String> idMap = new HashMap<>();

        protected Record(Map<TypeToken<? extends Record>, String> ids) {

        }

        protected Record() {
            this(null);
        }

        public final Vault getVault() {
            return Vault.this;
        }

        public final void save() {
            saveRecord(this);
        }

        public final void delete() {
            deleteRecord(this);
        }
    }

    public class InvalidVaultException extends Exception {
        public InvalidVaultException(String message) {
            super(message);
        }
    }
}
