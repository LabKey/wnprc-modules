package org.labkey.wnprc_billing.pipeline;

import org.apache.commons.lang3.time.DateUtils;
import org.jetbrains.annotations.Nullable;
import org.labkey.api.data.Container;
import org.labkey.api.ehr_billing.pipeline.BillingPipelineJobProcess;
import org.labkey.api.ehr_billing.pipeline.BillingPipelineJobSupport;
import org.labkey.api.ehr_billing.pipeline.InvoicedItemsProcessingService;
import org.labkey.api.security.User;
import org.labkey.wnprc_billing.WNPRC_BillingSchema;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Implements methods to define the set of queries (and their column mappings) to be included in the Billing Task processing.
 * Rows from the processed queries will be written to the ehr_billing.invoicedItems table.
 */
public class InvoicedItemsProcessingServiceImpl implements InvoicedItemsProcessingService
{
    @Override
    public List<BillingPipelineJobProcess> getProcessList()
    {
        List<BillingPipelineJobProcess> processes = new ArrayList<>();

        BillingPipelineJobProcess perDiemProcess = new BillingPipelineJobProcess("Per Diems", WNPRC_BillingSchema.NAME, "perDiemFeeRates", getPerDiemColMap())
        {
            @Override
            public Map<String, Object> getQueryParams(BillingPipelineJobSupport support)
            {
                Map<String, Object> params = super.getQueryParams(support);
                Long numDays = Math.round(((Long) (support.getEndDate().getTime() - support.getStartDate().getTime())).doubleValue() / DateUtils.MILLIS_PER_DAY);
                numDays++;
                params.put("NumDays", numDays.intValue());
                return params;
            }
        };
        perDiemProcess.setRequiredFields(Arrays.asList("date", "unitCost", "totalcost"));
        processes.add(perDiemProcess);

        BillingPipelineJobProcess proceduresProcess = new BillingPipelineJobProcess("Procedure Fees", WNPRC_BillingSchema.NAME, "procedureFeeRates", getProceduresColMap());
        proceduresProcess.setRequiredFields(Arrays.asList("date", "unitCost", "totalcost"));
        processes.add(proceduresProcess);

        BillingPipelineJobProcess miscChargesProcess = new BillingPipelineJobProcess("Misc Charges", WNPRC_BillingSchema.NAME, "miscChargesFeeRates", getMisChargesColMap());
        miscChargesProcess.setRequiredFields(Arrays.asList("date", "unitCost", "totalcost"));
        miscChargesProcess.setUseEHRContainer(true);
        miscChargesProcess.setMiscCharges(true);
        processes.add(miscChargesProcess);

        return processes;
    }

    private Map<String, String> getPerDiemColMap()
    {
        Map<String, String> colMap = new HashMap<>();
        colMap.put("Id", "Id");
        colMap.put("date", "date");
        colMap.put("project", "project");
        colMap.put("quantity", "quantity");
        colMap.put("unitCost", "unitCost");
        colMap.put("totalcost", "totalcost");
        colMap.put("unitCostDirect", "unitCostDirect");
        colMap.put("totalCostDirect", "totalCostDirect");
        colMap.put("comment", "comment");
        colMap.put("debitedAccount", "debitedAccount");
        colMap.put("chargeId", "chargeId");
        colMap.put("item", "item");
        colMap.put("category", "category");
        colMap.put("serviceCenter", "serviceCenter");
        return colMap;
    }

    private Map<String, String> getProceduresColMap()
    {
        Map<String, String> colMap = new HashMap<>();
        colMap.put("Id", "Id");
        colMap.put("date", "date");
        colMap.put("project", "project");
        colMap.put("quantity", "quantity");
        colMap.put("unitCost", "unitCost");
        colMap.put("totalcost", "totalcost");
        colMap.put("unitCostDirect", "unitCostDirect");
        colMap.put("totalCostDirect", "totalCostDirect");
        colMap.put("sourceRecord", "sourceRecord");
        colMap.put("comment", "comment");
        colMap.put("debitedAccount", "debitedAccount");
        colMap.put("chargeId", "chargeId");
        colMap.put("item", "item");
        colMap.put("category", "category");
        colMap.put("serviceCenter", "serviceCenter");
        return colMap;
    }

    private Map<String, String> getMisChargesColMap()
    {
        Map<String, String> colMap = new HashMap<>();
        colMap.put("Id", "Id");
        colMap.put("date", "date");
        colMap.put("project", "project");
        colMap.put("quantity", "quantity");
        colMap.put("unitCost", "unitCost");
        colMap.put("totalcost", "totalcost");
        colMap.put("unitCostDirect", "unitCostDirect");
        colMap.put("totalCostDirect", "totalCostDirect");
        colMap.put("sourceRecord", "sourceRecord");
        colMap.put("comment", "comment");
        colMap.put("debitedAccount", "debitedAccount");
        colMap.put("chargeId", "chargeId");
        colMap.put("item", "item");
        colMap.put("category", "category");
        colMap.put("serviceCenter", "serviceCenter");
        colMap.put("creditedAccount", "creditedAccount");
        return colMap;
    }

    @Override
    public String getInvoiceNum(Map<String, Object> row, Date billingPeriodEndDate)
    {
        SimpleDateFormat f = new SimpleDateFormat("MMddyyyy");//d = day in a month, D = day in a year, yyyy = calendar year
        String dateStr = f.format(billingPeriodEndDate);
        String debitedAcct = (String)row.getOrDefault("debitedAccount", "Unknown");

        if (null == debitedAcct)
        {
            Integer project = (Integer) row.get("project");
            String animalId = (String) row.get("Id");
            throw new RuntimeException("Unable to complete Billing Run. Debit Account not found for category '" + row.get("category") + "'" +
                    ((null != project) ? (", where project = " + project) : "") +
                    ((null != animalId) ? (" and animal Id = " + animalId) : ""));
        }
        return dateStr + debitedAcct.trim().toUpperCase();
    }

    @Override
    public void performAdditionalProcessing(String invoiceId, User user, Container container)
    {

    }

}