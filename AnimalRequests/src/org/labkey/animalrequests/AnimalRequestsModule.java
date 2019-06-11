package org.labkey.animalrequests;

import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.module.DefaultModule;
import org.labkey.api.module.ModuleContext;
import org.labkey.api.resource.Resource;
import org.labkey.api.view.WebPartFactory;
//import org.labkey.api.ehr.EHRService;

import java.util.Collection;
import java.util.Collections;
import java.util.Set;

public class AnimalRequestsModule extends DefaultModule
{
    public static final String NAME = "AnimalRequests";

    @Override
    public String getName()
    {
        return NAME;
    }

    @Override
    public double getVersion()
    {
        return 17.21;
    }

    @Override
    public boolean hasScripts()
    {
        return true;
    }

    @Override
    @NotNull
    protected Collection<WebPartFactory> createWebPartFactories()
    {
        return Collections.emptyList();
    }

    @Override
    protected void init()
    {
        addController(AnimalRequestsController.NAME, AnimalRequestsController.class);
    }

    @Override
    public void doStartup(ModuleContext moduleContext)
    {
        // add a container listener so we'll know when our container is deleted:
        ContainerManager.addContainerListener(new AnimalRequestsContainerListener());
    }

//    @Override
//    protected void doStartupAfterSpringConfig(ModuleContext moduleContext)
//    {
//        EHRService.get().registerModule(this);
//        EHRService.get().registerTableCustomizer(this, WNPRC_EHRCustomizer.class);
//        Resource r = getModuleResource("/scripts/wnprc_ehr/");
//        assert r != null;
//        EHRService.get().registerTriggerScript(this, r);
//    };

    @Override
    @NotNull
    public Collection<String> getSummary(Container c)
    {
        return Collections.emptyList();
    }

    @Override
    @NotNull
    public Set<String> getSchemaNames()
    {
        return Collections.singleton(AnimalRequestsSchema.NAME);
    }
}
