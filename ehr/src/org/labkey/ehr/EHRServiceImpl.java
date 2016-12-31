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
package org.labkey.ehr;

import org.apache.log4j.Logger;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.json.JSONObject;
import org.labkey.api.collections.CaseInsensitiveHashMap;
import org.labkey.api.data.AbstractTableInfo;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.JdbcType;
import org.labkey.api.data.PropertyManager;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.TableCustomizer;
import org.labkey.api.data.TableInfo;
import org.labkey.api.ehr.EHRQCState;
import org.labkey.api.ehr.EHRService;
import org.labkey.api.ehr.dataentry.DataEntryForm;
import org.labkey.api.ehr.dataentry.DataEntryFormFactory;
import org.labkey.api.ehr.dataentry.SingleQueryFormProvider;
import org.labkey.api.ehr.demographics.DemographicsProvider;
import org.labkey.api.ehr.history.HistoryDataSource;
import org.labkey.api.ehr.history.LabworkType;
import org.labkey.api.ehr.security.EHRDataEntryPermission;
import org.labkey.api.gwt.client.FacetingBehaviorType;
import org.labkey.api.ldk.LDKService;
import org.labkey.api.ldk.table.ButtonConfigFactory;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.module.ModuleProperty;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.DetailsURL;
import org.labkey.api.query.ExprColumn;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.UserSchema;
import org.labkey.api.resource.Resource;
import org.labkey.api.security.SecurableResource;
import org.labkey.api.security.SecurityPolicy;
import org.labkey.api.security.SecurityPolicyManager;
import org.labkey.api.security.User;
import org.labkey.api.security.permissions.Permission;
import org.labkey.api.study.DatasetTable;
import org.labkey.api.util.Pair;
import org.labkey.api.util.Path;
import org.labkey.api.util.URLHelper;
import org.labkey.api.view.ActionURL;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.ehr.dataentry.DataEntryManager;
import org.labkey.ehr.history.ClinicalHistoryManager;
import org.labkey.ehr.history.LabworkManager;
import org.labkey.ehr.security.EHRSecurityManager;
import org.labkey.ehr.table.DefaultEHRCustomizer;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * User: bimber
 * Date: 9/14/12
 * Time: 4:46 PM
 */
public class EHRServiceImpl extends EHRService
{
    private Set<Module> _registeredModules = new HashSet<>();
    private List<DemographicsProvider> _demographicsProviders = new ArrayList<>();
    private Map<REPORT_LINK_TYPE, List<ReportLink>> _reportLinks = new HashMap<>();
    private Map<String, List<Pair<Module, String>>> _actionOverrides = new HashMap<>();
    private List<Pair<Module, Resource>> _extraTriggerScripts = new ArrayList<>();
    private Map<Module, List<ClientDependency>> _clientDependencies = new HashMap<>();
    private Map<String, Map<String, List<Pair<Module, Class<? extends TableCustomizer>>>>> _tableCustomizers = new CaseInsensitiveHashMap<>();
    private Map<String, Map<String, List<ButtonConfigFactory>>> _moreActionsButtons = new CaseInsensitiveHashMap<>();
    private Map<String, Map<String, List<ButtonConfigFactory>>> _tbarButtons = new CaseInsensitiveHashMap<>();
    private Set<Module> _modulesRequiringLegacyExt3UI = new HashSet<>();

    private Map<String, String> _dateFormats = new HashMap<>();
    private static final Logger _log = Logger.getLogger(EHRServiceImpl.class);

    private static final String DATE_CATEGORY = "org.labkey.ehr.dateformat";

    public EHRServiceImpl()
    {

    }

    public static EHRServiceImpl get()
    {
        return (EHRServiceImpl)EHRService.get();
    }

    public void registerModule(Module module)
    {
        _registeredModules.add(module);
    }

    public Set<Module> getRegisteredModules()
    {
        return _registeredModules;
    }

    public void registerTriggerScript(Module owner, Resource script)
    {
        _extraTriggerScripts.add(Pair.of(owner, script));
    }

