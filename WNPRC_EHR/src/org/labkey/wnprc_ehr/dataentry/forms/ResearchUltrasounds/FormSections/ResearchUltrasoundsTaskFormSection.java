package org.labkey.wnprc_ehr.dataentry.forms.ResearchUltrasounds.FormSections;

import org.labkey.wnprc_ehr.dataentry.generics.sections.SimpleFormSection;

public class ResearchUltrasoundsTaskFormSection extends SimpleFormSection
{
    public ResearchUltrasoundsTaskFormSection() {
        super("study", "ResearchUltrasoundsInfo", "Research Ultrasounds");

        this.maxItemsPerColumn = 20;
        setClientStoreClass("WNPRC.ext.data.SingleAnimal.ResearchUltrasoundsClientStore");
    }
}
