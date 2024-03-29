package org.labkey.wnprc_virology;

import org.apache.commons.lang3.StringUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.json.JSONArray;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.ehr.EHRService;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.DuplicateKeyException;
import org.labkey.api.query.InvalidKeyException;
import org.labkey.api.query.QueryUpdateServiceException;
import org.labkey.api.security.SecurityManager;
import org.labkey.api.security.User;
import org.labkey.api.security.permissions.AdminPermission;
import org.labkey.api.util.JsonUtil;
import org.labkey.dbutils.api.SimpleQueryFactory;
import org.labkey.dbutils.api.SimpleQueryUpdater;
import org.labkey.wnprc_virology.security.permissions.WNPRCViralLoadReadPermission;
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

    public static String GROUP_ID = "wnprc_virology";
    public static String JOB_ID = "vl_rsehr_job";

    public static Module virologyModule = ModuleLoader.getInstance().getModule(WNPRC_VirologyModule.NAME);


    public Map<String,Object> getEmailListAndFolderInfo(Container container)
    {
        List<User> adminUsers = SecurityManager.getUsersWithPermissions(container, Collections.singleton(AdminPermission.class));
        List<User> immutableContainerVLReaders = SecurityManager.getUsersWithPermissions(container, Collections.singleton(WNPRCViralLoadReadPermission.class));
        ArrayList<User> mutableContainerVLReaders = new ArrayList<>();

        for (User vlReader: immutableContainerVLReaders) {
            mutableContainerVLReaders.add(vlReader);
        }
        for (User adminUser: adminUsers){
            mutableContainerVLReaders.remove(adminUser);
        }
        Map<String, Object> mpVL = new HashMap<>();
        List<String> emailsVLReaders = new ArrayList<>();
        for (User u : mutableContainerVLReaders){
            emailsVLReaders.add(u.getEmail());
        }
        mpVL.put("emails", StringUtils.join(emailsVLReaders,";"));
        mpVL.put("folder_path", container.getPath());
        mpVL.put("folder_container_id", container.getEntityId());
        mpVL.put("folder_name", container.getName());
        return mpVL;
    }

    @Override
    public void execute(JobExecutionContext jobExecutionContext)
    {
        _log.info("Starting Viral Load RSEHR Job");

        try
        {
            //update the settings map in case settings have changed since startup.
            virologyModule = ModuleLoader.getInstance().getModule(WNPRC_VirologyModule.NAME);
            boolean populatedSuccessfully = populateFolderPermissionsTable();
            if (populatedSuccessfully)
            {
                _log.info("Viral Load RSEHR Job Complete");
            }
            else
            {
                _log.warn("Viral Load RSEHR Job did not complete successfully");
            }
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


    }

    public boolean populateFolderPermissionsTable() throws QueryUpdateServiceException, SQLException, BatchValidationException, DuplicateKeyException, InvalidKeyException
    {
        List<Map<String, Object>> rowsToInsert = new ArrayList<>();
        String containerPath = virologyModule.getModuleProperties().get(WNPRC_VirologyModule.RSEHR_PARENT_FOLDER_STRING_PROP).getEffectiveValue(ContainerManager.getRoot());
        if (containerPath == null)
            containerPath = virologyModule.getModuleProperties().get(WNPRC_VirologyModule.RSEHR_PARENT_FOLDER_STRING_PROP).getDefaultValue();
        if (containerPath == null)
        {
            _log.info("No container path found for RSEHR Viral Load Parent Folder. Configure it in the module settings.");
            return false;
        }
        Container viralLoadContainer = ContainerManager.getForPath(containerPath);
        if (viralLoadContainer == null)
        {
            _log.info("No container found for RSEHR Viral Load Parent Folder. Set up the container to run this job.");
            return false;
        }

        try
        {
            for (Container child : viralLoadContainer.getChildren())
            {
                Map<String, Object> mp = getEmailListAndFolderInfo(child);
                rowsToInsert.add(mp);
            }
            User user = EHRService.get().getEHRUser(viralLoadContainer);
            SimpleQueryUpdater qu = new SimpleQueryUpdater(user, viralLoadContainer, "wnprc_virology", "folder_paths_with_readers");
            SimpleQueryFactory sf = new SimpleQueryFactory(user,viralLoadContainer);
            JSONArray rowsToDelete = sf.selectRows("wnprc_virology", "folder_paths_with_readers");
            if (rowsToDelete.length() > 0)
                qu.delete(JsonUtil.toMapList(rowsToDelete));
            if (rowsToInsert.size() > 0)
                qu.insert(rowsToInsert);

        }
        catch (Exception e)
        {
            _log.error("Viral Load RSEHR Job ERROR");
            e.printStackTrace();
            return false;
        }
        return true;
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
        String containerPath = virologyModule.getModuleProperties().get(WNPRC_VirologyModule.RSEHR_PARENT_FOLDER_STRING_PROP).getEffectiveValue(ContainerManager.getRoot());
        if (containerPath == null)
            containerPath = virologyModule.getModuleProperties().get(WNPRC_VirologyModule.RSEHR_PARENT_FOLDER_STRING_PROP).getDefaultValue();
        if (containerPath == null)
        {
            _log.info("No container path found for RSEHR Viral Load Parent Folder. Configure it in the module properties.");
            return null;
        }
        Container viralLoadContainer = ContainerManager.getForPath(containerPath);
        Trigger trigger = newTrigger()
                .withIdentity(getTriggerKey())
                .startNow()
                .withSchedule(
                        simpleSchedule()
                                .withIntervalInMinutes(Integer.parseInt(virologyModule.getModuleProperties().get(WNPRC_VirologyModule.RSEHR_JOB_INTERVAL_PROP).getEffectiveValue(viralLoadContainer)))
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

            sched.unscheduleJob(getTriggerKey());
        }
        catch (SchedulerException e) {
            throw new RuntimeException(e);
        }

        _log.info("Unscheduled the Viral Load RSEHR job.");
    }
}
