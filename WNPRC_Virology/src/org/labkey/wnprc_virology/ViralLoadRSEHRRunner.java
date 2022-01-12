package org.labkey.wnprc_virology;

import org.apache.commons.lang3.StringUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.json.JSONArray;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.ehr.EHRService;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.DuplicateKeyException;
import org.labkey.api.query.InvalidKeyException;
import org.labkey.api.query.QueryUpdateServiceException;
import org.labkey.api.security.SecurityManager;
import org.labkey.api.security.User;
import org.labkey.api.security.permissions.AdminPermission;
import org.labkey.dbutils.api.SimpleQueryFactory;
import org.labkey.dbutils.api.SimpleQueryUpdater;
import org.labkey.wnprc_ehr.security.permissions.WNPRCViralLoadReadPermission;
import org.quartz.Job;
import org.quartz.JobDetail;
import org.quartz.JobExecutionContext;
import org.quartz.JobKey;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.quartz.Trigger;
import org.quartz.TriggerKey;
import org.quartz.impl.StdSchedulerFactory;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.quartz.JobBuilder.newJob;
import static org.quartz.JobKey.jobKey;
import static org.quartz.SimpleScheduleBuilder.simpleSchedule;
import static org.quartz.TriggerBuilder.newTrigger;
import static org.quartz.TriggerKey.triggerKey;

public class ViralLoadRSEHRRunner implements Job {
    private static Logger _log = LogManager.getLogger(ViralLoadRSEHRRunner.class);

    public static String GROUP_ID = "wnprc";
    public static String JOB_ID = "vl_rsehr_job";
    public static String TRIGGER_ID = "bc_report_trigger";
    //Parent path for where the VL Data is being ETL'd into from main EHR
    //TODO store this into a property
    public static String VIROLOGY_RSEHR_PATH = "/WNPRC/WNPRC_Units/Research_Services/Virology_Services/VL_DB/Private/";


    public Map<String,Object> getEmailList(Container container)
    {
        List<User> adminUsers = SecurityManager.getUsersWithPermissions(container, Collections.singleton(AdminPermission.class));
        List<User> containerVLReaders = SecurityManager.getUsersWithPermissions(container, Collections.singleton(WNPRCViralLoadReadPermission.class));
        for (User adminUser: adminUsers){
            containerVLReaders.remove(adminUser);
        }
        Map<String, Object> mpVL = new HashMap<>();
        List<String> emailsVLReaders = new ArrayList<>();
        for (User u : containerVLReaders){
            emailsVLReaders.add(u.getEmail());
        }
        mpVL.put("emails", StringUtils.join(emailsVLReaders,";"));
        mpVL.put("folder_path", container.getPath());
        mpVL.put("folder_container_id", container.getEntityId());
        return mpVL;
    }

    @Override
    public void execute(JobExecutionContext jobExecutionContext)
    {
        _log.info("Starting Viral Load RSEHR Job");

        try
        {
            populateFolderPermissionsTable();
        }
        catch (QueryUpdateServiceException e)
        {
            e.printStackTrace();
        }
        catch (SQLException e)
        {
            e.printStackTrace();
        }
        catch (BatchValidationException e)
        {
            e.printStackTrace();
        }
        catch (DuplicateKeyException e)
        {
            e.printStackTrace();
        }
        catch (InvalidKeyException e)
        {
            e.printStackTrace();
        }

        _log.info("Viral Load RSEHR Job Complete");

    }

    public void populateFolderPermissionsTable() throws QueryUpdateServiceException, SQLException, BatchValidationException, DuplicateKeyException, InvalidKeyException
    {
        List<Map<String, Object>> rowsToInsert = new ArrayList<>();
        Container container = ContainerManager.getForPath(VIROLOGY_RSEHR_PATH);
        for (Container child : container.getChildren())
        {
            Map<String, Object> mp = getEmailList(child);
            rowsToInsert.add(mp);
        }
        User user = EHRService.get().getEHRUser(container);
        SimpleQueryUpdater qu = new SimpleQueryUpdater(user, container, "wnprc_virology", "folder_paths_with_readers");
        SimpleQueryFactory sf = new SimpleQueryFactory(user,container);
        JSONArray rowsToDelete = sf.selectRows("wnprc_virology", "folder_paths_with_readers");
        if (rowsToDelete.length() > 0)
            qu.delete(rowsToDelete.toMapList());
        if (rowsToInsert.size() > 0)
            qu.insert(rowsToInsert);
    }

    public static JobKey getJobKey() {
        return jobKey(JOB_ID, GROUP_ID);
    }

    public static TriggerKey getTriggerKey() {
        return triggerKey(JOB_ID, GROUP_ID);
    }

    public static JobDetail getJobDetail() {
        JobDetail job = newJob(ViralLoadRSEHRRunner.class)
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
                                .withIntervalInMinutes(5)
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
                _log.warn("Scheduler is not running, so the Viral Load upload will not occur.");
            }

            sched.scheduleJob(getJobDetail(), getTrigger());
        }
        catch (SchedulerException e) {
            throw new RuntimeException(e);
        }

        _log.info("Scheduled the Viral Load RSEHR job to run.");
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

        _log.info("Unscheduled the Viral Load RSEHR job.");
    }
}
