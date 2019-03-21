package org.labkey.wnprc_ehr.data.breeding;

import org.apache.log4j.Logger;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.labkey.api.collections.CaseInsensitiveMapWrapper;
import org.labkey.api.data.Container;
import org.labkey.api.data.DbScope;
import org.labkey.api.data.RuntimeSQLException;
import org.labkey.api.data.TableSelector;
import org.labkey.api.dataiterator.DataIteratorBuilder;
import org.labkey.api.dataiterator.DataIteratorContext;
import org.labkey.api.dataiterator.ListofMapsDataIterator;
import org.labkey.api.dataiterator.LoggingDataIterator;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.DuplicateKeyException;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.QueryUpdateServiceException;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.User;
import org.labkey.api.security.permissions.InsertPermission;
import org.labkey.api.view.UnauthorizedException;
import org.labkey.study.query.DatasetTableImpl;
import org.labkey.study.query.DatasetUpdateService;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.AbstractMap;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Scanner;
import java.util.function.Function;
import java.util.stream.Stream;

/**
 * Generates records in study.pregnancies and study.pregnancy_outcomes based on historical data already stored in the
 * database--specifically from study.birth and study.prenatal for already "completed" pregnancies and from
 * study.demographics for "ongoing" pregnancies (based on a "pg" in the medical field).
 */
public final class PregnancyHistoryCreator
{
    /**
     * Logger for logging the logs
     */
    private static final Logger LOG = Logger.getLogger(PregnancyHistoryCreator.class);

    /**
     * Creates new pregnancy and outcome records in the new datasets based on the existing records in the birth,
     * prenatal, and demographics tables
     *
     * @param user      User creating the records
     * @param container Container to query/create in
     */
    public static void createPregnanciesAndOutcomes(User user, Container container)
            throws SQLException, QueryUpdateServiceException, BatchValidationException, DuplicateKeyException
    {
        UserSchema schema = QueryService.get().getUserSchema(user, container, "study");
        assert schema != null;

        try (DbScope.Transaction tx = schema.getDbSchema().getScope().ensureTransaction())
        {
            createAndInsertRecords(user, container, schema, getSql("PregnancyHistory.sql"), "pregnancies", PregnancyHistoryCreator::generatePregnancyRecord);
            createAndInsertRecords(user, container, schema, getSql("OutcomeHistory.sql"), "pregnancy_outcomes", PregnancyHistoryCreator::generateOutcomeRecord);
            tx.commit();
        }
    }

    /**
     * Generates records using the passed SQL string and generator function and inserts them into the passed
     * dataset in the passed container as the passed user.
     *
     * @param user      User performing insert
     * @param container Container to query/insert into
     * @param schema    Schema to query
     * @param sql       SQL string to execute to generate records
     * @param dataset   Dataset name into which to insert
     * @param generator Generator to build records for insert
     */
    private static void createAndInsertRecords(User user, Container container, UserSchema schema, String sql, String dataset, Function<ResultSet, Map<String, Object>> generator)
            throws SQLException, DuplicateKeyException, BatchValidationException, QueryUpdateServiceException
    {
        DatasetTableImpl table = (DatasetTableImpl) schema.getTable(dataset);
        assert table != null;

        if ((new TableSelector(table)).getRowCount() > 0)
        {
            LOG.warn(String.format("Pregnancy history will only be created for empty datasets, skipping dataset with data: dataset=%s", dataset));
            return;
        }

        ArrayList<Map<String, Object>> records = new ArrayList<>();
        try (ResultSet rs = QueryService.get().select(schema, sql))
        {
            while (rs.next())
            {
                Map<String, Object> record = generator.apply(rs);
                if (record != null) records.add(record);
            }
        }
        if (records.size() > 0)
        {
            BatchValidationException bve = new BatchValidationException();
            // create a new, custom implementation of the dataset update service that skips over the auditing
            // and the trigger scripts to insert data directly into the new pregnancy and outcome datasets. be
            // advised that this requires all the data being inserted to be properly sanitized (with respect to
            // the triggers) BEFORE it gets passed to the update service, because the triggers will not run.
            // because the data is being pulled directly from the extant data in the database, this SHOULD be
            // safe enough (i.e., there will be no additional sanitizing necessary, since we're using known valid
            // data as inputs) but if anything changes in our handling of related data, be sure to update this, too.
            //   - clay, 17 May 2018
            QueryUpdateService qus = new DatasetUpdateService(table)
            {
                @Override
                public List<Map<String, Object>> insertRows(@NotNull User user, @NotNull Container container, @NotNull List<Map<String, Object>> rows, @NotNull BatchValidationException errors,
                                                            @Nullable Map<Enum, Object> configParameters, @Nullable Map<String, Object> extraScriptContext)
                {
                    if (!hasPermission(user, InsertPermission.class))
                        throw new UnauthorizedException("You do not have permission to insert data into this table.");

                    DataIteratorContext context = getDataIteratorContext(errors, InsertOption.INSERT, configParameters);
                    DataIteratorBuilder builder = createImportDIB(user, container,
                            new DataIteratorBuilder.Wrapper(LoggingDataIterator.wrap(
                                    new ListofMapsDataIterator(rows.get(0).keySet(), rows))), context);

                    ArrayList<Map<String, Object>> output = new ArrayList<>();
                    int count = _pump(builder, output, context);
                    LOG.debug(String.format("Fast inserted pregnancy-related records (no triggers): table=%s, count=%d",
                            getQueryTable().getName(), count));

                    return output;
                }
            };
            qus.setBulkLoad(true);
            qus.insertRows(user, container, records, bve, null, null);
            if (bve.hasErrors())
                throw bve;
        }
    }

