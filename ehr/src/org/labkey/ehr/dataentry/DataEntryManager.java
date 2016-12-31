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
import org.labkey.api.cache.CacheManager;
import org.labkey.api.cache.StringKeyCache;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.TableInfo;
import org.labkey.api.ehr.dataentry.DataEntryForm;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.DataEntryFormFactory;
import org.labkey.api.ehr.dataentry.SingleQueryFormProvider;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.User;
import org.labkey.api.study.Dataset;
import org.labkey.api.study.DatasetTable;
import org.labkey.api.study.Study;
import org.labkey.api.study.StudyService;
import org.labkey.ehr.EHRManager;
import org.labkey.ehr.EHRModule;
import org.labkey.ehr.security.EHRSecurityManager;
import org.labkey.ehr.utils.TriggerScriptHelper;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * User: bimber
 * Date: 4/27/13
 * Time: 8:24 AM
 */
public class DataEntryManager
{
    private static final DataEntryManager _instance = new DataEntryManager();
    private static final Logger _log = Logger.getLogger(DataEntryManager.class);
    private List<DataEntryFormFactory> _forms = new ArrayList<>();
    private Map<String, List<FieldKey>> _defaultFieldKeys = new HashMap<>();
    private List<SingleQueryFormProvider> _queryProviders =  new ArrayList<>();
    private final StringKeyCache<Object> _cache;

    private DataEntryManager()
    {
        _cache = CacheManager.getStringKeyCache(1000, CacheManager.UNLIMITED, "EHRDataEntryManagerCache");
    }

    public static DataEntryManager get()
    {
        return _instance;
    }

    public StringKeyCache getCache()
    {
        return _cache;
    }

    public void registerFormType(DataEntryFormFactory fact)
    {
        _forms.add(fact);
    }

    //designed to produce a non-redunant list of forms that are active in the provided container
    private Map<String, DataEntryForm> getFormMap(Container c, User u)
    {
        DataEntryFormContext ctx = new DataEntryFormContextImpl(c, u);
        Map<String, DataEntryForm> map = new HashMap<>();
        for (DataEntryFormFactory fact : _forms)
        {
            DataEntryForm f = fact.createForm(ctx);
            if (f.isAvailable())
                map.put(f.getName(), f);
        }

        return map;
    }

    public Collection<DataEntryForm> getForms(Container c, User u)
    {
        return getFormMap(c, u).values();
    }

    public DataEntryForm getFormByName(String name, Container c, User u)
    {
        return getFormMap(c, u).get(name);
    }

    public DataEntryForm getFormForQuery(String schemaName, String queryName, Container c, User u)
    {
        UserSchema us = QueryService.get().getUserSchema(u, c, schemaName);
        if (us == null)
            throw new IllegalArgumentException("Unable to find schema: " + schemaName);

        TableInfo ti = us.getTable(queryName);
        if (ti == null)
            throw new IllegalArgumentException("Unable to find table: " + schemaName + "." + queryName);

        DataEntryFormContext ctx = new DataEntryFormContextImpl(c, u);

        //allow modules to override specific tables
        for (SingleQueryFormProvider p : _queryProviders)
        {
            if (p.isAvailable(c, ti))
            {
                return SingleQueryForm.create(ctx, ModuleLoader.getInstance().getModule(EHRModule.class), ti, p.getSection());
            }
        }

        return SingleQueryForm.create(ctx, ModuleLoader.getInstance().getModule(EHRModule.class), ti);
    }

    public void registerDefaultFieldKeys(String schemaName, String queryName, List<FieldKey> keys)
    {
        _defaultFieldKeys.put(getTableKey(schemaName, queryName), keys);
    }

    public List<FieldKey> getDefaultFieldKeys(TableInfo ti)
    {
        String tableKey = getTableKey(ti.getPublicSchemaName(), ti.getPublicName());
        if (_defaultFieldKeys.containsKey(tableKey))
            return _defaultFieldKeys.get(tableKey);


        return inferDefaultFieldKeys(ti);
    }

