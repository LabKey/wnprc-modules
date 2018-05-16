package org.labkey.wnprc_ehr.dataentry.forms.BloodDrawRequest;

import org.labkey.api.ehr.dataentry.AnimalDetailsFormSection;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.ehr.dataentry.RequestForm;
import org.labkey.api.ehr.dataentry.RequestFormSection;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.WNPRCConstants;
import org.labkey.wnprc_ehr.dataentry.forms.BloodDrawRequest.FormSections.BloodDrawRequestFormSection;

import java.util.Arrays;

public class BloodDrawRequestForm extends RequestForm {
    public static final String NAME = "Blood Draw Request";

    public BloodDrawRequestForm(DataEntryFormContext ctx, Module owner) {
        super(ctx, owner, NAME, "Request Blood Draws", WNPRCConstants.DataEntrySections.COLONY_RECORDS, Arrays.asList(
                new RequestFormSection(),
                new AnimalDetailsFormSection(),
                new BloodDrawRequestFormSection()
        ));

        addClientDependency(ClientDependency.fromPath("wnprc_ehr/model/sources/Request.js"));
    }
}
