/*
 * Copyright (c) 2009-2016 LabKey Corporation
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

import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.Logger;
import org.jetbrains.annotations.Nullable;
import org.labkey.api.cache.CacheManager;
import org.labkey.api.collections.CaseInsensitiveHashMap;
import org.labkey.api.collections.CaseInsensitiveHashSet;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.DbScope;
import org.labkey.api.data.PropertyManager;
import org.labkey.api.data.PropertyStorageSpec;
import org.labkey.api.data.RuntimeSQLException;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.Selector;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.SqlExecutor;
import org.labkey.api.data.SqlSelector;
import org.labkey.api.data.Table;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableResultSet;
import org.labkey.api.data.TableSelector;
import org.labkey.api.data.dialect.SqlDialect;
import org.labkey.api.ehr.EHRQCState;
import org.labkey.api.ehr.EHRService;
import org.labkey.api.ehr.dataentry.DataEntryForm;
import org.labkey.api.ehr.security.EHRCompletedInsertPermission;
import org.labkey.api.exp.ChangePropertyDescriptorException;
import org.labkey.api.exp.OntologyManager;
import org.labkey.api.exp.PropertyDescriptor;
import org.labkey.api.exp.api.ExperimentService;
import org.labkey.api.exp.api.StorageProvisioner;
import org.labkey.api.exp.property.Domain;
import org.labkey.api.exp.property.DomainProperty;
import org.labkey.api.exp.property.PropertyService;
import org.labkey.api.exp.query.ExpSchema;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.module.ModuleProperty;
import org.labkey.api.query.AliasManager;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.DuplicateKeyException;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.InvalidKeyException;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.QueryUpdateServiceException;
import org.labkey.api.query.Queryable;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.User;
import org.labkey.api.security.UserManager;
import org.labkey.api.security.ValidEmail;
import org.labkey.api.security.permissions.DeletePermission;
import org.labkey.api.study.Dataset;
import org.labkey.api.study.Study;
import org.labkey.api.study.StudyService;
import org.labkey.api.util.ExceptionUtil;
import org.labkey.api.util.PageFlowUtil;
import org.labkey.api.util.Pair;
import org.labkey.api.util.ResultSetUtil;
import org.labkey.ehr.dataentry.DataEntryManager;
import org.labkey.ehr.security.EHRSecurityManager;
import org.labkey.ehr.utils.EHRQCStateImpl;

import java.beans.Introspector;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class EHRManager
{
    private static final EHRManager _instance = new EHRManager();
    public static final String EHRStudyContainerPropName = "EHRStudyContainer";
    public static final String EHRAdminUserPropName = "EHRAdminUser";
    public static final String EHRDefaultClinicalProjectName = "EHRDefaultClinicalProjectName";
    public static final String EHRCacheDemographicsPropName = "CacheDemographicsOnStartup";
    public static final String EHRStudyLabel = "Primate Electronic Health Record";
    public static final String SECURITY_PACKAGE = EHRCompletedInsertPermission.class.getPackage().getName();

    @Queryable
    public static final String VET_REVIEW = "Vet Review";
    @Queryable
    public static final String VET_ATTENTION = "Vet Attention";
    @Queryable
    public static final String OBS_REVIEWED = "Reviewed";
    @Queryable
    public static final String OBS_CATEGORY_OBSERVATIONS = "Observations";

    private static final Logger _log = Logger.getLogger(EHRManager.class);

    private EHRManager()
    {
        // prevent external construction with a private default constructor
    }

    public static EHRManager get()
    {
        return _instance;
    }

    /**
     * @return The value of the EHRAdminUser
     */
    public User getEHRUser(Container c)
    {
        return getEHRUser(c, true);
    }

    public User getEHRUser(Container c, boolean logOnError)
    {
        try
        {
            Module ehr = ModuleLoader.getInstance().getModule(EHRModule.NAME);
            ModuleProperty mp = ehr.getModuleProperties().get(EHRManager.EHRAdminUserPropName);
            String emailAddress = PropertyManager.getCoalecedProperty(PropertyManager.SHARED_USER, c, mp.getCategory(), EHRManager.EHRAdminUserPropName);
            if (emailAddress == null)
            {
                if (logOnError)
                    _log.error("Attempted to access EHR email module property from container: " + c.getPath() + ", but it was null.  Some code may not work as expected.", new Exception());
                return null;
            }

            ValidEmail email = new ValidEmail(emailAddress);
            return UserManager.getUser(email);
        }
        catch (ValidEmail.InvalidEmailException e)
        {
            throw new RuntimeException(e);
        }
    }

    /**
     * @return The value of the EHRStudyContainer, as set in the root container
     */
    public Container getPrimaryEHRContainer()
    {
        return getPrimaryEHRContainer(true);
    }

    public Container getPrimaryEHRContainer(boolean logOnError)
    {
        Module ehr = ModuleLoader.getInstance().getModule(EHRModule.NAME);
        ModuleProperty mp = ehr.getModuleProperties().get(EHRManager.EHRStudyContainerPropName);
        String path = PropertyManager.getCoalecedProperty(PropertyManager.SHARED_USER, ContainerManager.getRoot(), mp.getCategory(), EHRManager.EHRAdminUserPropName);
        if (path == null)
        {
            if (logOnError)
                _log.error("Attempted to access EHR containerPath Module Property, which has not been set for the root container", new Exception());
            return null;
        }

        return ContainerManager.getForPath(path);
    }

    public String getEHRDefaultClinicalProjectName(Container c)
    {
        Module ehr = ModuleLoader.getInstance().getModule(EHRModule.NAME);
        ModuleProperty mp = ehr.getModuleProperties().get(EHRManager.EHRDefaultClinicalProjectName);

        return PropertyManager.getCoalecedProperty(PropertyManager.SHARED_USER, c, mp.getCategory(), EHRManager.EHRDefaultClinicalProjectName);
    }

    /**
     * This is a somewhat crude method to identify any containers with an EHR study.  A study is identified as an EHR study if the
     * label is "Primate Electronic Health Record" and the EHR module is turned on in that folder.  This was originally written for
     * java upgrade scripts.
     * @return Set of EHR studies
     */
    public Set<Study> getEhrStudies(User u)
    {
        Module ehrModule = ModuleLoader.getInstance().getModule(EHRModule.NAME);
        if (u == null)
            u = getEHRUser(ContainerManager.getRoot(), false);

        if (u == null)
        {
            _log.info("EHR User Module Property has not been set for root, cannot find EHR studies");
            return null;
        }

        Set<Study> ehrStudies = new HashSet<>();
        for (Study s : StudyService.get().getAllStudies(ContainerManager.getRoot(), u))
        {
            if (EHRStudyLabel.equals(s.getLabel()) && s.getContainer().getActiveModules().contains(ehrModule))
            {
                ehrStudies.add(s);
            }
        }
        return ehrStudies;
    }

    public List<String> verifyDatasetResources(Container c, User u)
    {
        List<String> messages = new ArrayList<>();
        Study s = StudyService.get().getStudy(c);
        if (s == null){
            messages.add("There is no study in container: " + c.getPath());
            return messages;
        }

        for (Dataset ds : s.getDatasets())
        {
            UserSchema us = QueryService.get().getUserSchema(u, c, "study");
            TableInfo ti = us.getTable(ds.getName(), true);

            if (!ti.hasTriggers(c))
            {
                messages.add("Missing trigger script for: " + ds.getLabel());
            }

            //TODO: query.xml file
        }

        return messages;
    }
    
    /**
     * The EHR expects certain properties to be present on all dataset.  This will iterate each dataset, add any
     * missing columns and make sure the columns point to the correct propertyURI
     * @param c
     * @param u
     * @param commitChanges
     * @return
     */
    public List<String> ensureStudyQCStates(Container c, final User u, final boolean commitChanges)
    {
        final List<String> messages = new ArrayList<>();
        final Study s = StudyService.get().getStudy(c);
        if (s == null){
            messages.add("There is no study in container: " + c.getPath());
            return messages;
        }

        boolean shouldClearCache = false;

        //NOTE: there is no public API to set a study, so hit the DB directly.
        final TableInfo studyTable = DbSchema.get("study").getTable("study");
        TableInfo ti = DbSchema.get("study").getTable("qcstate");

        Object[][] states = new Object[][]{
            {"Abnormal", "Value is abnormal", true},
            {"Completed", "Record has been completed and is public", true},
            {"Delete Requested", "Records are requested to be deleted", false},
            {"In Progress", "Draft Record, not public", false},
            {"Request: Approved", "Request has been approved", false},
            {"Request: Sample Delivered", "The sample associated with this request has been delivered", false},
            {"Request: Denied", "Request has been denied", false},
            {"Request: Cancelled", "Request has been cancelled", false},
            {"Request: Pending", "Part of a request that has not been approved", false},
            {"Review Required", "Review is required prior to public release", false},
            {"Scheduled", "Record is scheduled, but not performed", false}
        };

        try (DbScope.Transaction transaction = ExperimentService.get().ensureTransaction())
        {
            final Map<String, Integer> qcMap = new HashMap<>();

            //first QCStates
            for (Object[] qc : states)
            {
                SimpleFilter filter = new SimpleFilter(FieldKey.fromString("Container"), c);
                filter.addCondition(FieldKey.fromString("label"), qc[0]);
                TableSelector ts = new TableSelector(ti, Collections.singleton("RowId"), filter, null);
                Integer[] rowIds = ts.getArray(Integer.class);
                if (rowIds.length > 0)
                {
                    qcMap.put((String)qc[0], rowIds[0]);
                    continue;
                }

                messages.add("Missing QCState: " + qc[0]);
                if (commitChanges)
                {
                    Map<String, Object> row = new CaseInsensitiveHashMap<>();
                    row.put("container", c.getId());
                    row.put("label", qc[0]);
                    row.put("description", qc[1]);
                    row.put("publicdata", qc[2]);
                    row = Table.insert(u, ti, row);

                    qcMap.put((String)row.get("label"), (Integer)row.get("rowid"));

                    shouldClearCache = true;
                }
            }

            //then check general properties
            SimpleFilter filter = new SimpleFilter(FieldKey.fromString("entityid"), s.getEntityId());
            TableSelector studySelector = new TableSelector(studyTable, filter, null);
            Map<String, Object> toUpdate = new CaseInsensitiveHashMap<>();
            Integer completedQCState = qcMap.get("Completed");

            try (ResultSet rs = studySelector.getResultSet())
            {
                rs.next();
                if (!qcMap.containsKey("Completed"))
                {
                    messages.add("There was an error locating QCState Completed");
                }
                else
                {
                    if (rs.getInt("DefaultAssayQCState") != completedQCState)
                    {
                        messages.add("Set DefaultAssayQCState to Completed");
                        toUpdate.put("DefaultAssayQCState", completedQCState);
                    }

                    if (rs.getInt("DefaultDirectEntryQCState") != completedQCState)
                    {
                        messages.add("Set DefaultDirectEntryQCState to Completed");
                        toUpdate.put("DefaultDirectEntryQCState", completedQCState);
                    }

                    if (rs.getInt("DefaultPipelineQCState") != completedQCState)
                    {
                        messages.add("Set DefaultPipelineQCState to Completed");
                        toUpdate.put("DefaultPipelineQCState", completedQCState);
                    }

                    if (!rs.getBoolean("ShowPrivateDataByDefault"))
                    {
                        messages.add("Set ShowPrivateDataByDefault to true");
                        toUpdate.put("ShowPrivateDataByDefault", true);
                    }
                }
            }

            if (commitChanges && toUpdate.size() > 0)
            {
                Table.update(u, studyTable, toUpdate, s.getContainer().getId());
                shouldClearCache = true;
            }

            transaction.commit();
        }
        catch (SQLException e)
        {
            ExceptionUtil.logExceptionToMothership(null, e);
            messages.add(e.getMessage());
            return messages;
        }

        if (shouldClearCache)
        {
            Introspector.flushCaches();
            CacheManager.clearAllKnownCaches();
        }

        return messages;
    }
    
    /**
     * The EHR expects certain properties to be present on all dataset.  This will iterate each dataset, add any
     * missing columns and make sure the columns point to the correct propertyURI
     * @param c
     * @param u
     * @param commitChanges
     * @return
     */
    public List<String> ensureDatasetPropertyDescriptors(Container c, User u, boolean commitChanges, boolean rebuildIndexes)
    {
        List<String> messages = new ArrayList<>();

        try (DbScope.Transaction transaction = ExperimentService.get().ensureTransaction())
        {
            Study study = StudyService.get().getStudy(c);
            if (study == null) {
                messages.add("No study in this folder");
                return messages;
            }

            List<String> propertyURIs = new ArrayList<>();
            propertyURIs.add(EHRProperties.PROJECT.getPropertyDescriptor().getPropertyURI());
            propertyURIs.add(EHRProperties.REMARK.getPropertyDescriptor().getPropertyURI());
            propertyURIs.add(EHRProperties.OBJECTID.getPropertyDescriptor().getPropertyURI());
            propertyURIs.add(EHRProperties.PARENTID.getPropertyDescriptor().getPropertyURI());
            propertyURIs.add(EHRProperties.TASKID.getPropertyDescriptor().getPropertyURI());
            propertyURIs.add(EHRProperties.REQUESTID.getPropertyDescriptor().getPropertyURI());
            propertyURIs.add(EHRProperties.DESCRIPTION.getPropertyDescriptor().getPropertyURI());
            propertyURIs.add(EHRProperties.PERFORMEDBY.getPropertyDescriptor().getPropertyURI());
            propertyURIs.add(EHRProperties.FORMSORT.getPropertyDescriptor().getPropertyURI());


            List<PropertyDescriptor> properties = new ArrayList<>();
            Container sharedContainer = ContainerManager.getSharedContainer();
            for (String propertyURI : propertyURIs)
            {
                PropertyDescriptor pd = OntologyManager.getPropertyDescriptor(propertyURI, sharedContainer);
                if (pd == null)
                {
                    _log.error("PropertyDescriptor [" + propertyURI + "] is null for container: " + c.getPath());
                    String sql = " SELECT * FROM " + OntologyManager.getTinfoPropertyDescriptor() + " WHERE PropertyURI LIKE '%#" + (propertyURI.split("#")[1]) + "'";
                    PropertyDescriptor[] pdArray = new SqlSelector(OntologyManager.getExpSchema(), sql).getArray(PropertyDescriptor.class);
                    if (pdArray.length > 0)
                    {
                        for (PropertyDescriptor p : pdArray)
                        {
                            _log.error("found match in container: " + p.getContainer().getPath() + " [" + p.getPropertyURI() + "]");
                        }
                    }
                    else
                    {
                        _log.error("no matching property descriptors found in database");
                    }
                }
                else
                {
                    properties.add(pd);
                }
            }

            List<String> optionalPropertyURIs = new ArrayList<>();
            optionalPropertyURIs.add(EHRProperties.ENDDATE.getPropertyDescriptor().getPropertyURI());
            optionalPropertyURIs.add(EHRProperties.DATEREQUESTED.getPropertyDescriptor().getPropertyURI());
            optionalPropertyURIs.add(EHRProperties.ACCOUNT.getPropertyDescriptor().getPropertyURI());
            optionalPropertyURIs.add(EHRProperties.CASEID.getPropertyDescriptor().getPropertyURI());
            optionalPropertyURIs.add(EHRProperties.VETREVIEW.getPropertyDescriptor().getPropertyURI());
            optionalPropertyURIs.add(EHRProperties.VETREVIEWDATE.getPropertyDescriptor().getPropertyURI());
            optionalPropertyURIs.add(EHRProperties.DATEFINALIZED.getPropertyDescriptor().getPropertyURI());

            List<PropertyDescriptor> optionalProperties = new ArrayList<>();
            for (String propertyURI : optionalPropertyURIs)
            {
                PropertyDescriptor pd = OntologyManager.getPropertyDescriptor(propertyURI, sharedContainer);
                if (pd == null)
                {
                    _log.error("PropertyDescriptor [" + propertyURI + "] is null for container: " + c.getPath());
                    String sql = " SELECT * FROM " + OntologyManager.getTinfoPropertyDescriptor() + " WHERE PropertyURI LIKE '%#" + (propertyURI.split("#")[1]) + "'";
                    PropertyDescriptor[] pdArray = new SqlSelector(OntologyManager.getExpSchema(), sql).getArray(PropertyDescriptor.class);
                    if (pdArray.length > 0)
                    {
                        for (PropertyDescriptor p : pdArray)
                        {
                            _log.error("found match in container: " + p.getContainer().getPath() + " [" + p.getPropertyURI() + "]");
                        }
                    }
                    else
                    {
                        _log.error("no matching property descriptors found in database");
                    }
                }
                else
                {
                    optionalProperties.add(pd);
                }
            }

            List<? extends Dataset> datasets = study.getDatasets();

            for (Dataset dataset : datasets)
            {
                Domain domain = dataset.getDomain();
                List<? extends DomainProperty> dprops = domain.getProperties();
                if (dprops == null)
                {
                    _log.error("domain.getProperties() was null for: " + domain.getName());
                    continue;
                }

                boolean changed = false;
                List<PropertyDescriptor> toUpdate = new ArrayList<>();

                List<PropertyDescriptor> props = new ArrayList<>();
                props.addAll(properties);
                if (dataset.getCategory() != null && dataset.getCategory().equals("ClinPath") && !dataset.getName().equalsIgnoreCase("Clinpath Runs"))
                {
                    String propertyURI = EHRProperties.RUNID.getPropertyDescriptor().getPropertyURI();
                    PropertyDescriptor pd = OntologyManager.getPropertyDescriptor(propertyURI, sharedContainer);
                    if (pd == null)
                    {
                        _log.error("PropertyDescriptor [" + propertyURI + "] is null for container: " + c.getPath());
                        String sql = " SELECT * FROM " + OntologyManager.getTinfoPropertyDescriptor() + " WHERE PropertyURI LIKE '%#" + (propertyURI.split("#")[1]) + "'";
                        PropertyDescriptor[] pdArray = new SqlSelector(OntologyManager.getExpSchema(), sql).getArray(PropertyDescriptor.class);
                        if (pdArray.length > 0)
                        {
                            for (PropertyDescriptor p : pdArray)
                            {
                                _log.error("found match in container: " + p.getContainer().getPath() + " [" + p.getPropertyURI() + "]");
                            }
                        }
                        else
                        {
                            _log.error("no matching property descriptors found in database");
                        }
                    }
                    else
                    {
                        props.add(pd);
                    }
                }

                for (PropertyDescriptor pd : props)
                {
                    boolean found = false;
                    for (DomainProperty dp : dprops)
                    {
                        if (dp == null)
                        {
                            _log.error("domain has a null domain property: " + domain.getName());
                            continue;
                        }

                        //if the expected property is present, verify datatype and propertyURI
                        if (dp.getName().equalsIgnoreCase(pd.getName()))
                        {
                            found = true;

                            if (!dp.getPropertyURI().equals(pd.getPropertyURI()))
                            {
                                messages.add("Need to replace propertyURI on property \"" + pd.getName() + "\" for dataset " + dataset.getName());
                                if (commitChanges)
                                {
                                    toUpdate.add(pd);
                                }
                            }

//                            if (!pd.getContainer().equals(dp.getContainer()) && !pd.getProject().equals(ContainerManager.getSharedContainer()))
//                            {
//                                messages.add("Containers do not match for: " + dp.getName() + ".  Expected: " + dp.getContainer().getPath() + ", but was: " + pd.getContainer().getPath() + ".");
//                            }

                            if (!dp.getName().equals(pd.getName()))
                            {
                                messages.add("Case mismatch for property in dataset: " + dataset.getName() + ".  Expected: " + pd.getName() + ", but was: " + dp.getName() + ". This has not been automatically changed");
                            }
                        }
                    }

                    if (!found)
                    {
                        messages.add("Missing property \"" + pd.getName() + "\" on dataset: " + dataset.getName() + ".  Needs to be created.");
                        if (commitChanges)
                        {
                            DomainProperty d = domain.addProperty();
                            d.setPropertyURI(pd.getPropertyURI());
                            d.setRangeURI(pd.getRangeURI());
                            d.setName(pd.getName());
                            changed = true;
                        }
                    }
                }

                //dont add these, but if they already exist make sure we use the right propertyURI
                for (PropertyDescriptor pd : optionalProperties)
                {
                    for (DomainProperty dp : dprops)
                    {
                        if (dp.getName().equalsIgnoreCase(pd.getName()))
                        {
                            if (!dp.getPropertyURI().equals(pd.getPropertyURI()))
                            {
                                messages.add("Incorrect propertyURI on optional property \"" + pd.getName() + "\" for dataset: " + dataset.getName() +".  Needs to be updated.");
                                if (commitChanges)
                                {
                                    toUpdate.add(pd);
                                }
                            }
                        }
                    }
                }

                if (changed)
                {
                    domain.save(u);
                }

                for (PropertyDescriptor pd : toUpdate)
                {
                    updatePropertyURI(domain, pd);
                }
            }

            //ensure keymanagement type
            if (commitChanges)
            {
                DbSchema studySchema = DbSchema.get("study");
                SQLFragment sql = new SQLFragment("UPDATE study.dataset SET keymanagementtype=?, keypropertyname=? WHERE demographicdata=? AND container=?", "GUID", "objectid", false, c.getEntityId());
                long total = new SqlExecutor(studySchema).execute(sql);
                messages.add("Non-demographics datasets updated to use objectId as a managed key: "+ total);
            }
            else
            {
                DbSchema studySchema = DbSchema.get("study");
                SQLFragment sql = new SQLFragment("SELECT * FROM study.dataset WHERE keymanagementtype!=? AND demographicdata=? AND container=?", "GUID", false, c.getEntityId());
                long total = new SqlExecutor(studySchema).execute(sql);
                if (total > 0)
                    messages.add("Non-demographics datasets that are not using objectId as a managed key: " + total);
            }

            //add indexes
            String[][] toIndex = new String[][]{{"taskid"}};
            String[][] idxToRemove = new String[][]{{"date"}, {"parentid"}, {"objectid"}, {"runId"}, {"requestid"}};

            Set<String> distinctIndexes = new HashSet<>();
            for (Dataset d : study.getDatasets())
            {
                String tableName = d.getDomain().getStorageTableName();
                TableInfo realTable = StorageProvisioner.createTableInfo(d.getDomain());
                if (realTable == null)
                {
                    _log.error("Table not found for dataset: " + d.getLabel() + " / " + d.getTypeURI());
                    continue;
                }

                List<String[]> toAdd = new ArrayList<>();
                Collections.addAll(toAdd, toIndex);

                List<String[]> toRemove = new ArrayList<>();
                Collections.addAll(toRemove, idxToRemove);

                if (realTable.getColumn("vetreview") != null && !d.getName().equalsIgnoreCase("drug"))
                    toRemove.add(new String[]{"qcstate", "include:vetreview"});

                if (d.getLabel().equalsIgnoreCase("Housing"))
                {
                    toAdd.add(new String[]{"participantid", "enddate"});
                    toAdd.add(new String[]{"participantid", "include:date,cage,room"});
                    toAdd.add(new String[]{"lsid", "participantid"});
                    toAdd.add(new String[]{"date", "lsid", "participantid"});
                    toAdd.add(new String[]{"date", "include:lsid,participantid,cage,room"});
                    toAdd.add(new String[]{"objectid"});
                }
                else if (d.getLabel().equalsIgnoreCase("Assignment"))
                {
                    toAdd.add(new String[]{"project", "participantid", "enddate"});
                    toAdd.add(new String[]{"enddate", "project"});
                }
                else if (d.getLabel().equalsIgnoreCase("Clinpath Runs"))
                {
                    toAdd.add(new String[]{"parentid"});
                    toAdd.add(new String[]{"objectid"});

                    toAdd.add(new String[]{"requestid"});
                    toRemove.remove(new String[]{"requestid"});
                }
                else if (d.getLabel().equalsIgnoreCase("Clinical Encounters"))
                {
                    toAdd.add(new String[]{"caseno"});
                    toAdd.add(new String[]{"objectid"});

                    toAdd.add(new String[]{"requestid"});
                    toRemove.remove(new String[]{"requestid"});
                }
                else if (d.getLabel().equalsIgnoreCase("Demographics"))
                {
                    toAdd.add(new String[]{"participantid", "calculated_status"});
                    toAdd.add(new String[]{"participantid:ASC", "include:death"});
                }
                else if (d.getLabel().equalsIgnoreCase("Animal Record Flags"))
                {
                    toRemove.add(new String[]{"participantid:ASC", "include:category,value"});
                }
                else if (d.getLabel().equalsIgnoreCase("Clinical Remarks"))
                {
                    toAdd.add(new String[]{"participantid", "lsid"});
                    toRemove.add(new String[]{"participantid:ASC", "date:ASC", "lsid:ASC"});
                    toAdd.add(new String[]{"participantid:ASC", "date:ASC", "lsid:ASC", "include:hx,qcstate,datefinalized,category"});
                    toRemove.add(new String[]{"date", "include:hx,caseid"});
                    toAdd.add(new String[]{"objectid"});
                }
                else if (d.getLabel().equalsIgnoreCase("Treatment Orders"))
                {
                    toAdd.add(new String[]{"objectid"});

                    toAdd.add(new String[]{"requestid"});
                    toRemove.remove(new String[]{"requestid"});
                }
                else if (d.getLabel().equalsIgnoreCase("Cases"))
                {
                    toAdd.add(new String[]{"enddate", "qcstate", "lsid"});
                    toAdd.add(new String[]{"participantid", "lsid", "assignedvet"});
                    toAdd.add(new String[]{"objectid"});
                }
                else if (d.getName().equalsIgnoreCase("clinical_observations"))
                {
                    toAdd.add(new String[]{"participantid", "date", "include:taskid,lsid,category,observation,area,remark"});
                    for (String[] i : toAdd)
                    {
                        if (i.length < 2)
                            continue;

                        if ("participantid".equals(i[0]) && "date".equals(i[1]))
                        {
                            toAdd.remove(i);
                            break;
                        }
                    }

                    toRemove.add(new String[]{"participantid", "date"});
                }
                else if (d.getName().equalsIgnoreCase("drug"))
                {
                    toAdd.add(new String[]{"treatmentid"});

                    toRemove.add(new String[]{"qcstate", "include:treatmentid,vetreview"});
                    toRemove.add(new String[]{"qcstate", "include:treatmentid"});

                    toAdd.add(new String[]{"requestid"});
                    toRemove.remove(new String[]{"requestid"});
                }
                else if (d.getName().equalsIgnoreCase("blood"))
                {
                    toAdd.add(new String[]{"requestid"});
                    toRemove.remove(new String[]{"requestid"});
                }

                //ensure indexes removed, unless explicitly requested by a table
                for (String[] cols : toRemove)
                {
                    String indexName = getIndexName(realTable.getSqlDialect(), tableName, cols);
                    boolean found = false;
                    for (String[] addedIndex : toAdd)
                    {
                        String addedIndexName = getIndexName(realTable.getSqlDialect(), tableName, addedIndex);
                        if (addedIndexName.equalsIgnoreCase(indexName))
                        {
                            found = true;
                            break;
                        }
                    }

                    if (found)
                    {
                        break;
                    }

                    boolean exists = doesIndexExist(realTable.getSchema(), tableName, indexName);
                    if (exists)
                    {
                        if (commitChanges)
                        {
                            messages.add("Dropping index on column(s): " + StringUtils.join(cols, ", ") + " for dataset: " + d.getLabel());
                            String sqlString;
                            if (realTable.getSqlDialect().isSqlServer())
                            {
                                sqlString = "DROP INDEX " + indexName + " ON " + realTable.getSelectName();
                            }
                            else
                            {
                                sqlString = "DROP INDEX " + realTable.getSchema().getName() + "." + indexName;
                            }

                            SQLFragment sql = new SQLFragment(sqlString);
                            SqlExecutor se = new SqlExecutor(realTable.getSchema());
                            se.execute(sql);
                        }
                        else
                        {
                            messages.add("Will drop index on column(s): " + StringUtils.join(cols, ", ") + " for dataset: " + d.getLabel());
                        }
                    }
                }

                //then add indexes
                for (String[] indexCols : toAdd)
                {
                    boolean missingCols = false;

                    List<String> cols = new ArrayList<>();
                    String[] includedCols = null;
                    Map<String, String> directionMap = new HashMap<>();

                    for (String name : indexCols)
                    {
                        String[] tokens = name.split(":");
                        if (tokens[0].equalsIgnoreCase("include"))
                        {
                            if (tokens.length > 1)
                            {
                                includedCols = tokens[1].split(",");
                            }
                        }
                        else
                        {
                            cols.add(tokens[0]);
                            if (tokens.length > 1)
                                directionMap.put(tokens[0], tokens[1]);
                        }
                    }

                    for (String col : cols)
                    {
                        if (realTable.getColumn(col) == null)
                        {
                            //messages.add("Dataset: " + d.getName() + " does not have column " + col + ", so indexing will be skipped");
                            missingCols = true;
                        }
                    }

                    if (missingCols)
                        continue;

                    String indexName = getIndexName(realTable.getSqlDialect(), tableName, indexCols);

                    if (distinctIndexes.contains(indexName))
                        throw new RuntimeException("An index has already been created with the name: " + indexName);
                    distinctIndexes.add(indexName);

                    Set<String> indexNames = new CaseInsensitiveHashSet();
                    DatabaseMetaData meta = realTable.getSchema().getScope().getConnection().getMetaData();
                    ResultSet rs = null;
                    try
                    {
                        rs = meta.getIndexInfo(realTable.getSchema().getScope().getDatabaseName(), realTable.getSchema().getName(), tableName, false, false);
                        while (rs.next())
                        {
                            indexNames.add(rs.getString("INDEX_NAME"));
                        }
                    }
                    finally
                    {
                        ResultSetUtil.close(rs);
                    }

                    boolean exists = indexNames.contains(indexName);
                    if (exists && rebuildIndexes)
                    {
                        if (commitChanges)
                        {
                            dropIndex(realTable.getSchema(), realTable, indexName, cols, d.getLabel(), messages);
                        }
                        else
                        {
                            messages.add("Will drop/recreate index on column(s): " + StringUtils.join(cols, ", ") + " for dataset: " + d.getLabel());
                        }
                        exists = false;
                    }

                    if (!exists)
                    {
                        if (commitChanges)
                        {
                            List<String> columns = new ArrayList<>();
                            for (String name : cols)
                            {
                                if (realTable.getSqlDialect().isSqlServer() && directionMap.containsKey(name))
                                    name += " " + directionMap.get(name);

                                columns.add(name);
                            }

                            createIndex(realTable.getSchema(), realTable, d.getLabel(), indexName, columns, includedCols, messages);
                        }
                        else
                        {
                            messages.add("Missing index on column(s): " + StringUtils.join(indexCols, ", ") + " for dataset: " + d.getLabel());
                        }
                    }
                }

                //then disable if needed.  only attempt on SQLServer
                if (realTable.getSqlDialect().isSqlServer())
                {
                    if (!"demographics".equalsIgnoreCase(d.getName()))
                    {
                        PropertyStorageSpec.Index[] idxToDisable = new PropertyStorageSpec.Index[]{
                                new PropertyStorageSpec.Index(false, "participantsequencenum"),
                                new PropertyStorageSpec.Index(false, "qcstate")
                        };

                        for (PropertyStorageSpec.Index toDisable : idxToDisable)
                        {
                            String idxName = AliasManager.makeLegalName(tableName + '_' + StringUtils.join(toDisable.columnNames, "_"), DbScope.getLabKeyScope().getSqlDialect());
                            if (doesIndexExist(realTable.getSchema(), tableName, idxName))
                            {
                                messages.add("will disable index: " + tableName + "." + idxName);
                                if (commitChanges)
                                {
                                    new SqlExecutor(realTable.getSchema()).execute(new SQLFragment("ALTER INDEX " + idxName + " ON studydataset." + tableName + " DISABLE"));
                                }
                            }
                            else
                            {
                                _log.warn("unable to find index: " + tableName + "." + idxName);
                                String indexName = getIndexName(realTable.getSqlDialect(), tableName, toDisable.columnNames);
                                if (doesIndexExist(realTable.getSchema(), tableName, indexName))
                                {
                                    messages.add("will disable index: " + tableName + "." + indexName);
                                    if (commitChanges)
                                    {
                                        new SqlExecutor(realTable.getSchema()).execute(new SQLFragment("ALTER INDEX " + indexName + " ON studydataset." + tableName + " DISABLE"));
                                    }
                                }
                                else
                                {
                                    _log.warn("unable to find index: " + tableName + "." + indexName);
                                }
                            }
                        }
                    }
                }
            }

            createEHRLookupIndexes(messages, commitChanges, rebuildIndexes);

            //increase length of encounters remark col
            if (commitChanges && DbScope.getLabKeyScope().getSqlDialect().isSqlServer())
            {
                for (String label : new String[]{"Clinical Encounters", "Gross Findings"})
                {
                    Dataset ds = study.getDatasetByLabel(label);
                    if (ds != null)
                    {
                        _log.info("increasing size of remark column for dataset: " + label);
                        SQLFragment sql = new SQLFragment("ALTER TABLE studydataset." + ds.getDomain().getStorageTableName() + " ALTER COLUMN remark NVARCHAR(max);");
                        SqlExecutor se = new SqlExecutor(DbScope.getLabKeyScope());
                        se.execute(sql);
                    }
                }
            }

            transaction.commit();

            Introspector.flushCaches();
            CacheManager.clearAllKnownCaches();
        }
        catch (SQLException e)
        {
            throw new RuntimeSQLException(e);

        }
        catch (ChangePropertyDescriptorException e)
        {
            throw new RuntimeException(e);
        }

        return messages;
    }

    //only sqlserver enterprise edition supports index compression.  team city is not enterprise
    private boolean isEnterpriseEdition(DbSchema schema)
    {
        SqlSelector ss = new SqlSelector(schema, new SQLFragment("select serverproperty('Edition')"));

        return ss.getObject(String.class).contains("Enterprise");
    }

    private String getIndexName(SqlDialect dialect, String tableName, String[] indexCols)
    {
        List<String> cols = new ArrayList<>();
        String[] includedCols = null;
        Map<String, String> directionMap = new HashMap<>();

        for (String name : indexCols)
        {
            String[] tokens = name.split(":");
            if (tokens[0].equalsIgnoreCase("include"))
            {
                if (tokens.length > 1)
                {
                    includedCols = tokens[1].split(",");
                }
            }
            else
            {
                cols.add(tokens[0]);
                if (tokens.length > 1)
                    directionMap.put(tokens[0], tokens[1]);
            }
        }

        String indexName = tableName + "_" + StringUtils.join(cols, "_");
        if (includedCols != null && dialect.isSqlServer())
        {
            indexName += "_include_" + StringUtils.join(includedCols, "_");
        }

        return indexName;
    }

    private void createEHRLookupIndexes(List<String> messages, boolean commitChanges, boolean rebuildIndexes) throws SQLException
    {
        DbSchema schema = DbSchema.get("ehr_lookups");
        TableInfo realTable = schema.getTable("flag_values");
        String indexName = "flag_values_container_category_objectid";
        List<String> cols = Arrays.asList("container", "category", "objectid");

        boolean exists = doesIndexExist(schema, "flag_values", indexName);

        if (commitChanges && (!exists || rebuildIndexes))
        {
            if (exists)
                dropIndex(schema, realTable, indexName, cols, indexName, messages);

            createIndex(schema, realTable, indexName, indexName, cols, new String[]{"value"}, messages);
        }
        else if ((!exists || rebuildIndexes))
        {
            if (exists)
                messages.add("Will drop index on column(s): container, category, objectid" + " for table: ehr_lookups.flag_values");

            messages.add("Will create index on column(s): container, category, objectid" + " for table: ehr_lookups.flag_values");
        }
    }

    private void createIndex(DbSchema schema, TableInfo realTable, String tableName, String indexName, List<String> columns, String[] includedCols, List<String> messages)
    {
        messages.add("Creating index on column(s): " + StringUtils.join(columns, ", ") + " for table: " + tableName);
        String sqlString = "CREATE INDEX " + indexName + " ON " + realTable.getSelectName() + "(" + StringUtils.join(columns, ", ") + ")";
        if (schema.getSqlDialect().isSqlServer() && isEnterpriseEdition(schema))
        {
            if (includedCols != null)
                sqlString += " INCLUDE (" + StringUtils.join(includedCols, ", ") + ") ";

            sqlString += " WITH (DATA_COMPRESSION = ROW)";
        }
        SQLFragment sql = new SQLFragment(sqlString);
        SqlExecutor se = new SqlExecutor(schema);
        se.execute(sql);
    }

    private boolean doesIndexExist(DbSchema schema, String tableName, String indexName) throws SQLException
    {
        Set<String> indexNames = new CaseInsensitiveHashSet();
        DatabaseMetaData meta = schema.getScope().getConnection().getMetaData();
        ResultSet rs = null;
        try
        {
            rs = meta.getIndexInfo(schema.getScope().getDatabaseName(), schema.getName(), tableName, false, false);
            while (rs.next())
            {
                indexNames.add(rs.getString("INDEX_NAME"));
            }
        }
        finally
        {
            ResultSetUtil.close(rs);
        }

        return indexNames.contains(indexName);
    }

    private void dropIndex(DbSchema schema, TableInfo realTable, String indexName, List<String> cols, String tableName, List<String> messages)
    {
        messages.add("Dropping index on column(s): " + StringUtils.join(cols, ", ") + " for dataset: " + tableName);
        String sqlString = "DROP INDEX " + indexName + " ON " + realTable.getSelectName();
        SQLFragment sql = new SQLFragment(sqlString);
        SqlExecutor se = new SqlExecutor(schema);
        se.execute(sql);
    }

    //the module's SQL scripts create indexes, but apparently only SQL server enterprise supports compression,
    //so this code will let admins compress them after the fact
    public void compressEHRSchemaIndexes()
    {
        if (!DbScope.getLabKeyScope().getSqlDialect().isSqlServer() && isEnterpriseEdition(EHRSchema.getInstance().getSchema()))
        {
            _log.error("Index compression on EHR can only be performed on SQL server currently.");
            return;
        }

        _log.info("Compressing indexes on select EHR schema tables");

        List<Pair<String, String[]>> names = new ArrayList<>();
        names.add(Pair.of("encounter_flags", new String[]{"objectid"}));
        names.add(Pair.of("encounter_flags", new String[]{"parentid"}));
        names.add(Pair.of("encounter_flags", new String[]{"id"}));

        names.add(Pair.of("encounter_participants", new String[]{"parentid"}));
        names.add(Pair.of("encounter_participants", new String[]{"id"}));
        names.add(Pair.of("encounter_participants", new String[]{"taskid"}));

        names.add(Pair.of("encounter_summaries", new String[]{"id"}));
        names.add(Pair.of("encounter_summaries", new String[]{"container", "objectid"}));
        names.add(Pair.of("encounter_summaries", new String[]{"container", "parentid"}));
        names.add(Pair.of("encounter_summaries", new String[]{"taskid"}));

        names.add(Pair.of("snomed_tags", new String[]{"taskid"}));
        names.add(Pair.of("snomed_tags", new String[]{"code", "container"}));

        names.add(Pair.of("treatment_times", new String[]{"container", "treatmentid"}));

        for (Pair<String, String[]> pair : names)
        {
            String table = pair.first;
            String indexName = table + "_" + StringUtils.join(pair.second, "_");
            rebuildIndex(table, indexName);
        }

        //clustered index does not follow other naming conventions
        rebuildIndex("snomed_tags", "CIDX_snomed_tags");
    }

    private void rebuildIndex(String table, String indexName)
    {
        DbSchema ehr = EHRSchema.getInstance().getSchema();
        SQLFragment sql = new SQLFragment("ALTER INDEX " + indexName + " ON ehr." + table + " REBUILD WITH (DATA_COMPRESSION = ROW);");
        SqlExecutor se = new SqlExecutor(ehr);
        se.execute(sql);
    }
    
    //NOTE: this assumes the property already exists
    private void updatePropertyURI(Domain d, PropertyDescriptor pd) throws SQLException
    {
        TableResultSet results = null;

        try
        {
            DbSchema expSchema = DbSchema.get(ExpSchema.SCHEMA_NAME);
            TableInfo propertyDomain = expSchema.getTable("propertydomain");
            TableInfo propertyDescriptor = expSchema.getTable("propertydescriptor");

            //find propertyId
            TableSelector ts = new TableSelector(propertyDescriptor, Collections.singleton("propertyid"), new SimpleFilter(FieldKey.fromString("PropertyURI"), pd.getPropertyURI()), null);
            Integer[] ids = ts.getArray(Integer.class);
            if (ids.length == 0)
            {
                throw new SQLException("Unknown propertyURI: " + pd.getPropertyURI());
            }
            int propertyId = ids[0];

            //first ensure the propertyURI exists
            SQLFragment sql = new SQLFragment("select propertyid from exp.propertydomain p where domainId = ? AND propertyid in (select propertyid from exp.propertydescriptor pd where pd.name " + (expSchema.getSqlDialect().isPostgreSQL() ? "ilike" : "like") + " ?)", d.getTypeId(), pd.getName());
            SqlSelector selector = new SqlSelector(expSchema.getScope(), sql);
            results = selector.getResultSet();

            List<Integer> oldIds = new ArrayList<>();
            while (results.next())
            {
                Map<String, Object> row = results.getRowMap();
                oldIds.add((Integer)row.get("propertyid"));
            }

            if (oldIds.size() == 0)
            {
                //this should not happen
                throw new SQLException("Unexpected: propertyId " + pd.getPropertyURI() + " does not exists for domain: " + d.getTypeURI());
            }

            if (oldIds.size() == 1 && oldIds.contains(propertyId))
            {
                //property ID already correct
                return;
            }

            SqlExecutor executor = new SqlExecutor(expSchema);

            if (oldIds.size() == 1)
            {
                //only 1 ID, but not using correct propertyURI
                String updateSql = "UPDATE exp.propertydomain SET propertyid = ? where domainId = ? AND propertyid = ?";
                long updated = executor.execute(updateSql, propertyId, d.getTypeId(), oldIds.get(0));

                PropertyDescriptor toDelete = OntologyManager.getPropertyDescriptor(oldIds.get(0));
                if (toDelete != null)
                {
                    PropertyService.get().deleteValidatorsAndFormats(toDelete.getContainer(), toDelete.getPropertyId());
                    OntologyManager.deletePropertyDescriptor(toDelete);
                }
            }
            else
            {
                //if more than 1 row exists, this means we have duplicate property descriptors
                SQLFragment selectSql = new SQLFragment("select min(sortorder) from exp.propertydomain p where domainId = ? AND propertyid in (select propertyid from exp.propertydescriptor pd where pd.name = ?");
                SqlSelector ss = new SqlSelector(expSchema.getScope(), selectSql);
                ResultSet resultSet = ss.getResultSet();
                Integer minSort = resultSet.getInt(0);

                String updateSql = "UPDATE exp.propertydomain SET propertyid = ? where domainId = ? AND propertyid IN ? AND sortorder = ?";
                executor.execute(updateSql, propertyId, d.getTypeId(), oldIds, minSort);

                oldIds.remove(propertyId);
                for (Integer id : oldIds)
                {
                    PropertyDescriptor toDelete = OntologyManager.getPropertyDescriptor(id);
                    if (toDelete != null)
                    {
                        PropertyService.get().deleteValidatorsAndFormats(toDelete.getContainer(), toDelete.getPropertyId());
                        OntologyManager.deletePropertyDescriptor(toDelete);
                    }
                }

                String deleteSql2 = "DELETE FROM exp.propertydomain WHERE propertyid != ? AND domainId = ? AND propertyid IN ? AND sortorder != ?";
                executor.execute(deleteSql2, propertyId, d.getTypeId(), oldIds, minSort);
            }
        }
        finally
        {
            ResultSetUtil.close(results);
        }
    }

    public Map<String, Map<String, Object>> getAnimalDetails(User u, Container c, String[] animalsIds, Set<String> extraSources)
    {
        Map<String, Map<String, Object>> ret = new HashMap<String, Map<String, Object>>();

        //first the basic information



        return ret;
    }

    public String getFormTypeForTask(Container c, User u, String taskId)
    {
        UserSchema us = QueryService.get().getUserSchema(u, c, EHRSchema.EHR_SCHEMANAME);
        if (us == null)
            return null;

        TableInfo ti = us.getTable(EHRSchema.TABLE_TASKS);
        if (ti == null)
            return null;

        TableSelector ts = new TableSelector(ti, Collections.singleton("formType"), new SimpleFilter(FieldKey.fromString("taskid"), taskId), null);
        String[] ret = ts.getArray(String.class);

        if (ret != null && ret.length == 1)
            return ret[0];

        return null;
    }

    public String getFormTypeForRequest(Container c, User u, String requestId)
    {
        UserSchema us = QueryService.get().getUserSchema(u, c, EHRSchema.EHR_SCHEMANAME);
        if (us == null)
            return null;

        TableInfo ti = us.getTable(EHRSchema.TABLE_REQUESTS);
        if (ti == null)
            return null;

        TableSelector ts = new TableSelector(ti, Collections.singleton("formType"), new SimpleFilter(FieldKey.fromString("taskid"), requestId), null);
        String[] ret = ts.getArray(String.class);

        if (ret != null && ret.length == 1)
            return ret[0];

        return null;
    }

    public int discardTask(Container c, User u, String taskId) throws SQLException
    {
        DataEntryForm def = getDataEntryFormForTask(c, u, taskId);

        int deleted = 0;
        for (final TableInfo ti : def.getTables())
        {
            SimpleFilter filter = new SimpleFilter(FieldKey.fromString("taskId"), taskId);
            final List<Map<String, Object>> keysToDelete = new ArrayList<>();
            final List<Map<String, Object>> requestsToQueue = new ArrayList<>();
            Set<String> colNames = new HashSet<>();
            colNames.addAll(ti.getPkColumnNames());
            if (ti.getColumn(FieldKey.fromString("requestid")) != null)
                colNames.add("requestid");

            // forEachMap is much more efficient than iterating ResultSet and calling ResultSetUtil.mapRow(rs)
            TableSelector ts = new TableSelector(ti, colNames, filter, null);
            ts.forEachMap(new Selector.ForEachBlock<Map<String, Object>>()
            {
                @Override
                public void exec(Map<String, Object> map) throws SQLException
                {
                    Map<String, Object> row = new CaseInsensitiveHashMap<>();
                    row.putAll(map);

                    if (row.containsKey("requestid") && row.get("requestid") != null)
                    {
                        row.put("requestid", null);
                        row.put("qcstate", null);
                        row.put("taskid", null);
                        row.put("qcstateLabel", "Request: Approved");

                        requestsToQueue.add(row);
                    }
                    else
                    {
                        keysToDelete.add(row);
                    }
                }
            });

            try
            {
                if (!keysToDelete.isEmpty())
                {
                    ti.getUpdateService().deleteRows(u, c, keysToDelete, null, new HashMap<String, Object>());
                }


                if (!requestsToQueue.isEmpty())
                {
                    ti.getUpdateService().updateRows(u, c, requestsToQueue, requestsToQueue, null, new HashMap<String, Object>());
                }
            }
            catch (InvalidKeyException e)
            {
                throw new RuntimeException(e);
            }
            catch (QueryUpdateServiceException e)
            {
                throw new RuntimeException(e);
            }
            catch (BatchValidationException e)
            {
                throw new RuntimeException(e);
            }
        }

        return deleted;
    }

    public DataEntryForm getDataEntryFormForTask(Container c, User u, String taskId)
    {
        String formType = EHRManager.get().getFormTypeForTask(c, u, taskId);
        if (formType == null)
        {
            throw new IllegalArgumentException("Unable to find formType for the task: " + taskId);
        }

        DataEntryForm def = DataEntryManager.get().getFormByName(formType, c, u);
        if (def == null)
        {
            throw new IllegalArgumentException("Unable to find form type for the name: " + formType);
        }

        return def;
    }

    public DataEntryForm getDataEntryFormForRequest(Container c, User u, String requestId)
    {
        String formType = EHRManager.get().getFormTypeForRequest(c, u, requestId);
        if (formType == null)
        {
            throw new IllegalArgumentException("Unable to find formType for the request: " + requestId);
        }

        DataEntryForm def = DataEntryManager.get().getFormByName(formType, c, u);
        if (def == null)
        {
            throw new IllegalArgumentException("Unable to find form type for the name: " + formType);
        }

        return def;
    }

    public boolean canDiscardTask(Container c, User u, String taskId, List<String> errorMsgs)
    {
        DataEntryForm def = getDataEntryFormForTask(c, u, taskId);

        Map<Integer, EHRQCState> qcStateMap = new HashMap<>();
        for (EHRQCState qc : EHRManager.get().getQCStates(c))
        {
            qcStateMap.put(qc.getRowId(), qc);
        }

        boolean hasPermission = true;
        Set<TableInfo> distinctTables = def.getTables();
        for (TableInfo ti : distinctTables)
        {
            if (ti.getColumn(FieldKey.fromString("qcstate")) != null && ti.getColumn(FieldKey.fromString("taskid")) != null)
            {
                SimpleFilter filter = new SimpleFilter(FieldKey.fromString("taskid"), taskId);
                TableSelector ts = new TableSelector(ti, Collections.singleton("qcstate"), filter, null);
                Set<Integer> distinctQcStates = new HashSet<>();
                distinctQcStates.addAll(Arrays.asList(ts.getArray(Integer.class)));
                for (Integer qc : distinctQcStates)
                {
                    EHRQCState q = qcStateMap.get(qc);
                    if (q != null)
                    {
                        if (!EHRSecurityManager.get().testPermission(u, ti, DeletePermission.class, q))
                        {
                            hasPermission = false;
                            errorMsgs.add("Insufficient permissions to delete record with QCState of: " + q.getLabel());
                            break;
                        }
                    }
                }
            }
        }

        return hasPermission;
    }

    public EHRQCState[] getQCStates(Container c)
    {
        SQLFragment sql = new SQLFragment("SELECT * FROM study.qcstate qc LEFT JOIN ehr.qcstatemetadata md ON (qc.label = md.QCStateLabel) WHERE qc.container = ?", c.getEntityId());
        DbSchema db = DbSchema.get("study");
        return new SqlSelector(db, sql).getArray(EHRQCStateImpl.class);
    }

    public Collection<String> ensureFlagActive(User u, Container c, String flag, Date date, @Nullable Date enddate, String remark, Collection<String> toTest, boolean livingAnimalsOnly) throws BatchValidationException
    {
        final List<String> animalIds = new ArrayList<>(toTest);

        TableInfo flagsTable = getEHRTable(c, u, "study", "flags");
        if (flagsTable == null)
        {
            throw new IllegalArgumentException("Unable to find flags table in container: " + c.getPath());
        }

        //find animals already with this flag on this date
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("flag"), flag);
        filter.addCondition(FieldKey.fromString("Id"), animalIds, CompareType.IN);
        //note: this is done to accommodate future dates, since enddateCoalesced would convert open-ended records to today
        filter.addClause(new SimpleFilter.OrClause(
            new CompareType.CompareClause(FieldKey.fromString("enddate"), CompareType.DATE_GTE, date),
            new CompareType.CompareClause(FieldKey.fromString("enddate"), CompareType.ISBLANK, null)
        ));
        filter.addCondition(FieldKey.fromString("date"), date, CompareType.DATE_LTE);

        TableSelector ts =  new TableSelector(flagsTable, PageFlowUtil.set("lsid", "Id", "date", "enddate", "remark"), filter, null);
        ts.forEach(new Selector.ForEachBlock<ResultSet>()
        {
            @Override
            public void exec(ResultSet rs) throws SQLException
            {
                animalIds.remove(rs.getString("Id"));
            }
        });

        TableInfo ti = getEHRTable(c, u, "study", "demographics");

        //limit to IDs present at the center
        if (livingAnimalsOnly)
        {
            SimpleFilter filter2 = new SimpleFilter(FieldKey.fromString("Id"), animalIds, CompareType.IN);
            filter2.addCondition(FieldKey.fromString("calculated_status"), "Alive", CompareType.EQUAL);
            TableSelector demographics = new TableSelector(ti, PageFlowUtil.set("Id"), filter2, null);

            animalIds.retainAll(demographics.getCollection(String.class));
        }

        try
        {
            //then insert rows
            List<Map<String, Object>> rows = new ArrayList<>();
            for (String animal : animalIds)
            {
                Map<String, Object> row = new CaseInsensitiveHashMap<>();
                row.put("Id", animal);
                row.put("date", date);
                if (enddate != null)
                {
                    row.put("enddate", enddate);
                }
                row.put("remark", remark);
                row.put("flag", flag);
                row.put("performedby", u.getDisplayName(u));

                rows.add(row);
            }

            BatchValidationException errors = new BatchValidationException();
            if (rows.size() > 0)
                flagsTable.getUpdateService().insertRows(u, flagsTable.getUserSchema().getContainer(), rows, errors, null, getExtraContext());

            if (errors.hasErrors())
                throw errors;

            return animalIds;
        }
        catch (QueryUpdateServiceException | DuplicateKeyException e)
        {
            _log.error("problem adding flags", e);
            throw new RuntimeException(e);
        }
        catch (SQLException e)
        {
            _log.error("problem adding flags", e);
            throw new RuntimeSQLException(e);
        }
    }

    private TableInfo getEHRTable(Container c, User u, String schema, String query)
    {
        Container ehrContainer = EHRService.get().getEHRStudyContainer(c);
        if (ehrContainer != null)
        {
            UserSchema us = QueryService.get().getUserSchema(u, ehrContainer, schema);
            if (us == null)
            {
                return null;
            }

            return us.getTable(query);
        }

        return null;
    }

    public Collection<String> terminateFlagsIfExists(User u, Container c, String flag, final Date enddate, Collection<String> animalIds)
    {
        TableInfo flagsTable = getEHRTable(c, u, "study", "flags");
        if (flagsTable == null)
        {
            throw new IllegalArgumentException("Unable to find flags table in container: " + c.getPath());
        }

        final List<Map<String, Object>> rows = new ArrayList<>();
        final List<Map<String, Object>> oldKeys = new ArrayList<>();
        final Set<String> distinctIds = new HashSet<>();

        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("flag"), flag);
        filter.addCondition(FieldKey.fromString("Id"), animalIds, CompareType.IN);
        filter.addCondition(FieldKey.fromString("isActive"), true);
        TableSelector ts = new TableSelector(flagsTable, PageFlowUtil.set("lsid", "Id", "date", "enddate", "remark"), filter, null);
        ts.forEach(new Selector.ForEachBlock<ResultSet>()
        {
            @Override
            public void exec(ResultSet rs) throws SQLException
            {
                Map<String, Object> row = new CaseInsensitiveHashMap<>();
                row.put("enddate", enddate);
                rows.add(row);

                Map<String, Object> keys = new CaseInsensitiveHashMap<>();
                keys.put("lsid", rs.getString("lsid"));
                oldKeys.add(keys);

                distinctIds.add(rs.getString("Id"));
            }
        });

        try
        {
            if (rows.size() > 0)
                flagsTable.getUpdateService().updateRows(u, flagsTable.getUserSchema().getContainer(), rows, oldKeys, null, getExtraContext());

            return distinctIds;
        }
        catch (InvalidKeyException e)
        {
            throw new RuntimeException(e);
        }
        catch (BatchValidationException e)
        {
            throw new RuntimeException(e);
        }
        catch (QueryUpdateServiceException e)
        {
            throw new RuntimeException(e);
        }
        catch (SQLException e)
        {
            throw new RuntimeSQLException(e);
        }
    }

    public Map<String, Object> getExtraContext()
    {
        Map<String, Object> map = new HashMap<String, Object>();
        map.put("quickValidation", true);
        map.put("generatedByServer", true);

        return map;
    }
}
