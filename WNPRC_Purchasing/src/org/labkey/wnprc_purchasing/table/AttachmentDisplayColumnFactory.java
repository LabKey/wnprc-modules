package org.labkey.wnprc_purchasing.table;

import org.apache.commons.lang3.StringUtils;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.DataColumn;
import org.labkey.api.data.DisplayColumn;
import org.labkey.api.data.DisplayColumnFactory;
import org.labkey.api.data.RenderContext;
import org.labkey.api.query.QueryAction;
import org.labkey.api.query.QueryService;
import org.labkey.api.util.HtmlString;
import org.labkey.api.util.PageFlowUtil;
import org.labkey.api.view.ActionURL;

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
            StringBuilder html = new StringBuilder();
            if (StringUtils.isNotBlank(fileAttachment))
            {
                //file attachments are saved as a string with "||" delimiters between file names ex. fileA||fileB
                String[] attachments = fileAttachment.split("\\|\\|");
                int index = 0;
                for (String attachment : attachments)
                {
                    if (index++ > 0) {
                        html.append(", ");
                    }
                    ActionURL url = QueryService.get().urlFor(ctx.getViewContext().getUser(), ctx.getViewContext().getContainer(), QueryAction.executeQuery, "exp", "Files");
                    url.addParameter("Name", attachment);
                    html.append("<a href=\"");
//                    html.append(PageFlowUtil.filter(url));
                    html.append("labkey/_webdav/WNPRC%20Purchasing/%40files/PurchasingRequestAttachments/38/IMG-2982.jpg");
                    html.append("\">");
                    html.append(attachment);
                    html.append("</a>");
                }
            }
            else
            {
                html.append(HtmlString.NBSP);
            }

            return HtmlString.of(html);
        }

    }
}
