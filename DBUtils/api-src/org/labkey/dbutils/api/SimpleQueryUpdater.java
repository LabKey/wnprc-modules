package org.labkey.dbutils.api;

import org.json.JSONObject;
import org.labkey.api.collections.CaseInsensitiveMapWrapper;
import org.labkey.api.data.Container;
import org.labkey.api.data.DbScope;
import org.labkey.api.data.TableInfo;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.DuplicateKeyException;
import org.labkey.api.query.InvalidKeyException;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.QueryUpdateServiceException;
import org.labkey.api.security.User;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

/**
 * Similarly to how {@link SimpleQuery} makes it simple to access data in tables, {@link SimpleQueryUpdater} makes
 * it easy to edit tables.
 */
public class SimpleQueryUpdater {
    private TableInfo tableInfo;
    private QueryUpdateService service;
    private User user;
    private Container container;

    public SimpleQueryUpdater (User user, Container container, String schemaName, String tableName) {
        this.tableInfo = QueryService.get().getUserSchema(user, container, schemaName).getTable(tableName);
        this.service = this.tableInfo.getUpdateService();
        this.user = user;
        this.container = container;
    }

    public List<CaseInsensitiveMapWrapper<Object>> insert(Map<String, Object>... rowArray) throws QueryUpdateServiceException, SQLException, BatchValidationException, DuplicateKeyException {
        List<Map<String, Object>> rows = makeRowsCaseInsensitive(rowArray);
        return this.insert(rows);
    }

    public List<CaseInsensitiveMapWrapper<Object>> update(Map<String, Object>... rowArray) throws QueryUpdateServiceException, SQLException, BatchValidationException, InvalidKeyException {
        List<Map<String, Object>> rows = makeRowsCaseInsensitive(rowArray);
        return this.update(rows);
    }

    public List<CaseInsensitiveMapWrapper<Object>> upsert(Map<String, Object>... rowArray) throws QueryUpdateServiceException, SQLException, InvalidKeyException, BatchValidationException, DuplicateKeyException {
        List<Map<String, Object>> rows = makeRowsCaseInsensitive(rowArray);
        return this.upsert(rows);
    }

    public List<CaseInsensitiveMapWrapper<Object>> delete(Map<String, Object>... rowArray) throws QueryUpdateServiceException, SQLException, InvalidKeyException, BatchValidationException {
        List<Map<String, Object>> rows = makeRowsCaseInsensitive(rowArray);
        return this.delete(rows);
    }

    /**
     * Inserts a row into the table. It does the entire thing as a transaction, so any failure
     * will result in no data being inserted.
     *
     * @param rows A "list" of {@link Map<String, Object>} objects that represent rows.  Note that these can
     *      be {@link JSONObject}s, if you so choose.
     * @return A {@link List<CaseInsensitiveMapWrapper>} of the rows that were inserted.  They will have all been
     *      converted to be case-insensitive, and will include any fields that were added/changed automatically
     *      by the INSERT or trigger scripts.
     * @throws QueryUpdateServiceException Indicates an internal error in the QueryUpdateService
     * @throws SQLException Indicates a communication problem with the SQL database
     * @throws BatchValidationException Thrown if the trigger scripts throw an error on any row
     * @throws DuplicateKeyException Thrown if there is already a row in the table with the same key
     */
    public List<CaseInsensitiveMapWrapper<Object>> insert(List<Map<String, Object>> rows) throws QueryUpdateServiceException, SQLException, BatchValidationException, DuplicateKeyException {
        rows = makeRowListCaseInsensitive(rows);
        List<CaseInsensitiveMapWrapper<Object>> rowsToReturn = new ArrayList<>();

        // Wrap everything in a transaction to make INSERT operations atomic together.
        try(DbScope.Transaction transaction = tableInfo.getSchema().getScope().ensureTransaction()) {
            rowsToReturn.addAll(getCaseInsensitiveRowList(doInsert(rows)));

            // Actually commit the changes.
            transaction.commit();
        }
        return rowsToReturn;
    }

    /**
     * Updates a row in the table. It does the entire thing as a transaction, so any failure
     * will result in no data being updated.
     *
     * @param rows A "list" of {@link Map<String, Object>} objects that represent rows.  Note that these can
     *      be {@link JSONObject}s, if you so choose.
     * @return A {@link List<CaseInsensitiveMapWrapper>} of the rows that were updated.  They will have all been
     *      converted to be case-insensitive, and will include any fields that were added/changed automatically
     *      by the UPDATE or trigger scripts.
     * @throws QueryUpdateServiceException Indicates an internal error in the QueryUpdateService
     * @throws SQLException Indicates a communication problem with the SQL database
     * @throws InvalidKeyException Thrown if the key in an updated row doesn't exist in the table
     * @throws BatchValidationException Thrown if the trigger scripts throw an error on any row
     */
    public List<CaseInsensitiveMapWrapper<Object>> update(List<Map<String, Object>> rows) throws QueryUpdateServiceException, SQLException, BatchValidationException, InvalidKeyException {
        rows = makeRowListCaseInsensitive(rows);
        List<CaseInsensitiveMapWrapper<Object>> rowsToReturn = new ArrayList<>();

        // Wrap everything in a transaction to make UPDATE operations atomic together.
        try(DbScope.Transaction transaction = tableInfo.getSchema().getScope().ensureTransaction()) {
            rowsToReturn.addAll(getCaseInsensitiveRowList(doUpdate(rows)));

            // Actually commit the changes.
            transaction.commit();
        }
        return rowsToReturn;
    }



