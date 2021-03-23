package org.labkey.wnprc_ehr.dataentry.forms.ProcedureRequest;

import org.labkey.api.ehr.dataentry.AnimalDetailsFormSection;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.ehr.dataentry.TaskForm;
import org.labkey.api.ehr.dataentry.TaskFormSection;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.WNPRCConstants;
import org.labkey.wnprc_ehr.dataentry.forms.ProcedureRequest.FormSections.BloodDrawsSection;
import org.labkey.wnprc_ehr.dataentry.forms.ProcedureRequest.FormSections.ProceduresRequestedSection;

import java.util.Arrays;

public class ProcedureRequestForm extends TaskForm {
    public static final String NAME = "Procedure Request";

    public ProcedureRequestForm(DataEntryFormContext ctx, Module owner) {
        super(ctx, owner, NAME, NAME, WNPRCConstants.DataEntrySections.REQUESTS, Arrays.asList(
                new TaskFormSection(),
                new AnimalDetailsFormSection(),
                new ProceduresRequestedSection(),
                new BloodDrawsSection()
        ));

        for(FormSection section: this.getFormSections()) {
            section.addConfigSource("Request");
        }

        this.addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/model/sources/Request.js"));
    }
}
