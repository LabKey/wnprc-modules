package org.labkey.gringotts.model;

import com.google.common.reflect.TypeToken;
import org.apache.commons.collections15.map.CaseInsensitiveMap;
import org.jooq.DSLContext;
import org.jooq.Result;
import org.jooq.impl.DSL;
import org.labkey.gringotts.GringottsSchema;
import org.labkey.gringotts.api.GringottsService;
import org.labkey.gringotts.api.annotation.SerializeField;
import org.labkey.gringotts.api.exception.InvalidVaultException;
import org.labkey.gringotts.api.model.ColumnInfo;
import org.labkey.gringotts.api.model.ValueType;
import org.labkey.gringotts.api.model.Vault;
import org.labkey.gringotts.model.jooq.tables.records.VaultColumnsRecord;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.labkey.gringotts.model.jooq.tables.VaultColumns.VAULT_COLUMNS;

/**
 * Created by jon on 11/4/16.
 */
public class VaultSerializationInfo {
    private final Vault vault;
    private VaultSerializationInfo parentInfo;
    private final String internalId;

    // A list of the versions
    private final List<CaseInsensitiveMap<ColumnInfo>> versions;

    // A collection of all internal names that have been used.
    public Set<String> usedColumnNames = new HashSet<>();

    public boolean needsToFlushMostRecentColumnMap = false;

    public VaultSerializationInfo(Vault vault) throws InvalidVaultException {
        this.vault = vault;
        this.internalId = getInternalId();

        this.versions = getVersions();

        Class superClass = this.vault.getTypeToken().getRawType().getSuperclass();
        if (superClass == Vault.Record.class) {
            parentInfo = null;
        }
        else {

        }
    }

    public Integer getCurrentVersion() {
        return versions.size();
    }

    public String getInternalId() {
        if (internalId != null) {
            return internalId;
        }

        return VaultUtils.getInternalId(vault);
    }

    public List<CaseInsensitiveMap<ColumnInfo>> getVersions() throws InvalidVaultException {
        if (this.versions != null) {
            return this.versions;
        }

        // Create a new list to use
        List<CaseInsensitiveMap<ColumnInfo>> versions = new ArrayList<>();

        // Fetch a map of previous column maps
        Map<Integer, Result<VaultColumnsRecord>> versionColumnMap = GringottsSchema.getSQLConnection().selectFrom(VAULT_COLUMNS).fetch().intoGroups(VAULT_COLUMNS.VERSION);

        // Figure out the highest version number
        int highestIndex = Collections.max(versionColumnMap.keySet()).intValue();

        // Loop through each version to convert to a ColumnInfo record.
        for (int i = 0; i <= highestIndex; i++) {
            CaseInsensitiveMap<ColumnInfo> columnMap = new CaseInsensitiveMap();
            versions.add(columnMap);

            for(VaultColumnsRecord columnRecord : versionColumnMap.get(i)) {
                ColumnInfo info = new ColumnInfo(
                        columnRecord.getType(),
                        columnRecord.getColumnname(),
                        columnRecord.getColumnid()
                );

                columnMap.put(info.columnName, info);

                usedColumnNames.add(info.internalName);
            }
        }

        // Possibly add the current map to the pool.
        CaseInsensitiveMap<ColumnInfo> currentMap = getColumnMapForClass(vault.getClass());
        if (versions.size() == 0 || !columnMapsAreEqual(currentMap, versions.get(versions.size() - 1))) {
            versions.add(currentMap);
            needsToFlushMostRecentColumnMap = true;
        }

        return versions;
    }

