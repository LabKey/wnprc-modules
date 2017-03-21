package org.labkey.dbutils;

import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.ldk.ExtendedSimpleModule;
import org.labkey.api.module.DefaultModule;
import org.labkey.api.module.ModuleContext;
import org.labkey.api.view.WebPartFactory;
import sun.reflect.generics.reflectiveObjects.NotImplementedException;

import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

public class dbutilsModule extends ExtendedSimpleModule {
    @Override
    public boolean hasScripts() { return true; }

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
        Set<String> schemaNames = new HashSet<>();
        schemaNames.add("dbutils");
        return schemaNames;
    }

    public Container getPrivateContainer() {
        throw new NotImplementedException();
    }

    public Container getPrivateFilesContainer() {
        throw new NotImplementedException();
    }
}