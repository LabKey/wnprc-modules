package org.labkey.wnprc_ehr.dataentry.forms.Necropsy.FormSections;

import org.labkey.wnprc_ehr.dataentry.generics.sections.SlaveFormSection;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class BodyConditionSection extends SlaveFormSection {
    public BodyConditionSection() {
        super("study", "Body Condition", "Body Condition");

        maxItemsPerColumn = 10;
    }

    @Override
    public Set<String> getSlaveFields() {
        Set<String> fields = new HashSet<>();

        fields.add("Id");
        fields.add("date");

        return fields;
    }

    @Override
    protected List<String> getFieldNames() {
        return Arrays.asList("Id", "date", "score");
    }
}
