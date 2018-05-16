package org.labkey.wnprc_ehr.dataentry.forms.Necropsy;

import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.WNPRCConstants;
import org.labkey.wnprc_ehr.dataentry.forms.Necropsy.FormSections.AlopeciaSection;
import org.labkey.wnprc_ehr.dataentry.forms.Necropsy.FormSections.BodyConditionSection;
import org.labkey.wnprc_ehr.dataentry.forms.Necropsy.FormSections.HistologySection;
import org.labkey.wnprc_ehr.dataentry.forms.Necropsy.FormSections.MorphologicDiagnosisSection;
import org.labkey.wnprc_ehr.dataentry.forms.Necropsy.FormSections.NecropsyInfoSection;
import org.labkey.wnprc_ehr.dataentry.forms.Necropsy.FormSections.OrganWeightsSection;
import org.labkey.wnprc_ehr.dataentry.forms.Necropsy.FormSections.TissueSamplesSection;
import org.labkey.wnprc_ehr.dataentry.forms.Necropsy.FormSections.TreatmentsSection;
import org.labkey.wnprc_ehr.dataentry.forms.Necropsy.FormSections.WeightSection;
import org.labkey.wnprc_ehr.dataentry.generics.forms.SimpleTaskForm;
import org.labkey.wnprc_ehr.dataentry.generics.sections.AnimalDetailsPanel;
import org.labkey.wnprc_ehr.dataentry.generics.sections.TaskFormSection;

import java.util.Arrays;
import java.util.List;

public class NecropsyForm extends SimpleTaskForm {
    public static final String NAME = "Necropsy";

    public NecropsyForm(DataEntryFormContext ctx, Module owner) {
        super(ctx, owner, NAME, NAME, WNPRCConstants.DataEntrySections.PATHOLOGY_CLINPATH, Arrays.asList(
                new TaskFormSection(),
                new NecropsyInfoSection(),
                new AnimalDetailsPanel(),
                new WeightSection(),
                new TreatmentsSection(),
                new BodyConditionSection(),
                new AlopeciaSection(),
                new TissueSamplesSection(),
                new OrganWeightsSection(),
                new MorphologicDiagnosisSection()
        ));

        for(FormSection section: this.getFormSections()) {
            section.addConfigSource("Necropsy");
            section.addConfigSource("NecropsyTask");
        }

        setStoreCollectionClass("WNPRC.ext.data.NecropsyStoreCollection");
        this.addClientDependency(ClientDependency.fromPath("wnprc_ehr/model/sources/Necropsy.js"));
        this.addClientDependency(ClientDependency.fromPath("wnprc_ehr/model/sources/Pathology.js"));
        this.addClientDependency(ClientDependency.fromPath("wnprc_ehr/ext4/data/SingleAnimal/NecropsyServerStore.js"));
        this.addClientDependency(ClientDependency.fromPath("wnprc_ehr/ext4/data/SingleAnimal/NecropsyStoreCollection.js"));
    }

    @Override
    protected List<String> getMoreActionButtonConfigs() {
        List<String> buttons = super.getMoreActionButtonConfigs();

        buttons.add("FINALIZE_DEATH");
        buttons.add("UPDATE_DEATH");

        return buttons;
    }
}