package org.labkey.wnprc_ehr.dataentry.forms.ResearchUltrasounds.FormSections;

import org.labkey.wnprc_ehr.dataentry.generics.sections.SimpleFormSection;

public class ResearchUltrasoundsFormSection extends SimpleFormSection
{
    public ResearchUltrasoundsFormSection() {
        super("study", "research_ultrasounds", "Research Ultrasounds");

        this.maxItemsPerColumn = 20;
        setClientStoreClass("WNPRC.ext.data.SingleAnimal.ResearchUltrasoundsClientStore");
    }
}
