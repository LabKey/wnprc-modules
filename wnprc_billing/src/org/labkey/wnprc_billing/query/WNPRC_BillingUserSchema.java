/*
 * Copyright (c) 2017-2018 LabKey Corporation
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
package org.labkey.wnprc_billing.query;

import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.labkey.api.data.Container;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.TableInfo;
import org.labkey.api.ldk.table.CustomPermissionsTable;
import org.labkey.api.query.SimpleUserSchema;
import org.labkey.api.security.User;
import org.labkey.api.security.permissions.DeletePermission;
import org.labkey.api.security.permissions.InsertPermission;
import org.labkey.api.security.permissions.ReadPermission;
import org.labkey.api.security.permissions.UpdatePermission;
import org.labkey.api.ehr_billing.security.EHR_BillingAdminPermission;

/**
 * Created by Binal on 10/31/2017.
 */
public class WNPRC_BillingUserSchema extends SimpleUserSchema
{

    public WNPRC_BillingUserSchema(String name, @Nullable String description, User user, Container container, DbSchema dbschema)
    {
        super(name, description, user, container, dbschema);
    }

    @Override
    @Nullable
    protected TableInfo createWrappedTable(String name, @NotNull TableInfo schematable)
    {
        CustomPermissionsTable ti = new CustomPermissionsTable(this, schematable).init();

        ti.addPermissionMapping(InsertPermission.class, EHR_BillingAdminPermission.class);
        ti.addPermissionMapping(UpdatePermission.class, EHR_BillingAdminPermission.class);
        ti.addPermissionMapping(DeletePermission.class, EHR_BillingAdminPermission.class);
        return ti;
    }

    @Override
    protected boolean canReadSchema()
    {
        User user = getUser();
        if (user == null)
            return false;
        return getContainer().hasPermission(user, ReadPermission.class);
    }
}