/*
 *
 *  * Copyright (c) 2026 Board of Regents of the University of Wisconsin System
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *     http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
 */

package org.labkey.cageui.dataentry;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.DbScope;
import org.labkey.api.data.PropertyManager;
import org.labkey.api.data.PropertyManager.WritablePropertyMap;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
//import org.labkey.api.ehr.EHRService;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.InvalidKeyException;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.QueryUpdateServiceException;
import org.labkey.api.query.UserSchema;
import org.labkey.api.query.ValidationException;
import org.labkey.api.security.User;
import org.labkey.api.util.JsonUtil;
import org.labkey.api.view.ActionURL;
import org.labkey.api.view.ViewContext;
import org.labkey.cageui.CageUIManager;
import org.labkey.cageui.CageUISchema;
import org.labkey.cageui.action.AllHistoryForm;
import org.labkey.cageui.action.CageHistoryForm;
import org.labkey.cageui.action.CageModificationHistoryForm;
import org.labkey.cageui.action.RackHistoryForm;
import org.labkey.cageui.action.RoomHistoryForm;
import org.quartz.CronScheduleBuilder;
import org.quartz.Job;
import org.quartz.JobBuilder;
import org.quartz.JobDetail;
import org.quartz.JobExecutionContext;
import org.quartz.Trigger;
import org.quartz.TriggerBuilder;
import org.quartz.impl.StdSchedulerFactory;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

public class CageUIRecordDeleteRunner implements Job
{
    public static final String PROPERTY_DOMAIN = "org.labkey.ehr.recorddeletion";
    public static final String ENABLED_PROP = "isEnabled";
    private static final Logger _log = LogManager.getLogger(CageUIRecordDeleteRunner.class);
    private static final int _hour = 23;
    private static final int _minute = 30;

    public CageUIRecordDeleteRunner()
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

    @Override
    public void execute(JobExecutionContext context)
    {
        User rootUser = CageUIManager.get().getEHRUser(ContainerManager.getRoot(), false);
        if (rootUser == null)
            return;

        run(ContainerManager.getRoot());
    }

    public void run(Container c)
    {
        if (!isEnabled(c))
            return;

        _log.info("Starting CageUI Record Delete Runner for folder: {}", c.getPath());

        User u = CageUIManager.get().getEHRUser(c);
        if (u == null)
            return;

        // Push a fake ViewContext onto the HttpView stack
        try (ViewContext.StackResetter ignored = ViewContext.pushMockViewContext(u, c, new ActionURL("cageui", "fake.view", c)))
        {

            List<Map<String, Object>> rowsToDelete = getIdsToDelete(u, c);
            deleteInProgressRecords(u, c, rowsToDelete);
        }
        catch (ValidationException e)
        {
            _log.error(e.getMessage(), e);
        }
    }

    private List<Map<String, Object>> getIdsToDelete(User u, Container c) {
        UserSchema schema = QueryService.get().getUserSchema(u, c, "cageui");
        TableInfo table = schema.getTable("all_history");
        SimpleFilter filter = new SimpleFilter();
        filter.addCondition(FieldKey.fromString("QCState"), 2, CompareType.EQUAL);
        TableSelector selector = new TableSelector(table, filter, null);

        ObjectMapper mapper = JsonUtil.createDefaultMapper();
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        TypeReference<ArrayList<AllHistoryForm>> typeRef = new TypeReference<ArrayList<AllHistoryForm>>() {};
        ArrayList<AllHistoryForm> forms = mapper.convertValue(selector.getMapArray(), typeRef);

        List<Map<String, Object>> historyIdKeys = forms.stream()
                .map(form -> {
                    Map<String, Object> rowMap = new HashMap<>();
                    rowMap.put("historyid", form.getHistoryId());
                    return rowMap;
                })
                .toList();

        return historyIdKeys;
    }

    private <T> List<Map<String, Object>> getRecordsToDelete(User u, Container c, Collection<String> historyIds, TableInfo ti, Class<T> formClass, Function<T, Object> rowIdExtractor){
        SimpleFilter filter = new SimpleFilter();
        filter.addCondition(FieldKey.fromString("historyid"), historyIds, CompareType.IN);
        TableSelector selector = new TableSelector(ti, filter, null);

        ObjectMapper mapper = JsonUtil.createDefaultMapper();
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

        TypeReference<ArrayList<T>> typeRef = new TypeReference<ArrayList<T>>() {};
        ArrayList<T> forms = mapper.convertValue(selector.getMapArray(), typeRef);

        List<Map<String, Object>> keys = forms.stream()
                .map(form -> {
                    Map<String, Object> rowMap = new HashMap<>();
                    rowMap.put("rowid", rowIdExtractor.apply(form));
                    return rowMap;
                })
                .toList();

        return keys;
    }




