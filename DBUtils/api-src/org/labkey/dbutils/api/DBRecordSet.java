package org.labkey.dbutils.api;

import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.Container;
import org.labkey.api.data.Results;
import org.labkey.api.data.RuntimeSQLException;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.TableInfo;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.DefaultSchema;
import org.labkey.api.query.DuplicateKeyException;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.InvalidKeyException;
import org.labkey.api.query.QueryHelper;
import org.labkey.api.query.QuerySchema;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.QueryUpdateServiceException;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.User;
import org.labkey.api.util.ResultSetUtil;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Created by jon on 3/23/16.
 */
public class DBRecordSet {
    private Set<DBRecord> records = new HashSet<>();
    private Set<DBRecord> newRecords = new HashSet<>(); // records to be inserted

    final protected User user;
    final protected Container container;

    final protected String schemaName;
    final protected String tableName;

    public DBRecordSet(User user, Container container, String schemaName, String tableName) {
        this(user, container, schemaName, tableName, null);
    }

    public DBRecordSet(User user, Container container, String schemaName, String tableName, SimpleFilter filter) {
        this.user = user;
        this.container = container;

        this.schemaName = schemaName;
        this.tableName = tableName;

        Results rs = null;

        // Define the service, schema, and table.
        QueryService queryService = QueryService.get();
        UserSchema userSchema   = QueryService.get().getUserSchema(user, container, schemaName);
        if (userSchema == null) {
            throw new InvalidTableException("The schema for the table you specified (\"" + schemaName + "\") does not exist");
        }

        TableInfo tableInfo    = userSchema.getTable(tableName);
        if (tableInfo == null) {
            throw new InvalidTableException("The table you specified (\"" + tableName + "\") does not exist in the \"" + schemaName + "\" schema.");
        }

        try {

            QueryHelper queryHelper = new QueryHelper(container, user, schemaName, tableName);

            // Determine the columns to include
            List<FieldKey> columns = tableInfo.getDefaultVisibleColumns();

            // Now get the actual columnInfo
            Map<FieldKey, ColumnInfo> map = queryService.getColumns(tableInfo, columns);
            Collection<ColumnInfo> cols = map.values();

            // Actually execute the query and grab the results
            rs = queryHelper.select(columns, filter);

            // Now, loop through results, adding them to our results object
            if (rs.next()) {
                do {
                    records.add(new DBRecord(this, rs));
                } while (rs.next());
            }
        }
        catch(SQLException e) {
            throw new RuntimeSQLException(e);
        }
        finally {
            ResultSetUtil.close(rs);
        }
    }

    protected DefaultSchema getDefaultSchema() {
        return DefaultSchema.get(user, container);
    }

    protected QuerySchema getSchema() {
        return getDefaultSchema().getSchema(schemaName);
    }


    public Set<DBRecord> getRecords() {
        Set<DBRecord> recordsToReturn = new HashSet<>();

        recordsToReturn.addAll(records);
        recordsToReturn.addAll(newRecords);

        return Collections.unmodifiableSet(recordsToReturn);
    }

    private QueryUpdateService getUpdateService() {
        return getSchema().getTable(tableName).getUpdateService();
    }

    private void insertRecords(List<DBRecord> records) throws InvalidKeyException, BatchValidationException, QueryUpdateServiceException, SQLException {
        getUpdateService().updateRows(user, container, transformRecordsToMaps(records),
                null, /* original values can be null since keys don't change */
                null, // configParameters
                null  // Map<String, Object> extraScriptContext
        );
    }

    private void updateRecords(List<DBRecord> records) throws DuplicateKeyException, BatchValidationException, QueryUpdateServiceException, SQLException {
        getUpdateService().insertRows(user, container, transformRecordsToMaps(records),
                null, /* original values can be null since keys don't change */
                null, // configParameters
                null  // Map<String, Object> extraScriptContext
        );
    }

    public void saveRecord(DBRecord record) throws Exception {
        saveRecords(Arrays.asList(record));
    }

    public void saveAllRecords() throws Exception {
        List<DBRecord> recordsToSave = new ArrayList<>();
        recordsToSave.addAll(getRecords());
        saveRecords(recordsToSave);
    }

    public void saveRecords(List<DBRecord> recordsToSave) throws Exception {
        List<DBRecord> recordsToUpdate = new ArrayList<>();
        List<DBRecord> recordsToInsert = new ArrayList<>();

        // Check to make sure that we're only saving the records that belong to our set.
        for(DBRecord record : recordsToSave) {
            if (records.contains(record)) {
                recordsToUpdate.add(record);
            }
            else if (newRecords.contains(record)) {
                recordsToInsert.add(record);
            }
            else {
                throw new Exception("You can only save records associated with this set");
            }
        }

        insertRecords(recordsToInsert);
        updateRecords(recordsToUpdate);

        //recordsToUpdate.forEach(DBRecordType::resetOriginalValues); // Java 8 version of next few lines
        for(DBRecord record : recordsToUpdate) {
            record.resetOriginalValues();
        }

        //recordsToInsert.forEach(DBRecordType::resetOriginalValues); // Java 8 version of next few lines
        for(DBRecord record : recordsToInsert) {
            record.resetOriginalValues();
        }
    }

    private List<Map<String, Object>> transformRecordsToMaps(List<DBRecord> records) {
        List<Map<String, Object>> maps = new ArrayList<>();
        for(DBRecord record : records) {
            maps.add(record.getCurrentValues());
        }

        return maps;
    }

    public class DBRecord {
        final protected DBRecordSet recordSet;
        final protected Map<String, Object> originalValues;
        final protected Map<String, Object> currentValues = new HashMap<>();

        protected DBRecord(DBRecordSet recordSet, Results rs) throws SQLException {
            this.recordSet = recordSet;

            originalValues = rs.getRowMap();

            // Clone the original values into currentValues
            for(String key : originalValues.keySet()) {
                currentValues.put(key, originalValues.get(key));
            }
        }

        protected void resetOriginalValues() {
            for(String key : currentValues.keySet()) {
                originalValues.put(key, currentValues.get(key));
            }
        }

        public Map<String, Object> getCurrentValues() {
            return currentValues;
        }

        protected void saveRecord() throws Exception {
            recordSet.saveRecord(this);
        }
    }

    public class InvalidTableException extends RuntimeException {
        public InvalidTableException() { super(); }
        public InvalidTableException(String message) { super(message); }
        public InvalidTableException(String message, Throwable cause) { super(message, cause); }
        public InvalidTableException(Throwable cause) { super(cause); }
    }
}