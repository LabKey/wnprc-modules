package org.labkey.wnprc_ehr.dataentry.forms;

import org.labkey.api.ehr.EHRService;
import org.labkey.api.ehr.dataentry.AbstractDataEntryForm;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.DataEntryFormFactory;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.ehr.dataentry.SimpleFormPanelSection;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.dataentry.generics.sections.SimpleGridSection;

import java.util.AbstractMap;
import java.util.Arrays;
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
                , new AbstractMap.SimpleEntry<>("Pregnancy Outcomes", "pregnancy_outcomes")
                , new AbstractMap.SimpleEntry<>("Ultrasounds", "ultrasounds")
        ).map(e -> Breeding.bulkFactory(module, e.getKey(), e.getValue()))
                .forEach(es::registerFormType);
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
    private static class BreedingForm extends AbstractDataEntryForm
    {
        /**
         * Creates a breeding form with the passed form sections
         *
         * @param ctx      Context (for superclass)
         * @param owner    Module owning the form
         * @param formName Name to display on the form
         * @param sections Form sections to add to the form
         */
        private BreedingForm(DataEntryFormContext ctx, Module owner, String formName, FormSection... sections)
        {
            super(ctx, owner, formName, formName, "Colony Records", Arrays.asList(sections));
            addClientDependency(ClientDependency.fromPath("/wnprc_ehr/model/sources/Breeding.js"));
            addClientDependency(ClientDependency.fromPath("/wnprc_ehr/ext4/data/BreedingStoreCollection.js"));
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
}
