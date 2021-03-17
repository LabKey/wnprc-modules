/*
 * Copyright (c) 2020 LabKey Corporation
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

package org.labkey.wnprc_purchasing;

import org.labkey.api.data.DbSchema;
import org.labkey.api.data.DbSchemaType;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.dialect.SqlDialect;

public class WNPRC_PurchasingSchema
{
    private static final WNPRC_PurchasingSchema _instance = new WNPRC_PurchasingSchema();
    public static final String NAME = "wnprc_purchasing";

    //wnprc_purchasing tables
    public static final String PAYMENT_OPTIONS_TABLE = "paymentOptions";

    public static WNPRC_PurchasingSchema getInstance()
    {
        return _instance;
    }

    private WNPRC_PurchasingSchema()
    {
        // private constructor to prevent instantiation from
        // outside this class: this singleton should only be
        // accessed via org.labkey.wnprc_purchasing.WNPRC_PurchasingSchema.getInstance()
    }

    public DbSchema getSchema()
    {
        return DbSchema.get(NAME, DbSchemaType.Module);
    }

    public SqlDialect getSqlDialect()
    {
        return getSchema().getSqlDialect();
    }

    public TableInfo getPaymentOptionsTable()
    {
        return getSchema().getTable(PAYMENT_OPTIONS_TABLE);
    }
}
