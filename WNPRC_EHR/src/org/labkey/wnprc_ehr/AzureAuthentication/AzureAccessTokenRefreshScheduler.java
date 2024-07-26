package org.labkey.wnprc_ehr.AzureAuthentication;

import org.apache.log4j.Logger;
import org.quartz.DailyTimeIntervalScheduleBuilder;
import org.quartz.JobBuilder;
import org.quartz.JobDetail;
import org.quartz.Trigger;
import org.quartz.TriggerBuilder;
import org.quartz.impl.StdSchedulerFactory;

import java.util.HashMap;
import java.util.Map;

/**
 * Created with IntelliJ IDEA.
 * User: gottfredsen
 * Date: 2020-10-14
 */
public class AzureAccessTokenRefreshScheduler {
    private static final AzureAccessTokenRefreshScheduler _instance = new AzureAccessTokenRefreshScheduler();
    private static final Logger _log = Logger.getLogger(AzureAccessTokenRefreshScheduler.class);
    private static Map<String, JobDetail> _jobs = new HashMap<>();
    private Map<String, Integer> _frequencies = new HashMap<>();
    private Map<String, Boolean> _enabled = new HashMap<>();

    private AzureAccessTokenRefreshScheduler() {

    }

    public static AzureAccessTokenRefreshScheduler get() {
        return _instance;
    }

    /**
     * Schedules the job with the given name. This will only succeed if the job name matches a name in the wnprc.azure_accounts table
     *
     * @param name the name of the job to schedule
     */
    public synchronized void schedule(String name) {
        //Retrieves an object with all of the data from wnprc.azure_accounts table
        AzureAccessTokenRefreshSettings settings = AzureAccessTokenRefreshSettings.get();

        //only schedule the job if the account is enabled in EHR
        if (settings.isEnabled(name)) {
            try {
                //create new job and put it in the jobs map
                if (_jobs.get(name) == null) {
                    _jobs.put(name, JobBuilder.newJob(AzureAccessTokenRefreshRunner.class)
                            .withIdentity(AzureAccessTokenRefreshScheduler.class.getCanonicalName() + "_" + name, AzureAccessTokenRefreshScheduler.class.getCanonicalName() + "_" + name)
                            .usingJobData("name", name)
                            .build());
                }

                //ensure refresh interval is valid
                if (settings.getRefreshInterval(name) == null || settings.getRefreshInterval(name) <= 0) {
                    _log.info("Azure access token refresh for '" + settings.getDisplayName(name) + "' has an invalid refresh interval (" + settings.getRefreshInterval(name) + "), will not schedule.");
                    return;
                }

                _frequencies.put(name, settings.getRefreshInterval(name));
                _enabled.put(name, settings.isEnabled(name));

                Trigger trigger = TriggerBuilder.newTrigger()
                        .withIdentity(AzureAccessTokenRefreshScheduler.class.getCanonicalName() + "_" + name, AzureAccessTokenRefreshScheduler.class.getCanonicalName() + "_" + name)
                        .withSchedule(DailyTimeIntervalScheduleBuilder.dailyTimeIntervalSchedule().withIntervalInMinutes(_frequencies.get(name)))
                        .forJob(_jobs.get(name))
                        .build();

                //actually schedule the job
                StdSchedulerFactory.getDefaultScheduler().scheduleJob(_jobs.get(name), trigger);

                _log.info("Azure access token refresh for '" + settings.getDisplayName(name) + "' is scheduled to run every " + settings.getRefreshInterval(name) + " minutes");
            } catch (Exception e) {
                _log.error("Error scheduling Azure access token refresh for '" + settings.getDisplayName(name) + "'", e);
            }
        }
    }

    /**
     * Unschedules the job provided by the name parameter. This method will do nothing if the given job does not exist
     *
     * @param name the name of the job to unschedule
     */
    public synchronized void unschedule(String name) {
        AzureAccessTokenRefreshSettings settings = AzureAccessTokenRefreshSettings.get();

        if (_jobs.get(name) != null) {
            try {
                StdSchedulerFactory.getDefaultScheduler().deleteJob(_jobs.get(name).getKey());
                _enabled.put(name, false);
                _log.info("Azure access token refresh for '" + settings.getDisplayName(name) + "'  unscheduled");
            } catch (Exception e) {
                _log.error("Error unscheduling Azure access token refresh for '" + settings.getDisplayName(name) + "'", e);
            }
        }
    }

    /**
     * Should be called when settings are changed so that the settings cache is consistent with whether or not the job is actually scheduled
     *
     * @param name the name of the job to check for settings changes on
     */
    public void onSettingsChange(String name) {
        AzureAccessTokenRefreshSettings settings = AzureAccessTokenRefreshSettings.get();

        if (!settings.isEnabled(name)) {
            if (_jobs.get(name) != null) {
                unschedule(name);
            }
        } else {
            if (_jobs.get(name) == null) {
                schedule(name);
            } else if (!_enabled.get(name) && settings.isEnabled(name)) {
                schedule(name);
            } else if (!_frequencies.get(name).equals(settings.getRefreshInterval(name))) {
                //if the frequency of the refresh has changed we need to unschedule the old job with the old refresh frequency first
                unschedule(name);
                schedule(name);
            }
        }
    }
}
