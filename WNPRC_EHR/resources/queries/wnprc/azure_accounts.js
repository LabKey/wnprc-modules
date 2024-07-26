function afterInsert(row, oldRow) {
    refreshSettingsCache();
}

function afterUpdate(row, oldRow) {
    refreshSettingsCache();
}

function afterDelete(row, oldRow) {
    refreshSettingsCache();
}

function refreshSettingsCache() {
    org.labkey.wnprc_ehr.AzureAuthentication.AzureAccessTokenRefreshJavaHelper.refreshSettingsCache();
}