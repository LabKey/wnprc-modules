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
package org.labkey.ehr.dataentry;

import org.apache.log4j.Logger;
import org.labkey.api.collections.CaseInsensitiveHashMap;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.PropertyManager;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.ehr.EHRService;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.InvalidKeyException;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.QueryUpdateServiceException;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.User;
import org.labkey.api.study.Dataset;
import org.labkey.api.study.Study;
import org.labkey.api.study.StudyService;
import org.labkey.api.util.PageFlowUtil;
import org.labkey.api.view.ActionURL;
import org.labkey.api.view.ViewContext;
import org.labkey.ehr.EHRManager;
import org.quartz.CronScheduleBuilder;
import org.quartz.Job;
import org.quartz.JobBuilder;
import org.quartz.JobDetail;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.quartz.Trigger;
import org.quartz.TriggerBuilder;
import org.quartz.impl.StdSchedulerFactory;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * User: bimber
 * Date: 11/13/13
 * Time: 11:13 AM
 */
public class RecordDeleteRunner implements Job
{
    public static final String PROPERTY_DOMAIN = "org.labkey.ehr.recorddeletion";
    public static final String ENABLED_PROP = "isEnabled";
    private static final Logger _log = Logger.getLogger(RecordDeleteRunner.class);
    private static final int _hour = 23;
    private static final int _minute = 30;

    public RecordDeleteRunner()
    {

    }

    public static boolean isEnabled(Container c)
    {
        Map<String, String> props = PropertyManager.getProperties(c, PROPERTY_DOMAIN);
        if (props.containsKey(ENABLED_PROP))
        {
            return Boolean.parseBoolean(props.get(ENABLED_PROP));
        }

        return false;
    }

    public void execute(JobExecutionContext context) throws JobExecutionException
    {
        User rootUser = EHRManager.get().getEHRUser(ContainerManager.getRoot(), false);
        if (rootUser == null)
            return;

        for (Study s : EHRManager.get().getEhrStudies(rootUser))
        {
            run(s.getContainer());
        }
    }

    public void run(Container c)
    {
        if (!isEnabled(c))
            return;

        _log.info("Starting EHR Record Delete Runner for folder: " + c.getPath());

        User u = EHRService.get().getEHRUser(c);
        if (u == null)
            return;

        UserSchema schema = QueryService.get().getUserSchema(u, c, "study");
        Study s = StudyService.get().getStudy(c);

        // Push a fake ViewContext onto the HttpView stack
        try (ViewContext.StackResetter ignored = ViewContext.pushMockViewContext(u, c, new ActionURL("ehr", "fake.view", c)))
        {
            for (Dataset ds : s.getDatasets())
            {
                TableInfo ti = schema.getTable(ds.getName());  //use UserSchema so we can delete using UpdateService
                deleteRecordsFromTable(ti, "lsid");
            }

            //NOTE: consider letting modules register extra tables to delete
            UserSchema ehrSchema = QueryService.get().getUserSchema(u, c, "ehr");
            if (ehrSchema != null)
            {
                deleteRecordsFromTable(ehrSchema.getTable("tasks"), "taskid");
                deleteRecordsFromTable(ehrSchema.getTable("requests"), "requestid");
            }
        }
    }

    private void deleteRecordsFromTable(TableInfo ti, String pkField)
    {
        try
        {
            SimpleFilter filter = new SimpleFilter(FieldKey.fromString("qcstate/label"), PageFlowUtil.set(EHRService.QCSTATES.DeleteRequested.getLabel(), EHRService.QCSTATES.RequestCancelled.getLabel(), EHRService.QCSTATES.RequestDenied.getLabel()), CompareType.IN);
            TableSelector ts = new TableSelector(ti, Collections.singleton(pkField), filter, null);
            String[] pks = ts.getArray(String.class);
            if (pks.length > 0)
            {
                List<Map<String, Object>> keys = new ArrayList<>();
                for (String pk : pks)
                {
                    Map<String, Object> row = new CaseInsensitiveHashMap<>();
                    row.put(pkField, pk);
                    keys.add(row);
                }

                _log.info("deleting " + keys.size() + " records from table: " + ti.getName() + " in container: " + ti.getUserSchema().getContainer().getPath());
                ti.getUpdateService().deleteRows(ti.getUserSchema().getUser(), ti.getUserSchema().getContainer(), keys, null, new HashMap<String, Object>());
            }
        }
        catch (BatchValidationException | InvalidKeyException | QueryUpdateServiceException | SQLException e)
        {
            _log.error(e.getMessage(), e);
        }
    }

    public static synchronized void schedule()
    {
        try
        {
            JobDetail job = JobBuilder.newJob(RecordDeleteRunner.class)
                    .withIdentity(RecordDeleteRunner.class.getCanonicalName(), RecordDeleteRunner.class.getCanonicalName())
                    .usingJobData("ehrDelete", RecordDeleteRunner.class.getName())
                    .build();

            Trigger trigger = TriggerBuilder.newTrigger()
                    .withIdentity(RecordDeleteRunner.class.getCanonicalName(), RecordDeleteRunner.class.getCanonicalName())
                    .withSchedule(CronScheduleBuilder.dailyAtHourAndMinute(_hour, _minute))
                    .forJob(job)
                    .build();

            StdSchedulerFactory.getDefaultScheduler().scheduleJob(job, trigger);

            _log.info("EHR Record Delete runner scheduled to run at " + _hour + ":" + _minute + " each day");
        }
        catch (Exception e)
        {
            _log.error("Error scheduling EHR Record Delete Runner", e);
        }
    }

    public static void setProperties(Container c, Boolean isEnabled)
    {
        PropertyManager.PropertyMap props = PropertyManager.getWritableProperties(c, PROPERTY_DOMAIN, true);
        props.put(ENABLED_PROP, isEnabled.toString());
        props.save();
    }
}

