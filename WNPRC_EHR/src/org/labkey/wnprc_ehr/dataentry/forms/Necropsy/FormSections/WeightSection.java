package org.labkey.wnprc_ehr.dataentry.forms.Necropsy.FormSections;

import java.util.Arrays;
import org.labkey.wnprc_ehr.dataentry.generics.sections.SlaveFormSection;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class WeightSection extends SlaveFormSection {
    public WeightSection() {
        super("study", "Weight", "Weight");

        maxItemsPerColumn = 1;
    }

    @Override
    public Set<String> getSlaveFields() {
        Set<String> fields = new HashSet<>();

        fields.add("Id");

        return fields;
    }

    @Override
    protected List<String> getFieldNames() {
        return Arrays.asList("Id", "date", "weight", "remark");
    }
}