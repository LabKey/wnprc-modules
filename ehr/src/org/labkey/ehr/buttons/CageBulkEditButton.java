/*
 * Copyright (c) 2014 LabKey Corporation
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
package org.labkey.ehr.buttons;

import org.labkey.api.data.TableInfo;
import org.labkey.api.ehr.security.EHRLocationEditPermission;
import org.labkey.api.ldk.table.SimpleButtonConfigFactory;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;

import java.util.LinkedHashSet;

/**

 */
public class CageBulkEditButton extends SimpleButtonConfigFactory
{
    public CageBulkEditButton(Module owner)
    {
        super(owner, "Bulk Edit Cage/Divider Types", "EHR.window.BulkEditCageTypeWindow.buttonHandler(dataRegionName);");

        LinkedHashSet cds = new LinkedHashSet<ClientDependency>();
        cds.add(ClientDependency.fromModuleName("ehr"));
        cds.add(ClientDependency.fromPath("ehr/window/BulkEditCageTypeWindow.js"));
        setClientDependencies(cds);
    }

    @Override
    public boolean isAvailable(TableInfo ti)
    {
        if (!super.isAvailable(ti))
            return false;

        if (!ti.getUserSchema().getContainer().hasPermission(ti.getUserSchema().getUser(), EHRLocationEditPermission.class))
            return false;

        return true;
    }
}