    public void registerLabworkType(LabworkType type)
    {
        LabworkManager.get().registerType(type);
    }

    public List<Resource> getExtraTriggerScripts(Container c)
    {
        List<Resource> resouces = new ArrayList<>();
        Set<Module> activeModules = c.getActiveModules();

        for (Pair<Module, Resource> pair : _extraTriggerScripts)
        {
            if (activeModules.contains(pair.first))
            {
                resouces.add(pair.second);
            }
        }
        return Collections.unmodifiableList(resouces);
    }

    public void registerDemographicsProvider(DemographicsProvider provider)
    {
        _demographicsProviders.add(provider);
    }

    public Collection<DemographicsProvider> getDemographicsProviders(Container c)
    {
        Map<String, DemographicsProvider> providers = new HashMap<>();
        for (DemographicsProvider p : _demographicsProviders)
        {
            if (p.isAvailable(c))
                providers.put(p.getName(), p);
        }

        return Collections.unmodifiableCollection(providers.values());
    }

    public void registerTableCustomizer(Module owner, Class<? extends TableCustomizer> customizerClass)
    {
        registerTableCustomizer(owner, customizerClass, LDKService.ALL_SCHEMAS, LDKService.ALL_TABLES);
    }

    public void registerTableCustomizer(Module owner, Class<? extends TableCustomizer> customizerClass, String schema, String query)
    {
        Map<String, List<Pair<Module, Class<? extends TableCustomizer>>>> map = _tableCustomizers.get(schema);
        if (map == null)
            map = new CaseInsensitiveHashMap<>();

        List<Pair<Module, Class<? extends TableCustomizer>>> list = map.get(query);
        if (list == null)
            list = new ArrayList<>();

        list.add(Pair.of(owner, customizerClass));

        map.put(query, list);
        _tableCustomizers.put(schema, map);
    }

    public List<TableCustomizer> getCustomizers(Container c, String schema, String query)
    {
        List<TableCustomizer> list = new ArrayList<>();
        Set<Module> modules = c.getActiveModules();

        if (_tableCustomizers.get(LDKService.ALL_SCHEMAS) != null)
        {
            for (Pair<Module, Class<? extends TableCustomizer>> pair : _tableCustomizers.get(LDKService.ALL_SCHEMAS).get(LDKService.ALL_TABLES))
            {
                if (modules.contains(pair.first))
                {
                    TableCustomizer tc = instantiateCustomizer(pair.second);
                    if (tc != null)
                        list.add(tc);
                }
            }
        }

        if (_tableCustomizers.containsKey(schema))
        {
            if (_tableCustomizers.get(schema).containsKey(LDKService.ALL_TABLES))
            {
                for (Pair<Module, Class<? extends TableCustomizer>> pair : _tableCustomizers.get(schema).get(LDKService.ALL_TABLES))
                {
                    if (modules.contains(pair.first))
                    {
                        TableCustomizer tc = instantiateCustomizer(pair.second);
                        if (tc != null)
                            list.add(tc);
                    }
                }
            }

            if (_tableCustomizers.get(schema).containsKey(query))
            {
                for (Pair<Module, Class<? extends TableCustomizer>> pair : _tableCustomizers.get(schema).get(query))
                {
                    if (modules.contains(pair.first))
                    {
                        TableCustomizer tc = instantiateCustomizer(pair.second);
                        if (tc != null)
                            list.add(tc);
                    }
                }
            }
        }

        return Collections.unmodifiableList(list);
    }

    private TableCustomizer instantiateCustomizer(Class<? extends TableCustomizer> customizerClass)
    {
        try
        {
            return customizerClass.newInstance();
        }
        catch (InstantiationException | IllegalAccessException e)
        {
            _log.error("Unable to create instance of class '" + customizerClass.getName() + "'", e);
        }

        return null;
    }

    public void registerClientDependency(ClientDependency cd, Module owner)
    {
        List<ClientDependency> list = _clientDependencies.get(owner);
        if (list == null)
            list = new ArrayList<>();

        list.add(cd);

        _clientDependencies.put(owner, list);
    }

