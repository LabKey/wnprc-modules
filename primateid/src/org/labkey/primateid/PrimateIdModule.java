/*
 * Copyright (c) 2018-2026 Board of Regents of the University of Wisconsin System
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
package org.labkey.primateid;

import org.labkey.api.ehr.EHRService;
import org.labkey.api.ldk.ExtendedSimpleModule;
import org.labkey.api.module.ModuleContext;

public class PrimateIdModule extends ExtendedSimpleModule
{
    @Override
    protected void doStartupAfterSpringConfig(ModuleContext moduleContext)
    {
        super.doStartupAfterSpringConfig(moduleContext);

        EHRService ehr = EHRService.get();
        ehr.registerModule(this);
        ehr.registerTriggerScript(this, getModuleResource("/scripts/primateid/triggers.js"));
    }

    @Override
    public boolean hasScripts()
    {
        return true;
    }
}