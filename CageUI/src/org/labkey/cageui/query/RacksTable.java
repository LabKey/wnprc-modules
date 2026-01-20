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

package org.labkey.cageui.query;

import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerFilter;
import org.labkey.api.data.TableInfo;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.DuplicateKeyException;
import org.labkey.api.query.InvalidKeyException;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.QueryUpdateServiceException;
import org.labkey.api.query.SimpleQueryUpdateService;
import org.labkey.api.query.SimpleUserSchema;
import org.labkey.api.security.User;
import org.labkey.api.security.UserPrincipal;
import org.labkey.api.security.permissions.DeletePermission;
import org.labkey.api.security.permissions.InsertPermission;
import org.labkey.api.security.permissions.Permission;
import org.labkey.api.security.permissions.UpdatePermission;
import org.labkey.cageui.security.permissions.CageUITemplateCreatorPermission;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;

public class RacksTable extends SimpleUserSchema.SimpleTable<CageUIUserSchema>
{
    public RacksTable(CageUIUserSchema schema, TableInfo table, ContainerFilter cf)
    {
        super(schema, table, cf);
    }

    @Override
    public QueryUpdateService getUpdateService()
    {
        return new RacksTable.UpdateService(this);
    }

    protected class UpdateService extends SimpleQueryUpdateService
    {
        public UpdateService(SimpleUserSchema.SimpleTable ti)
        {
            super(ti, ti.getRealTable());
        }

        // This checks permission before any data modification occurs
        @Override
        public boolean hasPermission(@NotNull UserPrincipal user, Class<? extends Permission> perm)
        {
            boolean hasPermission = super.hasPermission(user, perm);
            boolean isEditPerm = perm == InsertPermission.class || perm == UpdatePermission.class || perm == DeletePermission.class;

            if (isEditPerm)
            {
                return super.hasPermission(user, CageUITemplateCreatorPermission.class); // Besides normal folder permissions check for CageUILayoutEditorPermission
            }

            return hasPermission;
        }


        @Override
        public List<Map<String, Object>> insertRows(User user, Container container, List<Map<String, Object>> rows, BatchValidationException errors, @Nullable Map<Enum, Object> configParameters, @Nullable Map<String, Object> extraScriptContext) throws DuplicateKeyException, QueryUpdateServiceException, SQLException
        {
            List<Map<String, Object>> result = null;
            if (hasPermission(user, CageUITemplateCreatorPermission.class))
            {
                result = super._insertRowsUsingDIB(user, container, rows, getDataIteratorContext(errors, InsertOption.INSERT, configParameters), extraScriptContext);
            }
            afterInsertUpdate(result == null ? 0 : result.size(), errors);
            return result;
        }

        @Override
        public List<Map<String, Object>> updateRows(User user, Container container, List<Map<String, Object>> rows, List<Map<String, Object>> oldKeys,
                                                    BatchValidationException errors, @Nullable Map<Enum, Object> configParameters, Map<String, Object> extraScriptContext)
                throws InvalidKeyException, BatchValidationException, QueryUpdateServiceException, SQLException
        {
            List<Map<String, Object>> result = null;
            if (hasPermission(user, CageUITemplateCreatorPermission.class))
            {
                result = super.updateRows(user, container, rows, oldKeys, errors, configParameters, extraScriptContext);
            }
            afterInsertUpdate(result == null ? 0 : result.size(), errors);
            return result;
        }

        @Override
        public List<Map<String, Object>> deleteRows(User user, Container container, List<Map<String, Object>> keys, @Nullable Map<Enum, Object> configParameters, @Nullable Map<String, Object> extraScriptContext)
                throws SQLException, BatchValidationException, QueryUpdateServiceException, InvalidKeyException
        {
            if (hasPermission(user, CageUITemplateCreatorPermission.class))
            {
                return super.deleteRows(user, container, keys, configParameters, extraScriptContext);
            }
            return null;
        }
    }
}
