package org.labkey.wnprc_ehr.dataentry.forms.Clinpath;

import org.labkey.api.ehr.dataentry.AnimalDetailsFormSection;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.TaskForm;
import org.labkey.api.ehr.dataentry.TaskFormSection;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.WNPRCConstants;
import org.labkey.wnprc_ehr.dataentry.forms.Clinpath.FormSections.BacteriologyResultsSection;
import org.labkey.wnprc_ehr.dataentry.forms.Clinpath.FormSections.ChemistryResultsSection;
import org.labkey.wnprc_ehr.dataentry.forms.Clinpath.FormSections.ClinpathRunsFormSection;
import org.labkey.wnprc_ehr.dataentry.forms.Clinpath.FormSections.CytologyAutomatedSection;
import org.labkey.wnprc_ehr.dataentry.forms.Clinpath.FormSections.CytologyManualSection;
import org.labkey.wnprc_ehr.dataentry.forms.Clinpath.FormSections.HematologyMorphologySection;
import org.labkey.wnprc_ehr.dataentry.forms.Clinpath.FormSections.HematologyResultsSection;
import org.labkey.wnprc_ehr.dataentry.forms.Clinpath.FormSections.ImmunologyResultsSection;
import org.labkey.wnprc_ehr.dataentry.forms.Clinpath.FormSections.ParasitologyResultsSection;
import org.labkey.wnprc_ehr.dataentry.forms.Clinpath.FormSections.UrinalysisResultsSection;
import org.labkey.wnprc_ehr.dataentry.forms.Clinpath.FormSections.VirologyResultsSection;

import java.util.Arrays;

public class ClinpathForm extends TaskForm {
    public static final String NAME = "Clinpath";

    public ClinpathForm(DataEntryFormContext ctx, Module owner) {
        super(ctx, owner, NAME, "Enter " + NAME + " Results", WNPRCConstants.DataEntrySections.PATHOLOGY_CLINPATH, Arrays.asList(
                new TaskFormSection(),
                new ClinpathRunsFormSection(),
                new AnimalDetailsFormSection(),
                new BacteriologyResultsSection(),
                new ChemistryResultsSection(),
                new HematologyResultsSection(),
                new HematologyMorphologySection(),
                new ImmunologyResultsSection(),
                new ParasitologyResultsSection(),
                new UrinalysisResultsSection(),
                new VirologyResultsSection(),
                new CytologyAutomatedSection(),
                new CytologyManualSection()
        ));

        addClientDependency(ClientDependency.fromPath("wnprc_ehr/model/sources/Assay.js"));
    }
}
