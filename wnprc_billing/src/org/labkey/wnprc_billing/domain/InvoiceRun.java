package org.labkey.wnprc_billing.domain;

import java.util.Date;

public class InvoiceRun
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