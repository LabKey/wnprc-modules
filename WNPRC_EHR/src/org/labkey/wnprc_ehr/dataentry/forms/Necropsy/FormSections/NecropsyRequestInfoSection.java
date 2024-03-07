package org.labkey.wnprc_ehr.dataentry.forms.Necropsy.FormSections;

import org.labkey.api.ehr.dataentry.AbstractFormSection;
import org.labkey.wnprc_ehr.dataentry.generics.sections.SimpleFormSection;

import java.util.Arrays;
import java.util.List;

/**
 * Created by jon on 3/15/16.
 */
public class NecropsyRequestInfoSection extends SimpleFormSection {
    public NecropsyRequestInfoSection() {
        super("study", "Necropsies", "Necropsies");
        setTemplateMode(AbstractFormSection.TEMPLATE_MODE.NONE);

        this.maxItemsPerColumn = 9;

        setClientStoreClass("WNPRC.ext.data.SingleAnimal.NecropsyClientStore");
    }

    @Override
    protected List<String> getFieldNames() {
        return Arrays.asList(
                //animal information
                "Id",
                "is_prenatal_necropsy",
                "dam",

                //necropsy information
                "perfusion_area",
                "perfusion_soln1",
                "perfusion_soln2",

                //Billing information
                "project",
                "account",

                //logistic information
                "date",
                "location",
                "shipping",
                "shipping_comment",

                //additional information
                "comments"
        );
    }
}
