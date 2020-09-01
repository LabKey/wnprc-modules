package org.labkey.wnprc_ehr.dataentry.forms.Necropsy.FormSections;

import org.labkey.wnprc_ehr.dataentry.generics.sections.SimpleFormSection;

import java.util.Arrays;

public class NecropsyInfoSection extends SimpleFormSection {
    public NecropsyInfoSection() {
        super("study", "Necropsies", "Necropsies");
        setTemplateMode(TEMPLATE_MODE.NONE);

        fieldNamesAtStartInOrder = Arrays.asList(
                "Id",
                "date",
                "is_prenatal_necropsy",
                "dam",
                "project",
                "account",
                "tattoo",
                "caseno",
                "location",
                "performedby",
                "pathologistHistology",
                "pathologistReview",
                "assistant",
                "billing",
                "tissue_distribution",
                "timeofdeath",
                "causeofdeath",
                "mannerofdeath",
                "perfusion_area"
        );

        fieldNamesAtEndInOrder = Arrays.asList(
                "grossdescription",
                "histologicalDescription",
                "remark",
                "patho_notes",
                "comments"
        );

        maxItemsPerColumn = 16;

        setClientStoreClass("WNPRC.ext.data.SingleAnimal.NecropsyClientStore");
    }
}