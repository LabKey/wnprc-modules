package org.labkey.wnprc_ehr.AzureAuthentication;

public class AzureAccessTokenRefreshJavaHelper {

    public static void refreshSettingsCache() {
        AzureAccessTokenRefreshSettings.refreshSettingsMap();
    }
}