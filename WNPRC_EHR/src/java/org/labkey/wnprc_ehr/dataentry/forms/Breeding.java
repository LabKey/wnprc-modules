package org.labkey.wnprc_ehr.dataentry.forms;

import org.labkey.api.ehr.dataentry.AbstractDataEntryForm;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.dataentry.generics.sections.SimpleGridSection;

import java.util.Arrays;

public final class Breeding
{
    private static abstract class AbstractBreedingForm extends AbstractDataEntryForm
    {
        private AbstractBreedingForm(DataEntryFormContext ctx, Module owner, String name, FormSection... sections)
        {
            super(ctx, owner, name, name, "Colony Records", Arrays.asList(sections));
            addClientDependency(ClientDependency.fromPath("/wnprc_ehr/model/sources/Breeding.js"));
            getFormSections().forEach(s -> s.addConfigSource("Breeding"));
        }
    }

    @SuppressWarnings("unused") // reflection
    public static final class BreedingEncounterForm extends AbstractBreedingForm
    {
        private static final String NAME = "Breeding Encounters";

        public BreedingEncounterForm(DataEntryFormContext ctx, Module owner)
        {
            super(ctx, owner, NAME, new SimpleGridSection("study", "breeding_encounters", NAME));
        }
    }

    @SuppressWarnings("unused") // reflection
    public static final class PregnancyForm extends AbstractBreedingForm
    {
        private static final String NAME = "Pregnancies";

        public PregnancyForm(DataEntryFormContext ctx, Module owner)
        {
            super(ctx, owner, NAME, new SimpleGridSection("study", "pregnancies", NAME));
        }
    }

    @SuppressWarnings("unused") // reflection
    public static final class PregnancyOutcomeForm extends AbstractBreedingForm
    {
        private static final String NAME = "Pregnancy Outcomes";

        public PregnancyOutcomeForm(DataEntryFormContext ctx, Module owner)
        {
            super(ctx, owner, NAME, new SimpleGridSection("study", "pregnancy_outcomes", NAME));
        }
    }

    @SuppressWarnings("unused") // reflection
    public static final class UltrasoundForm extends AbstractBreedingForm
    {
        private static final String NAME = "Ultrasounds";

        public UltrasoundForm(DataEntryFormContext ctx, Module owner)
        {
            super(ctx, owner, NAME, new SimpleGridSection("study", "ultrasounds", NAME));
        }
    }
}
