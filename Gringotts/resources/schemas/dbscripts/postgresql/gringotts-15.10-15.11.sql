-- Create schema, tables, indexes, and constraints used for Gringotts module here
-- All SQL VIEW definitions should be created in gringotts-create.sql and dropped in gringotts-drop.sql
CREATE SCHEMA gringotts;

/*
 * This is just a lookup from Vault Class name (getId()) on the Vault object to the
 * internal vaultid.  This is so the "Id" can change in the future, but would never
 * need to change internally, because it would use an internally assigned id.
 *
 * Initially, I do not plan to support changing the id of a vault, but I'd like to
 * leave the door open for doing it in the future without introducing a huge headache.
 */
CREATE TABLE gringotts.vaults (
  vaultId        TEXT NOT NULL,
  vaultClassName TEXT NOT NULL,

  -- Purposely not including modified[By], as vaults are only ever created, not modified
  createdby  userid,
  created    TIMESTAMP,

  CONSTRAINT PK_vaults PRIMARY KEY (vaultId, created)
);

/*
 * This is the basic unit of the ledger.  Every update to the database is associated
 * with a transaction.
 *
 * Transactions can cover multiple vaults, so that changes to associated records can
 * be atomic, and there is less contention over transaction timestamps.
 */
CREATE TABLE gringotts.transactions (
  createdOn     TIMESTAMP DEFAULT current_timestamp,

  transactionId TEXT NOT NULL,
  "user"        userid,

  -- These two are for QC transactions.  Essentially, a transaction can "take effect" in
  -- the past, which allows you to essentially edit old records while still leaving a
  -- perfect ledger.  To edit, you'd add a new transaction with a date of now but an
  -- effectiveOn of the exact timestamp of the
  effectiveOn   TIMESTAMP,
  comment       TEXT,

  CONSTRAINT PK_transactions PRIMARY KEY (createdOn),
  CONSTRAINT transactions_id_unique UNIQUE (transactionId)
);
COMMENT ON TABLE gringotts.transactions IS 'This is the basic unit of the ledger.  Every update to the database is associated with a transaction.';


/*
 * This table essentially holds all of the structures of the various versions of the record.
 * This also supplies the mappings between the internal column name and the exposed "column"
 * name.  In general, they will line up, unless there are changes made to the data structure.
 */
CREATE TABLE gringotts.vault_columns (
  vaultId    TEXT NOT NULL,
  version    INTEGER,
  columnName TEXT,

  type       TEXT,
  columnId   TEXT,

  CONSTRAINT PK_vault_columns PRIMARY KEY (vaultId, version, columnName)
);


CREATE TABLE gringotts.records (
  vaultId   TEXT     NOT NULL,
  recordId  TEXT     NOT NULL,
  container ENTITYID NOT NULL,
  version   INTEGER,

  transactionId TEXT NOT NULL,

  CONSTRAINT PK_records PRIMARY KEY (vaultId, recordId, version)
);

CREATE TABLE gringotts.vault_text_values (
  vaultId       TEXT     NOT NULL,
  recordId      TEXT     NOT NULL,
  columnId      TEXT     NOT NULL,
  transactionId TEXT     NOT NULL,

  value         TEXT,
  effectiveDate TIMESTAMP,

  CONSTRAINT PK_vault_text_values PRIMARY KEY (vaultId, recordId, columnId, transactionId),
  CONSTRAINT FK_vault_text_values_transactions FOREIGN KEY (transactionId) REFERENCES gringotts.transactions (transactionId)
);

CREATE TABLE gringotts.vault_datetime_values (
  vaultId       TEXT     NOT NULL,
  recordId      TEXT     NOT NULL,
  columnId      TEXT     NOT NULL,
  transactionId TEXT     NOT NULL,

  value         TIMESTAMP,
  effectiveDate TIMESTAMP,

  CONSTRAINT PK_vault_datetime_values PRIMARY KEY (vaultId, recordId, columnId, transactionId),
  CONSTRAINT FK_vault_datetime_values_transactions FOREIGN KEY (transactionId) REFERENCES gringotts.transactions (transactionId)
);

CREATE TABLE gringotts.vault_int_values (
  vaultId       TEXT     NOT NULL,
  recordId      TEXT     NOT NULL,
  columnId      TEXT     NOT NULL,
  transactionId TEXT     NOT NULL,

  value         INTEGER,
  effectiveDate TIMESTAMP,

  CONSTRAINT PK_vault_int_values PRIMARY KEY (vaultId, recordId, columnId, transactionId),
  CONSTRAINT FK_vault_int_values_transactions FOREIGN KEY (transactionId) REFERENCES gringotts.transactions (transactionId)
);

/*
 * This holds the mappings for records that extend other records.  The child vault class must extend the
 * parent vault class.
 */
CREATE TABLE gringotts.vault_parent_records (
  childVaultId   TEXT NOT NULL,
  childRecordId  TEXT NOT NULL,
  parentVaultId  TEXT NOT NULL,
  parentRecordId TEXT NOT NULL,

  CONSTRAINT PK_vault_parent_records PRIMARY KEY (childRecordId, childVaultId, parentVaultId, parentRecordId)
);

CREATE TABLE gringotts.vault_links (
  -- "Primary" primary keys
  vaultId1 TEXT NOT NULL, -- source
  columnId TEXT NOT NULL,
  vaultId2 TEXT NOT NULL, -- target

  --  "Secondary" primary keys
  record1       TEXT NOT NULL, -- source
  record2       TEXT NOT NULL, -- target
  transactionId TEXT NOT NULL,

  isLinked BOOLEAN NOT NULL DEFAULT TRUE,
  "order"  INTEGER,

  CONSTRAINT PK_vault_links PRIMARY KEY (vaultId1, columnId, vaultId2, record1, record2, transactionId)
);