/*
 * Copyright (c) 2013-2017 LabKey Corporation
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
package org.labkey.wnprc_billing.dataentry;

import org.labkey.api.ehr.dataentry.NonStoreFormSection;
import org.labkey.api.view.template.ClientDependency;

/**
 * Class to administer Ext4JS component for Animal Details/Demographics info for data entry form.
 */
public class WNPRC_BillingAnimalDetailsFormSection extends NonStoreFormSection
{
    public WNPRC_BillingAnimalDetailsFormSection()
    {
        super("AnimalDetails", "Animal Details", "ehr_billing-animaldetailspanel");
        addClientDependency(ClientDependency.supplierFromPath("ehr_billing/panel/EHR_BillingAnimalDetailsPanel.js"));
    }
}