package org.labkey.wnprc_ehr.dataentry.forms.WaterMonitoring.FormSections;


import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.dataentry.generics.sections.SimpleGridSection;

import java.util.ArrayList;
import java.util.List;

public class WaterOrderFormSection extends SimpleGridSection
{
    public WaterOrderFormSection(){
        super ("study", "waterOrders", "Water Orders");
        /*fieldNamesAtStartInOrder = new ArrayList<>().addAll(Arrays.asList(
                "Id",
                "date",
                "enddate",
                "volume",
                "provideFruit"
        ));*/

        this.setAllowBulkAdd(true);
        addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/data/HusbandryClientStore.js"));
        addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/ext4/windows/AddWaterWindow.js"));
        setClientStoreClass("WNPRC.ext.data.SingleAnimal.WaterClientStore");
    }
    public WaterOrderFormSection(String sectionTitle){
        super ("study", "waterOrders", sectionTitle);
        this.setAllowBulkAdd(true);
        addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/data/HusbandryClientStore.js"));
        addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/ext4/windows/AddWaterWindow.js"));
        setClientStoreClass("WNPRC.ext.data.SingleAnimal.WaterClientStore");
    }
    public List<String> getTbarButtons(){
        List<String> defaultButtons = super.getTbarButtons();

        defaultButtons.add("ADDWATERS");
        defaultButtons.add("DUPLICATE");

        return defaultButtons;

    }
}
