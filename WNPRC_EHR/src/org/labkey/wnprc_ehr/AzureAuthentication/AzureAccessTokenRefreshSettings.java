package org.labkey.wnprc_ehr.AzureAuthentication;

import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.DbSchemaType;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.InvalidKeyException;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.QueryUpdateServiceException;
import org.labkey.api.security.User;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;

public class AzureAccessTokenRefreshSettings {

    private static Map<String, Map<String, Object>> _settings = null;
    private static final AzureAccessTokenRefreshSettings _instance = new AzureAccessTokenRefreshSettings();

    private AzureAccessTokenRefreshSettings() {
        if (_settings == null) {
            refreshSettingsMap();
        }
    }

    public static AzureAccessTokenRefreshSettings get() {
        return _instance;
    }

    public void refreshSettingsMap() {
        _settings = new TreeMap<>();

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

        if (ti != null) {
            final Map<FieldKey, ColumnInfo> colMap = QueryService.get().getColumns(ti, columns);

            TableSelector ts = new TableSelector(ti, colMap.values(), null, null);
            Map<String, Object>[] azureAccounts = ts.getMapArray();

            for (Map<String, Object> account : azureAccounts) {
                _settings.put((String) account.get("name"), account);
            }
        }
    }

    public boolean updateSettings(List<Map<String, Object>> newSettings, User user) throws InvalidKeyException, BatchValidationException, QueryUpdateServiceException, SQLException {

        for (Map<String, Object> accountSettings : newSettings) {
            if (accountSettings.get("name") == null) {
                return false;
            }
        }

        //Get the service object based on schema/table
        TableInfo ti = QueryService.get().getUserSchema(user, ContainerManager.getForPath("/WNPRC"), "wnprc").getTable("azure_accounts");
        QueryUpdateService service = ti.getUpdateService();

        List<Map<String, Object>> updatedSettings = service.updateRows(user, ContainerManager.getForPath("/WNPRC"), newSettings, newSettings, null, null);
        if (updatedSettings.size() != newSettings.size()) {
            throw new QueryUpdateServiceException("There was an error updating the azure_accounts table.");
        }

        return true;
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

    @NotNull
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
