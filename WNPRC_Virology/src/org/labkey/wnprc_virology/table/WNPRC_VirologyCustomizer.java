package org.labkey.wnprc_virology.table;

import org.labkey.api.data.AbstractTableInfo;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.DataColumn;
import org.labkey.api.data.DisplayColumn;
import org.labkey.api.data.DisplayColumnFactory;
import org.labkey.api.data.MutableColumnInfo;
import org.labkey.api.data.RenderContext;
import org.labkey.api.data.TableInfo;
import org.labkey.api.ldk.table.AbstractTableCustomizer;

import java.io.IOException;
import java.io.Writer;
import java.text.DecimalFormat;

public class WNPRC_VirologyCustomizer extends AbstractTableCustomizer
{
    //    private UserSchema _userSchema = null;

    @Override
    public void customize(TableInfo table)
    {
        if (table instanceof AbstractTableInfo)
        {
            //if (matches(table, "list", "viral_load_data_filtered"))
            if (matches(table, "list", "viral_load_data_filtered") || matches(table, "study", "viral_loads"))
            {
                customizeViralLoadFilteredTable((AbstractTableInfo) table);
            }
        }
    }



    private void customizeViralLoadFilteredTable(AbstractTableInfo table)
    {
        String name = "viral_load_average";
        MutableColumnInfo col = (MutableColumnInfo) table.getColumn(name);
        if (null != col)
        {
            //decided to go with just renderGridCellContents() for html display bolding instead of Conditional Format bolding
            //if we need to get more fancy in the future we can go with a ConditionalFormat
            // see the targetedms repo for an example:
            // https://github.com/LabKey/targetedms/blob/aae086c4217c7b7fc0b975c84cc9fb564ea91606/src/org/labkey/targetedms/query/PTMPercentsGroupedCustomizer.java#L223
            //col.setDisplayColumnFactory((boundCol) -> new CDRConditionalFormatDisplayColumn(boundCol));
            col.setDisplayColumnFactory(new DisplayColumnFactory()
            {
                @Override
                public DisplayColumn createRenderer(ColumnInfo colInfo)
                {
                    return new LLoDHtmlFormatDisplayColumn(colInfo);
                }
            });

        }
    }

    private static class LLoDHtmlFormatDisplayColumn extends DataColumn
    {
        public LLoDHtmlFormatDisplayColumn(ColumnInfo colInfo)
        {
            super(colInfo);
        }

        @Override
        public void renderGridCellContents(RenderContext ctx, Writer out) throws IOException
        {

            StringBuilder htmlString = new StringBuilder();
            DecimalFormat df = new DecimalFormat("0.##E00");
            String asString = df.format(ctx.get("viral_load_average"));
            if (ctx.get("below_llod").toString().contains("Yes"))
            {
                htmlString.append("<strong>");
                htmlString.append(asString);
                htmlString.append("</strong>");
                out.write(htmlString.toString());
            }
            else
            {
                htmlString.append(asString);
                out.write(htmlString.toString());
            }
        }
    }
}
