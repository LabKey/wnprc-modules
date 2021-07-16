package org.labkey.wnprc_purchasing.table;

import org.labkey.api.data.AbstractTableInfo;
import org.labkey.api.data.BaseColumnInfo;
import org.labkey.api.data.JdbcType;
import org.labkey.api.data.MutableColumnInfo;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.data.UrlColumn;
import org.labkey.api.ldk.table.AbstractTableCustomizer;
import org.labkey.api.query.DetailsURL;
import org.labkey.api.query.ExprColumn;
import org.labkey.api.security.permissions.AdminPermission;
import org.labkey.api.security.permissions.InsertPermission;
import org.labkey.api.security.permissions.UpdatePermission;
import org.labkey.api.view.ActionURL;
import org.labkey.wnprc_purchasing.WNPRC_PurchasingController;

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
                addReorderLink((AbstractTableInfo) tableInfo, "rowId", new ActionURL(WNPRC_PurchasingController.PurchaseAdminAction.class, tableInfo.getUserSchema().getContainer()));
            }
            else if (matches(tableInfo, "ehr_purchasing", "purchasingReceiverOverview"))
            {
                addRequestUpdateLinks((AbstractTableInfo) tableInfo);
            }
            else if (matches(tableInfo, "ehr_purchasing", "purchasingRequestsOverview"))
            {
                addReorderLink((AbstractTableInfo) tableInfo, "rowId", new ActionURL(WNPRC_PurchasingController.RequesterAction.class, tableInfo.getUserSchema().getContainer()));
            }
            else if (matches(tableInfo, "ehr_purchasing", "purchasingRequestsOverviewForAdmins"))
            {
                addReorderLink((AbstractTableInfo) tableInfo, "requestNum", new ActionURL(WNPRC_PurchasingController.PurchaseAdminAction.class, tableInfo.getUserSchema().getContainer()));
            }
        }
    }

    private void addRequestLink(AbstractTableInfo ti)
    {
        ActionURL returnUrl = new ActionURL();
        if (ti.hasPermission(Objects.requireNonNull(ti.getUserSchema()).getUser(), AdminPermission.class))
        {
            returnUrl = new ActionURL(WNPRC_PurchasingController.PurchaseAdminAction.class, ti.getUserSchema().getContainer());
        }
        else if (ti.hasPermission(Objects.requireNonNull(ti.getUserSchema()).getUser(), UpdatePermission.class))
        {
            returnUrl = new ActionURL(WNPRC_PurchasingController.PurchaseReceiverAction.class, ti.getUserSchema().getContainer());
        }
        else if (ti.hasPermission(Objects.requireNonNull(ti.getUserSchema()).getUser(), InsertPermission.class))
        {
            returnUrl = new ActionURL(WNPRC_PurchasingController.RequesterAction.class, ti.getUserSchema().getContainer());
        }
        ActionURL detailsUrl = new ActionURL(WNPRC_PurchasingController.PurchasingRequestAction.class, ti.getUserSchema().getContainer());
        detailsUrl.addParameter("requestRowId", "${rowId}");
        detailsUrl.addParameter("returnUrl", returnUrl.toString());

        MutableColumnInfo rowId = (MutableColumnInfo) ti.getColumn("rowId");
        rowId.setURL(DetailsURL.fromString(detailsUrl.toContainerRelativeURL()));
    }

    private void addRequestUpdateLinks(AbstractTableInfo ti)
    {
        ActionURL returnUrl = new ActionURL(WNPRC_PurchasingController.PurchaseReceiverAction.class, ti.getUserSchema().getContainer());
        ActionURL detailsUrl = new ActionURL(WNPRC_PurchasingController.PurchasingRequestAction.class, ti.getUserSchema().getContainer());
        detailsUrl.addParameter("requestRowId", "${requestRowId}");
        detailsUrl.addParameter("returnUrl", returnUrl.toString());

        MutableColumnInfo requestRowId = (MutableColumnInfo) ti.getColumn("requestRowId");
        requestRowId.setURL(DetailsURL.fromString(detailsUrl.toContainerRelativeURL()));

        MutableColumnInfo quantityReceived = (MutableColumnInfo) ti.getColumn("quantityReceived");
        quantityReceived.setURL(DetailsURL.fromString(detailsUrl.toContainerRelativeURL()));
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

    private void addReorderLink(AbstractTableInfo ti, String requestIdColName, ActionURL returnUrl)
    {
        String colName = "Reorder";
        TableSelector ts = new TableSelector(ti);

        if (ti.getColumn(colName) == null && ts.getRowCount() > 0)
        {
            BaseColumnInfo reorderCol = new BaseColumnInfo(colName, JdbcType.VARCHAR);
            reorderCol.setHidden(false);
            reorderCol.setCalculated(true);
            reorderCol.setLabel(colName);

            reorderCol.setDisplayColumnFactory(colInfo -> {
                ActionURL detailsUrl = new ActionURL(WNPRC_PurchasingController.PurchasingRequestAction.class,
                        Objects.requireNonNull(ti.getUserSchema(), "ehr_purchasing user schema not found").getContainer());
                detailsUrl.addParameter("requestRowId", "${"+requestIdColName+"}");
                detailsUrl.addParameter("isReorder", "true");
                detailsUrl.addParameter("returnUrl", returnUrl.toString());
                UrlColumn urlColumn = new UrlColumn(detailsUrl.toString(), "Reorder");
                urlColumn.setName(colName);
                return urlColumn;
            });

            ti.addColumn(reorderCol);
        }
    }
}
