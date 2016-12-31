package org.labkey.webutils;

import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.module.DefaultModule;
import org.labkey.api.module.ModuleContext;
import org.labkey.api.view.WebPartFactory;
import org.labkey.webutils.api.WebUtilsService;

import java.util.Collection;
import java.util.Collections;
import java.util.Set;

public class WebUtilsModule extends DefaultModule {
    public static final String NAME = "WebUtils";

    @Override
    public String getName()
    {
        return NAME;
    }

    @Override
    public double getVersion()
    {
        return 15.2;
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
    protected void init() {
        addController(WebUtilsController.NAME, WebUtilsController.class);

        WebUtilsService.setInstance(new WebUtilsServiceImpl());

    }

    @Override
    public void doStartup(ModuleContext moduleContext) {
        // add a container listener so we'll know when our container is deleted:
        ContainerManager.addContainerListener(new WebUtilsContainerListener());
    }

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
        return Collections.singleton(WebUtilsSchema.NAME);
    }
}