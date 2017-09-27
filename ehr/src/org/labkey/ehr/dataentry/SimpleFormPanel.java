/*
 * Copyright (c) 2013 LabKey Corporation
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
package org.labkey.ehr.dataentry;

import org.labkey.api.ehr.dataentry.SimpleFormSection;

/**
 * User: bimber
 * Date: 4/27/13
 * Time: 10:54 AM
 */
public class SimpleFormPanel extends SimpleFormSection
{
    public SimpleFormPanel(String schemaName, String queryName, String label)
    {
        super(schemaName, queryName, label, "ehr-formpanel");
    }
}
