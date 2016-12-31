/*
 * Copyright (c) 2013-2016 LabKey Corporation
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
package org.labkey.api.ehr.dataentry;

import org.json.JSONObject;
import org.labkey.api.data.TableInfo;
import org.labkey.api.security.permissions.Permission;
import org.labkey.api.util.Pair;
import org.labkey.api.view.template.ClientDependency;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * User: bimber
 * Date: 4/27/13
 * Time: 8:36 AM
 */
public interface FormSection
{
    abstract public String getName();

    abstract public String getLabel();

    abstract public String getXtype();

    abstract public String getClientModelClass();

    abstract public boolean hasPermission(DataEntryFormContext ctx, Class<? extends Permission> perm);

    abstract public Set<Pair<String, String>> getTableNames();

    abstract public Set<TableInfo> getTables(DataEntryFormContext ctx);

    abstract public JSONObject toJSON(DataEntryFormContext ctx, boolean includeFormElements);

    abstract public LinkedHashSet<ClientDependency> getClientDependencies();

    abstract public void setConfigSources(List<String> configSources);

    abstract public void addConfigSource(String source);

    abstract public void addClientDependency(ClientDependency cd);

    abstract public void setShowSaveTemplateForAll(Boolean showSaveTemplateForAll);

    abstract public void setTemplateMode(AbstractFormSection.TEMPLATE_MODE mode);
}
