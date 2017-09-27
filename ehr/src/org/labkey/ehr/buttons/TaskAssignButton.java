/*
 * Copyright (c) 2013-2014 LabKey Corporation
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
import org.labkey.api.ehr.security.EHRDataEntryPermission;
import org.labkey.api.ldk.table.SimpleButtonConfigFactory;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;

/**
 * User: bimber
 * Date: 8/2/13
 * Time: 12:26 PM
 */
public class TaskAssignButton extends SimpleButtonConfigFactory
{
    public TaskAssignButton(Module owner)
    {
        super(owner, "Assign Tasks", "EHR.window.TaskAssignWindow.buttonHandler(dataRegionName);");
        setClientDependencies(ClientDependency.fromPath("ehr/window/TaskAssignWindow.js"));
    }

    public boolean isAvailable(TableInfo ti)
    {
        return super.isAvailable(ti) && ti.getUserSchema().getContainer().hasPermission(ti.getUserSchema().getUser(), EHRDataEntryPermission.class);
    }
}

