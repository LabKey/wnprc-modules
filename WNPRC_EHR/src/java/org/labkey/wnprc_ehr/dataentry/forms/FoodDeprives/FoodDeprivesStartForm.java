package org.labkey.wnprc_ehr.dataentry.forms.FoodDeprives;

import org.labkey.api.ehr.dataentry.AnimalDetailsFormSection;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.ehr.dataentry.TaskForm;
import org.labkey.api.ehr.dataentry.TaskFormSection;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.WNPRCConstants;
import org.labkey.wnprc_ehr.WNPRC_EHRModule;
import org.labkey.wnprc_ehr.dataentry.forms.FoodDeprives.FormSections.FoodDeprivesFormSections;

import java.util.Arrays;
import java.util.List;

/**
 * Created by fdnicolalde on 3/9/16.
 */
public class FoodDeprivesStartForm extends TaskForm
{
    public static final String NAME = "Food Deprive Start";

    public FoodDeprivesStartForm(DataEntryFormContext ctx, Module owner) {
        super(ctx, owner, NAME, "Enter " + NAME, WNPRCConstants.DataEntrySections.CLINICAL_SPI, Arrays.asList(
                new TaskFormSection(),
                new AnimalDetailsFormSection(),
                new FoodDeprivesFormSections(NAME)
        ));
        this.addClientDependency(ClientDependency.fromPath("wnprc_ehr/model/sources/Husbandry.js"));

        for(FormSection section: this.getFormSections()) {
            section.addConfigSource("Husbandry");
        }

        for(ClientDependency dependency : WNPRC_EHRModule.getDataEntryClientDependencies()) {
            this.addClientDependency(dependency);
        }

        setStoreCollectionClass("EHR.data.FoodDepriveStore");
        addClientDependency(ClientDependency.fromPath("wnprc_ehr/data/foodDepriveStore.js"));
        addClientDependency(ClientDependency.fromPath("wnprc_ehr/ext4/components/buttons/husbandryButtons.js"));
        //addClientDependency(ClientDependency.fromPath("wnprc_ehr/ext4/components/BoxSelect.js"));

    }

    @Override
    protected List<String> getButtonConfigs()
    {
        List<String> ret = super.getButtonConfigs();

        ret.add("FOOD_STARTED");
        ret.remove("SUBMIT");
        ret.remove("SAVEDRAFT");
        ret.remove("CLOSE");

        return ret;
    }
}
