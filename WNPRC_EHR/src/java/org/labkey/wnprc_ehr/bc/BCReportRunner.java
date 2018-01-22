package org.labkey.wnprc_ehr.bc;

import org.apache.log4j.Logger;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.ehr.EHRService;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.security.User;
import org.labkey.wnprc_ehr.WNPRC_EHRModule;
import org.quartz.Job;
import org.quartz.JobDetail;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.quartz.JobKey;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.quartz.Trigger;
import org.quartz.TriggerKey;
import org.quartz.impl.StdSchedulerFactory;

import java.util.HashSet;
import java.util.Set;

import static org.quartz.JobBuilder.newJob;
import static org.quartz.SimpleScheduleBuilder.simpleSchedule;
import static org.quartz.TriggerBuilder.newTrigger;

import static org.quartz.JobKey.*;
import static org.quartz.TriggerKey.*;

/**
 * Created by jon on 1/19/17.
 */
public class BCReportRunner implements Job {
    private static Logger _log = Logger.getLogger(BCReportRunner.class);

    public static String GROUP_ID = "wnprc";
    public static String JOB_ID = "bc_report_job";
    public static String TRIGGER_ID = "bc_report_trigger";

    @Override
    public void execute(JobExecutionContext jobExecutionContext) throws JobExecutionException {
        _log.info("Starting Job");

        WNPRC_EHRModule module = (WNPRC_EHRModule) ModuleLoader.getInstance().getModule(WNPRC_EHRModule.class);
        Set<Container> studyContainers = module.getWNPRCStudyContainers();

        for (Container studyContainer : studyContainers) {
            User user = EHRService.get().getEHRUser(studyContainer);
            _log.info(String.format("Running BCReports for container %s as user %s", studyContainer.getPath(), user));
            BCReportManager bcReportManager = new BCReportManager(user, studyContainer);
            bcReportManager.uploadReports();
        }
    }

    public static JobKey getJobKey() {
        return jobKey(JOB_ID, GROUP_ID);
    }

    public static TriggerKey getTriggerKey() {
        return triggerKey(JOB_ID, GROUP_ID);
    }

    public static JobDetail getJobDetail() {
        JobDetail job = newJob(BCReportRunner.class)
                .withIdentity(getJobKey())
                .build();

        return job;
    }

    public static Trigger getTrigger() {
        Trigger trigger = newTrigger()
                .withIdentity(getTriggerKey())
                .startNow()
                .withSchedule(
                        simpleSchedule()
                                .withIntervalInHours(4)
                                .repeatForever()
                )
                .build();

        return trigger;
    }

    public static void schedule() {
        Scheduler sched;

        try {
            sched = StdSchedulerFactory.getDefaultScheduler();
            if (!sched.isStarted()) {
                _log.warn("Scheduler is not running, so the BC upload will not occur.");
            }

            sched.scheduleJob(getJobDetail(), getTrigger());
        }
        catch (SchedulerException e) {
            throw new RuntimeException(e);
        }

        _log.info("Scheduled the BCReport to run.");
    }

    public static void unschedule() {
        Scheduler sched;

        try {
            sched = StdSchedulerFactory.getDefaultScheduler();

            sched.deleteJob(getJobKey());
            //sched.unscheduleJob(getTriggerKey());
        }
        catch (SchedulerException e) {
            throw new RuntimeException(e);
        }

        _log.info("Unscheduled the BCReport.");
    }
}
