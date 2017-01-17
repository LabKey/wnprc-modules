package org.labkey.googledrive;

import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.Container;
import org.labkey.api.ldk.ExtendedSimpleModule;
import org.labkey.api.module.Module;
import org.labkey.api.query.DefaultSchema;
import org.labkey.api.query.QuerySchema;
import org.labkey.api.view.WebPartFactory;
import org.labkey.googledrive.api.GoogleDriveService;

import java.util.Collection;
import java.util.Collections;
import java.util.Set;

public class GoogleDriveModule extends ExtendedSimpleModule {
    @Override
    public boolean hasScripts() {
        return true;
    }

    @Override
    @NotNull
    protected Collection<WebPartFactory> createWebPartFactories() {
        return Collections.emptyList();
    }

    @Override
    protected void init() {
        addController(GoogleDriveController.NAME, GoogleDriveController.class);

        GoogleDriveService.set(new GoogleDriveServiceImpl());
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
            public QuerySchema createSchema(final DefaultSchema schema, Module module) {
                return (QuerySchema) new GoogleDriveSchema(schema.getUser(), schema.getContainer());
            }
        });
    }
}