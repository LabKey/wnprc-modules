package org.labkey.cageui.query;

import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerFilter;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.TableInfo;
import org.labkey.api.query.SimpleUserSchema;
import org.labkey.api.security.User;
import org.labkey.api.security.permissions.DeletePermission;
import org.labkey.api.security.permissions.InsertPermission;
import org.labkey.api.security.permissions.Permission;
import org.labkey.api.security.permissions.UpdatePermission;
import org.labkey.cageui.CageUISchema;
/*
import org.labkey.ehr.query.EHRContainerScopedTable;
import org.labkey.ehr.query.EHRCustomPermissionsTable;
import org.labkey.ehr.query.EHRDataEntryTable;
*/

public class CageUIUserSchema extends SimpleUserSchema
{
    public CageUIUserSchema(User user, Container container, DbSchema dbschema)
    {
        super(CageUISchema.NAME, "Cage UI Tables", user, container, dbschema);
    }

//    @Override
//    @Nullable
//    protected TableInfo createWrappedTable(String name, @NotNull TableInfo schemaTable, ContainerFilter cf)
//    {
//        if (CageUISchema.TABLE_LAYOUT_HISTORY.equalsIgnoreCase(name))
//            return getDataEntryTable(schemaTable, cf);
//        return super.createWrappedTable(name, schemaTable, cf);
//    }
//
//    private TableInfo getDataEntryTable(TableInfo schemaTable, ContainerFilter cf)
//    {
//        return new EHRDataEntryTable<>(this, schemaTable, cf).init();
//    }
//
//    private TableInfo getCustomPermissionTable(TableInfo schemaTable, ContainerFilter cf, Class<? extends Permission> perm)
//    {
//        EHRCustomPermissionsTable<CageUIUserSchema> ret = new EHRCustomPermissionsTable<>(this, schemaTable, cf);
//        ret.addPermissionMapping(InsertPermission.class, perm);
//        ret.addPermissionMapping(UpdatePermission.class, perm);
//        ret.addPermissionMapping(DeletePermission.class, perm);
//        return ret.init();
//    }
//
//    private TableInfo getContainerScopedTable(TableInfo schemaTable, ContainerFilter cf, String psuedoPk, Class<? extends Permission> perm)
//    {
//        EHRContainerScopedTable<CageUIUserSchema> ret = new EHRContainerScopedTable<>(this, schemaTable, cf, psuedoPk);
//        ret.addPermissionMapping(InsertPermission.class, perm);
//        ret.addPermissionMapping(UpdatePermission.class, perm);
//        ret.addPermissionMapping(DeletePermission.class, perm);
//        return ret.init();
//    }
}