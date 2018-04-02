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