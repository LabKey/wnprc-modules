package org.labkey.wnprc_billing.domain;

import org.apache.commons.net.ntp.TimeStamp;

import java.util.Date;

public class InvoicedItem
{
    int _rowId;
    String _id;
    String _transactionNumber;
    String _item;
    String _comment;
    String _groupName;
    Double _quantity;
    Double _unitCost;
    Double _totalCost;
    Date _date;
    TimeStamp _invoiceDate;
    private String _category;

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

    public String getGroupName()
    {
        return _groupName;
    }

    public void setGroupName(String groupName)
    {
        _groupName = groupName;
    }
}