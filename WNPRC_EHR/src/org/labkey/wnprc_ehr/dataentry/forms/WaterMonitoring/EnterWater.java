package org.labkey.wnprc_ehr.dataentry.forms.WaterMonitoring;

import org.labkey.api.ehr.dataentry.AnimalDetailsFormSection;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.wnprc_ehr.dataentry.forms.WaterMonitoring.FormSections.WaterDrugAdministrationSection;
import org.labkey.wnprc_ehr.dataentry.forms.WaterMonitoring.FormSections.WaterSingleDayApprenticeSection;
import org.labkey.wnprc_ehr.dataentry.generics.sections.SingleEncounterSection;
import org.labkey.wnprc_ehr.dataentry.generics.sections.TaskFormSection;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.WNPRCConstants;
import org.labkey.wnprc_ehr.dataentry.forms.WaterMonitoring.FormSections.WaterFormSections;
import org.labkey.wnprc_ehr.dataentry.forms.WaterMonitoring.FormSections.WaterWeightSection;
import org.labkey.wnprc_ehr.dataentry.generics.forms.SimpleTaskForm;
import org.labkey.wnprc_ehr.dataentry.generics.sections.chairingFormSection;
import org.labkey.wnprc_ehr.dataentry.generics.sections.restraintFormSection;

import java.util.Arrays;
import java.util.List;

public class EnterWater extends SimpleTaskForm
{
    public static final String NAME = "Enter Lab Water";

    public EnterWater(DataEntryFormContext ctx, Module owner)
    {
        super(ctx, owner, NAME,  NAME, WNPRCConstants.DataEntrySections.CLINICAL_SPI, Arrays.asList(
                new TaskFormSection(),
                new SingleEncounterSection(),
                new AnimalDetailsFormSection(),
                new WaterWeightSection(),
                new chairingFormSection(),
                new restraintFormSection(),
                new WaterDrugAdministrationSection(),
                new WaterFormSections(),
                new WaterSingleDayApprenticeSection()
        ));
        setStoreCollectionClass("WNPRC.ext.data.WaterStoreCollection");
        this.addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/model/sources/Husbandry.js"));
        this.addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/ext4/data/SingleAnimal/WaterServerStore.js"));
        this.addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/ext4/data/SingleAnimal/WaterStoreCollection.js"));

        for (FormSection section : this.getFormSections()){
            section.addConfigSource("Husbandry");
            //section.addConfigSource("Encounter");
        }

       // setStoreCollectionClass("EHR.data.WaterStore");
    }

    @Override
    protected List<String> getButtonConfigs(){
        List<String> buttons = super.getButtonConfigs();
        buttons.add("WNPRC_SUBMIT_FINAL");
        buttons.add("BASICSUBMIT");

        return buttons;

    }




}
