/*
 *
 *  * Copyright (c) 2025 Board of Regents of the University of Wisconsin System
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *     http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
 */

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
        SQLFragment sqlSqft = new SQLFragment("(SELECT ROUND((length / 12 * width / 12), 2) as sqft)");
        ExprColumn newColSqft = new ExprColumn(ti, "sqft", sqlSqft, JdbcType.VARCHAR);
        newColSqft.setLabel("Square Feet");
        newColSqft.setDescription("Square footage of the cages in the rack type");
        ti.addColumn(newColSqft);

        SQLFragment sqlName = new SQLFragment("(SELECT CAST(rack_types$type$.\"title\"  AS TEXT) || '-' || CAST(manufacturer AS TEXT) || '-' || CAST(size AS TEXT) || CASE WHEN stationary THEN '-stationary' ELSE '' END as name)");
        ExprColumn newColName = new ExprColumn(ti, "name", sqlName, JdbcType.VARCHAR);
        newColName.setLabel("Name");
        newColName.setDescription("Name of the rack type combing several columns into a string so the users have a detailed view of what they are choosing");
        ti.addColumn(newColName);
    }
}
