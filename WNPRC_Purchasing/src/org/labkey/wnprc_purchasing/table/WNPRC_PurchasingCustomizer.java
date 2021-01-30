package org.labkey.wnprc_purchasing.table;

import org.labkey.api.data.AbstractTableInfo;
import org.labkey.api.data.JdbcType;
import org.labkey.api.data.MutableColumnInfo;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.TableInfo;
import org.labkey.api.ldk.table.AbstractTableCustomizer;
import org.labkey.api.query.DetailsURL;
import org.labkey.api.query.ExprColumn;
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
            }
        }
    }

    private void addRequestLink(AbstractTableInfo ti)
    {
        if (ti.hasPermission(Objects.requireNonNull(ti.getUserSchema()).getUser(), UpdatePermission.class))
        {
            MutableColumnInfo rowId = (MutableColumnInfo) ti.getColumn("rowId");
            rowId.setURL(DetailsURL.fromString("/WNPRC_Purchasing-purchasingRequest.view?requestRowId=${rowId}"));
        }
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
}
