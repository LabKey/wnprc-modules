package org.labkey.wnprc_ehr.dataentry.forms.WaterMonitoring.FormSections;

import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.dataentry.generics.sections.SlaveGridSection;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class WaterDrugAdministrationSection extends SlaveGridSection
{
    public WaterDrugAdministrationSection(){
        super ("study", "drug", "Implant Maintenance");
        //setClientStoreClass("EHR.data.DrugAdministrationRunsClientStore");
        //addClientDependency(ClientDependency.fromPath("ehr/data/DrugAdministrationRunsClientStore.js"));
        addClientDependency(ClientDependency.fromPath("ehr/form/field/SnomedCombo.js"));
        //setClientStoreClass("WNPRC.ext.data.SingleAnimal.WaterClientStore");
       // setAllowBulkAdd(true);
        addClientDependency(ClientDependency.fromPath("wnprc_ehr/ext4/components/buttons/husbandryButtons.js"));
    }
    public WaterDrugAdministrationSection(String title){
        super ("study", "drug", title);
        //this.addConfigSource("WNPRC_Request");
        //setClientStoreClass("WNPRC.ext.data.SingleAnimal.WaterClientStore");
        // setAllowBulkAdd(true);
    }
    @Override
    public List<String> getTbarButtons(){

        List<String> defaultButtons = super.getTbarButtons();
        defaultButtons.add(1,"CHANGETIME");

        return defaultButtons;
    }
    @Override
    public Set<String> getSlaveFields(){
        Set<String> fields = new HashSet<>();
        fields.add("Id");
        fields.add("project");
        return fields;
    }
    @Override
    public List<String> getFieldNames(){
        return Arrays.asList("Id","project","date","category","code","areaCleaned","route","remark");
    }
}
