package org.labkey.wnprc_ehr.dataentry.forms;

import org.labkey.api.ehr.EHRService;
import org.labkey.api.ehr.dataentry.AbstractDataEntryForm;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.DataEntryFormFactory;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.ehr.dataentry.SimpleFormPanelSection;
import org.labkey.api.ehr.dataentry.SimpleFormSection;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.WNPRC_EHRModule;
import org.labkey.wnprc_ehr.dataentry.generics.sections.SimpleGridSection;

import java.util.AbstractMap;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Container class for all the breeding-related data entry forms. Also responsible for registration with
 * the EHR service via the {@link #registerDataEntryForms(EHRService, Module)} method.
 */
public final class Breeding
{
    /**
     * Registers the breeding data entry forms in the passed EHR service for the passed module.
     *
     * @param es     EHR service instance to register in
     * @param module Parent module instance for the forms
     */
    public static void registerDataEntryForms(EHRService es, Module module)
    {
        // register the generic singular, edit forms
        Stream.of(new AbstractMap.SimpleEntry<>("Breeding Encounter", "breeding_encounters")
                , new AbstractMap.SimpleEntry<>("Pregnancy", "pregnancies")
                , new AbstractMap.SimpleEntry<>("Pregnancy Outcome", "pregnancy_outcomes")
                , new AbstractMap.SimpleEntry<>("Ultrasound", "ultrasounds")
        ).map(e -> Breeding.editFactory(module, e.getKey(), e.getValue()))
                .forEach(es::registerFormType);

        // register the generic bulk entry forms
        Stream.of(new AbstractMap.SimpleEntry<>("Breeding Encounters", "breeding_encounters")
                , new AbstractMap.SimpleEntry<>("Pregnancies", "pregnancies")
        ).map(e -> Breeding.bulkFactory(module, e.getKey(), e.getValue()))
                .forEach(es::registerFormType);

        es.registerFormType(ctx -> new BreedingForm(ctx, module, "Ultrasounds",
                new PregnancyGridSection("ultrasounds", "Ultrasounds")));
        es.registerFormType(ctx -> new BreedingForm(ctx, module, "Pregnancy Outcomes",
                new PregnancyGridSection("pregnancy_outcomes", "Pregnancy Outcomes")));
    }

    /**
     * Generates a new {@link DataEntryFormFactory} to create a bulk-edit {@link BreedingForm} with the passed
     * properties.
     *
     * @param module    Parent module instance for the forms
     * @param formName  Name of the form
     * @param queryName Query to execute (in the study schema)
     * @return Factory method to generate new form instances
     */
    private static DataEntryFormFactory bulkFactory(Module module, String formName, String queryName)
    {
        return (ctx) -> BreedingForm.bulk(ctx, module, formName, queryName);
    }

    /**
     * Generates a new {@link DataEntryFormFactory} to create a single-record {@link BreedingForm} with the passed
     * properties
     *
     * @param module    Parent module instance for the forms
     * @param formName  Name of the form
     * @param queryName Query to execute (in the study schema)
     * @return Factory method to generate new form instances
     */
    private static DataEntryFormFactory editFactory(Module module, String formName, String queryName)
    {
        return (ctx) -> BreedingForm.edit(ctx, module, formName, queryName);
    }

    /**
     * Breeding-specific data entry form class. Sets the category to "Colony Records" and adds the
     * "Breeding" metadata configuration to each of the form sections.
     */
    private static final class BreedingForm extends AbstractDataEntryForm
    {
        /**
         * Creates a breeding form with the passed form sections
         *
         * @param ctx      Context (for superclass)
         * @param owner    Module owning the form
         * @param formName Name to display on the form
         * @param sections Form sections to add to the form
         */
        public BreedingForm(DataEntryFormContext ctx, Module owner, String formName, FormSection... sections)
        {
            super(ctx, owner, formName, formName, "Colony Records", Arrays.asList(sections));
            addClientDependency(ClientDependency.fromPath("/wnprc_ehr/ext4/breeding.lib.xml"));
            getFormSections().forEach(s -> s.addConfigSource("Breeding"));
            setStoreCollectionClass("WNPRC.ext.data.BreedingStoreCollection");
        }

        private static BreedingForm bulk(DataEntryFormContext ctx, Module owner, String formName, String queryName)
        {
            return new BreedingForm(ctx, owner, formName,
                    new SimpleGridSection("study", queryName, formName));
        }

        private static BreedingForm edit(DataEntryFormContext ctx, Module owner, String formName, String queryName)
        {
            return new BreedingForm(ctx, owner, formName,
                    new SimpleFormPanelSection("study", queryName, formName, false));
        }
    }

    private static final class PregnancyGridSection extends SimpleFormSection
    {
        public PregnancyGridSection(String queryName, String label)
        {
            super("study", queryName, label, "wnprc-pregnancygridpanel");
        }

        @Override
        public List<String> getTbarButtons()
        {
            List<String> buttons =  super.getTbarButtons();
            buttons.remove("ADDRECORD");
            buttons.add(0, "APPENDRECORD");
            return buttons;
        }
    }
}
