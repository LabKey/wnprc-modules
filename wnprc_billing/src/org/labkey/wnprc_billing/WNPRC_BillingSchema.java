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

import org.labkey.api.data.DbSchema;
import org.labkey.api.data.DbSchemaType;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.dialect.SqlDialect;

public class WNPRC_BillingSchema
{
    private static final WNPRC_BillingSchema _instance = new WNPRC_BillingSchema();
    public static final String NAME = "wnprc_billing";

    //Tables
    public static final String TABLE_INVOICED_ITEMS_FOR_PDF = "InvoicedItemsForPDF";
    public static final String TABLE_INVOICE = "Invoice";
    public static final String TABLE_INVOICE_RUNS = "InvoiceRuns";
    public static final String TABLE_TIER_RATES = "tierrates";
    public static final String TABLE_JET_INVOICE_ITEMS = "JetInvoiceItems";
    public static final String TABLE_ALIASES = "Aliases";
    public static final String TABLE_SUMMARIZED_ITEMS = "summarizedInvoicedItemsByCategory";

    public static WNPRC_BillingSchema getInstance()
    {
        return _instance;
    }

    private WNPRC_BillingSchema()
    {
        // private constructor to prevent instantiation from
        // outside this class: this singleton should only be
        // accessed via org.labkey.wnprc_billing.WNPRC_BillingSchema.getInstance()
    }

    public static DbSchema getSchema()
    {
        return DbSchema.get(NAME, DbSchemaType.Module);
    }

    public SqlDialect getSqlDialect()
    {
        return getSchema().getSqlDialect();
    }

    public TableInfo getTierRates()
    {
        return getSchema().getTable(TABLE_TIER_RATES);
    }
}
