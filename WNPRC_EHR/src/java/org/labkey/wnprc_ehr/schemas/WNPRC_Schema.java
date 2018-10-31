package org.labkey.wnprc_ehr.schemas;

import org.apache.log4j.Logger;
import org.apache.log4j.Priority;
import org.jetbrains.annotations.Nullable;
import org.json.JSONArray;
import org.json.JSONObject;
import org.labkey.api.cache.CacheManager;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.TableInfo;
import org.labkey.api.ehr.security.EHRRequestPermission;
import org.labkey.api.ehr.security.EHRVeterinarianPermission;
import org.labkey.api.exp.ChangePropertyDescriptorException;
import org.labkey.api.exp.OntologyManager;
import org.labkey.api.exp.PropertyDescriptor;
import org.labkey.api.exp.property.Domain;
import org.labkey.api.exp.property.DomainProperty;
import org.labkey.api.exp.property.SystemProperty;
import org.labkey.api.ldk.table.CustomPermissionsTable;
import org.labkey.api.query.SimpleUserSchema;
import org.labkey.api.security.User;
import org.labkey.api.security.permissions.InsertPermission;
import org.labkey.api.security.permissions.UpdatePermission;
import org.labkey.api.study.Dataset;
import org.labkey.api.study.Study;
import org.labkey.api.study.StudyService;
import org.labkey.dbutils.api.SimpleQueryFactory;
import org.labkey.webutils.api.json.JsonUtils;
import org.labkey.wnprc_ehr.schemas.enum_lookups.NecropsyDeliveryOptionTable;
import org.labkey.wnprc_ehr.schemas.enum_lookups.NecropsySampleDeliveryDestination;

import java.beans.Introspector;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Created by jon on 2/24/16.
 */
public class WNPRC_Schema extends SimpleUserSchema {
    private static Logger _log = Logger.getLogger(WNPRC_Schema.class);
    public static final String NAME = "wnprc";
    public static String DESCRIPTION = "Schema for WNPRC specific data.";
    public Container _container;

    /*
     * This should reflect the list of tables.
     */
    public enum TABLE {
        EMAIL_SERVER    ("email_server"),
        EXTERNAL_LABS   ("external_Labs"),
        NECROPSY_SUITE  ("necropsy_suite")
        ;

        String tableName;

        TABLE(String tableName) {
            this.tableName = tableName;
        }

        public String getTableName() {
            return this.tableName;
        }
    }

    public WNPRC_Schema(User user, Container container) {
        super(NAME, DESCRIPTION, user, container, DbSchema.get(NAME));
        _container = container;
    }

    @Override
    public TableInfo createTable(String name) {
        Map<String, TableInfo> enumTables = getEnumTables();

        if (enumTables.containsKey(name)) {
            return enumTables.get(name);
        }
        if (name.equalsIgnoreCase("vvc")){
            CustomPermissionsTable vvc = new CustomPermissionsTable(this,_dbSchema.getTable(name));
            vvc.addPermissionMapping(UpdatePermission.class, EHRVeterinarianPermission.class);
            vvc.addPermissionMapping(InsertPermission.class, EHRRequestPermission.class);

            return vvc.init();
        }
        else {
            return super.createTable(name);
        }
    }

    @Override
    public synchronized Set<String> getVisibleTableNames() {
        return getTableNames();
    }

    @Override
    public Set<String> getTableNames() {
        // Grab the ones that are defined in SQL
        Set<String> tables = new HashSet<>();

        tables.addAll(super.getTableNames());
        tables.addAll(getEnumTables().keySet());

        return tables;
    }

    private Map<String, TableInfo> _enumTables = null;
    protected Map<String, TableInfo> getEnumTables() {
        if (_enumTables == null) {
            _enumTables = new HashMap<>();

            _enumTables.put(NecropsyDeliveryOptionTable.NAME,       new NecropsyDeliveryOptionTable(this));
            _enumTables.put(NecropsySampleDeliveryDestination.NAME, new NecropsySampleDeliveryDestination(this));
        }

        return _enumTables;
    }

    public static List<JSONObject> selectRows(User user, Container container, TABLE table) {
        return WNPRC_Schema.selectRows(user, container, table, null);
    }

    public static List<JSONObject> selectRows(User user, Container container, TABLE table, @Nullable SimpleFilter filter) {
        // Grab the data
        SimpleQueryFactory queryFactory = new SimpleQueryFactory(user, container);
        JSONArray results = queryFactory.selectRows(NAME, table.tableName, filter);

        // Transform to a List
        List<JSONObject> rows = new ArrayList<>();
        rows.addAll(JsonUtils.getListFromJSONArray(results));

        return rows;
    }

    public static void ensureStudyShape(User user, Container container) throws ChangePropertyDescriptorException {
        Study study = StudyService.get().getStudy(container);

        Dataset tissueSamples = study.getDatasetByName(TissueSampleTable.TABLENAME);
        Domain tissueSamplesDomain = tissueSamples.getDomain();

        // Make sure the columns exist on the tissue samples table.
        for (SystemProperty systemProperty : Arrays.asList(TissueSampleTable.COLLECT_BEFORE_DEATH, TissueSampleTable.COLLECTION_ORDER)) {
            String propertyURI = systemProperty.getPropertyDescriptor().getPropertyURI();
            DomainProperty domainProperty = tissueSamplesDomain.getPropertyByURI(propertyURI);
            PropertyDescriptor pd = OntologyManager.getPropertyDescriptor(propertyURI, ContainerManager.getSharedContainer());
            if (domainProperty == null) {
                // The property doesn't exist, so we should create it
                _log.log(Priority.INFO, String.format("The %s column doesn't exist on the %s table.  Creating it now.", systemProperty.getPropertyDescriptor().getName(), TissueSampleTable.TABLENAME));

                domainProperty = tissueSamplesDomain.addProperty();
                domainProperty.setPropertyURI(pd.getPropertyURI());
                domainProperty.setRangeURI(pd.getRangeURI());
                domainProperty.setName(pd.getName());
            }
            else {
                _log.log(Priority.INFO, String.format("The %s column already exists on the %s table.", systemProperty.getPropertyDescriptor().getName(), TissueSampleTable.TABLENAME));
            }
        }

        _log.info(String.format("Saving %s domain as %s and flushing caches", tissueSamples.getName(), user));
        tissueSamplesDomain.save(user);
        Introspector.flushCaches();
        CacheManager.clearAllKnownCaches();
    }
}
