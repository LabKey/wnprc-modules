package org.labkey.wnprc_ehr.dataentry.forms.WaterMonitoring;

import org.labkey.api.ehr.dataentry.AnimalDetailsFormSection;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.ehr.dataentry.RequestFormSection;
import org.labkey.api.ehr.dataentry.TaskFormSection;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.WNPRCConstants;
import org.labkey.wnprc_ehr.dataentry.forms.WaterMonitoring.FormSections.WaterSingleDaySection;
import org.labkey.wnprc_ehr.dataentry.generics.forms.SimpleRequestForm;
import org.labkey.wnprc_ehr.dataentry.generics.forms.SimpleTaskForm;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class EnterSingleDayWater extends SimpleRequestForm
{
    public static final String NAME = "Enter Single Day Water";

    public EnterSingleDayWater(DataEntryFormContext ctx, Module owner){
        super (ctx, owner, NAME, NAME, WNPRCConstants.DataEntrySections.CLINICAL_SPI, Arrays.asList(
                new RequestFormSection(),
                new AnimalDetailsFormSection(),
                new WaterSingleDaySection("Enter Single Day Water")
        ));

        for (FormSection section: this.getFormSections()){
            section.addConfigSource("WNPRC_Request");
        }

        this.addClientDependency(ClientDependency.fromPath("wnprc_ehr/model/sources/Request.js"));

    }

    @Override
    protected List<String> getButtonConfigs(){
        List<String> ret = new ArrayList<>();
        ret.addAll(super.getButtonConfigs());
        ret.remove("REQUEST");
        ret.add("SCHEDULE");

        return ret;
    }
}
