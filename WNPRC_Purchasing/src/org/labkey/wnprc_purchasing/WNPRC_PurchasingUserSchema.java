package org.labkey.wnprc_purchasing;

import org.jetbrains.annotations.Nullable;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerFilter;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.DatabaseTableType;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.SimpleUserSchema;
import org.labkey.api.query.SimpleQueryUpdateService;
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

    @Override
    public QueryUpdateService getUpdateService()
    {
        // UNDONE: add an 'isUserEditable' bit to the schema and table?
        if (!isReadOnly())
        {
            TableInfo table = getRealTable();
            if (table != null && table.getTableType() == DatabaseTableType.TABLE)
                return new SimpleQueryUpdateService(this, table)
                {
                    @Override
                    protected boolean supportUpdateUsingDIB()
                    {
                        return false;
                    }
                };
        }
        return null;
    }
}
