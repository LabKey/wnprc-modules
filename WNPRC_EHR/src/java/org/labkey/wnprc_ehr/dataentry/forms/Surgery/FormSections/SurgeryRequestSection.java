package org.labkey.wnprc_ehr.dataentry.forms.Surgery.FormSections;

import org.labkey.api.ehr.dataentry.AbstractFormSection;
import org.labkey.wnprc_ehr.dataentry.generics.sections.SimpleFormSection;

public class SurgeryRequestSection extends SimpleFormSection
{
    public SurgeryRequestSection() {
        super("study", "surgery", "Surgery");
        setTemplateMode(TEMPLATE_MODE.ENCOUNTER);

        this.maxItemsPerColumn = 12;

        //setClientStoreClass("WNPRC.ext.data.SingleAnimal.SurgeryClientStore");
    }
}