    private void deleteInProgressRecords(User u, Container c, List<Map<String, Object>> rowsToDelete) throws ValidationException
    {
        BatchValidationException batchErrors = new BatchValidationException();
        UserSchema schema = QueryService.get().getUserSchema(u, c, "cageui");

        TableInfo allHistoryTable = schema.getTable("all_history");
        TableInfo cageHistoryTable = schema.getTable("cage_history");
        TableInfo rackHistoryTable = schema.getTable("rack_history");
        TableInfo cageModificationsHistoryTable = schema.getTable("cage_modifications_history");
        TableInfo roomHistoryTable = schema.getTable("room_history");

        Collection<String> historyIdsToRemove = rowsToDelete.stream()
                .map(map -> (String) map.get("historyid"))
                .collect(Collectors.toCollection(ArrayList::new));

        List<Map<String, Object>> allHistoryRowIds = getRecordsToDelete(u, c, historyIdsToRemove, cageHistoryTable, AllHistoryForm.class, AllHistoryForm::getRowid);
        List<Map<String, Object>> cageHistoryRowIds = getRecordsToDelete(u, c, historyIdsToRemove, cageHistoryTable, CageHistoryForm.class, CageHistoryForm::getRowid);
        List<Map<String, Object>> rackHistoryRowIds = getRecordsToDelete(u, c, historyIdsToRemove, cageHistoryTable, RackHistoryForm.class, RackHistoryForm::getRowid);
        List<Map<String, Object>> cageModHistoryRowIds = getRecordsToDelete(u, c, historyIdsToRemove, cageHistoryTable, CageModificationHistoryForm.class, CageModificationHistoryForm::getRowid);
        List<Map<String, Object>> roomHistoryRowIds = getRecordsToDelete(u, c, historyIdsToRemove, cageHistoryTable, RoomHistoryForm.class, RoomHistoryForm::getRowid);

        QueryUpdateService allHistoryQus = allHistoryTable.getUpdateService();
        if (allHistoryQus == null)
        {
            throw new IllegalStateException(allHistoryTable.getName() + " query update service");
        }

        QueryUpdateService cageHistoryQus = cageHistoryTable.getUpdateService();
        if (cageHistoryQus == null)
        {
            throw new IllegalStateException(cageHistoryTable.getName() + " query update service");
        }

        QueryUpdateService rackHistoryQus = rackHistoryTable.getUpdateService();
        if (rackHistoryQus == null)
        {
            throw new IllegalStateException(rackHistoryTable.getName() + " query update service");
        }

        QueryUpdateService cageModHistoryQus = cageModificationsHistoryTable.getUpdateService();
        if (cageModHistoryQus == null)
        {
            throw new IllegalStateException(cageModificationsHistoryTable.getName() + " query update service");
        }

        QueryUpdateService roomHistoryQus = roomHistoryTable.getUpdateService();
        if (roomHistoryQus == null)
        {
            throw new IllegalStateException(roomHistoryTable.getName() + " query update service");
        }

        try (DbScope.Transaction tx = CageUISchema.getInstance().getSchema().getScope().ensureTransaction())
        {
            _log.info("deleting {} records from table: {} in container: {}", allHistoryRowIds.size(), allHistoryTable.getName(), allHistoryTable.getUserSchema().getContainer().getPath());
            allHistoryQus.deleteRows(u, c, allHistoryRowIds, null, null);

            _log.info("deleting {} records from table: {} in container: {}", cageHistoryRowIds.size(), cageHistoryTable.getName(), cageHistoryTable.getUserSchema().getContainer().getPath());
            cageHistoryQus.deleteRows(u, c, cageHistoryRowIds, null, null);

            _log.info("deleting {} records from table: {} in container: {}", cageModHistoryRowIds.size(), cageModificationsHistoryTable.getName(), cageModificationsHistoryTable.getUserSchema().getContainer().getPath());
            cageModHistoryQus.deleteRows(u, c, cageModHistoryRowIds, null, null);

            _log.info("deleting {} records from table: {} in container: {}", rackHistoryRowIds.size(), rackHistoryTable.getName(), rackHistoryTable.getUserSchema().getContainer().getPath());
            rackHistoryQus.deleteRows(u, c, rackHistoryRowIds, null, null);

            _log.info("deleting {} records from table: {} in container: {}", roomHistoryRowIds.size(), roomHistoryTable.getName(), roomHistoryTable.getUserSchema().getContainer().getPath());
            roomHistoryQus.deleteRows(u, c, roomHistoryRowIds, null, null);

            if (batchErrors.hasErrors())
            {
                _log.error(batchErrors.getMessage(), batchErrors);
            }
            tx.commit();
        }
        catch (QueryUpdateServiceException | BatchValidationException | RuntimeException |
               SQLException | InvalidKeyException e)
        {
            _log.error(e.getMessage(), e);
        }

    }

    public static synchronized void schedule()
    {
        try
        {
            JobDetail job = JobBuilder.newJob(CageUIRecordDeleteRunner.class)
                    .withIdentity(CageUIRecordDeleteRunner.class.getCanonicalName(), CageUIRecordDeleteRunner.class.getCanonicalName())
                    .usingJobData("cageUIDelete", CageUIRecordDeleteRunner.class.getName())
                    .build();

            Trigger trigger = TriggerBuilder.newTrigger()
                    .withIdentity(CageUIRecordDeleteRunner.class.getCanonicalName(), CageUIRecordDeleteRunner.class.getCanonicalName())
                    .withSchedule(CronScheduleBuilder.dailyAtHourAndMinute(_hour, _minute))
                    .forJob(job)
                    .build();

            StdSchedulerFactory.getDefaultScheduler().scheduleJob(job, trigger);

            _log.info("CageUI Record Delete runner scheduled to run at " + _hour + ":" + _minute + " each day");
        }
        catch (Exception e)
        {
            _log.error("Error scheduling CageUI Record Delete Runner", e);
        }
    }

    public static void setProperties(Container c, Boolean isEnabled)
    {
        WritablePropertyMap props = PropertyManager.getWritableProperties(c, PROPERTY_DOMAIN, true);
        props.put(ENABLED_PROP, isEnabled.toString());
        props.save();
    }
}
