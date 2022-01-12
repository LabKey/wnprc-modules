/*
 * Copyright (c) 2016-2018 LabKey Corporation
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

package org.labkey.wnprc_virology;

import org.labkey.api.action.ApiResponse;
import org.labkey.api.action.ApiSimpleResponse;
import org.labkey.api.action.MutatingApiAction;
import org.labkey.api.action.SimpleViewAction;
import org.labkey.api.action.SpringActionController;
import org.labkey.api.pipeline.PipeRoot;
import org.labkey.api.pipeline.PipelineJobException;
import org.labkey.api.pipeline.PipelineService;
import org.labkey.api.pipeline.PipelineValidationException;
import org.labkey.api.security.RequiresPermission;
import org.labkey.api.security.permissions.ReadPermission;
import org.labkey.api.security.permissions.UpdatePermission;
import org.labkey.api.util.Pair;
import org.labkey.api.view.JspView;
import org.labkey.api.view.NavTree;
import org.labkey.wnprc_virology.pipeline.WNPRC_VirologyPopulateFoldersTableJob;
import org.springframework.validation.BindException;
import org.springframework.web.servlet.ModelAndView;

import java.io.File;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

public class WNPRC_VirologyController extends SpringActionController
{
    private static final DefaultActionResolver _actionResolver = new DefaultActionResolver(WNPRC_VirologyController.class);
    public static final String NAME = "WNPRC_Virology";

    public WNPRC_VirologyController()
    {
        setActionResolver(_actionResolver);
    }

    @RequiresPermission(ReadPermission.class)
    public class BeginAction extends SimpleViewAction
    {
        public ModelAndView getView(Object o, BindException errors) throws Exception
        {
            return new JspView("/org/labkey/wnprc_virology/view/hello.jsp");
        }

        @Override
        public void addNavTrail(NavTree root)
        {
        }
    }
    @RequiresPermission(UpdatePermission.class)
    public class WNPRC_VirologyPopulateFoldersTableJobAction extends MutatingApiAction<Object>
    {
        @Override
        public ApiResponse execute(Object form, BindException errors)
        {
            Map<String, Object> resultProperties = new HashMap<>();

            try
            {

                PipeRoot pipelineRoot = PipelineService.get().findPipelineRoot(getContainer());
                PipelineService.get().queueJob(new WNPRC_VirologyPopulateFoldersTableJob(getContainer(), getUser(), getViewContext().getActionURL(), pipelineRoot));

                resultProperties.put("success", true);
            }
            catch (Exception e)
            {
                errors.reject(ERROR_MSG, e.getMessage());
                return null;
            }

            return new ApiSimpleResponse(resultProperties);
        }
    }
}
