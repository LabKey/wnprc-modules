package org.labkey.wnprc_ehr.dataentry.forms.NecropsyAbstract;

import org.labkey.api.ehr.dataentry.AnimalDetailsFormSection;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.ehr.dataentry.TaskForm;
import org.labkey.api.ehr.dataentry.TaskFormSection;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.WNPRCConstants;
import org.labkey.wnprc_ehr.WNPRC_EHRModule;
import org.labkey.wnprc_ehr.dataentry.forms.NecropsyAbstract.FormSections.NecropsyAbstractFormSection;
import org.labkey.wnprc_ehr.dataentry.generics.forms.SimpleTaskForm;

import java.util.Arrays;
import java.util.List;

public class NecropsyAbstractForm extends SimpleTaskForm
{
    public static final String NAME = "Necropsy Abstract";

    public NecropsyAbstractForm(DataEntryFormContext ctx, Module owner) {
        super(ctx, owner, NAME, "Enter " + NAME, WNPRCConstants.DataEntrySections.CLINICAL_SPI, Arrays.asList(
                /*this task form is required?*/
                new TaskFormSection(),
                /*new AnimalDetailsFormSection(),*/
                new NecropsyAbstractFormSection(NAME)
        ));


        for(ClientDependency dependency : WNPRC_EHRModule.getDataEntryClientDependencies()) {
            this.addClientDependency(dependency);
        }


        //setStoreCollectionClass("EHR.data.NecropsyAbstractStore");
    }
    @Override
    protected List<String> getButtonConfigs()
    {
        List<String> ret = super.getButtonConfigs();
        //this is actually submit final, and puts the QC state into Completed
        ret.add("WNPRC_SUBMIT_FINAL");

        return ret;

    }

}
