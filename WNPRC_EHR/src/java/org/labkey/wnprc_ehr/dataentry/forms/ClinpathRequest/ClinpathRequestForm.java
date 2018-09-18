package org.labkey.wnprc_ehr.dataentry.forms.ClinpathRequest;

import org.labkey.api.ehr.dataentry.AnimalDetailsFormSection;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.ehr.dataentry.RequestForm;
import org.labkey.api.ehr.dataentry.RequestFormSection;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.WNPRCConstants;
import org.labkey.wnprc_ehr.dataentry.forms.ClinpathRequest.FormSections.ClinpathRunsSection;

import java.util.Arrays;

public class ClinpathRequestForm extends RequestForm {
    public static final String NAME = "Clinpath Request";

    public ClinpathRequestForm(DataEntryFormContext ctx, Module owner) {
        super(ctx, owner, NAME, "Request Clinpath Services", WNPRCConstants.DataEntrySections.REQUESTS, Arrays.asList(
                new RequestFormSection(),
                new ClinpathRunsSection(),
                new AnimalDetailsFormSection()
        ));

        this.addClientDependency(ClientDependency.fromPath("wnprc_ehr/model/sources/Request.js"));

        // Add the "Request" config source to each page.
        for (FormSection section : this.getFormSections()) {
            section.addConfigSource("WNPRC_Request");
        }
    }
}
