/*
 * Copyright (c) 2019-2026 LabKey Corporation
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
package org.labkey.wnprc_billing.invoice;

import com.koadweb.javafpdf.Alignment;
import org.labkey.wnprc_billing.domain.*;

import java.util.Arrays;
import java.util.List;

public class SummaryPDF extends InvoicePDF
{
    public SummaryPDF(Invoice invoice, Alias alias, InvoiceRun invoiceRun, double tierRate, String contactEmail, String billingAddress, String creditToAccount, String creditLine)
    {
        super(invoice, alias, invoiceRun, tierRate, contactEmail, billingAddress, creditToAccount, creditLine);
    }

    List<Column> headers = Arrays.asList(
            new Column("Charge Date", 25, Alignment.CENTER)
            {
                @Override
                public String getValue(FormattedLineItem lineItem)
                {
                    return lineItem.get_chargeDate() == null? "--" : dateFormat.format(lineItem.get_chargeDate());
                }
            },
            new Column("Description", 145, Alignment.LEFT)
            {
                @Override
                public String getValue(FormattedLineItem lineItem)
                {
                    return lineItem.get_description() == null?"": lineItem.get_description();
                }
            },
            new Column("Total Price", 20, Alignment.RIGHT)
            {
                @Override
                public String getValue(FormattedLineItem lineItem)
                {
                    return lineItem._linePrice == null ?"":moneyFormat.format(lineItem._linePrice);
                }
            });

    @Override
    public List<Column> getHeaders()
    {
        return headers;
    }

}
