package org.labkey.wnprc_ehr.AzureAuthentication;

public class AzureAccessTokenRefreshJavaHelper {

    public static void refreshSettingsCache() {
        AzureAccessTokenRefreshSettings.get().refreshSettingsMap();
        for (String name : AzureAccessTokenRefreshSettings.get().getNames()) {
            AzureAccessTokenRefreshScheduler.get().onSettingsChange(name);
        }
    }
}