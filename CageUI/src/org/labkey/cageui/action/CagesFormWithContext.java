/*
 *
 *  * Copyright (c) 2026 Board of Regents of the University of Wisconsin System
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *     http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
 */

package org.labkey.cageui.action;

import java.util.ArrayList;
import java.util.Map;

public class CagesFormWithContext
{
    private ArrayList<CagesForm> _cagesForm;
    private Map<String,Map<String, Object>> _extraContext;

    public ArrayList<CagesForm> getCagesForm()
    {
        return _cagesForm;
    }

    public void setCagesForm(ArrayList<CagesForm> cagesForm)
    {
        _cagesForm = cagesForm;
    }

    public Map<String,Map<String, Object>> getExtraContext()
    {
        return _extraContext;
    }

    public void setExtraContext(Map<String,Map<String, Object>> extraContext)
    {
        _extraContext = extraContext;
    }
}