    public Set<ClientDependency> getRegisteredClientDependencies(Container c)
    {
        Set<ClientDependency> set = new LinkedHashSet<>();
        for (Module m : _clientDependencies.keySet())
        {
            if (c.getActiveModules().contains(m))
            {
                set.addAll(_clientDependencies.get(m));
            }
        }

        return Collections.unmodifiableSet(set);
    }

    public void setDateFormat(Container c, String format)
    {
        PropertyManager.PropertyMap props = PropertyManager.getWritableProperties(c, DATE_CATEGORY, true);
        props.put("dateFormat", format);
        props.save();
        _dateFormats.put(c.getId(), format);
    }

    public String getDateFormat(Container c)
    {
        if (_dateFormats.containsKey(c.getId()))
            return _dateFormats.get(c.getId());

        Map<String, String> props = PropertyManager.getProperties(c, DATE_CATEGORY);
        if (props.containsKey("dateFormat"))
            return props.get("dateFormat");

        return "yyyy-MM-dd HH:mm";
    }

    public User getEHRUser(Container c)
    {
        return EHRManager.get().getEHRUser(c);
    }

    public void registerReportLink(REPORT_LINK_TYPE type, String label, Module owner, DetailsURL url, @Nullable String category)
    {
        List<ReportLink> links = _reportLinks.get(type);

        if (links == null)
            links = new ArrayList<>();

        links.add(new ReportLink(label, owner, url, category));

        _reportLinks.put(type, links);
    }

    public void registerReportLink(REPORT_LINK_TYPE type, String label, Module owner, URLHelper url, @Nullable String category)
    {
        List<ReportLink> links = _reportLinks.get(type);

        if (links == null)
            links = new ArrayList<>();

        links.add(new ReportLink(label, owner, url, category));

        _reportLinks.put(type, links);
    }

    public List<ReportLink> getReportLinks(Container c, User u, REPORT_LINK_TYPE type)
    {
        List<ReportLink> links = _reportLinks.get(type);
        if (links == null)
            return Collections.emptyList();

        List<ReportLink> ret = new ArrayList<>();
        for (ReportLink l : links)
        {
            if (l.isAvailable(c, u))
                ret.add(l);
        }

        return Collections.unmodifiableList(ret);
    }

    public class ReportLink
    {
        private URLHelper _url = null;
        private DetailsURL _detailsURL = null;
        private String _label;
        private Module _owner;
        private String _category;

        public ReportLink(String label, Module owner, DetailsURL url, @Nullable String category)
        {
            _detailsURL = url;
            _label = label;
            _owner = owner;
            _category = category;
        }

        public ReportLink(String label, Module owner, URLHelper url, @Nullable String category)
        {
            _url = url;
            _label = label;
            _owner = owner;
            _category = category;
        }

        public boolean isAvailable(Container c, User u)
        {
            return c.getActiveModules().contains(_owner);
        }

        public DetailsURL getDetailsUrl()
        {
            return _detailsURL;
        }

        public URLHelper getUrl()
        {
            return _url;
        }

        public String getLabel()
        {
            return _label;
        }

        public String getCategory()
        {
            return _category;
        }

        public JSONObject toJSON(Container c)
        {
            Map<String, Object> item = new HashMap<>();

            if (getDetailsUrl() != null)
            {
                ActionURL url = getDetailsUrl().copy(c).getActionURL();
                item.put("controller", url.getController());
                item.put("action", url.getAction());
                item.put("params", url.getParameterMap());
            }

            if (getUrl() != null)
            {
                item.put("url", getUrl().toString());
            }

            item.put("label", getLabel());
            item.put("category", getCategory());

            return new JSONObject(item);
        }
    }

    public void registerHistoryDataSource(HistoryDataSource source)
    {
        ClinicalHistoryManager.get().registerDataSource(source);
    }

    public void registerActionOverride(String actionName, Module owner, String resourcePath)
    {
        List<Pair<Module, String>> list = _actionOverrides.get(actionName);
        if (list == null)
            list = new ArrayList<>();

        list.add(Pair.of(owner, resourcePath));

        _actionOverrides.put(actionName, list);
    }

