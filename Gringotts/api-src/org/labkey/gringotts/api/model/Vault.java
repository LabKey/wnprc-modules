package org.labkey.gringotts.api.model;

import com.google.common.reflect.TypeToken;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.labkey.api.data.Container;
import org.labkey.api.security.User;
import org.labkey.gringotts.api.GringottsService;
import org.labkey.gringotts.api.exception.InvalidVaultException;
import org.labkey.gringotts.api.exception.RecordNotFoundException;

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
 *         allows a point-in-time lookback, where you can view the state of a
 *         record at any time in the past.
 *     </li>
 * </ul>
 *
 * Vaults are not great at write performance, so don't use them for something that
 * needs to store a new record (or edit) every 10 seconds.  The vault ecosystem is
 * limited to one transaction per microsecond across all Vaults, since it uses the
 * timestamp as the primary key.
 *
 * @param <RecordType> The class that represents the data record.
 *
 * Created by Jon Richardson on 10/19/16.
 */
public abstract class Vault<RecordType extends Vault.Record> {
    // Container is used for scoping.
    protected Container _container;

    // User is used for auditing.
    protected User _user;

    private TypeToken<RecordType> _typeToken;

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

        // Save off the type token for later.
        _typeToken = new TypeToken<RecordType>(getClass()) {};

        initialize();
    }

    /**
     * Sets the VaultInfo for the vault to use.
     *
     * This is synchronized, because only the first call should only run once.
     *
     * @throws InvalidVaultException
     */
    private synchronized void initialize() throws InvalidVaultException {

    }

    public User getUser() {
        return _user;
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
     * Upgrades a record to the current version.  The system tries it's best to bind the rawRecordValues
     * to the current object, but it's clearly not able to be perfect, so this method is called to finish
     * the upgrade.
     *
     * If this method throws an exception, the upgrade will fail, and the vault will be inaccessible. If
     * you want to rely on the default method of upcasting, just override this and return null.  Note that
     * that can cause data loss (in the case that you remove a persisted field), so you should be careful.
     *
     * @param recordType
     * @param rawRecordValues
     */
    public void upgrade(RecordType recordType, RawRecordValues rawRecordValues) {
        throw new UnsupportedOperationException("Not implemented");
    }

    /**
     * Return a pretty display name.  Often, this is very similar to the class name.
     *
     * @return A string to display as the name of the Vault in UIs, debugs, etc.
     */
    public abstract String getDisplayName();

    public int getCurrentRecordVersion() {
        return 0;
    }

    public TypeToken<RecordType> getTypeToken() {
        return _typeToken;
    }

    public abstract class Record {
        // We can take advantage of the extends functionality in Java to allow a record to inherit fields
        // nicely, but we can't really inherit the id, so we store the id has a hash of all ids for each
        // class.
        private final Map<TypeToken, String> idMap = new HashMap<>();

        // A reference to the original values currently in the DB
        private RawRecordValues oldValues = null;

        protected int version = Vault.this.getCurrentRecordVersion();

        // This is a private constructor shared by the two "public" constructors.
        private Record(@NotNull String id, @Nullable Object dummyObjectToMakeSignatureUnique) {
            idMap.put(getVault().getTypeToken(), id);
        }

        public String  getId(TypeToken typeToken) {
            return idMap.get(typeToken);
        }

        /**
         * Opens an existing record from the Vault.
         *
         * @param id the id of the record in the vault to retrieve
         * @throws RecordNotFoundException if the id doesn't exist in the database.
         */
        protected Record(@NotNull String id) throws RecordNotFoundException {
            this(id, null);

        }

        public RawRecordValues getOldValues() {
            return oldValues;
        }

        /**
         * Constructs a brand new record.
         */
        protected Record() {
            this(GringottsService.getNewId(), null);
        }

        private final void bind() {
            GringottsService.get().bindRecord(this);
        }

        /**
         * Utility function to access the containing Vault.
         *
         * @return the Record's containing vault
         */
        public final Vault getVault() {
            return Vault.this;
        }

        /**
         * Persists the record to the database, and updates this.oldValues
         */
        public final void save() {
            GringottsService.get().saveRecord(this);
        }

        /**
         * Marks a record as deleted in the database.  This prevents it from existing from this point on, but
         * it will still technically be stored in the database to allow historical queries and maintain the
         * ledger.
         */
        public final void delete() {
            GringottsService.get().deleteRecord(this);
        }
    }
}
