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

        this.maxItemsPerColumn = 4;

        setClientStoreClass("WNPRC.ext.data.SingleAnimal.NecropsyClientStore");
    }

    @Override
    protected List<String> getFieldNames() {
        return Arrays.asList(
                "Id",
                "is_prenatal_necropsy",
                "dam",
                "date",
                "location",
                "project",
                "account",
                "perfusion_area",
                "shipping",
                "shipping_comment",
                "comments"
        );
    }
}
