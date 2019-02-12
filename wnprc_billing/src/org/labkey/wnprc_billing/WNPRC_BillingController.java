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

import au.com.bytecode.opencsv.CSVWriter;
import org.labkey.api.action.ExportAction;
import org.labkey.api.action.SpringActionController;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.Sort;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.module.ModuleProperty;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.RequiresPermission;
import org.labkey.api.security.permissions.ReadPermission;
import org.labkey.api.util.PageFlowUtil;
import org.labkey.api.util.StringUtilsLabKey;
import org.labkey.api.view.NotFoundException;
import org.labkey.wnprc_billing.domain.*;
import org.labkey.wnprc_billing.invoice.InvoicePDF;
import org.labkey.wnprc_billing.invoice.SummaryPDF;
import org.springframework.validation.BindException;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.StringWriter;
import java.text.SimpleDateFormat;
import java.util.Collections;
import java.util.List;
import java.util.Map;

public class WNPRC_BillingController extends SpringActionController
{
    private static final DefaultActionResolver _actionResolver = new DefaultActionResolver(WNPRC_BillingController.class);
    public static final String NAME = "wnprc_billing";

    public WNPRC_BillingController()
    {
        setActionResolver(_actionResolver);
    }

    private List<InvoicedItem> getInvoicedItems(String invoiceNumber)
    {
        TableInfo tableInfo = getEhrBillingSchema().getTable(WNPRC_BillingSchema.TABLE_INVOICED_ITEMS_FOR_PDF);

        SimpleFilter filter = new SimpleFilter(FieldKey.fromParts("invoiceNumber"), invoiceNumber);
        TableSelector tableSelector = new TableSelector(tableInfo, filter,new Sort( "date,serviceCenter,id"));
        return tableSelector.getArrayList(InvoicedItem.class);
    }

    private Invoice getInvoice(String invoiceNumber)
    {
        TableInfo tableInfo = getEhrBillingSchema().getTable(WNPRC_BillingSchema.TABLE_INVOICE);

        SimpleFilter filter = new SimpleFilter(FieldKey.fromParts("invoiceNumber"), invoiceNumber);
        TableSelector tableSelector = new TableSelector(tableInfo, filter,null);
        return tableSelector.getObject(Invoice.class);
    }

    private TierRate getTierRate(String tierRateType)
    {
        TableInfo tableInfo = WNPRC_BillingSchema.getSchema().getTable(WNPRC_BillingSchema.TABLE_TIER_RATES);

        SimpleFilter filter = new SimpleFilter(FieldKey.fromParts("tierRateType"), tierRateType);
        filter.addCondition(FieldKey.fromString("isActive"), true, CompareType.EQUAL);
        TableSelector tableSelector = new TableSelector(tableInfo, filter,null);
        return tableSelector.getObject(TierRate.class);
    }

    private InvoiceRun getInvoiceRunByObjectId(String invoiceRunId)
    {
        TableInfo tableInfo = getEhrBillingSchema().getTable(WNPRC_BillingSchema.TABLE_INVOICE_RUNS);

        SimpleFilter filter = new SimpleFilter(FieldKey.fromParts("objectId"), invoiceRunId);
        TableSelector tableSelector = new TableSelector(tableInfo,filter,null);
        return tableSelector.getObject(invoiceRunId, InvoiceRun.class);
    }

    private InvoiceRun getInvoiceRunById(int runId)
    {
        TableInfo tableInfo = getEhrBillingSchema().getTable(WNPRC_BillingSchema.TABLE_INVOICE_RUNS);

        SimpleFilter filter = new SimpleFilter(FieldKey.fromParts("rowId"), runId);
        TableSelector tableSelector = new TableSelector(tableInfo,filter,null);
        return tableSelector.getObject(InvoiceRun.class);
    }

    private UserSchema getEhrBillingSchema()
    {
        return QueryService.get().getUserSchema(getUser(), getContainer(), "ehr_billing");
    }

    private Alias getInvoiceAccount(String accountNumber)
    {
        SimpleFilter filter = new SimpleFilter(FieldKey.fromParts("alias"), accountNumber.trim());
        TableInfo tableInfo = getEhrBillingSchema().getTable(WNPRC_BillingSchema.TABLE_ALIASES);
        TableSelector tableSelector = new TableSelector(tableInfo, filter,null);
        return tableSelector.getObject(Alias.class);
    }

    private List<InvoicedItem> getSummarizedItems(String invoiceNumber)
    {
        TableInfo tableInfo = getEhrBillingSchema().getTable(WNPRC_BillingSchema.TABLE_SUMMARIZED_ITEMS);

        SimpleFilter filter = new SimpleFilter(FieldKey.fromParts("invoiceNumber"), invoiceNumber);
        TableSelector tableSelector = new TableSelector(tableInfo, filter,new Sort( "date"));
        return tableSelector.getArrayList(InvoicedItem.class);
    }

    public static class InvoicePdfForm
    {
        String _invoiceNumber;
        int _rowId;
        boolean _asAttachment;
        String name;

