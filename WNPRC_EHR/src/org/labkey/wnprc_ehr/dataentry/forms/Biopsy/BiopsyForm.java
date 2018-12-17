package org.labkey.wnprc_ehr.dataentry.forms.Biopsy;

import org.labkey.api.ehr.dataentry.AnimalDetailsFormSection;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.ehr.dataentry.TaskForm;
import org.labkey.api.ehr.dataentry.TaskFormSection;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.WNPRCConstants;
import org.labkey.wnprc_ehr.dataentry.forms.Biopsy.FormSections.BiopsyInfoSection;
import org.labkey.wnprc_ehr.dataentry.forms.Biopsy.FormSections.HistologySection;
import org.labkey.wnprc_ehr.dataentry.forms.Biopsy.FormSections.MorphologicDiagnosisSection;
import org.labkey.wnprc_ehr.dataentry.forms.Biopsy.FormSections.TissueSamplesSection;

import java.util.Arrays;

public class BiopsyForm extends TaskForm {
    public static final String NAME = "Biopsy";

    public BiopsyForm(DataEntryFormContext ctx, Module owner) {
        super(ctx, owner, NAME, "Enter Biopsy", WNPRCConstants.DataEntrySections.PATHOLOGY_CLINPATH, Arrays.asList(
                new TaskFormSection(),
                new AnimalDetailsFormSection(),
                new BiopsyInfoSection(),
                new TissueSamplesSection(),
                new HistologySection(),
                new MorphologicDiagnosisSection()
        ));

        for(FormSection section: this.getFormSections()) {
            section.addConfigSource("Task");
            section.addConfigSource("Biopsy");
        }

        this.addClientDependency(ClientDependency.fromPath("wnprc_ehr/model/sources/Biopsy.js"));
    }
}
