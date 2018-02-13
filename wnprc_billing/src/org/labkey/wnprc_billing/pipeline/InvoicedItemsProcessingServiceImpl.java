package org.labkey.wnprc_billing.pipeline;

import org.labkey.api.ehr_billing.pipeline.InvoicedItemsProcessingService;
import org.labkey.wnprc_billing.WNPRC_BillingSchema;

import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * Implements methods to get queries and columns to be processed during a Billing Run.
 */
public class InvoicedItemsProcessingServiceImpl implements InvoicedItemsProcessingService
{
    public static final InvoicedItemsProcessingServiceImpl INSTANCE = new InvoicedItemsProcessingServiceImpl();

    @Override
    public String getSchemaName()
    {
        return WNPRC_BillingSchema.NAME;
    }

    @Override
    public String getPerDiemProcessingQueryName()
    {
        return "perDiemFeeRates";
    }

    @Override
    public String[] getPerDiemProcessingColumnNames()
    {
        return new String[]{
            "Id",
            "date",
            "project",
            "quantity",
            "unitCost",
            "totalcost",
            null, //sourceRecord
            "comment",
            "debitedAccount",
            "chargeId",
            "item",
            "category",
            "serviceCenter",
            null //creditedAccount
        };
    }

    @Override
    public String getProceduresProcessingQueryName()
    {
        return "procedureFeeRates";
    }

    @Override
    public String[] getProceduresProcessingColumnNames()
    {
        return new String[]{
            "Id",
            "date",
            "project",
            "quantity",
            "unitCost",
            "totalcost",
            "sourceRecord",
            "comment",
            "debitedAccount",
            "chargeid",
            "item",
            "category",
            "serviceCenter",
            null //creditedAccount
        };
    }

    @Override
    public String getMiscChargesProcessingQueryName()
    {
        return "miscChargesFeeRates";
    }

    @Override
    public String[] getMiscChargesProcessingColumnNames()
    {
        return new String[]{
            "Id",
            "date",
            "project",
            "quantity",
            "unitCost",
            "totalcost",
            "sourceRecord",
            "comment",
            "debitedAccount",
            "chargeid",
            "item",
            "category",
            "serviceCenter",
            "creditedAccount"
        };
    }


    @Override
    public String[] getInvoicedItemsColumnNames()
    {
        return new String[]{
                "Id",
                "date",
                "project",
                "quantity",
                "unitCost",
                "totalcost",
                "sourceRecord",
                "comment",
                "debitedAccount",
                "chargeId",
                "item",
                "category",
                "serviceCenter"
        };
    }

    @Override
    public String getLabworkProcessingQueryName()
    {
        return null;
    }

    @Override
    public String[] getLabworkProcessingColumnNames()
    {
        return null;
    }

    @Override
    public String getLeaseFeeProcessingQueryName()
    {
        return null;
    }

    @Override
    public String[] getLeaseFeeProcessingColumnNames()
    {
        return null;
    }

    @Override
    public String getInvoiceNum(String debitedAcct, Date billingPeriodDate)
    {
        SimpleDateFormat f = new SimpleDateFormat("MMYY");
        String dateStr = f.format(billingPeriodDate);
        return dateStr + debitedAcct.toUpperCase();
    }
}