package org.labkey.wnprc_ehr.dataentry.forms;

import org.labkey.api.ehr.EHRService;
import org.labkey.api.ehr.dataentry.AbstractDataEntryForm;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.DataEntryFormFactory;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.ehr.dataentry.SimpleFormPanelSection;
import org.labkey.api.ehr.dataentry.SimpleFormSection;
import org.labkey.api.ehr.dataentry.SingleQueryFormProvider;
import org.labkey.api.ehr.dataentry.SingleQueryFormSection;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.dataentry.generics.sections.AnimalDetailsPanel;

import java.util.ArrayList;
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
     * Panel xtype for the "master" data that is not linked to a parent pregnancy.
     */
    private static final String MASTER_PANEL_XTYPE = "wnprc-appendrecordgridpanel";
    /**
     * Panel xtypes for the pregnancy and ultrasound data to provide some automated data entry
     */
    private static final String PREGNANCY_PANEL_XTYPE = "wnprc-pregnancygridpanel";
    private static final String ULTRASOUND_PANEL_XTYPE = "wnprc-ultrasoundgridpanel";
    
    private static final String BREEDING_ENCOUNTER_LABEL = "Breeding Encounters";
    private static final String BREEDING_ENCOUNTER_QUERY = "breeding_encounters";
    private static final String PREGNANCY_LABEL = "Pregnancies";
    private static final String PREGNANCY_QUERY = "pregnancies";
    private static final String ULTRASOUND_LABEL = "Ultrasounds";
    private static final String ULTRASOUND_QUERY = "ultrasounds";
    private static final String PREGNANCY_OUTCOME_LABEL = "Pregnancy Outcomes";
    private static final String PREGNANCY_OUTCOME_QUERY = "pregnancy_outcomes";


    /**
     * Registers the breeding data entry forms in the passed EHR service for the passed module.
     *
     * @param es     EHR service instance to register in
     * @param module Parent module instance for the forms
     */
    public static void registerDataEntryForms(EHRService es, Module module)
    {
        // register the generic singular, edit forms
        Stream.of(Arrays.asList(BREEDING_ENCOUNTER_LABEL, BREEDING_ENCOUNTER_QUERY)
                , Arrays.asList(PREGNANCY_LABEL, PREGNANCY_QUERY)
                , Arrays.asList(ULTRASOUND_LABEL, ULTRASOUND_QUERY)
                , Arrays.asList(PREGNANCY_OUTCOME_LABEL, PREGNANCY_OUTCOME_QUERY)
        ).map(e -> Breeding.editFactory(module, e.get(0), e.get(1)))
                .forEach(es::registerFormType);

        // register the generic bulk entry forms
        Stream.of(Arrays.asList(BREEDING_ENCOUNTER_LABEL, BREEDING_ENCOUNTER_QUERY, MASTER_PANEL_XTYPE)
                , Arrays.asList(PREGNANCY_LABEL, PREGNANCY_QUERY, PREGNANCY_PANEL_XTYPE)
                , Arrays.asList(ULTRASOUND_LABEL, ULTRASOUND_QUERY, ULTRASOUND_PANEL_XTYPE)
                , Arrays.asList(PREGNANCY_OUTCOME_LABEL, PREGNANCY_OUTCOME_QUERY, MASTER_PANEL_XTYPE)
        ).map(e -> Breeding.bulkFactory(module, e.get(0), e.get(1), e.get(2)))
                .forEach(es::registerFormType);
    }

    public static void registerSingleFormOverrides(EHRService es, Module module) {
        List<SingleQueryFormSection> breedingSections = new ArrayList<>();
        breedingSections.add(new SingleQueryFormSection("study", BREEDING_ENCOUNTER_QUERY, BREEDING_ENCOUNTER_LABEL));
        breedingSections.add(new SingleQueryFormSection("study", PREGNANCY_QUERY, PREGNANCY_LABEL));
        breedingSections.add(new SingleQueryFormSection("study", ULTRASOUND_QUERY, BREEDING_ENCOUNTER_LABEL));
        breedingSections.add(new SingleQueryFormSection("study", PREGNANCY_OUTCOME_QUERY, BREEDING_ENCOUNTER_LABEL));

        breedingSections.forEach(fs -> {
            fs.addClientDependency(ClientDependency.fromPath("/wnprc_ehr/ext4/breeding.lib.xml"));
            fs.addConfigSource("Breeding.Columns");
            fs.addConfigSource("Breeding.Editors");
            fs.addConfigSource("Breeding.Config");
            es.registerSingleFormOverride(new SingleQueryFormProvider(module, fs.getSchemaName(), fs.getQueryName(), fs));
        });
    }

    /**
     * Generates a new {@link DataEntryFormFactory} to create a bulk-edit {@link BreedingForm} with the passed
     * properties.
     *
     * @param module    Parent module instance for the forms
     * @param formName  Name of the form
     * @param queryName Query to execute (in the study schema)
     * @param xtype     ExtJS xtype for the section's grid panel
     * @return Factory method to generate new form instances
     */
    private static DataEntryFormFactory bulkFactory(Module module, String formName, String queryName, String xtype)
    {
        return (ctx) -> BreedingForm.bulk(ctx, module, formName, queryName, xtype);
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
            getFormSections().forEach(s -> {
                s.addConfigSource("Breeding.Columns");
                s.addConfigSource("Breeding.Editors");
                s.addConfigSource("Breeding.Config");
            });
            setStoreCollectionClass("WNPRC.ext.data.BreedingStoreCollection");
        }

        @Override
        protected List<String> getButtonConfigs()
        {
            List<String> ret = super.getButtonConfigs();
            ret.remove("SUBMIT");
            return ret;
        }

        private static BreedingForm bulk(DataEntryFormContext ctx, Module owner, String formName, String queryName, String xtype)
        {
            return new BreedingForm(ctx, owner, formName,
                    //new AnimalDetailsPanel(), //FYI Add back in if we want the animal details panel to show
                    new SimpleFormSection("study", queryName, formName, xtype)
                    {
                        @Override
                        public List<String> getTbarButtons()
                        {
                            List<String> buttons = super.getTbarButtons();
                            buttons.remove("ADDRECORD");
                            buttons.add(0, "APPENDRECORD");
                            return buttons;
                        }
                    });
        }

        private static BreedingForm edit(DataEntryFormContext ctx, Module owner, String formName, String queryName)
        {
            return new BreedingForm(ctx, owner, formName,
                    new SimpleFormPanelSection("study", queryName, formName, false));
        }
    }
}
