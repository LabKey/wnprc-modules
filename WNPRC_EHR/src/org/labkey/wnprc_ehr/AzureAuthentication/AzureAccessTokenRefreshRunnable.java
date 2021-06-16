package org.labkey.wnprc_ehr.AzureAuthentication;

public class AzureAccessTokenRefreshRunnable implements Runnable {

    private String name;

    public AzureAccessTokenRefreshRunnable(String name) {
        this.name = name;
    }

    public void run() {
        AzureAccessTokenRefreshScheduler.get().schedule(name);
        AzureAccessTokenRefreshRunner azureAccessTokenRefreshRunner = new AzureAccessTokenRefreshRunner();
        azureAccessTokenRefreshRunner.doTokenRefresh(name);
    }
}
