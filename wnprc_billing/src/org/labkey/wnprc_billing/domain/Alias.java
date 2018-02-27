package org.labkey.wnprc_billing.domain;

import java.util.Date;

public class Alias
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
    public Date _budgetEndDate;
    public String _comments;

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

    public Date getBudgetEndDate()
    {
        return _budgetEndDate;
    }

    public void setBudgetEndDate(Date budgetEndDate)
    {
        _budgetEndDate = budgetEndDate;
    }

    public String getComments()
    {
        return _comments;
    }

    public void setComments(String comments)
    {
        _comments = comments;
    }
}
