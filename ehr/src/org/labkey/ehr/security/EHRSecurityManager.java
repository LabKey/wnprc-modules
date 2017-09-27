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
package org.labkey.ehr.security;

import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.Container;
import org.labkey.api.data.TableInfo;
import org.labkey.api.ehr.EHRQCState;
import org.labkey.api.ehr.EHRService;
import org.labkey.api.security.SecurableResource;
import org.labkey.api.security.SecurityPolicy;
import org.labkey.api.security.SecurityPolicyManager;
import org.labkey.api.security.User;
import org.labkey.api.security.permissions.DeletePermission;
import org.labkey.api.security.permissions.InsertPermission;
import org.labkey.api.security.permissions.Permission;
import org.labkey.api.security.permissions.UpdatePermission;
import org.labkey.api.study.Dataset;
import org.labkey.api.study.DatasetTable;
import org.labkey.api.study.Study;
import org.labkey.api.study.StudyService;
import org.labkey.ehr.EHRManager;
import org.labkey.ehr.dataentry.DataEntryManager;

import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * User: bimber
 * Date: 8/21/13
 * Time: 6:52 AM
 */
public class EHRSecurityManager
{
    private static final EHRSecurityManager _instance = new EHRSecurityManager();
    private static final String QCSTATE_CACHE_ID = "qcstates";

    private EHRSecurityManager()
    {

    }

    public static EHRSecurityManager get()
    {
        return _instance;
    }

    public void primeCache(Container c)
    {
        Study s = StudyService.get().getStudy(c);
        if (s != null)
        {
            getDatasets(s);
        }

        getQCStateInfo(c);
    }

    public boolean testPermission (User u, TableInfo ti, Class<? extends Permission> perm, EHRQCState qcState)
    {
        if (ti instanceof DatasetTable)
        {
            SecurableResource sr = ((DatasetTable)ti).getDataset();
            return testPermission(u, sr, perm, qcState);
        }
        else
        {
            return ti.hasPermission(u, perm);
        }
    }

    public boolean testPermission (User u, SecurableResource resource, Class<? extends Permission> perm, EHRQCState qcState)
    {
        Collection<Class<? extends Permission>> permissions;
        String className = getPermissionClassName(perm, qcState);

        //NOTE: See getResourceProps() in SecurityApiActions for notes on this hack
        if (resource instanceof Dataset)
        {
            Dataset ds = (Dataset)resource;
            permissions = ds.getPermissions(u);
        }
        else
        {
            SecurityPolicy policy = SecurityPolicyManager.getPolicy(resource);
            permissions = policy.getPermissions(u);
        }

        for (Class<? extends Permission> p : permissions)
        {
            if (p.getName().equals(className))
                return true;
        }

        return false;
    }

    public String getPermissionClassName(Class<? extends Permission> perm, EHRQCState qc)
    {
        //TODO: this is a little ugly
        String permString = perm.getCanonicalName().replaceAll(perm.getPackage().getName() + "\\.", "");
        String qcString = qc.getLabel().replaceAll("[^a-zA-Z0-9-]", "");
        return EHRManager.SECURITY_PACKAGE + ".EHR" + qcString + permString;
    }

    public boolean hasPermission(Container c, User u, String schemaName, String queryName, EVENT_TYPE event, String originalQCState, String targetQCState)
    {
        Map<String, EHRQCState> qcStates = getQCStateInfo(c);

        SecurableResource sr = getSecurableResource(c, u, schemaName, queryName);
        EHRQCState targetQC = qcStates.get(targetQCState);
        if (targetQC == null)
        {
            //_log.warn("Unknown target QCState: " + targetQCState);
            return false;
        }

        EHRQCState originalQC = null;
        if (originalQCState != null)
        {
            originalQC = qcStates.get(originalQCState);
            if (originalQC == null)
            {
                //_log.warn("Unknown original QCState: " + originalQCState);
                return false;
            }
        }

        //NOTE: currently we only test per-table permissions on study
        if (sr == null)
            return true;

        if (event.equals(EVENT_TYPE.update))
        {
            //test update on oldQC, plus insert on new QC
            if (originalQCState != null)
            {
                if (!EHRSecurityManager.get().testPermission(u, sr, UpdatePermission.class, originalQC))
                {
                    //_log.warn("Attempting to update a record with QCState of " + originalQC + " without permission in table: " + schemaName + "." + queryName);
                    return false;
                }
            }

            //we only need to test insert if the new QCState is different from the old one
            if (!targetQCState.equals(originalQCState))
            {
                if (!EHRSecurityManager.get().testPermission(u, sr, InsertPermission.class, targetQC))
                {
                    //_log.warn("Attempting to update a to a QCState of " + targetQCState + " without permission in table: " + schemaName + "." + queryName);
                    return false;
                }
            }
        }
        else
        {
            if (!EHRSecurityManager.get().testPermission(u, sr, event.perm, targetQC))
            {
                //_log.warn("Attempting to " + event.name() + " a record with QCState of " + targetQC + " without permission in table: " + schemaName + "." + queryName);
                return false;
            }
        }

        return true;
    }

    public static enum EVENT_TYPE {
        insert(InsertPermission.class),
        update(UpdatePermission.class),
        delete(DeletePermission.class);

        EVENT_TYPE(Class<? extends Permission> perm)
        {
            this.perm = perm;
        }

        public Class<? extends Permission> perm;
    }

    //internally cache datasets by container
    private List<? extends Dataset> getDatasets(Study s)
    {
        String cacheKey = EHRSecurityManager.class.getName() + "||studyDatasets||" + s.getContainer().getId();
        List<? extends Dataset> datasets = (List<Dataset>) DataEntryManager.get().getCache().get(cacheKey);
        if (datasets != null)
        {
            return datasets;
        }

        datasets = s.getDatasets();
        DataEntryManager.get().getCache().put(cacheKey, datasets);
        return datasets;
    }

    public SecurableResource getSecurableResource(Container c, User u, String schemaName, String queryName)
    {
        if ("study".equalsIgnoreCase(schemaName))
        {
            Study s = StudyService.get().getStudy(c);
            if (s == null)
                return null;

            for (Dataset sr : getDatasets(s))
            {
                if (sr.getLabel().equalsIgnoreCase(queryName) || sr.getName().equalsIgnoreCase(queryName))
                {
                    return sr;
                }
            }
        }
        return null;
    }

    @NotNull
    public Map<String, EHRQCState> getQCStateInfo(Container c)
    {
        Container targetContainer = EHRService.get().getEHRStudyContainer(c);
        if (targetContainer == null)
            return Collections.emptyMap();

        Study study = StudyService.get().getStudy(targetContainer);
        if (study == null)
            return Collections.emptyMap();

        String cacheKey = getCacheKey(study, QCSTATE_CACHE_ID);
        Map<String, EHRQCState> qcStates = (Map<String, EHRQCState>) DataEntryManager.get().getCache().get(cacheKey);
        if (qcStates != null)
            return qcStates;

        qcStates = new HashMap<>();
        for (EHRQCState qc : EHRManager.get().getQCStates(study.getContainer()))
        {
            qcStates.put(qc.getLabel(), qc);
        }

        DataEntryManager.get().getCache().put(getCacheKey(study, QCSTATE_CACHE_ID), qcStates);

        return qcStates;
    }

    private String getCacheKey(Study s, String suffix)
    {
        return getClass().getName() + "||" + s.getEntityId() + "||" + suffix;
    }
}