    public Resource getActionOverride(String actionName, Container c)
    {
        if (!_actionOverrides.containsKey(actionName))
            return null;

        Set<Module> activeModules = c.getActiveModules();
        for (Pair<Module, String> pair : _actionOverrides.get(actionName))
        {
            if (activeModules.contains(pair.first))
            {
                Resource r = pair.first.getModuleResource(Path.parse(pair.second));
                if (r != null)
                    return r;
                else
                    _log.error("Unable to find registered EHR action: " + pair.first.getName() + " / " + pair.second);
            }
        }

        return null;
    }

    public Container getEHRStudyContainer(Container c)
    {
        Module ehr = ModuleLoader.getInstance().getModule(EHRModule.NAME);
        ModuleProperty mp = ehr.getModuleProperties().get(EHRManager.EHRStudyContainerPropName);
        String path = mp.getEffectiveValue(c);
        if (path == null)
            return null;

        return ContainerManager.getForPath(path);
    }

    @NotNull
    public Map<String, EHRQCState> getQCStates(Container c)
    {
        return EHRSecurityManager.get().getQCStateInfo(c);
    }

    public void registerFormType(DataEntryFormFactory fact)
    {
        DataEntryManager.get().registerFormType(fact);
    }

    public DataEntryForm getDataEntryForm(String name, Container c, User u)
    {
        return DataEntryManager.get().getFormByName(name, c, u);
    }

    public void registerDefaultFieldKeys(String schemaName, String queryName, List<FieldKey> keys)
    {
        DataEntryManager.get().registerDefaultFieldKeys(schemaName, queryName, keys);
    }

    public List<FieldKey> getDefaultFieldKeys(TableInfo ti)
    {
        return DataEntryManager.get().getDefaultFieldKeys(ti);
    }

    public void registerTbarButton(ButtonConfigFactory btn, String schema, String query)
    {
        registerButton(btn, schema, query, _tbarButtons);
    }

    public void registerMoreActionsButton(ButtonConfigFactory btn, String schema, String query)
    {
        registerButton(btn, schema, query, _moreActionsButtons);
    }

    private void registerButton(ButtonConfigFactory btn, String schema, String query, Map<String, Map<String, List<ButtonConfigFactory>>> map)
    {
        Map<String, List<ButtonConfigFactory>> schemaMap = map.get(schema);
        if (schemaMap == null)
            schemaMap = new CaseInsensitiveHashMap<>();

        List<ButtonConfigFactory> list = schemaMap.get(query);
        if (list == null)
            list = new ArrayList<>();

        list.add(btn);

        schemaMap.put(query, list);
        map.put(schema, schemaMap);
    }

    public List<ButtonConfigFactory> getMoreActionsButtons(TableInfo ti)
    {
        return getButtons(ti, _moreActionsButtons);
    }

    public List<ButtonConfigFactory> getTbarButtons(TableInfo ti)
    {
        return getButtons(ti, _tbarButtons);
    }

    @NotNull
    private List<ButtonConfigFactory> getButtons(TableInfo ti, Map<String, Map<String, List<ButtonConfigFactory>>> map)
    {
        List<ButtonConfigFactory> buttons = new ArrayList<>();

        if (map.containsKey(LDKService.ALL_SCHEMAS))
        {
            Map<String, List<ButtonConfigFactory>> factories = map.get(LDKService.ALL_SCHEMAS);
            buttons.addAll(getButtonsForTable(ti, factories, LDKService.ALL_TABLES));
            buttons.addAll(getButtonsForTable(ti, factories, ti.getPublicName()));
        }

        if (map.containsKey(ti.getPublicSchemaName()))
        {
            Map<String, List<ButtonConfigFactory>> factories = map.get(ti.getPublicSchemaName());
            buttons.addAll(getButtonsForTable(ti, factories, LDKService.ALL_TABLES));
            buttons.addAll(getButtonsForTable(ti, factories, ti.getPublicName()));
        }

        return Collections.unmodifiableList(buttons);
    }

