/*
 * Copyright (c) 2017 LabKey Corporation
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

package org.labkey.wnprc_billing;

import org.labkey.api.action.ExportAction;
import org.labkey.api.action.SimpleViewAction;
import org.labkey.api.action.SpringActionController;
import org.labkey.api.security.RequiresPermission;
import org.labkey.api.security.permissions.ReadPermission;
import org.labkey.api.util.PageFlowUtil;
import org.labkey.api.view.JspView;
import org.labkey.api.view.NavTree;
import org.labkey.ehr.pdf.InvoicePDF;
import org.springframework.validation.BindException;
import org.springframework.web.servlet.ModelAndView;
import sun.java2d.opengl.OGLSurfaceData;

import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;

public class WNPRC_BillingController extends SpringActionController
{
    private static final DefaultActionResolver _actionResolver = new DefaultActionResolver(WNPRC_BillingController.class);
    public static final String NAME = "wnprc_billing";

    public WNPRC_BillingController()
    {
        setActionResolver(_actionResolver);
    }

    @RequiresPermission(ReadPermission.class)
    public class PDFExportAction extends ExportAction
    {
        @Override
        public void export(Object o, HttpServletResponse response, BindException errors) throws Exception
        {
            InvoicePDF pdf = new InvoicePDF();

            pdf.addPage();

            List<InvoicePDF.FormattedLineItem> items = new ArrayList<>();
            for (int i = 1; i < 100; i++)
            {
                items.add(new InvoicePDF.FormattedLineItem(new Date(2017, 12, i / 4 + 1), "Item " + i, 3, 1.3f * i));
            }
            pdf.addLines(items);

            PageFlowUtil.prepareResponseForFile(getViewContext().getResponse(), Collections.emptyMap(), "WNPRC_Invoice.pdf", true);
            pdf.output(getViewContext().getResponse().getOutputStream());
        }
    }
}