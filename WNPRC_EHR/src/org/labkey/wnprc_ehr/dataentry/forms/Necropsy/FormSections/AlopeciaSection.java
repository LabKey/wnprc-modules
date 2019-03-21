package org.labkey.wnprc_ehr.dataentry.forms.Necropsy.FormSections;

import org.labkey.wnprc_ehr.dataentry.generics.sections.SlaveFormSection;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

public class AlopeciaSection extends SlaveFormSection {
    public AlopeciaSection() {
        super("study", "Alopecia", "Alopecia");

        maxItemsPerColumn = 9;

        fieldNamesAtStartInOrder = Arrays.asList(
                "score",
                "remark"
        );
    }

    @Override
    public Set<String> getSlaveFields() {
        Set<String> fields = new HashSet<>();

        fields.add("Id");
        fields.add("date");

        return fields;
    }
}
