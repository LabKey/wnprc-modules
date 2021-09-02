package org.labkey.dbutils.api.service;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.jetbrains.annotations.NotNull;
import org.labkey.api.collections.CaseInsensitiveMapWrapper;
import org.labkey.api.data.Container;
import org.labkey.api.data.DbScope;
import org.labkey.api.data.TableInfo;
import org.labkey.api.study.security.SecurityEscalator;
import org.labkey.dbutils.api.exception.MissingPermissionsException;
import org.labkey.dbutils.api.schema.DecoratedTableInfo;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.DuplicateKeyException;
import org.labkey.api.query.InvalidKeyException;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.QueryUpdateServiceException;
import org.labkey.api.security.*;
import org.labkey.api.security.permissions.Permission;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * This class provides a Table Update Service that bypasses LabKey security, and instead checks the security
 * points passed into the constructor.  This shouldn't be used to get rid of security, but rather to offload
 * the job of checking security to the calling code, so that they can have custom or complicated application
 * code to determine whether a user may insert or update a given row.
 *
 * Created by jon on 10/25/16.
 */
public abstract class SecurityEscalatedService {
    private static Logger _log = LogManager.getLogger(SecurityEscalatedService.class);

    protected User user;
    protected Container container;

    public SecurityEscalatedService(User user, Container container, Class<? extends Permission>... requiredPermissions) throws MissingPermissionsException {
        this.user = user;
        this.container = container;

        // Check to make sure our user has all the required permissions
        SecurityPolicy policy = SecurityPolicyManager.getPolicy(container);
        if (requiredPermissions.length > 0 && !container.hasPermissions(user, new HashSet<>(Arrays.asList(requiredPermissions)))) {
            throw MissingPermissionsException.createNew(requiredPermissions);
        }
    }

    public abstract User getEscalationUser();

    public SimpleUpdateService getUpdateService(String schemaName, String tableName) {
        return new SimpleUpdateService(schemaName, tableName);
    }

    public class SimpleUpdateService {
        protected final String schemaName;
        protected final String tableName;

        public SimpleUpdateService(String schemaName, String tableName) {
            this.schemaName = schemaName;
            this.tableName = tableName;
        }

        private TableInfo _tableInfo;
        public TableInfo getTableInfo() {
            if (_tableInfo == null) {
                TableInfo originalTableInfo = QueryService.get().getUserSchema(getEscalationUser(), container, schemaName).getTable(tableName);
                _tableInfo = new DecoratedTableInfo(originalTableInfo) {
                    @Override
                    public boolean hasPermission(@NotNull UserPrincipal user, @NotNull Class<? extends Permission> perm) {
                        return true;
                    }
                };
            }

            return _tableInfo;
        }

        public QueryUpdateService getUpdateService() {
            return getTableInfo().getUpdateService();
        }

        private List<Map<String, Object>> castToCaseInsensitiveMap(List<Map<String, Object>> mapList) {
            List<Map<String, Object>> newList = new ArrayList<>();

            for (Map<String, Object> map : mapList) {
                newList.add(new CaseInsensitiveMapWrapper<>(map));
            }

            return newList;
        }

        public Map<String, Object> insertRow(Map<String, Object> row, String escalationComment) throws BatchValidationException, DuplicateKeyException, UnknownError {
            return this.insertRows(Arrays.asList(row), escalationComment).get(0);
        }

        public List<Map<String, Object>> insertRows(List<Map<String, Object>> rowMaps, String escalationComment) throws BatchValidationException, DuplicateKeyException, UnknownError {
            BatchValidationException batchValidationException = new BatchValidationException();

            List<Map<String, Object>> returnedRows;
            int numberOfRowsToInsert = rowMaps.size();

            // Wrap the whole thing in a transaction so that the insert is an all or nothing thing.
            try (DbScope.Transaction transaction = getTableInfo().getSchema().getScope().ensureTransaction()) {
                try (SecurityEscalatorAggregator escalator = SecurityEscalatorAggregator.beginEscalation(user, container, escalationComment)) {
                    escalator.registerSecurityEscalators(getEscalators(user, container, escalationComment));
                    returnedRows = getUpdateService().insertRows(user, container, this.castToCaseInsensitiveMap(rowMaps), batchValidationException, null, null);
                }
                catch (QueryUpdateServiceException|SQLException e) {
                    // These errors shouldn't happen, and if they do are part of the internals of LabKey, so don't worry about
                    // them and just throw them up the stack as a runtime error.
                    throw new RuntimeException(e);
                }

                // Check to make sure we have the right number of return rows.  #insertRows is known to simply ignore
                // certain errors for rows, and not throw an error (such as when there's a SQL/Batch validation exception).
                if (returnedRows == null || returnedRows.size() != numberOfRowsToInsert) {
                    throw new UnknownError("Unexpected number of rows returned from insertRows");
                }

                // If we got the validation exception, throw it.
                if (batchValidationException.hasErrors()) {
                    throw batchValidationException;
                }

                transaction.commit();
            }

            return returnedRows;
        }

