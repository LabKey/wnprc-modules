package org.labkey.wnprc_ehr.dataentry.forms.WaterMonitoring.FormSections;

import org.labkey.wnprc_ehr.dataentry.generics.sections.SlaveFormSection;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;


public class WaterWeightSection extends SlaveFormSection
{
    public WaterWeightSection() {

        super("study", "weight", "Weight");
        /*fieldNamesAtStartInOrder = Arrays.asList(
                "Id",
                "date",
                "project",
                "weight",
                "remarks"

        );

        maxItemsPerColumn = 3;
        setClientStoreClass("WNPRC.ext.data.SingleAnimal.MasterSectionClientStore");*/
        //setClientStoreClass("wnprc.ext.data.HusbandryServerStore");
       //this.addClientDependency(ClientDependency.fromPath("wnprc_ehr/data/HusbandryServerStore.js"));
    }

    @Override
    public Set<String> getSlaveFields(){
        Set<String> fields = new HashSet<>();
        fields.add("Id");
        fields.add("project");
        fields.add("date");

        return fields;
    }

    @Override
    public List<String> getFieldNames(){
        return Arrays.asList("Id","date","weight","remark");
    }

    //@Override
    //protected List<String> getFieldNames(){return Arrays.asList("Id","date","weight","project","remark");}

}