    private CaseInsensitiveMap<ColumnInfo> getColumnMapForClass(Class clazz) throws InvalidVaultException {
        CaseInsensitiveMap<ColumnInfo> columnMap = new CaseInsensitiveMap();

        for (Field field : clazz.getFields()) {
            if (field.isAnnotationPresent(SerializeField.class)) {
                SerializeField fieldInfo = field.getAnnotation(SerializeField.class);

                // If the column name is "", that means that we should just use the field name.
                String columnName = fieldInfo.columnName().equals("") ? field.getName().toLowerCase() : fieldInfo.columnName();
                String internalColumnName = internalizeColumnName(columnName);

                ValueType type = ValueType.getFromClass(field.getClass());

                if (type == null) {
                    throw new InvalidVaultException(String.format(
                            "Unrecognized type marked for serialization: %s is of type %s.  See %s for valid types.",
                            field.getName(),
                            field.getClass(),
                            ValueType.class.getCanonicalName()
                    ));
                }

                // Check to see if this column existed in the last version in the same form.  If so, give
                // it the same internal id.
                if (versions.size() > 0) {
                    CaseInsensitiveMap<ColumnInfo> lastMap = versions.get(versions.size() - 1);

                    if (lastMap.containsKey(columnName)) {
                        ColumnInfo oldColumn = lastMap.get(columnName);

                        if (oldColumn.type.equals(type)) {
                            internalColumnName = oldColumn.internalName;
                        }
                    }
                }

                columnMap.put(field.getName(), new ColumnInfo(type, columnName, internalColumnName));
            }
        }

        return columnMap;
    }

    Pattern endPattern = Pattern.compile(".*_(?<NUM>[0-9]+)$");
    private String internalizeColumnName(String originalColumnName) {
        String internalColumnName = originalColumnName;

        while (usedColumnNames.contains(internalColumnName)) {
            Matcher matcher = endPattern.matcher(internalColumnName);

            if (matcher.matches()) {
                // Get the current version
                Integer currentVersion = Integer.valueOf(matcher.group("NUM"), 10);
                internalColumnName = matcher.replaceAll(""); // Remove the suffix

                // Append an incremented number
                internalColumnName = internalColumnName + "_" + (new Integer(currentVersion + 1)).toString();
            }
            else {
                internalColumnName = internalColumnName + "_2";
            }
        }

        return internalColumnName;
    }

    private boolean columnMapsAreEqual(CaseInsensitiveMap<ColumnInfo> map1, CaseInsensitiveMap<ColumnInfo> map2) {
        if (!map1.keySet().containsAll(map2.keySet()) || !map2.keySet().containsAll(map1.keySet())) {
            return false;
        }

        for (String key : map1.keySet()) {
            ColumnInfo info1 = map1.get(key);
            ColumnInfo info2 = map1.get(key);

            if (!info1.equals(info2)) {
                return false;
            }
        }

        return true;
    }

    public void beforeWrite() {
        if (needsToFlushMostRecentColumnMap) {
            this.flushMostRecentColumnMap();
            needsToFlushMostRecentColumnMap = !needsToFlushMostRecentColumnMap;
        }
    }

    private void flushMostRecentColumnMap() {
        CaseInsensitiveMap<ColumnInfo> map = versions.get(versions.size() - 1);

        GringottsSchema.getSQLConnection().transaction(conn -> {
            for (String name : map.keySet()) {
                ColumnInfo info = map.get(name);

                VaultColumnsRecord rec = DSL.using(conn).newRecord(VAULT_COLUMNS);

                rec.setColumnid(info.internalName);
                rec.setColumnname(info.columnName);
                rec.setVersion(getCurrentVersion());
                rec.setVaultid(getInternalId());
                rec.setType(info.type.name());

                rec.store();
            }
        });
    }

    public void saveRecord(Vault.Record record) {
        CaseInsensitiveMap<ColumnInfo> curMap = versions.get(versions.size() - 1);

        Class recordClass = record.getVault().getTypeToken().getRawType();

        for (String fieldName : curMap.keySet()) {
            // Do something
        }
    }

    public static Map<TypeToken, ClassColumnInfo> cache = new HashMap<>();

    public static ClassColumnInfo getClassColumnInfo(TypeToken typeToken) {
        ClassColumnInfo info = cache.get(typeToken);

        if (info == null) {
            info = new ClassColumnInfo(typeToken);

            cache.put(typeToken, info);
        }

        return info;
    }

    public static class ClassColumnInfo {
        public ClassColumnInfo(TypeToken typeToken) {

        }
    }
}
