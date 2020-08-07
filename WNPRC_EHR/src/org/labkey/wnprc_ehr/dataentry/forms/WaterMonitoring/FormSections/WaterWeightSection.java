package org.labkey.wnprc_ehr.dataentry.forms.WaterMonitoring.FormSections;

import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.dataentry.generics.sections.SimpleFormSection;

import java.util.Arrays;


public class WaterWeightSection extends SimpleFormSection
{
    public WaterWeightSection() {

        super("study", "Weight", "Weight");
        fieldNamesAtStartInOrder = Arrays.asList(
                "Id",
                "date",
                "project",
                "weight",
                "remarks"

        );

        maxItemsPerColumn = 3;
        setClientStoreClass("WNPRC.ext.data.SingleAnimal.MasterSectionClientStore");
        //setClientStoreClass("wnprc.ext.data.HusbandryServerStore");
       //this.addClientDependency(ClientDependency.fromPath("wnprc_ehr/data/HusbandryServerStore.js"));
    }

    //@Override
    //protected List<String> getFieldNames(){return Arrays.asList("Id","date","weight","project","remark");}

}