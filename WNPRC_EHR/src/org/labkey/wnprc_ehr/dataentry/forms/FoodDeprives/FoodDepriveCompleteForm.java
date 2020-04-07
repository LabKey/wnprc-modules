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
import java.util.function.Supplier;

public class FoodDepriveCompleteForm extends TaskForm
{
    public static final String NAME = "Food Deprive Complete";

    public FoodDepriveCompleteForm(DataEntryFormContext ctx, Module owner){
        super(ctx, owner, NAME, "Enter " + NAME, WNPRCConstants.DataEntrySections.CLINICAL_SPI, Arrays.asList(
                new TaskFormSection(),
                new AnimalDetailsFormSection(),
                new FoodDeprivesFormSections(NAME)
        ));
        this.addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/model/sources/Husbandry.js"));

        for(FormSection section: this.getFormSections()) {
            section.addConfigSource("Husbandry");
        }

        for(Supplier<ClientDependency> dependency : WNPRC_EHRModule.getDataEntryClientDependencies()) {
            this.addClientDependency(dependency);
        }

        setStoreCollectionClass("EHR.data.FoodDepriveStore");
        addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/data/foodDepriveStore.js"));
        addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/ext4/components/buttons/husbandryButtons.js"));
        addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/ext4/components/UWBoxSelect.css"));

    }
    @Override
    protected List<String> getButtonConfigs()
    {
        List<String> ret = super.getButtonConfigs();
        ret.remove("SAVEDRAFT");
        ret.remove("CLOSE");
        return ret;
    }

}
