package org.labkey.wnprc_ehr.AzureAuthentication;

public class AzureAccessTokenRefreshRunnable implements Runnable {

    private String name;

    public AzureAccessTokenRefreshRunnable(String name) {
        this.name = name;
    }

    /**
     * Scheduled the token refresh job and then also immediately runs a token refresh
     */
    public void run() {
        AzureAccessTokenRefreshScheduler.get().schedule(name);
        AzureAccessTokenRefreshRunner azureAccessTokenRefreshRunner = new AzureAccessTokenRefreshRunner();
        azureAccessTokenRefreshRunner.doTokenRefresh(name);
    }
}
