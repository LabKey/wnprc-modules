/*
 * Copyright (c) 2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
                UrlColumn urlColumn = new UrlColumn(url.toString(), "Download CSV");
                urlColumn.setName(colName);
                return urlColumn;
            });

            ((AbstractTableInfo) ti).addColumn(wrappedColumnPDF);
        }
    }

}
