package org.labkey.wnprc_ehr.AzureAuthentication;

import org.apache.log4j.Logger;
import org.labkey.api.data.PropertyManager;
import org.labkey.wnprc_ehr.calendar.AzureActiveDirectoryAuthenticator;
import org.quartz.Job;
import org.quartz.JobDataMap;
import org.quartz.JobExecutionContext;

/**
 * Created with IntelliJ IDEA.
 * User: gottfredsen
 * Date: 2020-10-14
 */
public class AzureAccessTokenRefreshRunner implements Job {
    private static final Logger _log = Logger.getLogger(AzureAccessTokenRefreshRunner.class);

    public AzureAccessTokenRefreshRunner() {

    }

    public void execute(JobExecutionContext context) {
        JobDataMap jobDataMap = context.getMergedJobDataMap();
        String name = (String) jobDataMap.get("name");
        doTokenRefresh(name);
    }

    public void doTokenRefresh(String name) {
        AzureAccessTokenRefreshSettings settings = new AzureAccessTokenRefreshSettings();

        _log.info("Azure access token refresh started for '" + settings.getDisplayName(name) + "'");

        AzureActiveDirectoryAuthenticator authenticator = new AzureActiveDirectoryAuthenticator(
                settings.getApplicationId(name),
                settings.getAuthority(name),
                settings.getUpn(name),
                name,
                settings.getScopes(name));

        String accessToken = authenticator.getUserAccessToken();

        PropertyManager.PropertyMap properties = PropertyManager.getEncryptedStore().getWritableProperties(name + ".Credentials", true);
        properties.put("AccessToken", accessToken);
        properties.save();

        _log.info("Azure access token refresh completed for '" + settings.getDisplayName(name) + "'");
    }
}
