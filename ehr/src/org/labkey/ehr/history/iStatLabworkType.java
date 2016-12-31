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
package org.labkey.ehr.history;

import org.labkey.api.ehr.history.SortingLabworkType;
import org.labkey.api.module.Module;

/**
 * User: bimber
 * Date: 3/19/13
 * Time: 11:02 PM
 */
public class iStatLabworkType extends SortingLabworkType
{
    public iStatLabworkType(Module module)
    {
        super("iStat", "study", "iStatRefRange", "iStat", module);
        _normalRangeField = "range";
        _normalRangeStatusField = "status";
    }
}
