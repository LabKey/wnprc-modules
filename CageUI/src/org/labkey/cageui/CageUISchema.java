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

package org.labkey.cageui;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.DbSchemaType;
import org.labkey.api.data.TableInfo;
import org.labkey.cageui.query.CageUIUserSchema;


public class CageUISchema
{
    private static final CageUISchema _instance = new CageUISchema();
    private static Logger _log = LogManager.getLogger(CageUISchema.class);
    public static final String NAME = "cageui";
    public static String DESCRIPTION = "Schema for CageUI specific data.";
    public static final String TABLE_LAYOUT_HISTORY = "layout_history";

    public static CageUISchema getInstance()
    {
        return _instance;
    }

    private CageUISchema()
    {
        // private constructor to prevent instantiation from
        // outside this class: this singleton should only be
        // accessed via org.labkey.ehr.EHRSchema.getInstance().
    }

    public DbSchema getSchema()
    {
        return DbSchema.get(NAME, DbSchemaType.Module);
    }

    public TableInfo getLayoutHistoryTable()
    {
        return getSchema().getTable(CageUIUserSchema.LAYOUT_HISTORY_TABLE);
    }

    public TableInfo getRoomHistoryTable()
    {
        return getSchema().getTable(CageUIUserSchema.ROOM_HISTORY_TABLE);
    }

    public TableInfo getAllHistoryTable()
    {
        return getSchema().getTable(CageUIUserSchema.ALL_HISTORY_TABLE);
    }


    public TableInfo getTemplateLayoutHistoryTable()
    {
        return getSchema().getTable(CageUIUserSchema.TEMPLATE_LAYOUT_HISTORY_TABLE);
    }

    public TableInfo getCageHistoryTable()
    {
        return getSchema().getTable(CageUIUserSchema.CAGE_HISTORY_TABLE);
    }

    public TableInfo getRackTypesTable()
    {
        return getSchema().getTable(CageUIUserSchema.RACK_TYPES_TABLE);
    }

    public TableInfo getRacksTable()
    {
        return getSchema().getTable(CageUIUserSchema.RACKS_TABLE);
    }

    public TableInfo getCagesTable()
    {
        return getSchema().getTable(CageUIUserSchema.CAGES_TABLE);
    }

    public TableInfo getCageModificationsTable()
    {
        return getSchema().getTable(CageUIUserSchema.CAGE_MODIFICATIONS_TABLE);
    }

    public TableInfo getCageModificationsHistoryTable()
    {
        return getSchema().getTable(CageUIUserSchema.CAGE_MODIFICATIONS_HISTORY_TABLE);
    }


}
