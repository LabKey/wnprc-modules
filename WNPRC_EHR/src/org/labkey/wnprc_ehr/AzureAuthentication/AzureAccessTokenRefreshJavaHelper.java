package org.labkey.wnprc_ehr.AzureAuthentication;

public class AzureAccessTokenRefreshJavaHelper {

    /**
     * This method should be called when the settings cache needs to be refreshed.
     * It will refresh the refresh settings cache from the database, and then determine
     * if any jobs needs to be schedule/unscheduled/rescheduled
     */
    public static void refreshSettingsCache() {
        AzureAccessTokenRefreshSettings.get().refreshSettingsMap();
        for (String name : AzureAccessTokenRefreshSettings.get().getNames()) {
            AzureAccessTokenRefreshScheduler.get().onSettingsChange(name);
        }
    }
}