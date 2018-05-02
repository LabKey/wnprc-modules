package org.labkey.wnprc_ehr.dataentry.forms.Breeding;

import org.labkey.api.ehr.dataentry.AnimalDetailsFormSection;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.SimpleFormPanelSection;
import org.labkey.api.ehr.dataentry.TaskForm;
import org.labkey.api.ehr.dataentry.TaskFormSection;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.WNPRC_EHRModule;
import org.labkey.wnprc_ehr.dataentry.generics.sections.SimpleGridSection;

import java.util.Arrays;

public final class BreedingEncounterForm extends TaskForm
{
    private static final String NAME = "Breeding Encounter";

    public BreedingEncounterForm(DataEntryFormContext ctx, Module owner)
    {
        super(ctx, owner, NAME, NAME, "Colony Records", Arrays.asList(
                new TaskFormSection(),
                new AnimalDetailsFormSection(),
                new BreedingEncounterFormSection(),
                new BreedingChildFormSection("study", "breeding_remarks", "Breeding Remarks"),
                new BreedingChildFormSection("study", "ultrasounds", "Ultrasounds"),
                new BreedingChildFormSection("study", "pregnancy_outcomes", "Outcomes")));

        // add the dependencies from the module, including the breeding-specific store collection (which
        // overrides some of the defaults to set the participant id on the child records based on the parent)
        WNPRC_EHRModule.getDataEntryClientDependencies().forEach(this::addClientDependency);
        addClientDependency(ClientDependency.fromPath("wnprc_ehr/data/BreedingStoreCollection.js"));

        setStoreCollectionClass("WNPRC_EHR.data.BreedingStoreCollection");

        // load the metadata configuration for the dependent records sections (to hide the id)
        addClientDependency(ClientDependency.fromPath("wnprc_ehr/model/sources/Breeding.js"));
    }

    private static final class BreedingEncounterFormSection extends SimpleFormPanelSection
    {
        public BreedingEncounterFormSection()
        {
            super("study", "breeding_encounters", NAME);
            addConfigSource("BreedingParentRecord");
        }
    }

    private static final class BreedingChildFormSection extends SimpleGridSection
    {
        public BreedingChildFormSection(String schemaName, String queryName, String label)
        {
            super(schemaName, queryName, label);
            addConfigSource("BreedingChildRecord");
        }
    }
}
