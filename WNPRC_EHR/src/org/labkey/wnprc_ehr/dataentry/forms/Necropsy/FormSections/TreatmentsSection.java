package org.labkey.wnprc_ehr.dataentry.forms.Necropsy.FormSections;

import org.labkey.wnprc_ehr.dataentry.generics.sections.SlaveGridSection;

import java.util.HashSet;
import java.util.Set;

public class TreatmentsSection extends SlaveGridSection {
    public TreatmentsSection() {
        super("study", "Drug Administration", "Treatments");
    }

    @Override
    public Set<String> getSlaveFields() {
        Set<String> fields = new HashSet<>();

        fields.add("Id");
        fields.add("project");
        fields.add("account");

        return fields;
    }
}
