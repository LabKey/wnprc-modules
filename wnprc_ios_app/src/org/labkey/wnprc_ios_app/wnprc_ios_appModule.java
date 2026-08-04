/*
 * Copyright (c) 2025 LabKey Corporation
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

package org.labkey.wnprc_ios_app;

import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.DbSchemaType;
//import org.labkey.api.ehr.EHRService;
import org.labkey.api.module.DefaultModule;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleContext;
import org.labkey.api.module.SimpleModule;
import org.labkey.api.module.SpringModule;
import org.labkey.api.query.DefaultSchema;
import org.labkey.api.query.QuerySchema;
import org.labkey.api.query.QueryService;
import org.labkey.api.util.PageFlowUtil;
import org.labkey.api.view.WebPartFactory;
//import org.labkey.wnprc_ehr.updates.ModuleUpdate;

import javax.swing.*;
import java.util.Collection;
import java.util.Collections;
import java.util.Set;

public class wnprc_ios_appModule extends DefaultModule
{
    public static final String NAME = "wnprc_ios_app";

    @Override
    public String getName()
    {
        return NAME;
    }

    @Override
    public @Nullable Double getSchemaVersion()
    {
        return 25.001;
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
        addController(wnprc_ios_appController.NAME, wnprc_ios_appController.class);
    }

    @Override
    public void doStartup(ModuleContext moduleContext)
    {
        // add a container listener so we'll know when our container is deleted:
        ContainerManager.addContainerListener(new wnprc_ios_appContainerListener());

//        ModuleUpdate.onStartup(moduleContext, this);
//        EHRService.get().registerTableCustomizer(this, org.labkey.wnprc_ehr.table.WNPRC_EHRCustomizer.class);

        DefaultSchema.registerProvider(wnprc_ios_appSchema.NAME, new DefaultSchema.SchemaProvider(this)
        {
            @Override
            public @Nullable QuerySchema createSchema(DefaultSchema schema, Module module)
            {
                DbSchema dbSchema = DbSchema.get(wnprc_ios_appSchema.NAME, DbSchemaType.Module);
                return QueryService.get().createSimpleUserSchema(dbSchema.getQuerySchemaName(), null, schema.getUser(), schema.getContainer(), dbSchema);
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
        return Collections.singleton(wnprc_ios_appSchema.NAME);
    }

}