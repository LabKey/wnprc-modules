package org.labkey.wnprc_ehr.dataentry.forms.Necropsy.FormSections;

import org.labkey.wnprc_ehr.dataentry.generics.sections.SlaveGridSection;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class TissueSamplesSection extends SlaveGridSection {
    public TissueSamplesSection() {
        super("study", "Tissue Samples", "Tissue Samples");
    }

    @Override
    public List<String> getFieldNames() {
        return Arrays.asList(
                "lab_sample_id",
                "tissue",
                "qualifier",
                "preservation",
                "container_type",
                "quantity",
                "stain",
                "recipient",
                "ship_to",
                "accountToCharge",
                "tissueRemarks",
                "ship_to_comment",
                "pathologist",
                "trimdate",
                "trimmed_by",
                "trim_remarks",
                "slideNum",
                "Id",
                "date"
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
