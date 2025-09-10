/*
 *
 *  * Copyright (c) 2025 Board of Regents of the University of Wisconsin System
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *     http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
 */

package org.labkey.cageui;

import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.labkey.api.data.Container;
import org.labkey.api.ldk.ExtendedSimpleModule;
import org.labkey.api.query.DefaultSchema;
import org.labkey.api.query.QuerySchema;
import org.labkey.api.security.roles.RoleManager;
import org.labkey.api.view.WebPartFactory;
import org.labkey.api.module.Module;
import org.labkey.cageui.query.CageUIUserSchema;
import org.labkey.cageui.security.permissions.CageUIAnimalEditorPermission;
import org.labkey.cageui.security.permissions.CageUIAnimalReviewerPermission;
import org.labkey.cageui.security.permissions.CageUILayoutEditorAccessPermission;
import org.labkey.cageui.security.permissions.CageUIRoomCreatorPermission;
import org.labkey.cageui.security.permissions.CageUIRoomModifierPermission;
import org.labkey.cageui.security.permissions.CageUITemplateCreatorPermission;
import org.labkey.cageui.security.permissions.CageUIModificationEditorPermission;
import org.labkey.cageui.security.permissions.CageUINotesEditorPermission;
import org.labkey.cageui.security.permissions.CageUIUserPermission;
import org.labkey.cageui.security.roles.CageUIAdminRole;
import org.labkey.cageui.security.roles.CageUIModificationEditorRole;
import org.labkey.cageui.security.roles.CageUIRoomCreatorRole;
import org.labkey.cageui.security.roles.CageUIRoomModifierRole;


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
        return 25.002;
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
        registerRoles();
        registerPermissions();
    }

    private void registerPermissions() {
        RoleManager.registerPermission(new CageUIRoomCreatorPermission());
        RoleManager.registerPermission(new CageUIRoomModifierPermission());
        RoleManager.registerPermission(new CageUILayoutEditorAccessPermission());
        RoleManager.registerPermission(new CageUITemplateCreatorPermission());
        RoleManager.registerPermission(new CageUIAnimalEditorPermission());
        RoleManager.registerPermission(new CageUIAnimalReviewerPermission());
        RoleManager.registerPermission(new CageUIModificationEditorPermission());
        RoleManager.registerPermission(new CageUINotesEditorPermission());
        RoleManager.registerPermission(new CageUIUserPermission());

    }

    public void registerRoles() {
        RoleManager.registerRole(new CageUIAdminRole());
        RoleManager.registerRole(new CageUIRoomCreatorRole());
        RoleManager.registerRole(new CageUIRoomModifierRole());
        RoleManager.registerRole(new CageUIModificationEditorRole());
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
                return new CageUIUserSchema(schema.getUser(), schema.getContainer(), CageUISchema.getInstance().getSchema());
            }
        });
    }

}
