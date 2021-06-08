/*
 * Copyright (c) 2016-2019 LabKey Corporation
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

package org.labkey.wnprc_u24;

import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.DbSchemaType;
import org.labkey.api.module.DefaultModule;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleContext;
import org.labkey.api.query.DefaultSchema;
import org.labkey.api.query.QuerySchema;
import org.labkey.api.query.QueryService;
import org.labkey.api.view.WebPartFactory;

import java.util.Collection;
import java.util.Collections;
import java.util.Set;

public class wnprc_u24Module extends DefaultModule
{
    public static final String NAME = "wnprc_u24";

    @Override
    public String getName()
    {
        return NAME;
    }

    @Override
    public Double getSchemaVersion()
    {
        return 20.000;
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
        addController(wnprc_u24Controller.NAME, wnprc_u24Controller.class);
    }

    @Override
    public void doStartup(ModuleContext moduleContext)
    {
        // add a container listener so we'll know when our container is deleted:
        ContainerManager.addContainerListener(new wnprc_u24ContainerListener());

        for (final String schemaName : getSchemaNames())
        {
            final DbSchema dbSchema = DbSchema.get(schemaName, DbSchemaType.Module);
            DefaultSchema.registerProvider(dbSchema.getQuerySchemaName(), new DefaultSchema.SchemaProvider(this)
            {
                public QuerySchema createSchema(final DefaultSchema schema, Module module)
                {
                    DbSchema dbSchema = DbSchema.get(schemaName, DbSchemaType.Module);
                    return QueryService.get().createSimpleUserSchema(dbSchema.getQuerySchemaName(), null, schema.getUser(), schema.getContainer(), dbSchema);
                }
            });
        }
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
        return Collections.singleton(wnprc_u24Schema.NAME);
    }
}