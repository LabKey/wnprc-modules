package org.labkey.wnprc_purchasing.table;

import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.DataColumn;
import org.labkey.api.data.DisplayColumn;
import org.labkey.api.data.DisplayColumnFactory;
import org.labkey.api.data.RenderContext;
import org.labkey.api.files.FileContentService;
import org.labkey.api.util.HtmlString;
import org.labkey.api.util.HtmlStringBuilder;
import org.labkey.api.util.Path;
import org.labkey.api.webdav.AbstractWebdavResource;
import org.labkey.api.webdav.WebdavResolver;
import org.labkey.api.webdav.WebdavResolverImpl;
import org.labkey.api.webdav.WebdavResource;

import java.util.Collection;

import static org.labkey.api.util.DOM.A;
import static org.labkey.api.util.DOM.Attribute.href;
import static org.labkey.api.util.DOM.at;
import static org.labkey.api.util.DOM.createHtml;

public class AttachmentDisplayColumnFactory implements DisplayColumnFactory
{
    private final String PURCHASING_ATTACHMENT_FOLDER = "PurchasingRequestAttachments";

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
            String subFolder = String.valueOf(getValue(ctx));
            WebdavResolver resolver = WebdavResolverImpl.get();
            Path root = resolver.getRootPath();
            String pathStr = AbstractWebdavResource.c(root.getName() + ctx.getContainerPath(), FileContentService.FILES_LINK, PURCHASING_ATTACHMENT_FOLDER, subFolder);
            WebdavResource attachmentRoot = resolver.lookup(Path.parse(pathStr));
            HtmlStringBuilder html = HtmlStringBuilder.of();

            if (null != attachmentRoot)
            {
                Collection<? extends WebdavResource> list = attachmentRoot.list();
                int index = 0;

                for(WebdavResource r : list)
                {
                    if (index++ > 0) {
                        html.append(", ");
                    }
                    html.append(createHtml(A(at(href, r.getHref(ctx.getViewContext())), r.getName())));
                }
            }
            else
            {
                html.append(HtmlString.NBSP);
            }

            return html.getHtmlString();
        }
    }
}