        public String getInvoiceNumber()
        {
            return _invoiceNumber;
        }

        public void setInvoiceNumber(String invoiceId)
        {
            _invoiceNumber = invoiceId;
        }

        public int getRowId()
        {
            return _rowId;
        }

        public void setRowId(int rowId)
        {
            _rowId = rowId;
        }

        public boolean isAsAttachment()
        {
            return _asAttachment;
        }

        public void setAsAttachment(boolean asAttachment)
        {
            this._asAttachment = asAttachment;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }
    }

    public static class TierRate
    {
        double _tierRate;

        public double getTierRate()
        {
            return _tierRate;
        }

        public void setTierRate(double tierRate)
        {
            _tierRate = tierRate;
        }
    }

    @RequiresPermission(ReadPermission.class)
    public class GetJetInvoiceCSVAction extends ExportAction<InvoiceRunForm>
    {
        @Override
        public void export(InvoiceRunForm invoiceRunForm, HttpServletResponse response, BindException errors) throws Exception
        {
            String contentType = "text/plain";
            JetCSV csv = getJetCsv(invoiceRunForm.getRunId());
            response.setContentType(contentType);
            response.setHeader("Content-Disposition", "attachment; filename=\"" + csv.getFileName() + ".csv" + "\"");
            response.setContentLength(csv.getCsvData().getBytes(StringUtilsLabKey.DEFAULT_CHARSET).length);
            response.getOutputStream().write(csv.getCsvData().getBytes(StringUtilsLabKey.DEFAULT_CHARSET));
        }
    }

    private JetCSV getJetCsv(int runId) throws IOException
    {
        List<JetInvoiceItem> invoiceItems = getJetItems(runId);
        InvoiceRun invoiceRun = getInvoiceRunById(runId);
        StringWriter writer = new StringWriter();
        CSVWriter csvWriter = new CSVWriter(writer,CSVWriter.DEFAULT_SEPARATOR,CSVWriter.NO_QUOTE_CHARACTER);
        csvWriter.writeNext(new String[]{"NSCT"});
        String[] emptyLine = {""};
        csvWriter.writeNext(emptyLine);
        csvWriter.writeNext(new String[]{"Department","Fund","Program","Project","Activity ID","Account","Class",
                "Amount","Description","Jnl_Ln_Ref","Purch Ref No","Voucher No","Invoice No"});

        for (JetInvoiceItem invoiceItem : invoiceItems){
            csvWriter.writeNext(emptyLine);
            csvWriter.writeNext(new String[]{
                    invoiceItem.Department,
                    invoiceItem.Fund,
                    invoiceItem.Program,
                    invoiceItem.Project,
                    invoiceItem.ActivityID,
                    String.valueOf(invoiceItem.Account != null ?invoiceItem.Account.intValue():0),
                    invoiceItem.Class,
                    String.valueOf(invoiceItem.Amount != null ?invoiceItem.Amount.doubleValue():0),
                    invoiceItem.Description,
                    invoiceItem.Jnl_Ln_Ref,
                    invoiceItem.PurchRefNo,
                    invoiceItem.VoucherNo,
                    invoiceItem.InvoiceNo
            });
        }
        csvWriter.close();

        SimpleDateFormat dateFormat = new SimpleDateFormat("MM-dd-yy");
        String fileName = "JET_" + dateFormat.format(invoiceRun.getBillingPeriodStart()) + "_" +
                dateFormat.format(invoiceRun.getBillingPeriodEnd());
        return new JetCSV(fileName,writer.toString());
    }

    private class JetCSV{
        private final String _fileName;
        private final String _csvData;

        public JetCSV(String fileName, String csvData)
        {
            _fileName = fileName;
            _csvData = csvData;
        }

        public String getFileName()
        {
            return _fileName;
        }

        public String getCsvData()
        {
            return _csvData;
        }
    }

    private List<JetInvoiceItem> getJetItems(int runId)
    {
        UserSchema wnprc_billing = QueryService.get().getUserSchema(getUser(), getContainer(), WNPRC_BillingSchema.NAME);
        TableInfo tableInfo = wnprc_billing.getTable(WNPRC_BillingSchema.TABLE_JET_INVOICE_ITEMS);

        SimpleFilter filter = new SimpleFilter(FieldKey.fromParts("runId"), runId);
        TableSelector tableSelector = new TableSelector(tableInfo, filter, null);
        return tableSelector.getArrayList(JetInvoiceItem.class);    }

    public static class InvoiceRunForm
    {
        int _runId;

        public int getRunId()
        {
            return _runId;
        }

        public void setRunId(int runId)
        {
            _runId = runId;
        }
    }

    public static class JetInvoiceItem
    {
        int _runId;
        String Department;
        String Fund;
        String Program;
        String Project;
        Integer Account;
        Double Amount;
        String Description;
        String Jnl_Ln_Ref;
        String Class;
        String PurchRefNo;
        String VoucherNo;
        String InvoiceNo;
        String ActivityID;

