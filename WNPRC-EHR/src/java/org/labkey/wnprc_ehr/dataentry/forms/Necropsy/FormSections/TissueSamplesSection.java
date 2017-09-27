package org.labkey.wnprc_ehr.dataentry.forms.Necropsy.FormSections;

import org.labkey.wnprc_ehr.dataentry.generics.sections.SlaveGridSection;

import java.util.*;

public class TissueSamplesSection extends SlaveGridSection {
    public TissueSamplesSection() {
        super("study", "Tissue Samples", "Tissue Samples");
    }

    @Override
    public List<String> getFieldNames() {
        return Arrays.asList(
                "lab_sample_id",
                "collection_order",
                "collect_before_death",
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


    @Override
    public List<String> getTbarButtons() {
        List<String> defaultButtons = new ArrayList<>();
        defaultButtons.addAll(super.getTbarButtons());

        defaultButtons.add("WNPRC_AUTO_ASSIGN_ORDER");

        return defaultButtons;
    }
}
