/*
 * Copyright (c) 2020-2026 Board of Regents of the University of Wisconsin System
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
package org.labkey.wnprc_ehr.query;

import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.DataColumn;
import org.labkey.api.data.DisplayColumn;
import org.labkey.api.data.DisplayColumnFactory;
import org.labkey.api.data.RenderContext;
import org.labkey.api.util.HtmlString;

public class ViralLoadUnitsDisplayColumnFactory implements DisplayColumnFactory
{
    @Override
    public DisplayColumn createRenderer(ColumnInfo colInfo) {
        return new ViralLoadUnitsColumn(colInfo);
    }

    public static class ViralLoadUnitsColumn extends DataColumn
    {
        public ViralLoadUnitsColumn(ColumnInfo colInfo) {
            super(colInfo);
        }

        @Override
        public Object getValue(RenderContext ctx) {
            Object value = super.getValue(ctx);
            if (value instanceof Boolean) {
                boolean liquid = (Boolean) value;
                if (liquid) {
                    return "mL";
                }
                else {
                    return "mg";
                }
            }
            return "";
        }

        @Override
        public Object getDisplayValue(RenderContext ctx) {
            return getValue(ctx);
        }

        @Override
        public @NotNull HtmlString getFormattedHtml(RenderContext ctx) {
            return HtmlString.of(getValue(ctx));
        }
    }
}
