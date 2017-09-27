/*
 * Copyright (c) 2013-2014 LabKey Corporation
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
import org.labkey.api.data.TableInfo;
import org.labkey.api.ehr.security.AbstractEHRPermission;
import org.labkey.api.ehr.security.EHRDataEntryPermission;
import org.labkey.api.query.SimpleUserSchema;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.UserPrincipal;
import org.labkey.api.security.permissions.DeletePermission;
import org.labkey.api.security.permissions.InsertPermission;
import org.labkey.api.security.permissions.Permission;
import org.labkey.api.security.permissions.UpdatePermission;

/**
 * This class has been created primarily to allow alternate permission testing.
 * Because we cannot easily set granular permissions on hard tables, for a limited number
 * of key EHR hard tables we use this TableInfo, which requires the user to have EHRDataEntryPermission
 * on the container if we test for any of the EHR custom permissions
 *
 * User: bimber
 * Date: 8/6/13
 * Time: 7:27 PM
 */
public class DataEntryTable<SchemaType extends UserSchema> extends SimpleUserSchema.SimpleTable<SchemaType>
{
    public DataEntryTable(SchemaType schema, TableInfo table)
    {
        super(schema, table);
    }

    @Override
    public boolean hasPermission(@NotNull UserPrincipal user, @NotNull Class<? extends Permission> perm)
    {
        if (InsertPermission.class.isAssignableFrom(perm) || UpdatePermission.class.isAssignableFrom(perm) || DeletePermission.class.isAssignableFrom(perm))
        {
            if (!getContainer().hasPermission(user, EHRDataEntryPermission.class))
                return false;
        }

        //NOTE: we cannot currently set per-table permissions with ease, so allow DataEntryPermission
        //to be a proxy for any EHR permission
        if (AbstractEHRPermission.class.isAssignableFrom(perm))
        {
            return getContainer().hasPermission(user, EHRDataEntryPermission.class);
        }

        return super.hasPermission(user, perm);
    }
}