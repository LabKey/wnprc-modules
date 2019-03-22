/*
 * Copyright (c) 2015 LabKey Corporation
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

package org.labkey.webutils;

import org.labkey.api.action.ApiSimpleResponse;
import org.labkey.api.action.ReadOnlyApiAction;
import org.labkey.api.action.SimpleViewAction;
import org.labkey.api.action.SpringActionController;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.security.ActionNames;
import org.labkey.api.security.RequiresNoPermission;
import org.labkey.api.security.RequiresPermission;
import org.labkey.api.security.User;
import org.labkey.api.security.permissions.ReadPermission;
import org.labkey.api.view.JspView;
import org.labkey.api.view.NavTree;
import org.labkey.webutils.api.action.SimpleJspPageAction;
import org.springframework.validation.BindException;
import org.springframework.web.servlet.ModelAndView;

import java.util.HashMap;
import java.util.Map;

public class WebUtilsController extends SpringActionController
{
    private static final DefaultActionResolver _actionResolver = new DefaultActionResolver(WebUtilsController.class);
    public static final String NAME = "webutils";

    public WebUtilsController()
    {
        setActionResolver(_actionResolver);
    }

    @RequiresPermission(ReadPermission.class)
    public class BeginAction extends SimpleViewAction
    {
        public ModelAndView getView(Object o, BindException errors) throws Exception
        {
            return new JspView("/org/labkey/webutils/view/begin.jsp");
        }

        public NavTree appendNavTrail(NavTree root)
        {
            return root;
        }
    }

    @RequiresNoPermission
    @ActionNames("loginStatus")
    public class getLoginStatus extends ReadOnlyApiAction<Void>
    {
        @Override
        public Object execute(Void v, BindException errors) throws Exception {
            Map<String, Object> json = new HashMap<>();

            // Check to see if we're logged in as a guest.
            Boolean loggedIn = !(getUser() == User.guest);
            json.put("loggedIn", loggedIn);

            return new ApiSimpleResponse(json);
        }
    }

    public abstract class WebUtilsJspPageAction extends SimpleJspPageAction {
        @Override
        public Module getModule() {
            return ModuleLoader.getInstance().getModule(WebUtilsModule.class);
        }
    }

    public class TestPageAction extends WebUtilsJspPageAction {
        @Override
        public String getPathToJsp() {
            return "view/TestPage.jsp";
        }

        @Override
        public String getTitle() {
            return "Test Page";
        }
    }
}
