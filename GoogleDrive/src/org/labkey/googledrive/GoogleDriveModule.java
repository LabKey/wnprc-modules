package org.labkey.googledrive;

import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.ldk.ExtendedSimpleModule;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.query.DefaultSchema;
import org.labkey.api.query.QuerySchema;
import org.labkey.api.view.WebPartFactory;
import org.labkey.googledrive.api.GoogleDriveService;

import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

public class GoogleDriveModule extends ExtendedSimpleModule {
    @Override
    @NotNull
    protected Collection<WebPartFactory> createWebPartFactories() {
        return Collections.emptyList();
    }

    @Override
    protected void init() {
        addController(GoogleDriveController.NAME, GoogleDriveController.class);

        GoogleDriveService.set(new GoogleDriveServiceImpl());

        Container home = ContainerManager.getHomeContainer();

        // Ensure that we're enabled in the home module, since we'll use that for our queries.
        if (ModuleLoader.getInstance().shouldInsertData())
        {
            Set<Module> homeModules = new HashSet<>(home.getActiveModules());
            if (!homeModules.contains(this))
            {
                homeModules.add(this);
                home.setActiveModules(homeModules);
            }
        }
    }

    @Override
    @NotNull
    public Collection<String> getSummary(Container c) {
        return Collections.emptyList();
    }

    @Override
    @NotNull
    public Set<String> getSchemaNames() {
        return Collections.singleton(GoogleDriveSchema.NAME);
    }

    @Override
    public void registerSchemas() {
        DefaultSchema.registerProvider(GoogleDriveSchema.NAME, new DefaultSchema.SchemaProvider(this) {
            @Override
            public QuerySchema createSchema(final DefaultSchema schema, Module module) {
                return new GoogleDriveSchema(schema.getUser(), schema.getContainer());
            }
        });
    }
}