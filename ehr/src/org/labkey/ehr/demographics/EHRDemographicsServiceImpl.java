/*
 * Copyright (c) 2012-2016 LabKey Corporation
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
package org.labkey.ehr.demographics;

import com.google.common.collect.MapDifference;
import com.google.common.collect.Maps;
import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.Logger;
import org.jetbrains.annotations.NotNull;
import org.labkey.api.cache.CacheManager;
import org.labkey.api.cache.StringKeyCache;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.ehr.EHRDemographicsService;
import org.labkey.api.ehr.EHRService;
import org.labkey.api.ehr.demographics.AnimalRecord;
import org.labkey.api.ehr.demographics.DemographicsProvider;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.module.ModuleProperty;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.User;
import org.labkey.api.security.permissions.AdminPermission;
import org.labkey.api.study.Study;
import org.labkey.api.util.CPUTimer;
import org.labkey.api.util.ConfigurationException;
import org.labkey.api.util.JobRunner;
import org.labkey.api.util.Pair;
import org.labkey.ehr.EHRManager;
import org.labkey.ehr.EHRModule;
import org.quartz.CronScheduleBuilder;
import org.quartz.Job;
import org.quartz.JobBuilder;
import org.quartz.JobDetail;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.quartz.SchedulerException;
import org.quartz.Trigger;
import org.quartz.TriggerBuilder;
import org.quartz.impl.StdSchedulerFactory;
import org.springframework.dao.DeadlockLoserDataAccessException;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;

/**
 * User: bimber
 * Date: 9/17/12
 * Time: 8:35 PM
 */
public class EHRDemographicsServiceImpl extends EHRDemographicsService
{
    private static final Logger _log = Logger.getLogger(EHRDemographicsServiceImpl.class);
    private static JobDetail _job = null;

    private StringKeyCache<AnimalRecordImpl> _cache;

//    private static class DemographicsCacheLoader implements CacheLoader<String, AnimalRecord>
//    {
//        @Override
//        public AnimalRecord load(String key, Object argument)
//        {
//            //expects: container, animalId
//            Pair<Container, String> pair = (Pair)argument;
//
//            _log.info("loading animal: " + pair.second);
//            List<AnimalRecord> ret = EHRDemographicsServiceImpl.get().createRecords(pair.first, Collections.singleton(pair.second));
//
//            return ret.isEmpty() ? null : ret.get(0);
//        }
//    }

    public EHRDemographicsServiceImpl()
    {
        // NOTE: we expect to recache all living animals each night.  the purpose of a 25HR window is to make sure the
        // existing record is present so we can validate.  any other incidental cached records would expire shortly after
        _cache = CacheManager.getStringKeyCache(50000, (CacheManager.DAY + CacheManager.HOUR), "EHRDemographicsServiceImpl");
    }

    public static EHRDemographicsServiceImpl get()
    {
        return (EHRDemographicsServiceImpl)EHRDemographicsService.get();
    }

    private String getCacheKey(Container c, String id)
    {
        assert c != null && c.getId() != null : "Attempting to cache a record without a container: " + id;
        return getCacheKeyPrefix(c) + id;
    }

    private String getCacheKeyPrefix(Container c)
    {
        return getClass().getName() + "||" + c.getId() + "||";
    }

    /**
     * Queries the cache for the animal record, creating if not found.
     * Always returns a copy of the original
     */
    public AnimalRecord getAnimal(Container c, String id)
    {
        List<AnimalRecord> ret = getAnimals(c, Collections.singletonList(id));

        return !ret.isEmpty() ? ret.get(0) : null;
    }

    /**
     * Queries the cache for the animal record, creating if not found.
     * Always returns a copy of the original
     */
    public List<AnimalRecord> getAnimals(Container c, Collection<String> ids)
    {
        return getAnimals(c, ids, false);
    }

    private List<AnimalRecord> getAnimals(Container c, Collection<String> ids, boolean validateOnCreate)
    {
        List<AnimalRecord> records = new ArrayList<>();
        Set<String> toCreate = new HashSet<>();
        for (String id : ids)
        {
            AnimalRecord ret = getRecordFromCache(c, id);
            if (ret != null)
            {
                records.add(ret.createCopy());
            }
            else
            {
                toCreate.add(id);
            }
        }

        if (!toCreate.isEmpty())
        {
            //always return copy of record
            for (AnimalRecord ret : createRecords(c, toCreate, validateOnCreate))
            {
                records.add(ret.createCopy());
            }
        }

        return records;
    }

