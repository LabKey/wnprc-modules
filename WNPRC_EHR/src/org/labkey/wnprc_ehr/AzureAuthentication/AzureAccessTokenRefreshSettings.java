package org.labkey.wnprc_ehr.AzureAuthentication;

import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.DbSchemaType;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryService;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class AzureAccessTokenRefreshSettings {

    private Map<String, Map<String, Object>> _settings;

    public AzureAccessTokenRefreshSettings() {
        _settings = createSettingsMap();
    }

    private Map<String, Map<String, Object>> createSettingsMap() {
        Map<String, Map<String, Object>> settingsMap = new HashMap<>();

        DbSchema schema = DbSchema.get("wnprc", DbSchemaType.Module);
        TableInfo ti = schema.getTable("azure_accounts");

        Set<FieldKey> columns = new HashSet<>();
        columns.add(FieldKey.fromString("display_name"));
        columns.add(FieldKey.fromString("account"));
        columns.add(FieldKey.fromString("enabled"));
        columns.add(FieldKey.fromString("refresh_interval"));
        columns.add(FieldKey.fromString("application_id"));
        columns.add(FieldKey.fromString("authority"));
        columns.add(FieldKey.fromString("upn"));
        columns.add(FieldKey.fromString("name"));
        columns.add(FieldKey.fromString("scopes"));

        final Map<FieldKey, ColumnInfo> colMap = QueryService.get().getColumns(ti, columns);

        TableSelector ts = new TableSelector(ti, colMap.values(), null, null);
        Map<String, Object>[] azureAccounts = ts.getMapArray();

        for (int i = 0; i < azureAccounts.length; i++) {
            settingsMap.put((String) azureAccounts[i].get("name"), azureAccounts[i]);
        }

        return settingsMap;
    }

    public String getDisplayName(String name) {
        return (String) _settings.get(name).get("display_name");
    }

    public String getAccount(String name) {
        return (String) _settings.get(name).get("account");
    }

    public Boolean isEnabled(String name) {
        return (Boolean) _settings.get(name).get("enabled");
    }

    public Integer getRefreshInterval(String name) {
        return (Integer) _settings.get(name).get("refresh_interval");
    }

    public String getApplicationId(String name) {
        return (String) _settings.get(name).get("application_id");
    }

    public String getAuthority(String name) {
        return (String) _settings.get(name).get("authority");
    }

    public String getUpn(String name) {
        return (String) _settings.get(name).get("upn");
    }

    public Set<String> getScopes(String name) {
        String scopesString = (String) _settings.get(name).get("scopes");
        Set<String> scopes = scopesString != null ? new HashSet<>(Arrays.asList(scopesString.split("\\R"))) : null;
        return scopes;
    }

    public List<String> getNames() {
        List<String> names = new ArrayList<>();
        for (String name : _settings.keySet()) {
            names.add(name);
        }
        return names;
    }

    public Collection<Map<String, Object>> getAllSettings() {
        return _settings.values();
    }
}
