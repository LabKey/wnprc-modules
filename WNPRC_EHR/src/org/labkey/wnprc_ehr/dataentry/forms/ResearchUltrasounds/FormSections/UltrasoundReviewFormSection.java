package org.labkey.wnprc_ehr.dataentry.forms.ResearchUltrasounds.FormSections;

import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.dataentry.generics.sections.SlaveFormSection;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class UltrasoundReviewFormSection extends SlaveFormSection
{
    public UltrasoundReviewFormSection() {
        super("study", "ultrasound_review", "Ultrasound Review");
    }

    @Override
    public Set<String>  getSlaveFields() {
        Set<String> fields = new HashSet<>();
        fields.add("Id");
        return fields;
    }

    @Override
    protected List<String> getFieldNames() {
        List<String> fieldNames = new ArrayList<>();
        fieldNames.add("Id");
        fieldNames.add("date");
        fieldNames.add("head");
        fieldNames.add("falx");
        fieldNames.add("thalamus");
        fieldNames.add("lateral_ventricles");
        fieldNames.add("choroid_plexus");
        fieldNames.add("eye");
        fieldNames.add("profile");
        fieldNames.add("four_chamber_heart");
        fieldNames.add("diaphragm");
        fieldNames.add("stomach");
        fieldNames.add("bowel");
        fieldNames.add("bladder");
        fieldNames.add("findings");
        fieldNames.add("placenta_notes");
        fieldNames.add("remarks");
        fieldNames.add("completed");
        return fieldNames;
    }
}