    private synchronized void cacheRecord(AnimalRecordImpl record, boolean validateOnCreate)
    {
        String key = getCacheKey(record.getContainer(), record.getId());

        if (validateOnCreate)
        {
            AnimalRecord existing = _cache.get(key);
            if (existing != null)
            {
                if (existing.getProps().isEmpty() && !record.getProps().isEmpty())
                {
                    _log.error("mismatch for cached record for animal: " + record.getId() + ".  cached record has properties, but new record does not");
                }
                else if (!existing.getProps().isEmpty() && record.getProps().isEmpty())
                {
                    _log.error("mismatch for cached record for animal: " + record.getId() + ".  cached record has no properties, but new record does");
                }
                else if (existing.getProps().isEmpty() && record.getProps().isEmpty())
                {
                    //ignore
                }
                else
                {
                    Map<String, Object> props1 = new TreeMap<>();
                    Map<String, Object> props2 = new TreeMap<>();
                    for (DemographicsProvider p : EHRService.get().getDemographicsProviders(record.getContainer()))
                    {
                        for (String fk : p.getKeysToTest())
                        {
                            props1.put(fk, existing.getProps().get(fk));
                            props2.put(fk, record.getProps().get(fk));
                        }
                    }

                    MapDifference diff = Maps.difference(props1, props2);
                    if (!diff.areEqual())
                    {
                        _log.error("mismatch for cached record for animal: " + record.getId());
                        Map<String, MapDifference.ValueDifference> diffEntries = diff.entriesDiffering();
                        if (diffEntries.isEmpty())
                        {
                            _log.error("No differences found in the maps");
                        }

                        for (String prop : diffEntries.keySet())
                        {
                            _log.error("property: " + prop);
                            _log.error("original: ");
                            _log.error(diffEntries.get(prop).leftValue());
                            _log.error("new value: ");
                            _log.error(diffEntries.get(prop).rightValue());
                        }
                    }
                }
            }
        }

        _cache.put(key, record);
    }

    private void recacheRecords(Container c, List<String> ids)
    {
        for (String id : ids)
        {
            _cache.remove(getCacheKey(c, id));
        }

        asyncCache(c, ids);
    }

    public void reportDataChange(Container c, String schema, String query, List<String> ids)
    {
        reportDataChange(c, Collections.singletonList(Pair.of(schema, query)), ids, false);
    }

    public void reportDataChange(final Container c, final List<Pair<String, String>> changed, final List<String> ids, boolean async)
    {
        final User u = EHRService.get().getEHRUser(c);
        if (u == null)
        {
            _log.error("EHRUser not configured, cannot run demographics service");
            return;
        }

        if (async)
        {
            for (String id : ids)
            {
                _cache.remove(getCacheKey(c, id));
            }

            JobRunner.getDefault().execute(new Runnable(){
                public void run()
                {
                    doUpdateRecords(c, u, changed, ids);
                }
            });
        }
        else
        {
            doUpdateRecords(c, u, changed, ids);
        }
    }

    private void reportDataChangeForProvider(Container c, DemographicsProvider p, Collection<String> ids)
    {
        final User u = EHRService.get().getEHRUser(c);
        if (u == null)
        {
            _log.error("EHRUser not configured, cannot run demographics service");
            return;
        }

        updateForProvider(c, u, p, ids, false);
    }

    private void doUpdateRecords(Container c, User u, List<Pair<String, String>> changed, List<String> ids)
    {
        try
        {
            Set<DemographicsProvider> needsUpdate = new HashSet<>();
            Set<String> providerNames = new HashSet<>();
            for (DemographicsProvider p : EHRService.get().getDemographicsProviders(c))
            {
                for (Pair<String, String> pair : changed)
                {
                    if (p.requiresRecalc(pair.first, pair.second))
                    {
                        needsUpdate.add(p);
                        providerNames.add(p.getName());
                    }
                }
            }

            if (!needsUpdate.isEmpty())
            {
                _log.info("updating demographics providers: [" + StringUtils.join(providerNames, ";") + "] for " + ids.size() + " ids.  " + (ids.size() > 10 ? "" : "[" + StringUtils.join(ids, ",") + "]"));
            }

            for (DemographicsProvider p : needsUpdate)
            {
                updateForProvider(c, u, p, ids, true);
            }
        }
        catch (Exception e)
        {
            _log.error(e.getMessage(), e);
            recacheRecords(c, ids);
        }
    }

