package org.labkey.wnprc_ehr.dataentry.forms;

import org.labkey.api.ehr.EHRService;
import org.labkey.api.ehr.dataentry.AbstractDataEntryForm;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.DataEntryFormFactory;
import org.labkey.api.ehr.dataentry.FormSection;
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
        Stream.of(new AbstractMap.SimpleEntry<>("Breeding Encounters", "breeding_encounters")
                , new AbstractMap.SimpleEntry<>("Pregnancies", "pregnancies")
                , new AbstractMap.SimpleEntry<>("Pregnancy Outcomes", "pregnancy_outcomes")
                , new AbstractMap.SimpleEntry<>("Ultrasounds", "ultrasounds"))
                .map(e -> Breeding.createFormFactory(module, e.getKey(), e.getValue()))
                .forEach(es::registerFormType);
    }

    /**
     * Generates a new {@link DataEntryFormFactory} to create a {@link BreedingForm} with the passed properties.
     *
     * @param module    Parent module instance for the forms
     * @param formName  Name of the form
     * @param queryName Query to execute (in the study schema)
     * @return Factory method to generate new form instances
     */
    private static DataEntryFormFactory createFormFactory(Module module, String formName, String queryName)
    {
        return (ctx) -> new BreedingForm(ctx, module, formName, queryName);
    }

    /**
     * Breeding-specific data entry form class. Sets the category to "Colony Records" and adds the
     * "Breeding" metadata configuration to each of the form sections.
     */
    private static class BreedingForm extends AbstractDataEntryForm
    {
        /**
         * Creates a default breeding form with a single grid section on a study-schema query
         *
         * @param ctx       Context (for superclass)
         * @param owner     Module owning the form
         * @param formName  Name to display on the form
         * @param queryName Study schema query to invoke in the default section
         */
        private BreedingForm(DataEntryFormContext ctx, Module owner, String formName, String queryName)
        {
            this(ctx, owner, formName, new SimpleGridSection("study", queryName, formName));
        }

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
            getFormSections().forEach(s -> s.addConfigSource("Breeding"));
        }
    }
}
