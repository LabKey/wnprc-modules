package org.labkey.wnprc_ehr.query;

import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.DataColumn;
import org.labkey.api.data.DisplayColumn;
import org.labkey.api.data.DisplayColumnFactory;
import org.labkey.api.data.RenderContext;

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
        public String getFormattedValue(RenderContext ctx) {
            return h(getValue(ctx));
        }
    }
}