    private List<FieldKey> inferDefaultFieldKeys(TableInfo ti)
    {
        List<FieldKey> fks = new ArrayList<>();
        for (ColumnInfo ci : ti.getColumns())
        {
            if (ci.isShownInInsertView() && !ci.isCalculated())
            {
                fks.add(ci.getFieldKey());
            }
            else if (ci.isKeyField() || ci.getName().equalsIgnoreCase("formsort") || ci.getName().equalsIgnoreCase("objectid") || ci.getName().equalsIgnoreCase("runid") || ci.getName().equalsIgnoreCase("parentid") || ci.getName().equalsIgnoreCase("taskid") || ci.getName().equalsIgnoreCase("requestid"))
            {
                fks.add(ci.getFieldKey());
            }
        }

        return fks;
    }

    public static String getTableKey(String schemaName, String queryName)
    {
        return schemaName + "||" + queryName;
    }

    public static String getTableKey(TableInfo ti)
    {
        return getTableKey(ti.getPublicSchemaName(), ti.getPublicName());
    }

    public void registerSingleFormOverride(SingleQueryFormProvider p)
    {
        _queryProviders.add(p);
    }

    public void primeAllCaches()
    {
        User rootUser = EHRManager.get().getEHRUser(ContainerManager.getRoot(), false);
        if (rootUser == null)
            return;

        _cache.clear();
        for (Study s : EHRManager.get().getEhrStudies(rootUser))
        {
            TriggerScriptHelper helper = TriggerScriptHelper.create(rootUser.getUserId(), s.getContainer().getId());
            helper.primeCache();

            EHRSecurityManager.get().primeCache(s.getContainer());
        }
    }

    public void primeCachesForContainer(Container c, User u)
    {
        _cache.clear();  //this will result in all containers getting cleared, but this is a reasonable assumption if you have 1 EHR instance per site
        TriggerScriptHelper helper = TriggerScriptHelper.create(u.getUserId(), c.getId());
        helper.primeCache();

        EHRSecurityManager.get().primeCache(c);
    }

    public class DataEntryFormContextImpl implements DataEntryFormContext
    {
        private User _user;
        private Container _container;
        private Map<String, TableInfo> _tableMap = new HashMap<>();
        private Map<String, UserSchema> _userSchemas = new HashMap<>();
        private Map<String, Dataset> _datasetMap = null;

        public DataEntryFormContextImpl(Container c, User u)
        {
            _container = c;
            _user = u;
        }

        public TableInfo getTable(String schemaName, String queryName)
        {
            String key = schemaName + "||" + queryName;
            if (_tableMap.containsKey(key))
            {
                return _tableMap.get(key);
            }

            UserSchema us = getUserSchema(schemaName);
            if (us == null)
            {
                return null;
            }

            TableInfo ti = us.getTable(queryName);
            _tableMap.put(key, ti);

            if (ti instanceof DatasetTable)
            {
                String key2 = schemaName + "||" + ti.getTitle();
                _tableMap.put(key2, ti);
            }

            return ti;
        }

        private UserSchema getUserSchema(String schemaName)
        {
            if (_userSchemas.containsKey(schemaName))
                return _userSchemas.get(schemaName);

            UserSchema us = QueryService.get().getUserSchema(_user, _container, schemaName);
            _userSchemas.put(schemaName, us);

            return _userSchemas.get(schemaName);
        }

        public Container getContainer()
        {
            return _container;
        }

        public User getUser()
        {
            return _user;
        }

        public Map<String, Dataset> getDatasetMap()
        {
            if (_datasetMap == null)
            {
                Map<String, Dataset> datasetMap = new HashMap<>();
                Study s = StudyService.get().getStudy(getContainer());
                if (s != null)
                {
                    List<? extends Dataset> datasets = s.getDatasets();
                    for (Dataset d : datasets)
                    {
                        datasetMap.put(d.getName(), d);
                        datasetMap.put(d.getLabel(), d);
                    }
                }
                _datasetMap = datasetMap;
            }

            return _datasetMap;
        }
    }
}