    /**
     * Returns a new pregnancy outcome record build from the passed result set
     *
     * @param rs Results set from outcome query
     * @return Case-insensitive map of fields to data to insert into the database
     */
    private static CaseInsensitiveMapWrapper<Object> generateOutcomeRecord(ResultSet rs)
    {
        try
        {
            return new CaseInsensitiveMapWrapper<>(Stream.of(
                    // @formatter:off
                      new AbstractMap.SimpleEntry<>("Id", rs.getString("dam"))
                    , new AbstractMap.SimpleEntry<>("date", rs.getDate("date"))
                    , new AbstractMap.SimpleEntry<>("infantid", rs.getString("infantid"))
                    , new AbstractMap.SimpleEntry<>("outcome", rs.getString("outcome"))
                    , new AbstractMap.SimpleEntry<>("project", rs.getString("project"))
                    , new AbstractMap.SimpleEntry<>("pregnancyid", rs.getString("pregnancyid"))
                    , new AbstractMap.SimpleEntry<>("remark", rs.getString("remark"))
                    // @formatter:on
            ).collect(HashMap::new, (m, v) -> m.put(v.getKey(), v.getValue()), HashMap::putAll));
        }
        catch (SQLException e)
        {
            throw new RuntimeSQLException(e);
        }
    }

    /**
     * Returns a new pregnancy record build from the passed result set
     *
     * @param rs Results set from pregnancy query
     * @return Case-insensitive map of fields to data to insert into the database
     */
    private static CaseInsensitiveMapWrapper<Object> generatePregnancyRecord(ResultSet rs)
    {
        try
        {
            if (rs.getString("medical").matches("(?i:.*\\bpg\\b.*)"))
            {
                return new CaseInsensitiveMapWrapper<>(Stream.of(
                        // @formatter:off
                          new AbstractMap.SimpleEntry<>("date", rs.getDate("date"))
                        , new AbstractMap.SimpleEntry<>("Id", rs.getString("dam"))
                        , new AbstractMap.SimpleEntry<>("sireid", rs.getString("sire"))
                        , new AbstractMap.SimpleEntry<>("date_conception_early", rs.getDate("conception"))
                        , new AbstractMap.SimpleEntry<>("date_conception_late", rs.getDate("conception"))
                        // @formatter:on
                ).collect(HashMap::new, (m, v) -> m.put(v.getKey(), v.getValue()), HashMap::putAll));
            }
            else
            {
                return null;
            }
        }
        catch (SQLException e)
        {
            throw new RuntimeSQLException(e);
        }
    }

    /**
     * Returns the passed resource name as a (SQL) String
     *
     * @param resource Name of the SQL file to read
     * @return Contents of the file
     */
    private static String getSql(String resource)
    {
        try (Scanner s = new Scanner(PregnancyHistoryCreator.class.getResourceAsStream(resource)))
        {
            // "\A" is the regex escape for "beginning of string", so this will read the
            // whole InputStream as a String
            return s.useDelimiter("\\A").next();
        }
    }
}
