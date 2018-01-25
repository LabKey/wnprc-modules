package org.labkey.wnprc_ehr.dataentry.forms.Necropsy.FormSections;

import org.labkey.wnprc_ehr.dataentry.generics.sections.SlaveGridSection;

import java.util.HashSet;
import java.util.Set;

public class HistologySection extends SlaveGridSection {
    public HistologySection() {
        super("study", "Histology", "Histology");
    }


    @Override
    public Set<String> getSlaveFields() {
        Set<String> fields = new HashSet<>();

        fields.add("Id");
        fields.add("date");

        return fields;
    }
}
