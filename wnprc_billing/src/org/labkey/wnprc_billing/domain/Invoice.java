package org.labkey.wnprc_billing.domain;

public class Invoice
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