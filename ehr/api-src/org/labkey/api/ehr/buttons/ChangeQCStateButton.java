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
package org.labkey.api.ehr.buttons;

import org.jetbrains.annotations.Nullable;
import org.labkey.api.data.TableInfo;
import org.labkey.api.ehr.security.EHRRequestAdminPermission;
import org.labkey.api.ldk.table.SimpleButtonConfigFactory;
import org.labkey.api.module.Module;
import org.labkey.api.security.permissions.Permission;
import org.labkey.api.study.DatasetTable;
import org.labkey.api.view.template.ClientDependency;

import java.util.Collections;
import java.util.Set;

/**
 * User: bimber
 * Date: 8/2/13
 * Time: 12:26 PM
 */
public class ChangeQCStateButton extends SimpleButtonConfigFactory
{
    public ChangeQCStateButton(Module owner)
    {
        this(owner, "EHR.window.ChangeRequestStatusWindow", Collections.singleton(ClientDependency.fromPath("ehr/window/ChangeRequestStatusWindow.js")));
    }

    public ChangeQCStateButton(Module owner, @Nullable String jsClass, @Nullable Set<ClientDependency> clientDependencies)
    {
        this(owner, "Change Request Status", jsClass, clientDependencies);
    }

    public ChangeQCStateButton(Module owner, String text, @Nullable String jsClass, @Nullable Set<ClientDependency> clientDependencies)
    {
        super(owner, text, "EHR.window.ChangeRequestStatusWindow.changeQCStateHandler(dataRegionName, '" + jsClass + "');");

        if (clientDependencies != null)
        {
            setClientDependencies(clientDependencies);
        }
    }

    public boolean isAvailable(TableInfo ti)
    {
        if (!super.isAvailable(ti))
            return false;

        if (ti instanceof DatasetTable)
        {
            Set<Class<? extends Permission>> perms = ((DatasetTable) ti).getDataset().getPermissions(ti.getUserSchema().getUser());
            return perms.contains(EHRRequestAdminPermission.class);
        }

        return ti.hasPermission(ti.getUserSchema().getUser(), EHRRequestAdminPermission.class);
    }
}

