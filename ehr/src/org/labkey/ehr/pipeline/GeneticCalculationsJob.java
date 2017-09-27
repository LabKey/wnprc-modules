/*
 * Copyright (c) 2013-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.labkey.ehr.pipeline;

import org.apache.log4j.Logger;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.PropertyManager;
import org.labkey.api.ehr.EHRService;
import org.labkey.api.pipeline.PipelineJobException;
import org.labkey.api.security.User;
import org.quartz.CronScheduleBuilder;
import org.quartz.DailyTimeIntervalScheduleBuilder;
import org.quartz.Job;
import org.quartz.JobBuilder;
import org.quartz.JobDetail;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.quartz.SchedulerException;
import org.quartz.TimeOfDay;
import org.quartz.Trigger;
import org.quartz.TriggerBuilder;
import org.quartz.TriggerKey;
import org.quartz.impl.StdSchedulerFactory;
import org.springframework.scheduling.SchedulingException;

import java.util.HashMap;
import java.util.Map;

/**
 * User: bimber
 * Date: 4/25/13
 * Time: 5:56 PM
 */
public class GeneticCalculationsJob implements Job
{
    public final static String GENETICCALCULATIONS_PROPERTY_DOMAIN = "org.labkey.ehr.geneticcalculations";
    private static final Logger _log = Logger.getLogger(GeneticCalculationsJob.class);
    private static TriggerKey _jobKey = null;

    public GeneticCalculationsJob()
    {

    }

    public static void unschedule()
    {
        if (_jobKey != null)
        {
            try
            {
                _log.info("Unscheduling GeneticCalculationsJob");
                StdSchedulerFactory.getDefaultScheduler().unscheduleJob(_jobKey);
                _jobKey = null;
            }
            catch (SchedulerException e)
            {
                _log.error("Error unscheduling GeneticCalculationsJob", e);
            }
        }
    }

    public static void schedule()
    {
        //already schduled
        if (_jobKey != null)
            return;

        if (!isEnabled())
            return;

        Container c = getContainer();
        if (c == null)
            return;

        Integer hour = getHourOfDay();
        if (hour == null)
            hour = 2;

        JobDetail job = JobBuilder.newJob(GeneticCalculationsJob.class)
                .withIdentity(GeneticCalculationsJob.class.getCanonicalName())
                .build();

        Trigger trigger = TriggerBuilder.newTrigger()
                .withIdentity(GeneticCalculationsJob.class.getCanonicalName())
                .withSchedule(CronScheduleBuilder.dailyAtHourAndMinute(hour, 0))
                .forJob(job)
                .build();

        try
        {
            _log.info("Scheduling GeneticCalculationsJob to run at " + hour + ":00");
            StdSchedulerFactory.getDefaultScheduler().scheduleJob(job, trigger);
            _jobKey = trigger.getKey();
        }
        catch (SchedulerException e)
        {
            _log.error("Error scheduling GeneticCalculationsJob", e);
        }
    }

    public static boolean isScheduled()
    {
        return _jobKey != null;
    }

    public static boolean isEnabled()
    {
        Map<String, String> saved = PropertyManager.getProperties(GENETICCALCULATIONS_PROPERTY_DOMAIN);

        if (saved.containsKey("enabled"))
            return Boolean.parseBoolean(saved.get("enabled"));
        else
            return false;
    }

    public static Container getContainer()
    {
        Map<String, String> saved = PropertyManager.getProperties(GENETICCALCULATIONS_PROPERTY_DOMAIN);

        if (saved.containsKey("container"))
            return ContainerManager.getForId(saved.get("container"));

        return null;
    }

    public static Integer getHourOfDay()
    {
        Map<String, String> saved = PropertyManager.getProperties(GENETICCALCULATIONS_PROPERTY_DOMAIN);

        if (saved.containsKey("hourOfDay"))
            return Integer.parseInt(saved.get("hourOfDay"));

        return null;
    }

    public static void setProperties(Boolean isEnabled, Container c, Integer hourOfDay)
    {
        PropertyManager.PropertyMap props = PropertyManager.getWritableProperties(GENETICCALCULATIONS_PROPERTY_DOMAIN, true);
        props.put("enabled", isEnabled.toString());
        props.put("container", c.getId());
        props.put("hourOfDay", hourOfDay.toString());
        props.save();

        //unschedule in case settings have changed
        unschedule();

        if (isEnabled)
        {
            schedule();
        }
    }

    public void execute(JobExecutionContext context) throws JobExecutionException
    {
        Container c = getContainer();
        if (c == null)
        {
            _log.error("Unable to execute GeneticsCalculationTask, no container defined");
        }

        try
        {
            _log.info("Running Scheduled Genetic Calculations Job");
            new GeneticCalculationsRunnable().run(c, false);
        }
        catch (PipelineJobException e)
        {
            throw new JobExecutionException(e);
        }
    }
}
