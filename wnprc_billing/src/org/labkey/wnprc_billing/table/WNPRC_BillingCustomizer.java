package org.labkey.wnprc_billing.table;

import org.labkey.api.data.AbstractTableInfo;
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
import org.labkey.api.query.ExprColumn;
import org.labkey.api.data.JdbcType;
import org.labkey.api.data.SQLFragment;

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
            else if (matches(table, "wnprc_billing", "tierRates"))
            {
                customizeTierRates((AbstractTableInfo) table);
            }
        }
    }

    private SQLFragment getIsActiveSql(AbstractTableInfo ti)
    {
        return new SQLFragment("(CASE " +
                // when the start is in the future, using whole-day increments, it is not active
                " WHEN (CAST(" + ExprColumn.STR_TABLE_ALIAS + ".startDate as DATE) > {fn curdate()}) THEN " + ti.getSqlDialect().getBooleanFALSE() + "\n" +
                // when enddate is null, it is active
                " WHEN (" + ExprColumn.STR_TABLE_ALIAS + ".endDate IS NULL) THEN " + ti.getSqlDialect().getBooleanTRUE() + "\n" +
                // if enddate is in the future (whole-day increments), then it is active
                " WHEN (CAST(" + ExprColumn.STR_TABLE_ALIAS + ".endDate AS DATE) >= {fn curdate()}) THEN " + ti.getSqlDialect().getBooleanTRUE() + "\n" +
                " ELSE " + ti.getSqlDialect().getBooleanFALSE() + "\n" +
                " END)");
    }

    private void customizeTierRates(AbstractTableInfo ti)
    {
        String name = "isActive";
        if (ti.getColumn(name) == null)
        {
            SQLFragment sql = getIsActiveSql(ti);
            ExprColumn col = new ExprColumn(ti, name, sql, JdbcType.BOOLEAN, ti.getColumn("startDate"), ti.getColumn("endDate"));
            col.setLabel("Is Active?");
            col.setUserEditable(false);
            col.setFormat("Y;N;");
            ti.addColumn(col);
        }
    }

    private void customizeMiscCharges(AbstractTableInfo table)
    {
        UserSchema us = getBillingUserSchema(table, "ehr_billing");
        if (us == null)
        {
            return;
        }

        ColumnInfo chargeGroup = table.getColumn("chargeGroup");
        if (chargeGroup != null)
        {
            chargeGroup.setFk(new QueryForeignKey(us, us.getContainer(), "chargeUnits",
                    "groupName", null, true));
        }

        ColumnInfo debitedAcct = table.getColumn("debitedAccount");
        if (debitedAcct != null)
        {
            debitedAcct.setFk(new QueryForeignKey(us, us.getContainer(), "aliases",
                    "alias", null, true));
        }

        ColumnInfo chargeId= table.getColumn("chargeId");
        if (chargeId != null)
        {
            chargeId.setFk(new QueryForeignKey(us, us.getContainer(), "chargeableItems",
                    "rowid", null, true));
        }
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
        return null;
    }
}
