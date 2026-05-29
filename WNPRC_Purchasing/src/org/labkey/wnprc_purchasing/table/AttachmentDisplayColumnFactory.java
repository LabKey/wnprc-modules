/*
 * Copyright (c) 2021-2026 Board of Regents of the University of Wisconsin System
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
package org.labkey.wnprc_purchasing.table;

import org.jetbrains.annotations.NotNull;
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
        public @NotNull HtmlString getFormattedHtml(RenderContext ctx)
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