    private List<ButtonConfigFactory> getButtonsForTable(TableInfo ti, Map<String, List<ButtonConfigFactory>> factories, String query)
    {
        if (factories.containsKey(query))
        {
            List<ButtonConfigFactory> ret = new ArrayList<>();
            for (ButtonConfigFactory btn : factories.get(query))
            {
                if (btn.isAvailable(ti))
                    ret.add(btn);
            }

            return ret;
        }

        return Collections.emptyList();
    }

    public boolean hasDataEntryPermission (String schemaName, String queryName, Container c, User u)
    {
        return hasPermission(schemaName, queryName, c, u, EHRDataEntryPermission.class);
    }

    public boolean hasDataEntryPermission (TableInfo ti)
    {
        return hasPermission(ti, EHRDataEntryPermission.class);
    }

    public boolean hasPermission (String schemaName, String queryName, Container c, User u, Class<? extends Permission> perm)
    {
        Container ehrContainer = EHRService.get().getEHRStudyContainer(c);
        if (ehrContainer == null)
            return false;

        UserSchema studySchema = QueryService.get().getUserSchema(u, ehrContainer, schemaName);
        if (studySchema == null)
            return false;

        TableInfo ti = studySchema.getTable(queryName);
        if (ti == null)
            return false;

        return hasPermission(ti, perm);
    }

    public boolean hasPermission (TableInfo ti, Class<? extends Permission> perm)
    {
        SecurableResource sr;
        if (ti instanceof DatasetTable)
        {
            sr =((DatasetTable) ti).getDataset();
        }
        else
        {
            sr = ti.getUserSchema().getContainer();
        }

        SecurityPolicy policy = SecurityPolicyManager.getPolicy(sr);
        return policy.hasPermission(ti.getUserSchema().getUser(), perm);
    }

    public boolean hasPermission (String schemaName, String queryName, Container c, User u, Class<? extends Permission> perm, EHRQCState qcState)
    {
        SecurableResource sr = EHRSecurityManager.get().getSecurableResource(c, u, schemaName, queryName);
        if (sr == null)
        {
            _log.warn("Unable to find SecurableResource for table: " + schemaName + "." + queryName);
            return false;
        }

        return EHRSecurityManager.get().testPermission(u, sr, perm, qcState);
    }

    public void customizeDateColumn(AbstractTableInfo ti, String colName)
    {
        ColumnInfo dateCol = ti.getColumn(colName);
        if (dateCol == null)
            return;

        String calendarYear = "calendarYear";
        if (ti.getColumn(calendarYear) == null)
        {
            String colSql = dateCol.getValueSql(ExprColumn.STR_TABLE_ALIAS).getSQL();
            SQLFragment sql = new SQLFragment(ti.getSqlDialect().getDatePart(Calendar.YEAR, colSql));
            ExprColumn calCol = new ExprColumn(ti, calendarYear, sql, JdbcType.INTEGER, dateCol);
            calCol.setLabel("Calendar Year");
            calCol.setFacetingBehaviorType(FacetingBehaviorType.ALWAYS_OFF);
            calCol.setHidden(true);
            ti.addColumn(calCol);

            String fiscalYear = "fiscalYear";
            SQLFragment sql2 = new SQLFragment("(" + ti.getSqlDialect().getDatePart(Calendar.YEAR, colSql) + " + CASE WHEN " + ti.getSqlDialect().getDatePart(Calendar.MONTH, colSql) + " < 5 THEN -1 ELSE 0 END)");
            ExprColumn fiscalYearCol = new ExprColumn(ti, fiscalYear, sql2, JdbcType.INTEGER, dateCol);
            fiscalYearCol.setLabel("Fiscal Year (May 1)");
            fiscalYearCol.setDescription("This column will calculate the fiscal year of the record, based on a May 1 cycle");
            fiscalYearCol.setFacetingBehaviorType(FacetingBehaviorType.ALWAYS_OFF);
            fiscalYearCol.setHidden(true);
            ti.addColumn(fiscalYearCol);

            String fiscalYearJuly = "fiscalYearJuly";
            SQLFragment sql3 = new SQLFragment("(" + ti.getSqlDialect().getDatePart(Calendar.YEAR, colSql) + " + CASE WHEN " + ti.getSqlDialect().getDatePart(Calendar.MONTH, colSql) + " < 7 THEN -1 ELSE 0 END)");
            ExprColumn fiscalYearJulyCol = new ExprColumn(ti, fiscalYearJuly, sql3, JdbcType.INTEGER, dateCol);
            fiscalYearJulyCol.setLabel("Fiscal Year (July 1)");
            fiscalYearJulyCol.setDescription("This column will calculate the fiscal year of the record, based on a July 1 cycle");
            fiscalYearJulyCol.setFacetingBehaviorType(FacetingBehaviorType.ALWAYS_OFF);
            fiscalYearJulyCol.setHidden(true);
            ti.addColumn(fiscalYearJulyCol);
        }

        addDatePartCol(ti, dateCol, "Year", "This column shows the year portion of the record's date", Calendar.YEAR);
        addDatePartCol(ti, dateCol, "Month Number", "This column shows the month number (based on the record's date)", Calendar.MONTH);
        addDatePartCol(ti, dateCol, "Day Of Month", "This column shows the day of month (based on the record's date)", Calendar.DATE);
    }

