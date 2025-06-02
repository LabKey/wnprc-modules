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

package org.labkey.cageui.query;

import org.jetbrains.annotations.Nullable;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerFilter;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.TableInfo;
import org.labkey.api.query.SimpleUserSchema;
import org.labkey.api.security.User;
import org.labkey.cageui.CageUISchema;
import org.labkey.cageui.security.permissions.CageUILayoutEditorAccessPermission;

public class CageUIUserSchema extends SimpleUserSchema
{
    public static final String NAME = "cageui";
    public static final String LAYOUT_HISTORY_TABLE = "layout_history";
    public static final String RACK_TYPES_TABLE = "rack_types";
    public static final String RACKS_TABLE = "racks";

    public CageUIUserSchema(User user, Container container, DbSchema dbschema)
    {
        super(CageUISchema.NAME, "Cage UI Tables", user, container, dbschema);
    }

    public enum TableType
    {
        layout_history
                {
                    @Override
                    public TableInfo createTable(CageUIUserSchema schema, ContainerFilter cf)
                    {
                        if (schema.getContainer().hasPermission(schema.getUser(), CageUILayoutEditorAccessPermission.class))
                        {
                            return new LayoutHistoryTable(schema, CageUISchema.getInstance().getLayoutHistoryTable(), cf).init();
                        }

                        return null;
                    }
                },
        rack_types
                {
                    @Override
                    public TableInfo createTable(CageUIUserSchema schema, ContainerFilter cf)
                    {
                        return new RackTypesTable(schema, CageUISchema.getInstance().getRackTypesTable(), cf).init();
                    }
                },
        racks
                {
                    @Override
                    public TableInfo createTable(CageUIUserSchema schema, ContainerFilter cf)
                    {
                        return new RacksTable(schema, CageUISchema.getInstance().getRacksTable(), cf).init();
                    }
                };

        public abstract TableInfo createTable(CageUIUserSchema schema, ContainerFilter cf);
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