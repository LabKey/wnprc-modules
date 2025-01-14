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

package org.labkey.cageui;

import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.labkey.api.data.Container;
import org.labkey.api.ldk.ExtendedSimpleModule;
import org.labkey.api.query.DefaultSchema;
import org.labkey.api.query.QuerySchema;
import org.labkey.api.view.WebPartFactory;
import org.labkey.api.module.Module;


import java.util.Collection;
import java.util.Collections;
import java.util.Set;

public class CageUIModule extends ExtendedSimpleModule
{
    public static final String NAME = "CageUI";

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
        addController(CageUIController.NAME, CageUIController.class);
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
        return Collections.singleton(CageUISchema.NAME);
    }

    @Override
    public void registerSchemas() {
        DefaultSchema.registerProvider(CageUISchema.NAME, new DefaultSchema.SchemaProvider(this) {
            @Override
            public QuerySchema createSchema(final DefaultSchema schema, Module module) {
                return new CageUISchema(schema.getUser(), schema.getContainer());
            }
        });
    }

}
