package org.labkey.wnprc_purchasing.table;

import org.labkey.api.data.AbstractTableInfo;
import org.labkey.api.data.JdbcType;
import org.labkey.api.data.MutableColumnInfo;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.TableInfo;
import org.labkey.api.ldk.table.AbstractTableCustomizer;
import org.labkey.api.query.DetailsURL;
import org.labkey.api.query.ExprColumn;
import org.labkey.api.security.permissions.AdminPermission;
import org.labkey.api.security.permissions.UpdatePermission;

import java.util.Objects;

public class WNPRC_PurchasingCustomizer extends AbstractTableCustomizer
{
    @Override
    public void customize(TableInfo tableInfo)
    {
        if (tableInfo instanceof AbstractTableInfo)
        {
            if (matches(tableInfo, "ehr_purchasing", "purchasingRequests"))
            {
                addAttachmentsCol((AbstractTableInfo) tableInfo);
                addRequestLink((AbstractTableInfo) tableInfo);
                addTotalCostColumn((AbstractTableInfo) tableInfo);
            }
            else if (matches(tableInfo, "ehr_purchasing", "purchasingReceiverOverview"))
            {
                addRequestUpdateLinks((AbstractTableInfo) tableInfo);
            }
        }
    }

    private void addRequestLink(AbstractTableInfo ti)
    {
        if (ti.hasPermission(Objects.requireNonNull(ti.getUserSchema()).getUser(), AdminPermission.class))
        {
            String returnUrl = ti.getUserSchema().getContainer().getPath() + "/WNPRC_Purchasing-purchaseAdmin.view?";
            MutableColumnInfo rowId = (MutableColumnInfo) ti.getColumn("rowId");
            rowId.setURL(DetailsURL.fromString("/WNPRC_Purchasing-purchasingRequest.view?requestRowId=${rowId}&returnUrl="+returnUrl));
        }
    }

    private void addRequestUpdateLinks(AbstractTableInfo ti)
    {
        String returnUrl = ti.getUserSchema().getContainer().getPath() + "/WNPRC_Purchasing-purchaseReceiver.view?";
        MutableColumnInfo requestRowId = (MutableColumnInfo) ti.getColumn("requestRowId");
        requestRowId.setURL(DetailsURL.fromString("/WNPRC_Purchasing-purchasingRequest.view?requestRowId=${requestRowId}&returnUrl="+returnUrl));

        MutableColumnInfo quantityReceived = (MutableColumnInfo) ti.getColumn("quantityReceived");
        quantityReceived.setURL(DetailsURL.fromString("/WNPRC_Purchasing-purchasingRequest.view?requestRowId=${requestRowId}&returnUrl="+returnUrl));
    }

    private void addAttachmentsCol(AbstractTableInfo purchasingRequestsTable)
    {
        String name = "attachments";
        if (purchasingRequestsTable.getColumn(name) == null)
        {
            ExprColumn col = new ExprColumn(purchasingRequestsTable, name, new SQLFragment(ExprColumn.STR_TABLE_ALIAS + ".rowId"), JdbcType.VARCHAR);
            col.setLabel("Attachments");
            col.setUserEditable(false);
            purchasingRequestsTable.addColumn(col);
            col.setDisplayColumnFactory(new AttachmentDisplayColumnFactory());
        }
    }

    private void addTotalCostColumn(AbstractTableInfo purchasingRequestsTable)
    {
        String name = "totalCost";
        if (purchasingRequestsTable.getColumn(name) == null)
        {
            SQLFragment sql = new SQLFragment("(SELECT x.totalCost FROM (SELECT requestRowId, sum(quantity * unitCost) AS totalCost FROM ehr_purchasing.lineItems items GROUP BY items.requestRowId) x ");
            sql.append("WHERE " + ExprColumn.STR_TABLE_ALIAS + ".rowId = x.requestRowId)");
            ExprColumn col = new ExprColumn(purchasingRequestsTable, name, sql, JdbcType.DECIMAL);
            col.setFormat("$###,##0.00");
            col.setLabel("Total Cost");
            col.setUserEditable(false);
            purchasingRequestsTable.addColumn(col);
        }
    }
}