    /**
     * Inserts or updates a row to ensure it's in the table.  It intelligently checks to see if each row exists,
     * and determines whether to insert or update them.  It does the entire thing as a transaction, so any failure
     * will result in no data being inserted.
     *
     * @param rows A "list" of {@link Map<String, Object>} objects that represent rows.  Note that these can
     *                 be {@link JSONObject}s, if you so choose.
     * @return A {@link List<CaseInsensitiveMapWrapper>} of the rows that were upserted.  They will have all been
     *         converted to be case-insensitive, and will include any fields that were added/changed automatically
     *         by the INSERT/UPDATE or trigger scripts.
     * @throws QueryUpdateServiceException Indicates an internal error in the QueryUpdateService
     * @throws SQLException Indicates a communication problem with the SQL database
     * @throws InvalidKeyException Should not occur, since any row that would throw this will be INSERTed instead
     * @throws BatchValidationException Thrown if the trigger scripts throw an error on any row.
     * @throws DuplicateKeyException Should not occur, since any row that would throw this will be UPDATEd instead
     */
    public List<CaseInsensitiveMapWrapper<Object>> upsert(List<Map<String, Object>> rows) throws QueryUpdateServiceException, SQLException, InvalidKeyException, BatchValidationException, DuplicateKeyException {
        rows = makeRowListCaseInsensitive(rows);
        List<CaseInsensitiveMapWrapper<Object>> rowsToReturn = new ArrayList<>();

        // Create buckets for our rows to insert or update
        List<Map<String, Object>> rowsToInsert = new ArrayList<>();
        List<Map<String, Object>> rowsToUpdate = new ArrayList<>();

        // Rows that can be found in the database
        List<Map<String, Object>> rowsInDB = service.getRows(user, container, rows);

        // Assign each row to insert/update queues
        rowLoop:
        for (Map<String, Object> row : rows) {
            for (Map<String, Object> rowFromDB : rowsInDB) {
                if (this.rowMapsAreEqual(rowFromDB, row)) {
                    rowsToUpdate.add(row);
                    continue rowLoop;
                }
            }

            rowsToInsert.add(row);
        }

        // Wrap everything in a transaction to make both UPDATE and INSERT operations atomic together.
        try(DbScope.Transaction transaction = tableInfo.getSchema().getScope().ensureTransaction()) {
            rowsToReturn.addAll(getCaseInsensitiveRowList(doInsert(rowsToInsert)));
            rowsToReturn.addAll(getCaseInsensitiveRowList(doUpdate(rowsToUpdate)));

            // Actually commit the changes.
            transaction.commit();
        }
        return rowsToReturn;
    }

    public List<Map<String, Object>> doInsert(List<Map<String, Object>> rows) throws BatchValidationException , DuplicateKeyException, SQLException, QueryUpdateServiceException{
        List<Map<String, Object>> insertedRows = new ArrayList<>();
        if (rows.size() > 0) {
            BatchValidationException validationException = new BatchValidationException();
            insertedRows = service.insertRows(user, container, rows, validationException, null, null);

            if (validationException.hasErrors()) {
                throw validationException;
            }
            // From my understanding, this shouldn't really happen, if you're checking the BatchValidationException.
            // Otherwise, the QueryUpdateService has a tendency to insert as much as it can, and not throw an error
            // for the rows that it couldn't.
            else if (insertedRows.size() != rows.size()) {
                throw new QueryUpdateServiceException("Not all rows were inserted properly");
            }
        }
        return insertedRows;
    }

    public List<Map<String, Object>> doUpdate(List<Map<String, Object>> rows) throws BatchValidationException , InvalidKeyException, SQLException, QueryUpdateServiceException {
        List<Map<String, Object>> updatedRows = new ArrayList<>();
        if (rows.size() > 0) {
            updatedRows = service.updateRows(user, container, rows, rows, null, null);

            if (updatedRows.size() != rows.size()) {
                throw new QueryUpdateServiceException("Not all rows updated properly");
            }
        }
        return updatedRows;
    }

