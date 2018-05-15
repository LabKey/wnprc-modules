package org.labkey.wnprc_ehr.data.breeding;

import org.apache.log4j.Logger;
import org.jetbrains.annotations.Nullable;
import org.labkey.api.collections.CaseInsensitiveHashSet;
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
import java.util.function.Function;
import java.util.stream.Stream;

public final class PregnancyHistoryCreator
{
    /**
     * Logger for logging the logs
     */
    private static final Logger LOG = Logger.getLogger(PregnancyHistoryCreator.class);

    /**
     * SQL string to fetch the source records for generating pregnancy outcomes
     */
    private static final String OUTCOME_SQL =
            // @formatter:off
            " SELECT                                  " +
            "   y.*,                                  " +
            "   pg.lsid pregnancyid                   " +
            " FROM (SELECT                            " +
            "         b.dam      dam,                 " +
            "         b.date     date,                " +
            "         b.id       infantid,            " +
            "         'birth'    outcome,             " +
            "         NULL       project,             " +
            "         b.remark   remark,              " +
            "       FROM study.birth b                " +
            "       UNION                             " +
            "       SELECT                            " +
            "         p.dam      dam,                 " +
            "         p.date     date,                " +
            "         p.id       infantid,            " +
            "         'prenatal' outcome,             " +
            "         p.project  project,             " +
            "         p.remark   remark               " +
            "       FROM study.prenatal p             " +
            "      ) y                                " +
            " INNER JOIN study.pregnancies pg         " +
            "   ON y.dam = pg.id                      " +
            "     AND y.date = pg.date                " +
            " WHERE y.dam is not null                 " +
            "   AND y.dam <> 'unknown'                ";
            // @formatter:on

    /**
     * SQL string to fetch the source records for generating pregnancies
     */
    private static final String PREGNANCY_SQL =
            // @formatter:off
            " SELECT x.*                                                      "+
            " FROM (SELECT                                                    "+
            "         b.dam                                       dam,        "+
            "         b.date                                      date,       "+
            "         CASE                                                    "+
            "           WHEN b.conception IS NULL                             "+
            "             THEN timestampadd('SQL_TSI_DAY', -165, b.date)      "+
            "           ELSE b.conception                                     "+
            "         END                                         conception, "+
            "         'pg'                                        medical,    "+
            "         b.sire                                      sire        "+
            "       FROM study.birth b                                        "+
            "       UNION                                                     "+
            "       SELECT                                                    "+
            "         p.dam                                       dam,        "+
            "         p.date                                      date,       "+
            "         CASE                                                    "+
            "           WHEN p.conception IS NULL                             "+
            "             THEN timestampadd('SQL_TSI_DAY', -165, p.date)      "+
            "           ELSE p.conception                                     "+
            "         END                                         conception, "+
            "         'pg'                                        medical,    "+
            "         p.sire                                      sire        "+
            "       FROM study.prenatal p                                     "+
            "       UNION                                                     "+
            "       SELECT                                                    "+
            "         d.id                                        dam,        "+
            "         curdate()                                   date,       "+
            "         NULL                                        conception, "+
            "         d.medical                                   medical,    "+
            "         NULL                                        sire        "+
            "       FROM study.demographics d                                 "+
            "       WHERE lower(medical) LIKE '%pg%'                          "+
            "         AND calculated_status = 'Alive'                         "+
            "      ) x                                                        "+
            " WHERE x.dam IS NOT NULL                                         "+
            "   AND x.dam <> 'unknown'                                        ";
            // @formatter:on

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
            createAndInsertRecords(user, container, schema, PREGNANCY_SQL, "pregnancies", PregnancyHistoryCreator::generatePregnancyRecord);
            createAndInsertRecords(user, container, schema, OUTCOME_SQL, "pregnancy_outcomes", PregnancyHistoryCreator::generateOutcomeRecord);
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
            LOG.warn(String.format("pregnancy history will only be created for empty datasets, skipping dataset with data: dataset=%s", dataset));
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
            QueryUpdateService qus = new UpdateService(table);
            qus.setBulkLoad(true);

            BatchValidationException bve = new BatchValidationException();
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
                      new AbstractMap.SimpleEntry<>("id", rs.getString("dam"))
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
                        , new AbstractMap.SimpleEntry<>("id", rs.getString("dam"))
                        , new AbstractMap.SimpleEntry<>("sireid", rs.getString("sire"))
                        , new AbstractMap.SimpleEntry<>("date_conception", rs.getDate("conception"))
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
     * Private helper class used to speed up the initial insert of the pregnancy dataset information during update. Because
     * the initial dataset import is of already extant, sanitized data, the trigger scripts (and auditing) are both skipped
     * to keep the insert fast.
     */
    private static final class UpdateService extends DatasetUpdateService
    {
        public UpdateService(DatasetTableImpl table)
        {
            super(table);
        }

        @Override
        public List<Map<String, Object>> insertRows(User user, Container container, List<Map<String, Object>> rows, BatchValidationException errors,
                                                    @Nullable Map<Enum, Object> configParameters, @Nullable Map<String, Object> extraScriptContext)
        {
            if (!hasPermission(user, InsertPermission.class))
                throw new UnauthorizedException("You do not have permission to insert data into this table.");

            DataIteratorContext context = getDataIteratorContext(errors, InsertOption.INSERT, configParameters);

            ListofMapsDataIterator maps = new ListofMapsDataIterator(rows.size() > 0 ? rows.get(0).keySet() : new CaseInsensitiveHashSet(), rows);
            maps.setDebugName(getClass().getSimpleName() + ".insertRows()");

            DataIteratorBuilder builder = createImportDIB(user, container, new DataIteratorBuilder.Wrapper(LoggingDataIterator.wrap(maps)), context);
            ArrayList<Map<String, Object>> output = new ArrayList<>();

            int count = _pump(builder, output, context);
            LOG.debug(String.format("fast inserted pregnancy-related records: table=%s, count=%d", getQueryTable().getName(), count));

            if (errors.hasErrors())
            {
                LOG.warn("fast inserted pregnancy-related records: encountered some batch validation errors", errors);
                return null;
            }
            else
            {
                return output;
            }
        }
    }
}
