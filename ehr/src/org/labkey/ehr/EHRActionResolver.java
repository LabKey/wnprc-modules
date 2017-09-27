/*
 * Copyright (c) 2013-2016 LabKey Corporation
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
package org.labkey.ehr;

import org.labkey.api.action.SpringActionController;
import org.labkey.api.module.ModuleHtmlView;
import org.labkey.api.module.SimpleAction;
import org.labkey.api.resource.Resource;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.Controller;

/**
 * User: bimber
 * Date: 5/23/13
 * Time: 6:26 PM
 */
public class EHRActionResolver extends SpringActionController.DefaultActionResolver
{
    public EHRActionResolver()
    {
        super(EHRController.class);
    }

    public Controller resolveActionName(Controller actionController, String actionName)
    {
        return super.resolveActionName(actionController, actionName);
    }

    protected SpringActionController.HTMLFileActionResolver getHTMLFileActionResolver()
    {
        return new EHRHTMLFileActionResolver();
    }

    private class EHRHTMLFileActionResolver extends SpringActionController.HTMLFileActionResolver
    {
        public EHRHTMLFileActionResolver()
        {
            super(EHRModule.CONTROLLER_NAME);
        }

        @Override
        protected HTMLFileActionDescriptor createFileActionDescriptor(String actionName, Resource r)
        {
            return new EHRHTMLFileActionDescriptor(actionName, r);
        }

        private class EHRHTMLFileActionDescriptor extends HTMLFileActionDescriptor
        {
            private EHRHTMLFileActionDescriptor(String primaryName, Resource resource)
            {
                super(primaryName, resource);
            }

            @Override
            public Class<? extends Controller> getActionClass()
            {
                return EHRSimpleAction.class;
            }

            @Override
            public Controller createController(Controller actionController)
            {
                return new EHRSimpleAction(_resource);
            }
        }
    }

    private class EHRSimpleAction extends SimpleAction
    {

        public EHRSimpleAction(Resource r)
        {
            super(r);
        }

        @Override
        public ModelAndView handleRequest() throws Exception
        {
            EHRServiceImpl service = EHRServiceImpl.get();

            //TODO: best method to find action name?
            Resource r = service.getActionOverride(getViewContext().getActionURL().getAction(), getContainer());
            if (r != null)
            {
                ModuleHtmlView view = new ModuleHtmlView(r);

                //override page template if view requests
                if (null != view.getPageTemplate())
                    getPageConfig().setTemplate(view.getPageTemplate());

                return view;
            }

            return super.handleRequest();
        }
    }
}