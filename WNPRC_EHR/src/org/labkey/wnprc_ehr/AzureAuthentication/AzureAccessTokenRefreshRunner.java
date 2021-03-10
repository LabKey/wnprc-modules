package org.labkey.wnprc_ehr.AzureAuthentication;

import org.apache.log4j.Logger;
import org.labkey.wnprc_ehr.calendar.AzureActiveDirectoryAuthenticator;
import org.quartz.Job;
import org.quartz.JobDataMap;
import org.quartz.JobExecutionContext;
import org.labkey.wnprc_ehr.calendar.AzureActiveDirectoryAuthenticator.AzureTokenStatus;

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

    public AzureTokenStatus doTokenRefresh(String name) {
        AzureAccessTokenRefreshSettings settings = AzureAccessTokenRefreshSettings.get();
        String displayName = settings.getDisplayName(name);
        _log.info("Azure access token refresh - Started for '" + displayName + "'");

        AzureActiveDirectoryAuthenticator authenticator = new AzureActiveDirectoryAuthenticator(
                settings.getApplicationId(name),
                settings.getAuthority(name),
                settings.getUpn(name),
                name,
                settings.getScopes(name));

        AzureTokenStatus status = authenticator.getUserAccessToken();

        if (AzureTokenStatus.SUCCESS.equals(status)) {
            _log.info("Azure access token refresh - Completed for '" + displayName + "'");
        } else if (AzureTokenStatus.AUTH_REQUIRED.equals(status)) {
            _log.info("Azure access token refresh - Authentication required for '" + displayName + "'");
        } else {
            _log.info("Azure access token refresh - Failed for '" + displayName + "'");
        }

        return status;
    }
}