    private void updateForProvider(Container c, User u, DemographicsProvider p, Collection<String> ids, boolean doAfterUpdate)
    {
        CPUTimer timer = new CPUTimer(p.getName());
        timer.start();

        int start = 0;
        // Use a set to be sure there are no duplicates
        List<String> uniqueIds = new ArrayList<>(new HashSet<>(ids));
        while (start < uniqueIds.size())
        {
            List<String> sublist = uniqueIds.subList(start, Math.min(uniqueIds.size(), start + DemographicsProvider.MAXIMUM_BATCH_SIZE));
            start = start + DemographicsProvider.MAXIMUM_BATCH_SIZE;

            Map<String, Map<String, Object>> props = p.getProperties(c, u, sublist);
            Set<String> idsToUpdate = new TreeSet<>();

            Set<String> uncachedIds = new HashSet<>();

            for (String id : sublist)
            {
                synchronized (this)
                {
                    String key = getCacheKey(c, id);
                    AnimalRecordImpl ar = _cache.get(key);

                    //NOTE: we want to continue even if the map is NULL.  this is important to clear out the existing values.
                    if (doAfterUpdate)
                        idsToUpdate.addAll(p.getIdsToUpdate(c, id, ar == null ? null : ar.getProps(), props.get(id)));

                    if (ar != null)
                    {
                        // Only need to update the cache if the animal has a current record in the cache. Otherwise,
                        // it will be recalculated and recached lazily as needed
                        ar.update(p, props.get(id));   //perform update only after we determine which additional IDs should be recached
                        cacheRecord(ar, false);
                    }
                    else
                    {
                        uncachedIds.add(id);
                    }
                }
            }

            if (!uncachedIds.isEmpty())
            {
                _log.warn("Animal record not found in cache for: " + uncachedIds + ". Not a problem if these are newly inserted animals. Discovered during update of provider: " + p.getName());
            }

            idsToUpdate.removeAll(uniqueIds);
            if (!idsToUpdate.isEmpty())
            {
                _log.info("reporting change for " + idsToUpdate.size() + " additional ids after change in provider: " + p.getName() + (idsToUpdate.size() < 100 ? ".  " + StringUtils.join(idsToUpdate, ";") : ""));
                reportDataChangeForProvider(c, p, idsToUpdate);
            }
        }

        timer.stop();
        _log.info("updated demographics provider: " + p.getName() + " for " + ids.size() + " ids.  " + (ids.size() > 100 ? "" : "[" + StringUtils.join(ids, ",") + "]") + " took " + timer.getDuration());
    }

    // Create and cache IDs in the background
    private void asyncCache(final Container c, final List<String> ids)
    {
        _log.info("Perform async cache for " + ids.size() + " animals");

        JobRunner.getDefault().execute(new Runnable(){
            public void run()
            {
                try
                {
                    EHRDemographicsServiceImpl.get().createRecords(c, ids, false);
                }
                catch (DeadlockLoserDataAccessException e)
                {
                    _log.error("EHRDemographicsServiceImpl encountered a deadlock", e);
                }
            }
        });
    }

    /**
     * Queries the DB directly, bypassing the cache.  records are put in the cache on complete
     */
    private List<AnimalRecord> createRecords(Container c, Collection<String> ids, boolean validateOnCreate)
    {
        User u = EHRService.get().getEHRUser(c);
        if (u == null)
        {
            throw new ConfigurationException("EHRUser not set in the container: " + c.getPath());
        }

        Date startTime = new Date();
        Map<String, Map<String, Object>> ret = new HashMap<>();
        //NOTE: SQLServer can complain if requesting more than 2000 at a time, so break into smaller sets
        int start = 0;
        // Use a set to remove duplicates
        List<String> allIds = new ArrayList<>(new HashSet<>(ids));
        while (start < allIds.size())
        {
            List<String> sublist = allIds.subList(start, Math.min(allIds.size(), start + DemographicsProvider.MAXIMUM_BATCH_SIZE));
            _log.info("Creating demographics records for " + sublist.size() + " animals (" + start + " of " + allIds.size() + " already complete)");
            start = start + DemographicsProvider.MAXIMUM_BATCH_SIZE;

            for (DemographicsProvider p : EHRService.get().getDemographicsProviders(c))
            {
                Map<String, Map<String, Object>> props = p.getProperties(c, u, sublist);
                for (String id : props.keySet())
                {
                    Map<String, Object> perId = ret.get(id);
                    if (perId == null)
                        perId = new HashMap<>();

                    perId.putAll(props.get(id));

                    ret.put(id, perId);
                }
            }
        }

        // NOTE: the above fill only create an AnimalRecord for IDs that exist in the demographics table.
        // we also want to cache each attempt to find an ID.  requesting a non-existing ID still requires a query,
        // so make note of the fact it doesnt exist
        for (String id : allIds)
        {
            if (!ret.containsKey(id))
                ret.put(id, new HashMap<String, Object>());
        }

        List<AnimalRecord> records = new ArrayList<>();
        for (String id : ret.keySet())
        {
            Map<String, Object> props = ret.get(id);
            AnimalRecordImpl record = AnimalRecordImpl.create(c, id, props);
            cacheRecord(record, validateOnCreate);

            records.add(record);
        }

        double duration = ((new Date()).getTime() - startTime.getTime()) / 1000.0;
        if (duration > (2.0 * allIds.size()))
        {
            _log.warn("recached " + allIds.size() + " records in " + duration + " seconds");
        }
        return records;
    }

