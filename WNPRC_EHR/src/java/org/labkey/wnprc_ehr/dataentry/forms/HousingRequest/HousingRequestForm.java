package org.labkey.wnprc_ehr.dataentry.forms.HousingRequest;

import org.labkey.api.ehr.dataentry.AnimalDetailsFormSection;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.ehr.dataentry.TaskForm;
import org.labkey.api.ehr.dataentry.TaskFormSection;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.WNPRCConstants;
import org.labkey.wnprc_ehr.dataentry.forms.HousingRequest.FormSections.HousingSection;

import java.util.Arrays;

public class HousingRequestForm extends TaskForm {
    public static final String NAME = "Housing Request";

    public HousingRequestForm(DataEntryFormContext ctx, Module owner) {
        super(ctx, owner, NAME, NAME, WNPRCConstants.DataEntrySections.REQUESTS, Arrays.asList(
                new TaskFormSection(),
                new AnimalDetailsFormSection(),
                new HousingSection()
        ));

        addClientDependency(ClientDependency.fromPath("wnprc_ehr/model/sources/Request.js"));
    }
}