    private void addDatePartCol(AbstractTableInfo ti, ColumnInfo dateCol, String label, String description, Integer datePart)
    {
        String colName = dateCol.getName() + label.replaceAll(" ", "");
        if (ti.getColumn(colName) == null)
        {
            String colSql = dateCol.getValueSql(ExprColumn.STR_TABLE_ALIAS).getSQL();
            SQLFragment sql = new SQLFragment("(" + ti.getSqlDialect().getDatePart(datePart, colSql) + ")");
            ExprColumn newCol = new ExprColumn(ti, colName, sql, JdbcType.INTEGER, dateCol);
            newCol.setLabel(label);
            newCol.setDescription(description);
            newCol.setFacetingBehaviorType(FacetingBehaviorType.ALWAYS_OFF);
            newCol.setHidden(true);
            ti.addColumn(newCol);
        }
    }

    public TableCustomizer getEHRCustomizer()
    {
        return new DefaultEHRCustomizer();
    }

    public void registerSingleFormOverride(SingleQueryFormProvider p)
    {
        DataEntryManager.get().registerSingleFormOverride(p);
    }

    public void appendCalculatedIdCols(AbstractTableInfo ti, String dateFieldName)
    {
        DefaultEHRCustomizer t = new DefaultEHRCustomizer();
        t.appendCalculatedCols(ti, dateFieldName);
    }

    public Collection<String> ensureFlagActive(User u, Container c, String flag, Date date, String remark, Collection<String> animalIds, boolean livingAnimalsOnly) throws BatchValidationException
    {
        return ensureFlagActive(u, c, flag, date, null, remark, animalIds, livingAnimalsOnly);
    }

    public Collection<String> ensureFlagActive(User u, Container c, String flag, Date date, Date enddate, String remark, Collection<String> animalIds, boolean livingAnimalsOnly) throws BatchValidationException
    {
        return EHRManager.get().ensureFlagActive(u, c, flag, date, enddate, remark, animalIds, livingAnimalsOnly);
    }

    public Collection<String> terminateFlagsIfExists(User u, Container c, String flag, Date enddate, Collection<String> animalIds)
    {
        return EHRManager.get().terminateFlagsIfExists(u, c, flag, enddate, animalIds);
    }

    public String getEHRDefaultClinicalProjectName(Container c)
    {
        return EHRManager.get().getEHRDefaultClinicalProjectName(c);
    }

    @Override
    public void addModuleRequiringLegagyExt3EditUI(Module m)
    {
        _modulesRequiringLegacyExt3UI.add(m);
    }

    public boolean isUseLegagyExt3EditUI(Container c)
    {
        Set<Module> am = c.getActiveModules();
        for (Module m : _modulesRequiringLegacyExt3UI)
        {
            if (am.contains(m))
            {
                return true;
            }
        }

        return false;
    }
}