    public List<CaseInsensitiveMapWrapper<Object>> delete(List<Map<String, Object>> rows) throws QueryUpdateServiceException, SQLException, InvalidKeyException, BatchValidationException {
        List<CaseInsensitiveMapWrapper<Object>> rowsToReturn = new ArrayList<>();

        // Wrap everything in a transaction to make both UPDATE and INSERT operations atomic together.
        try(DbScope.Transaction transaction = tableInfo.getSchema().getScope().ensureTransaction()) {
            if (rows.size() > 0) {
                List<Map<String, Object>> deletedRows = service.deleteRows(user, container, rows, null, null);

                // Check to make sure that the QueryUpdateService doesn't try to delete as much as it can, and not throw
                // an error for the rows that it couldn't.
                if (deletedRows.size() != deletedRows.size()) {
                    throw new QueryUpdateServiceException("Not all rows were deleted properly");
                }
                else {
                    rowsToReturn.addAll(getCaseInsensitiveRowList(deletedRows));
                }
            }

            // Actually commit the changes.
            transaction.commit();
        }

        return rowsToReturn;
    }

    /**
     * Converts a list of maps into case insensitive maps, which are required by {@link QueryUpdateService#insertRows(User, Container, List, BatchValidationException, Map, Map)}
     * and {@link QueryUpdateService#updateRows(User, Container, List, List, Map, Map)}, even though the method
     * signature only claims it needs Maps.
     *
     * @param rows A list of {@link Map}s to convert.
     * @return A {@link List<CaseInsensitiveMapWrapper>} representing the same rows supplied as input.
     */
    public static List<CaseInsensitiveMapWrapper<Object>> getCaseInsensitiveRowList (List<Map<String, Object>> rows) {
        List<CaseInsensitiveMapWrapper<Object>> rowList = new ArrayList<>();

        for (Map<String, Object> row : rows) {
            rowList.add((new CaseInsensitiveMapWrapper<Object>(row)));
        }

        return rowList;
    }

    /**
     * Casts a "list" of rows to appropriate case insensitive rows for {@link QueryUpdateService#insertRows(User, Container, List, BatchValidationException, Map, Map)}
     * and {@link QueryUpdateService#updateRows(User, Container, List, List, Map, Map)}.
     *
     * @param rows A series (possibly of just one) of {@link Map<String, Object>} objects (which includes
     *             {@link JSONObject} objects, since they extend {@link Map<String, Object>}.
     * @return A {@link List<Map<String, Object>>} of maps that happen to be case insensitive.
     */
    public static List<Map<String, Object>> makeRowsCaseInsensitive(Map<String, Object>... rows) {
        return makeRowListCaseInsensitive(Arrays.asList(rows));
    }

    /**
     * Does the same thing as {@link #makeRowsCaseInsensitive(Map[])}, but taking a {@link List} as a parameter.
     *
     * @param rows A series (possibly of just one) of {@link Map<String, Object>} objects (which includes
     *             {@link JSONObject} objects, since they extend {@link Map<String, Object>}.
     * @return A {@link List<Map<String, Object>>} of maps that happen to be case insensitive.
     * @see #makeRowsCaseInsensitive(Map[])
     */
    public static List<Map<String, Object>> makeRowListCaseInsensitive(List<Map<String, Object>> rows) {
        List<Map<String, Object>> rowList = new ArrayList<>();
        rowList.addAll(getCaseInsensitiveRowList(rows));
        return rowList;
    }

    /**
     * Checks the equality of two rows in the eye of the database, by comparing their values for their primary
     * key columns. Note that this doesn't compare all values, it simply checks to see if they represent the
     * same row in the database.  They may have differing values for columns that are not primary keys, and
     * may contain keys that the other does not.  If either does not contain all of their primary keys, this will
     * indicate that they are different rows.  This is because some columns may be auto-assigned at INSERT time,
     * and this assumes that if they are not supplied, either the trigger scripts or database will supply a
     * new value for that field that doesn't match the other row.
     *
     * @param row1 The first row to compare.
     * @param row2 The second row to compare.
     * @return True if they share the same private keys, or false if they do not.
     */
    private boolean rowMapsAreEqual(Map<String, Object> row1, Map<String, Object> row2) {
        for (String columnName : tableInfo.getPkColumnNames()) {
            // Make sure the first row contains the key
            if (!row1.containsKey(columnName)) {
                return false;
            }

            // Check for null.  If both contain null, we'll consider them to be equal.  note
            // that PostgreSQL in general doesn't allow NULL primary keys as NULL != NULL in
            // PostgreSQL.  This is for the scenario where the primary key includes something
            // like container, which may be added by QueryUpdateService.
            if (row1.get(columnName) == null) {
                return row2.get(columnName) == null;
            }

            // Now that we know we won't get a NullPointerException on this line, just use the
            // built-in equality checker
            if (!row1.get(columnName).equals(row2.get(columnName))) {
                return false;
            }
        }

        return true;
    }
}
