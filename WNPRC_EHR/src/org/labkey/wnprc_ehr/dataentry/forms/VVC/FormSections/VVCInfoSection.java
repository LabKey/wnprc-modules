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
package org.labkey.wnprc_ehr.dataentry.forms.VVC.FormSections;

import org.labkey.wnprc_ehr.dataentry.generics.sections.SimpleFormSection;
//import org.labkey.api.ehr.dataentry.SimpleFormSection;

import java.util.Arrays;

public class VVCInfoSection extends SimpleFormSection{
    private String _clientModelClass = "EHR.model.DefaultClientModel";
    public VVCInfoSection(){
        super("wnprc", "vvc", "Veterinary Verification and Consultation");
        this.addConfigSource("Default");
       // addClientDependency(ClientDependency.supplierFromPath("/ehr/panel/EnterDataPanel.js"));
        setTemplateMode(TEMPLATE_MODE.NONE);

        fieldNamesAtStartInOrder = Arrays.asList(
                "dateRequested",
                "Project"
        );

    }
    @Override
    public String getClientModelClass()
    {
        return _clientModelClass;
    }

    @Override
    protected void setClientModelClass(String clientModelClass)
    {
        _clientModelClass = clientModelClass;
    }

}
