package org.labkey.wnprc_purchasing.table;

import org.labkey.api.data.AbstractTableInfo;
import org.labkey.api.data.JdbcType;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.TableInfo;
import org.labkey.api.ldk.table.AbstractTableCustomizer;
import org.labkey.api.query.ExprColumn;

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
            }
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
