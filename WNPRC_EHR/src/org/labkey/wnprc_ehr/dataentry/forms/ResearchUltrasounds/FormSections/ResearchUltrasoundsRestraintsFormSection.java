package org.labkey.wnprc_ehr.dataentry.forms.ResearchUltrasounds.FormSections;

import org.labkey.wnprc_ehr.dataentry.generics.sections.restraintFormSection;

import java.util.Set;

public class ResearchUltrasoundsRestraintsFormSection extends restraintFormSection
{
    public ResearchUltrasoundsRestraintsFormSection() {
        super("Restraint");
    }

    @Override
    public Set<String> getSlaveFields(){
        Set<String> fields = super.getSlaveFields();
        fields.add("date");
        return fields;
    }
}