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
import org.apache.commons.net.ntp.TimeStamp;
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
import org.labkey.wnprc_billing.invoice.InvoicePDF;
import org.springframework.validation.BindException;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.StringWriter;
import java.text.SimpleDateFormat;
import java.util.Collections;
import java.util.Date;
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
        TableInfo tableInfo = getEhrBillingSchema().getTable(WNPRC_BillingSchema.TABLE_INVOICED_ITEMS);

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
        //todo is accountNumber always not null
        SimpleFilter filter = new SimpleFilter(FieldKey.fromParts("alias"), accountNumber.trim());
        TableInfo tableInfo = getEhrBillingSchema().getTable(WNPRC_BillingSchema.TABLE_ALIASES);
        TableSelector tableSelector = new TableSelector(tableInfo, filter,null);
        return tableSelector.getObject(Alias.class);
    }

    public static class InvoicePdfForm
    {

        String _invoiceNumber;
        int _rowId;

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
    }

    public static class InvoiceRun
    {
        Date _runDate;
        Date _billingPeriodStart;
        Date _billingPeriodEnd;
        public Date getRunDate()
        {
            return _runDate;
        }

        public void setRunDate(Date runDate)
        {
            _runDate = runDate;
        }

        public Date getBillingPeriodStart()
        {
            return _billingPeriodStart;
        }

        public void setBillingPeriodStart(Date billingPeriodStart)
        {
            _billingPeriodStart = billingPeriodStart;
        }

        public Date getBillingPeriodEnd()
        {
            return _billingPeriodEnd;
        }

        public void setBillingPeriodEnd(Date billingPeriodEnd)
        {
            _billingPeriodEnd = billingPeriodEnd;
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
    public static class Invoice
    {
        String _invoiceNumber;
        Double _invoiceAmount;
        public String _accountNumber;
        private String _invoiceRunId;

        public String getInvoiceNumber()
        {
            return _invoiceNumber;
        }

        public void setInvoiceNumber(String invoiceNumber)
        {
            _invoiceNumber = invoiceNumber;
        }

        public Double getInvoiceAmount()
        {
            return _invoiceAmount;
        }

        public void setInvoiceAmount(Double invoiceAmount)
        {
            _invoiceAmount = invoiceAmount;
        }

        public String getAccountNumber()
        {
            return _accountNumber;
        }

        public void setAccountNumber(String accountNumber)
        {
            _accountNumber = accountNumber;
        }

        public String getInvoiceRunId()
        {
            return _invoiceRunId;
        }

        public void setInvoiceRunId(String invoiceRunId)
        {
            _invoiceRunId = invoiceRunId;
        }
    }
    public static class InvoicedItem
    {
        int _rowId;
        String _id;
        String _transactionNumber;
        String _item;
        String _comment;
        Double _quantity;
        Double _unitCost;
        Double _totalCost;
        Date   _date;
        TimeStamp _invoiceDate;
        private String _category;
        private String _servicecenter;


        public int getRowId()
        {
            return _rowId;
        }

        public void setRowId(int rowId)
        {
            _rowId = rowId;
        }

        public String getId()
        {
            return _id;
        }

        public void setId(String id)
        {
            _id = id;
        }

        public String getTransactionNumber()
        {
            return _transactionNumber;
        }

        public void setTransactionNumber(String transactionNumber)
        {
            _transactionNumber = transactionNumber;
        }

        public String getItem()
        {
            return _item;
        }

        public void setItem(String item)
        {
            _item = item;
        }

        public String getComment()
        {
            return _comment;
        }

        public void setComment(String comment)
        {
            _comment = comment;
        }

        public Double getQuantity()
        {
            return _quantity;
        }

        public void setQuantity(Double quantity)
        {
            _quantity = quantity;
        }

        public Double getUnitCost()
        {
            return _unitCost;
        }

        public void setUnitCost(Double unitCost)
        {
            _unitCost = unitCost;
        }

        public Double getTotalCost()
        {
            return _totalCost;
        }

        public void setTotalCost(Double totalCost)
        {
            _totalCost = totalCost;
        }

        public Date getDate()
        {
            return _date;
        }

        public void setDate(Date date)
        {
            _date = date;
        }

        public TimeStamp getInvoiceDate()
        {
            return _invoiceDate;
        }

        public void setInvoiceDate(TimeStamp invoiceDate)
        {
            _invoiceDate = invoiceDate;
        }

        public String getCategory()
        {
            return _category;
        }

        public void setCategory(String category)
        {
            _category = category;
        }

        public String getServicecenter()
        {
            return _servicecenter;
        }

        public void setServicecenter(String servicecenter)
        {
            _servicecenter = servicecenter;
        }
    }

    public static class Alias
    {
        String _alias;
        String _po_number;
        String _address;
        String _contact_email;
        private String _grantNumber;
        private String _uw_account;
        private String _uw_fund;
        private String _uw_udds;
        private String _uw_class_code;
        private String _tier_rate;


        public String getAlias()
        {
            return _alias;
        }

        public void setAlias(String alias)
        {
            _alias = alias;
        }

        public String getPo_number()
        {
            return _po_number;
        }

        public void setPo_number(String po_number)
        {
            _po_number = po_number;
        }

        public String getAddress()
        {
            return _address;
        }

        public void setAddress(String address)
        {
            _address = address;
        }

        public String getContact_email()
        {
            return _contact_email;
        }

        public void setContact_email(String contact_email)
        {
            _contact_email = contact_email;
        }

        public String getUw_account()
        {
            return _uw_account;
        }

        public void setUw_account(String uw_account)
        {
            _uw_account = uw_account;
        }

        public String getGrantNumber()
        {
            return _grantNumber;
        }

        public void setGrantNumber(String grantNumber)
        {
            _grantNumber = grantNumber;
        }

        public String getUw_fund()
        {
            return _uw_fund;
        }

        public void setUw_fund(String uw_fund)
        {
            _uw_fund = uw_fund;
        }

        public String getUw_udds()
        {
            return _uw_udds;
        }

        public void setUw_udds(String uw_udds)
        {
            _uw_udds = uw_udds;
        }

        public String getUw_class_code()
        {
            return _uw_class_code;
        }

        public void setUw_class_code(String uw_class_code)
        {
            _uw_class_code = uw_class_code;
        }

        public String getTier_rate()
        {
            return _tier_rate;
        }

        public void setTier_rate(String tier_rate)
        {
            _tier_rate = tier_rate;
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
            response.setContentLength(csv.getCsvData().length());
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

        for (JetInvoiceItem invoiceItem : invoiceItems)
        {
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
        String date = dateFormat.format(invoiceRun.getRunDate());


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
            Alias alias = getInvoiceAccount(invoice.getAccountNumber());
            InvoiceRun invoiceRun = getInvoiceRunByObjectId(invoice.getInvoiceRunId());
            TierRate accountTierRate = getTierRate(alias.getTier_rate());
            List<InvoicedItem> invoicedItems = getInvoicedItems(invoicePdfForm.getInvoiceNumber());

            Map<String, ModuleProperty> moduleProperties = ModuleLoader.getInstance().getModule(WNPRC_BillingModule.class).getModuleProperties();
            String contactEmail = moduleProperties.get(WNPRC_BillingModule.BillingContactEmail).getEffectiveValue(getContainer());
            String billingAddess = moduleProperties.get(WNPRC_BillingModule.BillingAddress).getEffectiveValue(getContainer());
            String creditToAccount = moduleProperties.get(WNPRC_BillingModule.CreditToAccount).getEffectiveValue(getContainer());

            double tierRate = accountTierRate != null ? accountTierRate.getTierRate() : 0;
            InvoicePDF pdf = new InvoicePDF(invoice, alias, invoiceRun, tierRate, contactEmail, billingAddess, creditToAccount);

            pdf.addPage();
            pdf.createLineItems(invoicedItems);
            SimpleDateFormat dateFormatBillingFor = new SimpleDateFormat("MM_yyyy");
            String filename = alias.getGrantNumber() + "_" + dateFormatBillingFor.format(invoiceRun.getBillingPeriodStart()) + "_Invoice.pdf";
            PageFlowUtil.prepareResponseForFile(getViewContext().getResponse(), Collections.emptyMap(), filename, false);
            pdf.output(getViewContext().getResponse().getOutputStream());
        }
    }


}