        public Map<String, Object> updateRow(Map<String, Object> row, String escalationComment) throws BatchValidationException, InvalidKeyException, UnknownError {
            return updateRows(Arrays.asList(row), escalationComment).get(0);
        }

        public List<Map<String, Object>> updateRows(List<Map<String, Object>> rowMaps, String escalationComment) throws BatchValidationException, InvalidKeyException, UnknownError {
            List<Map<String, Object>> returnedRows;
            int numberOfRowsToUpdate = rowMaps.size();

            List<Map<String, Object>> keyMaps = new ArrayList<>();
            for (Map<String, Object> rowMap : rowMaps) {
                CaseInsensitiveMapWrapper<Object> caseInsensitiveRowMap = new CaseInsensitiveMapWrapper<Object>(rowMap);

                Map<String, Object> keyMap = new HashMap<>();

                for (String columnName : getTableInfo().getPkColumnNames()) {
                    if (caseInsensitiveRowMap.containsKey(columnName)) {
                        keyMap.put(columnName, caseInsensitiveRowMap.get(columnName));
                    }
                    else {
                        throw new InvalidKeyException(String.format(
                                "Primary key '%s' missing from rowMap: %s",
                                columnName,
                                rowMap.toString()
                        ));
                    }
                }

                keyMaps.add(keyMap);
            }

            // Wrap the whole thing in a transaction so that the insert is an all or nothing thing.
            try (DbScope.Transaction transaction = getTableInfo().getSchema().getScope().ensureTransaction()) {
                try (SecurityEscalatorAggregator escalator = SecurityEscalatorAggregator.beginEscalation(user, container, escalationComment)) {
                    escalator.registerSecurityEscalators(getEscalators(user, container, escalationComment));

                    returnedRows = getUpdateService().updateRows(user, container, this.castToCaseInsensitiveMap(rowMaps), this.castToCaseInsensitiveMap(keyMaps), null, null);
                }
                catch (QueryUpdateServiceException|SQLException e) {
                    // These errors shouldn't happen, and if they do are part of the internals of LabKey, so don't worry about
                    // them and just throw them up the stack as a runtime error.
                    throw new RuntimeException(e);
                }

                // Check to make sure we have the right number of return rows.  #insertRows is known to simply ignore
                // certain errors for rows, and not throw an error (such as when there's a SQL validation exception).
                if (returnedRows.size() != numberOfRowsToUpdate) {
                    throw new UnknownError("Unexpected number of rows returned from insertRows");
                }

                transaction.commit();
            }

            return returnedRows;
        }
    }

    abstract public Set<SecurityEscalator> getEscalators(User user, Container container, String escalationComment);

    /*
     * This class just combines the EHR and Study Security escalators, to ensure the code above is clean,
     * and to provide an easy way to add another escalator, should the need arise.
     */
    private static class SecurityEscalatorAggregator implements AutoCloseable {
        Set<SecurityEscalator> _securityEscalators = new HashSet<>();

        private SecurityEscalatorAggregator(User user, Container container, String comment) {}

        public void registerSecurityEscalator(SecurityEscalator securityEscalator) {
            _securityEscalators.add(securityEscalator);
        }

        public void registerSecurityEscalators(Collection<SecurityEscalator> securityEscalatorCollection) {
            for (SecurityEscalator escalator : securityEscalatorCollection) {
                this.registerSecurityEscalator(escalator);
            }
        }

        @Override
        public void close() {
            for (SecurityEscalator escalator : _securityEscalators) {
                escalator.close();
            }
        }

        public static SecurityEscalatorAggregator beginEscalation(User user, Container container, String comment) {
            return new SecurityEscalatorAggregator(user, container, comment);
        }
    }
}
