/*
 * Copyright (c) 2018 LabKey Corporation
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