    public void cacheAnimals(Container c, User u, boolean validateOnCreate, boolean livingOnly)
    {
        TableInfo demographics = getDemographicsTableInfo(c, u);

        List<String> ids = new ArrayList<>();
        if (livingOnly)
        {
            TableSelector ts = new TableSelector(demographics, Collections.singleton("Id"), new SimpleFilter(FieldKey.fromString("calculated_status"), "Alive", CompareType.EQUAL), null);
            ids.addAll(ts.getArrayList(String.class));

            TableSelector ts2 = new TableSelector(demographics, Collections.singleton("Id"), new SimpleFilter(FieldKey.fromString("death"), "-30d", CompareType.DATE_GTE), null);
            List<String> recentlyDeadIds = ts2.getArrayList(String.class);
            ids.addAll(recentlyDeadIds);
        }
        else
        {
            TableSelector ts = new TableSelector(demographics, Collections.singleton("Id"), null, null);
            ids.addAll(ts.getArrayList(String.class));
        }

        if (!ids.isEmpty())
        {
            _log.info("Forcing recache of " + ids.size() + " animals");
            createRecords(c, ids, validateOnCreate);
            _log.info("Cache load complete");
        }
    }

    @NotNull
    private TableInfo getDemographicsTableInfo(Container c, User u)
    {
        UserSchema us = QueryService.get().getUserSchema(u, c, "study");
        if (us == null)
            throw new IllegalArgumentException("Unable to find study schema");

        TableInfo demographics = us.getTable("demographics");
        if (demographics == null)
            throw new IllegalArgumentException("Unable to find demographics table");
        return demographics;
    }

    /**
     * A helper to query the cache, which will create the record if not present
     */
    private AnimalRecordImpl getRecordFromCache(Container c, String animalId)
    {
        return _cache.get(getCacheKey(c, animalId));
    }

    private int cacheLivingAnimalsForAllContainers(boolean validateOnCreate)
    {
        //cache all living animals to be cached, if set
        ModuleProperty shouldCache = ModuleLoader.getInstance().getModule(EHRModule.class).getModuleProperties().get(EHRManager.EHRCacheDemographicsPropName);
        User rootUser = EHRManager.get().getEHRUser(ContainerManager.getRoot(), false);
        if (rootUser == null)
            return 0;

        int totalCached = 0;

        for (Study s : EHRManager.get().getEhrStudies(rootUser))
        {
            String value = shouldCache.getEffectiveValue(s.getContainer());
            if (value != null)
            {
                Boolean val = Boolean.parseBoolean(value);
                if (val)
                {
                    User u = EHRService.get().getEHRUser(s.getContainer());
                    if (u == null || !s.getContainer().hasPermission(u, AdminPermission.class))
                    {
                        continue;
                    }

                    _log.info("Recaching EHR demographics for all living animals in " + s.getContainer().getPath());

                    EHRDemographicsServiceImpl.get().cacheAnimals(s.getContainer(), u, validateOnCreate, true);
                    totalCached++;
                }
            }
        }

        return totalCached;
    }

    public void onStartup()
    {
        int totalCached = cacheLivingAnimalsForAllContainers(false);
        if (totalCached > 0)
        {
            try
            {
                if (_job == null)
                {
                    _job = JobBuilder.newJob(DemographicServiceRefreshRunner.class)
                            .withIdentity(EHRDemographicsServiceImpl.class.getCanonicalName(), EHRDemographicsServiceImpl.class.getCanonicalName())
                            .usingJobData("demographicsService", EHRDemographicsServiceImpl.class.getName())
                            .build();
                }

                Trigger trigger = TriggerBuilder.newTrigger()
                        .withIdentity(EHRDemographicsServiceImpl.class.getCanonicalName(), EHRDemographicsServiceImpl.class.getCanonicalName())
                        .withSchedule(CronScheduleBuilder.dailyAtHourAndMinute(0, 15))
                        .forJob(_job)
                        .build();

                StdSchedulerFactory.getDefaultScheduler().scheduleJob(_job, trigger);

                _log.info("EHRDemographicsServiceImpl scheduled a refresh daily at 12:15");
            }
            catch (SchedulerException e)
            {
                _log.error("Unable to schedule EHRDemographicsServiceImpl", e);
            }
        }
    }

    public static class DemographicServiceRefreshRunner implements Job
    {
        public DemographicServiceRefreshRunner()
        {

        }

        public void execute(JobExecutionContext context) throws JobExecutionException
        {
            EHRDemographicsServiceImpl.get().cacheLivingAnimalsForAllContainers(true);
        }
    }
}
