/*
 * Copyright (c) 2017 LabKey Corporation
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
import org.labkey.api.data.SimpleDisplayColumn;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.WrappedColumn;
import org.labkey.api.ldk.table.AbstractTableCustomizer;
import org.labkey.api.view.ActionURL;

public class WNPRC_InvoiceCustomizer extends AbstractTableCustomizer
{
    @Override
    public void customize(TableInfo tableInfo)
    {
        addViewPdf(tableInfo);
    }

    private void addViewPdf(TableInfo ti)
    {
        String colName = "viewPdf";

        if (ti.getColumn(colName) == null)
        {
            WrappedColumn wrappedColumnPDF = new WrappedColumn(ti.getColumn("invoiceNumber"),colName);
            wrappedColumnPDF.setHidden(false);
            wrappedColumnPDF.setLabel("View PDF");

            wrappedColumnPDF.setDisplayColumnFactory(colInfo -> {
                SimpleDisplayColumn simpleDisplayColumn = new SimpleDisplayColumn();
                simpleDisplayColumn.setName(colName);
                simpleDisplayColumn.setDisplayHtml("View PDF");
                ActionURL url = new ActionURL(WNPRC_BillingController.PDFExportAction.class, ti.getUserSchema().getContainer());
                url.addParameter("invoiceNumber", "${invoiceNumber}");
                simpleDisplayColumn.setURL(url.toString());

                return simpleDisplayColumn;
            });

            ((AbstractTableInfo) ti).addColumn(wrappedColumnPDF);
        }
    }
}
