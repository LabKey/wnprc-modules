package org.labkey.wnprc_billing;

import org.labkey.api.data.AbstractTableInfo;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.UrlColumn;
import org.labkey.api.data.WrappedColumn;
import org.labkey.api.ldk.table.AbstractTableCustomizer;
import org.labkey.api.query.DetailsURL;
import org.labkey.api.view.ActionURL;

public class WNPRC_InvoiceRunCustomizer extends AbstractTableCustomizer
{
    @Override
    public void customize(TableInfo tableInfo)
    {
        addViewJetInvoiceItems(tableInfo);
        addDownloadCSV(tableInfo);
    }

    private void addViewJetInvoiceItems(TableInfo ti)
    {
        String colName = "viewJETInvoice";

        if (ti.getColumn(colName) == null)
        {
            WrappedColumn wrappedColumnPDF = new WrappedColumn(ti.getColumn("rowId"),colName);
            wrappedColumnPDF.setHidden(false);
            wrappedColumnPDF.setLabel("View JET Invoice");

            wrappedColumnPDF.setDisplayColumnFactory(colInfo -> {
                String url = "/query/executeQuery.view?schemaName=wnprc_billing&" +
                        "query.queryName=jetInvoiceItems&query.runId~eq=${rowId}";
                UrlColumn urlColumn = new UrlColumn(DetailsURL.fromString(url, ti.getUserSchema().getContainer()), "View JET");
                urlColumn.setName(colName);
                return urlColumn;
            });
            ((AbstractTableInfo) ti).addColumn(wrappedColumnPDF);
        }
    }

    private void addDownloadCSV(TableInfo ti)
    {
        String colName = "downloadJetCsv";

        if (ti.getColumn(colName) == null)
        {
            WrappedColumn wrappedColumnPDF = new WrappedColumn(ti.getColumn("rowId"),colName);
            wrappedColumnPDF.setHidden(false);
            wrappedColumnPDF.setLabel("Download CSV");

            wrappedColumnPDF.setDisplayColumnFactory(colInfo -> {
                ActionURL url = new ActionURL(WNPRC_BillingController.GetJetInvoiceCSVAction.class, ti.getUserSchema().getContainer());
                url.addParameter("runId", "${rowId}");
                UrlColumn urlColumn = new UrlColumn(url, "Download CSV");
                urlColumn.setName(colName);
                return urlColumn;
            });

            ((AbstractTableInfo) ti).addColumn(wrappedColumnPDF);
        }
    }
}
