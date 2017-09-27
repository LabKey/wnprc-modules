/*
 * Copyright (c) 2014 LabKey Corporation
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
package org.labkey.ehr.buttons;

import org.labkey.api.ehr.buttons.EHRShowEditUIButton;
import org.labkey.api.ehr.security.EHRProjectEditPermission;
import org.labkey.api.ehr.security.EHRProtocolEditPermission;
import org.labkey.api.ldk.buttons.ShowEditUIButton;
import org.labkey.api.module.Module;

import java.util.HashMap;
import java.util.Map;

/**

 */
public class ProjectEditButton extends EHRShowEditUIButton
{
    public ProjectEditButton(Module owner, String schemaName, String queryName)
    {
        super(owner, schemaName, queryName, EHRProjectEditPermission.class);

        Map<String, String> urlParams = new HashMap<>();
        urlParams.put("project", "query.project~eq");
        urlParams.put("protocol", "query.protocol~eq");
        urlParams.put("query.viewName", "query.viewName");
        setUrlParamMap(urlParams);
    }
}
