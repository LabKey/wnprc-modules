/*
 * Copyright (c) 2021-2026 Board of Regents of the University of Wisconsin System
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

import org.jetbrains.annotations.Nullable;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerFilter;
import org.labkey.api.data.TableInfo;
import org.labkey.api.query.SimpleUserSchema;
import org.labkey.api.security.User;

/**
 * Exposes tables to be viewed from a schema browser
 */
public class WNPRC_PurchasingUserSchema extends SimpleUserSchema
{
    public WNPRC_PurchasingUserSchema(String name, User user, Container container)
    {
        super(name, "WNPRC Purchasing tables", user, container, WNPRC_PurchasingSchema.getInstance().getSchema());
    }

    public enum TableType
    {
        paymentOptions
        {
            @Override
            public TableInfo createTable(WNPRC_PurchasingUserSchema schema, ContainerFilter cf)
            {
                SimpleUserSchema.SimpleTable<WNPRC_PurchasingUserSchema> table =
                        new SimpleUserSchema.SimpleTable<>(
                                schema, WNPRC_PurchasingSchema.getInstance().getPaymentOptionsTable(), cf).init();
                return table;
            }
        };

        public abstract TableInfo createTable(WNPRC_PurchasingUserSchema schema, ContainerFilter cf);
    }

    @Override
    @Nullable
    public TableInfo createTable(String name, ContainerFilter cf)
    {
        if (name != null)
        {
            TableType tableType = null;
            for (TableType t : TableType.values())
            {
                // Make the enum name lookup case insensitive
                if (t.name().equalsIgnoreCase(name))
                {
                    tableType = t;
                    break;
                }
            }
            if (tableType != null)
            {
                return tableType.createTable(this, cf);
            }
        }
        return super.createTable(name, cf);
    }
}
