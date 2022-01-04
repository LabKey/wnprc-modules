/*
 * Copyright (c) 2020 LabKey Corporation
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

package org.labkey.wnprc_purchasing;

import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.module.DefaultModule;
import org.labkey.api.module.FolderTypeManager;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleContext;
import org.labkey.api.query.DefaultSchema;
import org.labkey.api.query.QuerySchema;
import org.labkey.api.security.roles.RoleManager;
import org.labkey.api.util.emailTemplate.EmailTemplateService;
import org.labkey.api.view.WebPartFactory;
import org.labkey.wnprc_purchasing.security.WNPRC_PurchasingDirectorRole;

import java.util.Collection;
import java.util.Collections;
import java.util.Set;

public class WNPRC_PurchasingModule extends DefaultModule
{
    public static final String NAME = "WNPRC_Purchasing";

    @Override
    public String getName()
    {
        return NAME;
    }

    @Override
    public @Nullable Double getSchemaVersion()
    {
        return 22.000;
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
        addController(WNPRC_PurchasingController.NAME, WNPRC_PurchasingController.class);
        EmailTemplateService.get().registerTemplate(NewRequestEmailTemplate.class);
        EmailTemplateService.get().registerTemplate(RequestStatusChangeEmailTemplate.class);
        EmailTemplateService.get().registerTemplate(LineItemChangeEmailTemplate.class);
        RoleManager.registerRole(new WNPRC_PurchasingDirectorRole());
    }

    @Override
    public void doStartup(ModuleContext moduleContext)
    {
        // add a container listener so we'll know when our container is deleted:
        ContainerManager.addContainerListener(new WNPRC_PurchasingContainerListener());

        FolderTypeManager.get().registerFolderType(this, new WNPRC_PurchasingFolderType(this));

        DefaultSchema.registerProvider(WNPRC_PurchasingSchema.NAME, new DefaultSchema.SchemaProvider(this)
        {
            @Override
            public QuerySchema createSchema(final DefaultSchema schema, Module module)
            {
                return new WNPRC_PurchasingUserSchema(WNPRC_PurchasingSchema.NAME, schema.getUser(), schema.getContainer());
            }
        });
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
        return Collections.singleton(WNPRC_PurchasingSchema.NAME);
    }
}