package org.labkey.cageui.query;

import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.ContainerFilter;
import org.labkey.api.data.TableInfo;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.SimpleQueryUpdateService;
import org.labkey.api.query.SimpleUserSchema;
import org.labkey.api.security.UserPrincipal;
import org.labkey.api.security.permissions.DeletePermission;
import org.labkey.api.security.permissions.InsertPermission;
import org.labkey.api.security.permissions.Permission;
import org.labkey.api.security.permissions.UpdatePermission;
import org.labkey.cageui.security.permissions.CageUIRoomCreatorPermission;
import org.labkey.cageui.security.permissions.CageUITemplateCreatorPermission;

public class LayoutHistoryTable extends SimpleUserSchema.SimpleTable<CageUIUserSchema>
{
    public LayoutHistoryTable(CageUIUserSchema schema, TableInfo table, ContainerFilter cf)
    {
        super(schema, table, cf);
    }

    @Override
    public QueryUpdateService getUpdateService()
    {
        return new LayoutHistoryTable.UpdateService(this);
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
                return super.hasPermission(user, CageUITemplateCreatorPermission.class) || super.hasPermission(user, CageUIRoomCreatorPermission.class); // Besides normal folder permissions check for CageUILayoutEditorPermission
            }

            return hasPermission;
        }
    }
}
