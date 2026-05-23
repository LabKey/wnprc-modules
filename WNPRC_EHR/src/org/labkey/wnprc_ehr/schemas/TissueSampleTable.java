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
package org.labkey.wnprc_ehr.schemas;

import org.labkey.api.exp.PropertyDescriptor;
import org.labkey.api.exp.PropertyType;
import org.labkey.api.exp.property.SystemProperty;
import org.labkey.wnprc_ehr.WNPRC_EHRModule;

/**
 * Created by jon on 2/14/17.
 */
public class TissueSampleTable {
    public static String TABLENAME = "tissue_samples";

    public static SystemProperty COLLECT_BEFORE_DEATH = new SystemProperty(Properties.generateURI("study", TABLENAME, "collect_before_death"), PropertyType.BOOLEAN) {
        @Override
        protected PropertyDescriptor constructPropertyDescriptor() {
            PropertyDescriptor pd = super.constructPropertyDescriptor();
            pd.setName("collect_before_death");
            pd.setLabel("Collect Before Death");
            pd.setContainer(WNPRC_EHRModule.getDefaultContainer());
            pd.setDescription("If true, the tissue should be collected antemortem.");
            return pd;
        }
    };

    public static SystemProperty COLLECTION_ORDER = new SystemProperty(Properties.generateURI("study", TABLENAME, "collection_order"), PropertyType.INTEGER) {
        @Override
        protected PropertyDescriptor constructPropertyDescriptor() {
            PropertyDescriptor pd = super.constructPropertyDescriptor();
            pd.setName("collection_order");
            pd.setLabel("Collection Order");
            pd.setContainer(WNPRC_EHRModule.getDefaultContainer());
            pd.setDescription("This is the order that tissues should appear in the collection list.");
            return pd;
        }
    };

    public static void registerProperties() {
        // Do nothing.  Just referencing this class loads and registers it.
    }
}
