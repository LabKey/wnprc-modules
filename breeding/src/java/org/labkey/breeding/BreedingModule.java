package org.labkey.breeding;

import org.jetbrains.annotations.NotNull;
import org.labkey.api.module.DefaultModule;
import org.labkey.api.module.ModuleContext;
import org.labkey.api.view.WebPartFactory;

import java.util.Collection;
import java.util.Collections;

public class BreedingModule extends DefaultModule
{
    @Override
    protected void init()
    {
        addController(BreedingController.NAME, BreedingController.class);
    }

    @Override
    protected @NotNull Collection<? extends WebPartFactory> createWebPartFactories()
    {
        return Collections.emptyList();
    }

    @Override
    public boolean hasScripts()
    {
        return false;
    }

    @Override
    protected void doStartup(ModuleContext moduleContext)
    {
        // no-op
    }

    @Override
    public @NotNull Collection<String> getSchemaNames()
    {
        return Collections.emptyList();
    }
}
