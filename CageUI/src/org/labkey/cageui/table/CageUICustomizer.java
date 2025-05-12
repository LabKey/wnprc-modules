package org.labkey.cageui.table;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.labkey.api.data.AbstractTableInfo;
import org.labkey.api.data.JdbcType;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.TableInfo;
import org.labkey.api.ldk.table.AbstractTableCustomizer;
import org.labkey.api.query.ExprColumn;

public class CageUICustomizer extends AbstractTableCustomizer
{

    protected static final Logger _log = LogManager.getLogger(CageUICustomizer.class);
    public CageUICustomizer()
    {

    }

    @Override
    public void customize(TableInfo table)
    {
        if (table instanceof AbstractTableInfo)
        {
            if (table.getName().equalsIgnoreCase("rack_types") && table.getSchema().getName().equalsIgnoreCase("cageui"))
                customizeRackTypesTable((AbstractTableInfo) table);
            }
        }

    private void customizeRackTypesTable(AbstractTableInfo ti)
    {
        SQLFragment sql = new SQLFragment("(SELECT (length * width) as sqft)");
        ExprColumn newCol = new ExprColumn(ti, "sqft", sql, JdbcType.VARCHAR);
        newCol.setLabel("Square Feet");
        newCol.setDescription("Square footage of the cages in the rack type");
        ti.addColumn(newCol);
    }
}
