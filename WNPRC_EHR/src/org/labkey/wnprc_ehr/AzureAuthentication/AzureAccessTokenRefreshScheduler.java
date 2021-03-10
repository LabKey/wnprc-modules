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

    public synchronized void schedule(String name) {
        AzureAccessTokenRefreshSettings settings = AzureAccessTokenRefreshSettings.get();

        if (settings.isEnabled(name)) {
            try {
                if (_jobs.get(name) == null) {
                    _jobs.put(name, JobBuilder.newJob(AzureAccessTokenRefreshRunner.class)
                            .withIdentity(AzureAccessTokenRefreshScheduler.class.getCanonicalName() + "_" + name, AzureAccessTokenRefreshScheduler.class.getCanonicalName() + "_" + name)
                            .usingJobData("name", name)
                            .build());
                }

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

                StdSchedulerFactory.getDefaultScheduler().scheduleJob(_jobs.get(name), trigger);

                _log.info("Azure access token refresh for '" + settings.getDisplayName(name) + "' is scheduled to run every " + settings.getRefreshInterval(name) + " minutes");
            } catch (Exception e) {
                _log.error("Error scheduling Azure access token refresh for '" + settings.getDisplayName(name) + "'", e);
            }
        }
    }

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
                unschedule(name);
                schedule(name);
            }
        }
    }
}
