/*
 * Copyright (c) 2018-2026 Board of Regents of the University of Wisconsin System
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
package org.labkey.webutils.api.action;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.labkey.api.view.template.PageConfig;
import org.springframework.web.servlet.ModelAndView;

/**
 * Created by jon on 9/16/16.
 */
public abstract class SimpleJspReportAction extends SimpleJspPageAction {
    @Override
    protected void beforeRender(HttpServletRequest request, HttpServletResponse response, ModelAndView _pageView) {
        super.beforeRender(request, response, _pageView);

        // Reports should display without the LabKey header.
        getPageConfig().setTemplate(PageConfig.Template.Body);
    }
}
