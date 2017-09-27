/*
 * Copyright (c) 2013-2015 LabKey Corporation
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
package org.labkey.ehr.query;

import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.labkey.api.data.Container;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.TableInfo;
import org.labkey.api.ehr.security.EHRDataAdminPermission;
import org.labkey.api.ehr.security.EHRProjectEditPermission;
import org.labkey.api.ehr.security.EHRProtocolEditPermission;
import org.labkey.api.ldk.table.ContainerScopedTable;
import org.labkey.api.ldk.table.CustomPermissionsTable;
import org.labkey.api.module.Module;
import org.labkey.api.query.SimpleUserSchema;
import org.labkey.api.security.User;
import org.labkey.api.security.permissions.DeletePermission;
import org.labkey.api.security.permissions.InsertPermission;
import org.labkey.api.security.permissions.Permission;
import org.labkey.api.security.permissions.UpdatePermission;
import org.labkey.ehr.EHRSchema;

/**
 * User: bimber
 * Date: 8/6/13
 * Time: 7:21 PM
 */
public class EHRUserSchema extends SimpleUserSchema
{
    public EHRUserSchema(User user, Container container, DbSchema dbschema)
    {
        super(EHRSchema.EHR_SCHEMANAME, null, user, container, dbschema);
    }

    @Override
    @Nullable
    protected TableInfo createWrappedTable(String name, @NotNull TableInfo schemaTable)
    {
        if (EHRSchema.TABLE_REQUESTS.equalsIgnoreCase(name))
            return getDataEntryTable(schemaTable);
        else if (EHRSchema.TABLE_TASKS.equalsIgnoreCase(name))
            return getDataEntryTable(schemaTable);
        else if (EHRSchema.TABLE_ENCOUNTER_FLAGS.equalsIgnoreCase(name))
            return getDataEntryTable(schemaTable);
        else if (EHRSchema.TABLE_ENCOUNTER_PARTICIPANTS.equalsIgnoreCase(name))
            return getDataEntryTable(schemaTable);
        else if (EHRSchema.TABLE_ENCOUNTER_SUMMARIES.equalsIgnoreCase(name))
            return getDataEntryTable(schemaTable);
        else if (EHRSchema.TABLE_SNOMED_TAGS.equalsIgnoreCase(name))
            return getDataEntryTable(schemaTable);
        else if (EHRSchema.TABLE_PROTOCOL.equalsIgnoreCase(name))
            return getProtocolTable(schemaTable);
        else if (EHRSchema.TABLE_PROTOCOL_COUNTS.equalsIgnoreCase(name))
            return getCustomPermissionTable(schemaTable, EHRProtocolEditPermission.class);
        else if (EHRSchema.TABLE_PROTOCOL_EXEMPTIONS.equalsIgnoreCase(name))
            return getCustomPermissionTable(schemaTable, EHRProtocolEditPermission.class);
        else if (EHRSchema.TABLE_PROTOCOL_PROCEDURES.equalsIgnoreCase(name))
            return getCustomPermissionTable(schemaTable, EHRProtocolEditPermission.class);
        else if (EHRSchema.TABLE_PROJECT.equalsIgnoreCase(name))
            return getProjectTable(schemaTable);
        else if (EHRSchema.TABLE_ANIMAL_GROUPS.equalsIgnoreCase(name))
            return getCustomPermissionTable(createSourceTable(name), EHRDataAdminPermission.class);
        else if (EHRSchema.TABLE_FLAG_VALUES.equalsIgnoreCase(name))
            return getCustomPermissionTable(createSourceTable(name), EHRDataAdminPermission.class);
        else
            return super.createWrappedTable(name, schemaTable);
    }

    private TableInfo getDataEntryTable(TableInfo schemaTable)
    {
        return new DataEntryTable(this, schemaTable).init();
    }

    private TableInfo getCustomPermissionTable(TableInfo schemaTable, Class<? extends Permission> perm)
    {
        CustomPermissionsTable ret = new CustomPermissionsTable(this, schemaTable);
        ret.addPermissionMapping(InsertPermission.class, perm);
        ret.addPermissionMapping(UpdatePermission.class, perm);
        ret.addPermissionMapping(DeletePermission.class, perm);

        return ret.init();
    }

    private TableInfo getProjectTable(TableInfo schemaTable)
    {
        ContainerScopedTable ret = new ContainerScopedTable(this, schemaTable, "project");
        ret.addPermissionMapping(InsertPermission.class, EHRProjectEditPermission.class);
        ret.addPermissionMapping(UpdatePermission.class, EHRProjectEditPermission.class);
        ret.addPermissionMapping(DeletePermission.class, EHRProjectEditPermission.class);

        return ret.init();
    }

    private TableInfo getProtocolTable(TableInfo schemaTable)
    {
        ContainerScopedTable ret = new ContainerScopedTable(this, schemaTable, "protocol");
        ret.addPermissionMapping(InsertPermission.class, EHRProtocolEditPermission.class);
        ret.addPermissionMapping(UpdatePermission.class, EHRProtocolEditPermission.class);
        ret.addPermissionMapping(DeletePermission.class, EHRProtocolEditPermission.class);

        return ret.init();
    }
}