        public int getRunId()
        {
            return _runId;
        }

        public void setRunId(int runId)
        {
            _runId = runId;
        }

        public String getDepartment()
        {
            return Department;
        }

        public String getFund()
        {
            return Fund;
        }

        public void setFund(String fund)
        {
            Fund = fund;
        }

        public void setDepartment(String department)
        {
            Department = department;
        }

        public String getProgram()
        {
            return Program;
        }

        public void setProgram(String program)
        {
            Program = program;
        }

        public String getProject()
        {
            return Project;
        }

        public void setProject(String project)
        {
            Project = project;
        }

        public Integer getAccount()
        {
            return Account;
        }

        public void setAccount(Integer account)
        {
            Account = account;
        }

        public Double getAmount()
        {
            return Amount;
        }

        public void setAmount(Double amount)
        {
            Amount = amount;
        }

        public String getDescription()
        {
            return Description;
        }

        public void setDescription(String description)
        {
            Description = description;
        }

        public String getJnl_Ln_Ref()
        {
            return Jnl_Ln_Ref;
        }

        public void setJnl_Ln_Ref(String jnl_Ln_Ref)
        {
            Jnl_Ln_Ref = jnl_Ln_Ref;
        }

        public String getItemClass()
        {
            return Class;
        }

        public void setClass(String aClass)
        {
            Class = aClass;
        }

        public String getPurchRefNo()
        {
            return PurchRefNo;
        }

        public void setPurchRefNo(String purchRefNo)
        {
            PurchRefNo = purchRefNo;
        }

        public String getVoucherNo()
        {
            return VoucherNo;
        }

        public void setVoucherNo(String voucherNo)
        {
            VoucherNo = voucherNo;
        }

        public String getInvoiceNo()
        {
            return InvoiceNo;
        }

        public void setInvoiceNo(String invoiceNo)
        {
            InvoiceNo = invoiceNo;
        }

        public String getActivityID()
        {
            return ActivityID;
        }

        public void setActivityID(String activityID)
        {
            ActivityID = activityID;
        }
    }

    @RequiresPermission(ReadPermission.class)
    public class PDFExportAction extends ExportAction<InvoicePdfForm>
    {
        @Override
        public void export(InvoicePdfForm invoicePdfForm, HttpServletResponse response, BindException errors) throws Exception
        {
            Invoice invoice = getInvoice(invoicePdfForm.getInvoiceNumber());
            if (null == invoice)
            {
                throw new NotFoundException(" Unable to generate PDF. The selected invoice could not be found.");
            }
            if (null == invoice.getInvoiceAmount())
            {
                throw new NotFoundException(" Unable to generate PDF. No Invoice Amount found.");
            }

            Alias alias = getInvoiceAccount(invoice.getAccountNumber());

            if (null == alias)
            {
                throw new NotFoundException("Unable to generate PDF. Account Number not found.");
            }

            InvoiceRun invoiceRun = getInvoiceRunByObjectId(invoice.getInvoiceRunId());
            TierRate accountTierRate = getTierRate(alias.getTier_rate());

            Map<String, ModuleProperty> moduleProperties = ModuleLoader.getInstance().getModule(WNPRC_BillingModule.class).getModuleProperties();
            String contactEmail = moduleProperties.get(WNPRC_BillingModule.BillingContactEmail).getEffectiveValue(getContainer());
            String billingAddess = moduleProperties.get(WNPRC_BillingModule.BillingAddress).getEffectiveValue(getContainer());
            String creditToAccount = moduleProperties.get(WNPRC_BillingModule.CreditToAccount).getEffectiveValue(getContainer());

            double tierRate = accountTierRate != null ? accountTierRate.getTierRate() : 0;
            String formName = invoicePdfForm.getName();
            InvoicePDF pdf = formName.equals("Invoice PDF") ? new InvoicePDF(invoice, alias, invoiceRun, tierRate, contactEmail, billingAddess, creditToAccount) :
                    new SummaryPDF(invoice, alias, invoiceRun, tierRate, contactEmail, billingAddess, creditToAccount);

            pdf.addPage();
            List<InvoicedItem> invoicedItems;

            if (formName.equalsIgnoreCase("Invoice PDF"))
            {
                invoicedItems = getInvoicedItems(invoicePdfForm.getInvoiceNumber());
                pdf.createLineItems(invoicedItems, true);
            }
            else
            {
                invoicedItems = getSummarizedItems(invoicePdfForm.getInvoiceNumber());
                pdf.createLineItems(invoicedItems, false);
            }

            SimpleDateFormat dateFormatBillingFor = new SimpleDateFormat("MM_yyyy");
            String filename = alias.getGrantNumber() + "_" + dateFormatBillingFor.format(invoiceRun.getBillingPeriodStart()) + "_Invoice.pdf";
            PageFlowUtil.prepareResponseForFile(getViewContext().getResponse(), Collections.emptyMap(), filename, invoicePdfForm.isAsAttachment());
            pdf.output(getViewContext().getResponse().getOutputStream());
        }
    }
}