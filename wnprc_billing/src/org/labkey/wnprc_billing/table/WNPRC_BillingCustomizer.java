package org.labkey.wnprc_billing.table;

import org.labkey.api.data.AbstractTableInfo;
import org.labkey.api.data.BaseColumnInfo;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.TableInfo;
import org.labkey.api.ldk.table.AbstractTableCustomizer;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.module.ModuleProperty;
import org.labkey.api.query.QueryForeignKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.permissions.ReadPermission;

public class WNPRC_BillingCustomizer extends AbstractTableCustomizer
{
    private UserSchema _billingUserSchema = null;

    public Container getBillingContainer(Container c)
    {
        Module billing = ModuleLoader.getInstance().getModule("ehr_billing");
        ModuleProperty mp = billing.getModuleProperties().get("BillingContainer");
        String path = mp.getEffectiveValue(c);
        if (path == null)
            return null;

        return ContainerManager.getForPath(path);

    }

    @Override
    public void customize(TableInfo table)
    {
        if (table instanceof AbstractTableInfo)
        {
            if (matches(table, "ehr_billing", "miscCharges"))
            {
                customizeMiscCharges((AbstractTableInfo) table);
            }
        }
    }

    private void customizeMiscCharges(AbstractTableInfo table)
    {
        UserSchema us = getBillingUserSchema(table, "ehr_billing");
        if (us == null)
        {
            return;
        }

        BaseColumnInfo chargeType = table.getMutableColumn("chargeType");
        if (chargeType != null)
        {
            chargeType.setFk(QueryForeignKey.from(us, table.getContainerFilter())
                    .container(us.getContainer())
                    .table("chargeUnits")
                    .key("chargeType")
                    .raw(true));
        }

        BaseColumnInfo debitedAcct = table.getMutableColumn("debitedAccount");
        if (debitedAcct != null)
        {
            debitedAcct.setFk(QueryForeignKey.from(us, table.getContainerFilter())
                    .container(us.getContainer())
                    .table("aliases")
                    .key("alias")
                    .raw(true));
        }

        BaseColumnInfo chargeId= table.getMutableColumn("chargeId");
        if (chargeId != null)
        {
            chargeId.setFk(QueryForeignKey.from(us, table.getContainerFilter())
                    .container(us.getContainer())
                    .table("chargeableItems")
                    .key("rowid")
                    .raw(true));
        }

//        UserSchema wnprcBillingUS = getBillingUserSchema(table, "wnprc_billing");

//        ColumnInfo chargeCategory = table.getColumn("chargeCategory");
//        if (chargeCategory != null)
//        {
//            chargeCategory.setFk(new QueryForeignKey(wnprcBillingUS, wnprcBillingUS.getContainer(), "miscChargesType",
//                    "category", null, true));
//        }
    }

    private UserSchema getBillingUserSchema(AbstractTableInfo table, String schemaName)
    {
        if (_billingUserSchema != null)
        {
            return _billingUserSchema;
        }

        //first try to actual container
        Container c = getBillingContainer(table.getUserSchema().getContainer());
        if (c != null && c.hasPermission(table.getUserSchema().getUser(), ReadPermission.class))
        {
            UserSchema us = QueryService.get().getUserSchema(table.getUserSchema().getUser(), c, schemaName);
            if (us != null)
            {
                _billingUserSchema = us;
                return us;
            }
        }

//        //then a linked schema
//        UserSchema us = QueryService.get().getUserSchema(table.getUserSchema().getUser(),
//                table.getUserSchema().getContainer(), "wnprc_billing_public");
//        if (us != null)
//        {
//            _billingUserSchema = us;
//            return us;
//        }

        return null;
    }
}
