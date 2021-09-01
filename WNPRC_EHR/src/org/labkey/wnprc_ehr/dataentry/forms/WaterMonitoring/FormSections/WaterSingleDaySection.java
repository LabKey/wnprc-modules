package org.labkey.wnprc_ehr.dataentry.forms.WaterMonitoring.FormSections;

import org.labkey.api.ehr.dataentry.SimpleFormSection;
import org.labkey.wnprc_ehr.dataentry.generics.sections.SlaveGridSection;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class WaterSingleDaySection extends SimpleFormSection
{
    /*public WaterSingleDaySection (){
        super ("study", "waterAmount", "Order Additional Future Water");
        //setClientStoreClass("WNPRC.ext.data.SingleAnimal.WaterClientStore");
       // setAllowBulkAdd(true);
    }*/
    public WaterSingleDaySection (String title){
        super ("study", "waterAmount", title, "ehr-gridpanel");
        this.addConfigSource("WNPRC_Request");
        //setClientStoreClass("WNPRC.ext.data.SingleAnimal.WaterClientStore");
        // setAllowBulkAdd(true);
    }


}
