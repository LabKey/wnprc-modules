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
import org.labkey.cageui.security.permissions.CageUILayoutEditorAccessPermission;
import org.labkey.cageui.security.permissions.CageUIRoomCreatorPermission;
import org.labkey.cageui.security.permissions.CageUITemplateCreatorPermission;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class RackTypesTable extends SimpleUserSchema.SimpleTable<CageUIUserSchema>
{
    public RackTypesTable(CageUIUserSchema schema, TableInfo table, ContainerFilter cf)
    {
        super(schema, table, cf);
    }

    @Override
    public QueryUpdateService getUpdateService()
    {
        return new RackTypesTable.UpdateService(this);
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

            if (isEditPerm){
                return super.hasPermission(user, CageUITemplateCreatorPermission.class); // Besides normal folder permissions check for CageUILayoutEditorPermission
            }

            return hasPermission;
        }

        @Override
        public List<Map<String, Object>> insertRows(User user, Container container, List<Map<String, Object>> rows, BatchValidationException errors, @Nullable Map<Enum, Object> configParameters, @Nullable Map<String, Object> extraScriptContext) throws DuplicateKeyException, QueryUpdateServiceException, SQLException
        {
            List<Map<String, Object>> result = null;
            if(hasPermission(user, CageUITemplateCreatorPermission.class)){
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
            if(hasPermission(user, CageUITemplateCreatorPermission.class)){
                result = super.updateRows(user, container, rows, oldKeys, errors, configParameters, extraScriptContext);
            }
            afterInsertUpdate(result == null ? 0 : result.size(), errors);
            return result;
        }

        @Override
        public List<Map<String, Object>> deleteRows(User user, Container container, List<Map<String, Object>> rows, BatchValidationException errors, @Nullable Map<Enum, Object> configParameters, @Nullable Map<String, Object> extraScriptContext) throws DuplicateKeyException, QueryUpdateServiceException, SQLException
        {
            List<Map<String, Object>> result = new ArrayList<Map<String, Object>>();
            if(hasPermission(user, CageUITemplateCreatorPermission.class)){
                for (int i = 0; i < rows.size(); i++)
                {
                    try
                    {
                        result.add(i,super.deleteRow(user, container, rows.get(i)));
                    }
                    catch (InvalidKeyException e)
                    {
                        throw new RuntimeException(e);
                    }
                }
            }
            afterInsertUpdate(result.isEmpty() ? 0 : result.size(), errors);
            return result;
        }
    }
}
