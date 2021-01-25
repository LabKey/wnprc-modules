package org.labkey.wnprc_purchasing.table;

import org.apache.commons.lang3.StringUtils;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.DataColumn;
import org.labkey.api.data.DisplayColumn;
import org.labkey.api.data.DisplayColumnFactory;
import org.labkey.api.data.RenderContext;
import org.labkey.api.util.HtmlString;
import org.labkey.api.util.HtmlStringBuilder;
import org.labkey.api.util.Link;
import org.labkey.api.view.ActionURL;
import org.labkey.api.view.HtmlView;

public class AttachmentDisplayColumnFactory implements DisplayColumnFactory
{

    @Override
    public DisplayColumn createRenderer(ColumnInfo colInfo)
    {
        return new AttachmentDisplayColumn(colInfo);
    }

    private class AttachmentDisplayColumn extends DataColumn
    {
        public AttachmentDisplayColumn(ColumnInfo colInfo)
        {
            super(colInfo);
        }

        @Override
        public HtmlString getFormattedHtml(RenderContext ctx)
        {
            String fileAttachment = (String) ctx.get(getColumnInfo().getFieldKey());
//            HtmlStringBuilder hsb = HtmlStringBuilder.of();
            StringBuilder hsb = new StringBuilder();
            if (StringUtils.isNotBlank(fileAttachment))
            {
                //file attachments are saved as a string with "||" delimiters between file names ex. fileA||fileB
                String[] attachments = fileAttachment.split("\\|\\|");
                int index = 0;
                for (String attachment : attachments)
                {
                    if (index++ > 0) {
                     hsb.append(", ");
                    }
                    hsb.append("<a href=\"query-executeQuery.view?schemaName=exp&query.queryName=Files&query.Name~eq=" + attachment + "\">" + attachment +"</a>");
                }
            }
            else
            {
                hsb.append(HtmlString.NBSP);
            }

            return HtmlString.of(hsb);
        }

    }
}
