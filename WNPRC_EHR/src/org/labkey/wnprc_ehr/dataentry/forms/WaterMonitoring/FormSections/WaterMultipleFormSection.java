package org.labkey.wnprc_ehr.dataentry.forms.WaterMonitoring.FormSections;

import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.dataentry.generics.sections.SimpleGridSection;

import java.util.ArrayList;
import java.util.List;

public class WaterMultipleFormSection extends SimpleGridSection
{
    public WaterMultipleFormSection (){

        super("study", "watergiven", "Water Given");
        setClientStoreClass("WNPRC.ext.data.SingleAnimal.WaterClientStore");
        setAllowBulkAdd(true);

        addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/ext4/windows/AddScheduleWaterWindow.js"));
        addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/ext4/components/buttons/husbandryButtons.js"));
        _showLocation = true;
        setAllowBulkAdd(false);
        setTemplateMode(TEMPLATE_MODE.NONE);
       // _templateMode = TEMPLATE_MODE.NONE;


    }
    @Override
    public List<String> getTbarButtons(){

        List<String> defaultButtons = super.getTbarButtons();

        defaultButtons.add(0,"ADDSCHEDULEDWATERS");
        defaultButtons.add(1,"CHANGETIME");
        //TODO: remove add button from the form.
        //defaultButtons.remove("ADDRECORD");
       
        return defaultButtons;
    }

    @Override
    public List<String> getTbarMoreActionButtons()
    {
        List<String> defaultButtons = new ArrayList<>();
        defaultButtons.addAll(super.getTbarMoreActionButtons());
        defaultButtons.remove("COPY_IDS");
        return defaultButtons;
    }
}
