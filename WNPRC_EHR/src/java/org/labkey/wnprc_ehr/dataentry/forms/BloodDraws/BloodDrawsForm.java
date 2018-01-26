package org.labkey.wnprc_ehr.dataentry.forms.BloodDraws;

import org.labkey.api.ehr.dataentry.AnimalDetailsFormSection;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.ehr.dataentry.TaskForm;
import org.labkey.api.ehr.dataentry.TaskFormSection;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.WNPRCConstants;
import org.labkey.wnprc_ehr.dataentry.forms.BloodDraws.FormSections.BloodDrawsFormSection;
import org.labkey.wnprc_ehr.dataentry.forms.BloodDraws.FormSections.DrugAdministrationFormSection;

import java.util.Arrays;

public class BloodDrawsForm extends TaskForm {
    public static final String NAME = "Blood Draws";

    public BloodDrawsForm(DataEntryFormContext ctx, Module owner) {
        super(ctx, owner, NAME, "Enter " + NAME, WNPRCConstants.DataEntrySections.CLINICAL_SPI, Arrays.<FormSection>asList(
                new TaskFormSection(),
                new AnimalDetailsFormSection(),
                new BloodDrawsFormSection(),
                new DrugAdministrationFormSection()
        ));

        this.addClientDependency(ClientDependency.fromPath("wnprc_ehr/model/sources/BloodDraws.js"));

        for(FormSection section: this.getFormSections()) {
            section.addConfigSource("BloodDraws");
        }
    }
}
