package org.labkey.wnprc_ehr.dataentry.forms.ResearchUltrasounds;

import org.labkey.api.ehr.dataentry.AnimalDetailsFormSection;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.ehr.dataentry.TaskFormSection;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.WNPRCConstants;
import org.labkey.wnprc_ehr.dataentry.forms.ResearchUltrasounds.FormSections.ResearchUltrasoundsFormSection;
import org.labkey.wnprc_ehr.dataentry.forms.ResearchUltrasounds.FormSections.ResearchUltrasoundsInstructionsFormSection;
import org.labkey.wnprc_ehr.dataentry.generics.forms.SimpleTaskForm;

import java.util.Arrays;

public class ResearchUltrasoundsForm extends SimpleTaskForm
{
    public static final String NAME = "Research Ultrasounds";

    public ResearchUltrasoundsForm(DataEntryFormContext ctx, Module owner) {
        super(ctx, owner, NAME, NAME, WNPRCConstants.DataEntrySections.CLINICAL_SPI, Arrays.asList(
            new TaskFormSection(),
            new AnimalDetailsFormSection(),
            new ResearchUltrasoundsInstructionsFormSection(),
            new ResearchUltrasoundsFormSection()
        ));

        for (FormSection section: getFormSections()) {
            section.addConfigSource("ResearchUltrasounds");
        }

        setStoreCollectionClass("WNPRC.ext.data.ResearchUltrasoundsStoreCollection");
        addClientDependency(ClientDependency.fromPath("wnprc_ehr/model/sources/ResearchUltrasounds.js"));
        addClientDependency(ClientDependency.fromPath("wnprc_ehr/ext4/data/SingleAnimal/ResearchUltrasoundsServerStore.js"));
        addClientDependency(ClientDependency.fromPath("wnprc_ehr/ext4/data/SingleAnimal/ResearchUltrasoundsStoreCollection.js"));
    }
}