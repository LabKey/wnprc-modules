package org.labkey.wnprc_billing.invoice;

import com.koadweb.javafpdf.Alignment;
import org.labkey.wnprc_billing.domain.*;

import java.util.Arrays;
import java.util.List;

public class SummaryPDF extends InvoicePDF
{
    public SummaryPDF(Invoice invoice, Alias alias, InvoiceRun invoiceRun, double tierRate, String contactEmail, String billingAddress, String creditToAccount)
    {
        super(invoice, alias, invoiceRun, tierRate, contactEmail, billingAddress, creditToAccount);
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
