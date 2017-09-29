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
import org.labkey.api.data.Container;
import org.labkey.api.module.Module;
import org.labkey.api.module.SimpleAction;
import org.labkey.api.util.Pair;
import org.labkey.api.util.Path;
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
        protected HTMLFileActionDescriptor createFileActionDescriptor(Module module, String actionName)
        {
            return new EHRHTMLFileActionDescriptor(module, actionName);
        }

        private class EHRHTMLFileActionDescriptor extends HTMLFileActionDescriptor
        {
            private EHRHTMLFileActionDescriptor(Module module, String primaryName)
            {
                super(module, primaryName);
            }

            @Override
            public Controller createController(Controller actionController)
            {
                Container c = ((SpringActionController)actionController).getViewContext().getContainer();
                Pair<Module, Path> pair = EHRServiceImpl.get().getActionOverride(getPrimaryName(), c);

                return (null == pair ? super.createController(actionController) : new SimpleAction(pair.first, pair.second));
            }
        }
    }
}