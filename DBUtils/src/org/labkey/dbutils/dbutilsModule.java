package org.labkey.dbutils;

import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.ldk.ExtendedSimpleModule;
import org.labkey.api.module.DefaultModule;
import org.labkey.api.module.ModuleContext;
import org.labkey.api.view.WebPartFactory;

import java.util.Collection;
import java.util.Collections;
import java.util.Set;

public class dbutilsModule extends ExtendedSimpleModule {
    public static final String NAME = "dbutils";
    public static final String SCHEMA_NAME = NAME;

    @Override
    public String getName() {
        return NAME;
    }

    @Override
    public double getVersion() {
        return 15.11;
    }

    @Override
    public boolean hasScripts() { return false; }

    @Override
    @NotNull
    protected Collection<WebPartFactory> createWebPartFactories() {
        return Collections.emptyList();
    }

    @Override
    protected void init() {
        addController(dbutilsController.NAME, dbutilsController.class);
    }

    @Override
    public void doStartupAfterSpringConfig(ModuleContext moduleContext) {}

    @Override
    @NotNull
    public Set<String> getSchemaNames() {
        return Collections.emptySet();
    }
}