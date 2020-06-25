package org.labkey.wnprc_compliance;

import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.Container;
import org.labkey.api.ldk.ExtendedSimpleModule;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleContext;
import org.labkey.api.query.DefaultSchema;
import org.labkey.api.query.QuerySchema;
import org.labkey.api.security.roles.RoleManager;
import org.labkey.api.view.WebPartFactory;
import org.labkey.wnprc_compliance.security.ComplianceAdminPermission;
import org.labkey.wnprc_compliance.security.ComplianceAdminRole;

import java.util.Collection;
import java.util.Collections;
import java.util.Set;

public class WNPRC_ComplianceModule extends ExtendedSimpleModule {
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
        addController(WNPRC_ComplianceController.NAME, WNPRC_ComplianceController.class);
        RoleManager.registerPermission(new ComplianceAdminPermission());
        RoleManager.registerRole(new ComplianceAdminRole());
    }

    @Override
    @NotNull
    public Collection<String> getSummary(Container c) {
        return Collections.emptyList();
    }

    @Override
    @NotNull
    public Set<String> getSchemaNames() {
        return Collections.singleton(WNPRC_ComplianceSchema.NAME);
    }

    @Override
    public void registerSchemas() {
        DefaultSchema.registerProvider(WNPRC_ComplianceSchema.NAME, new DefaultSchema.SchemaProvider(this) {
            @Override
            public QuerySchema createSchema(final DefaultSchema schema, Module module) {
                return (QuerySchema) new WNPRC_ComplianceSchema(schema.getUser(), schema.getContainer());
            }
        });
    }
}