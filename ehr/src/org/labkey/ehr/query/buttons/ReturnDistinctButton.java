/*
 * Copyright (c) 2013-2015 LabKey Corporation
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
package org.labkey.ehr.query.buttons;

import org.labkey.api.data.TableInfo;
import org.labkey.api.ldk.table.SimpleButtonConfigFactory;
import org.labkey.api.module.Module;
import org.labkey.api.study.DatasetTable;
import org.labkey.api.view.template.ClientDependency;

/**
 * User: bimber
 * Date: 7/10/13
 * Time: 8:10 PM
 */
public class ReturnDistinctButton extends SimpleButtonConfigFactory
{
    public ReturnDistinctButton(Module owner)
    {
        super(owner, "Return Distinct Values", "EHR.window.GetDistinctWindow.getDistinctHandler(dataRegionName);");
        setClientDependencies(ClientDependency.fromModuleName("ehr"));
    }

    public boolean isAvailable(TableInfo ti)
    {
        return super.isAvailable(ti) && ti instanceof DatasetTable;
    }
}
