package org.labkey.wnprc_ehr.dataentry.forms.WaterMonitoring.FormSections;

import org.labkey.wnprc_ehr.dataentry.generics.sections.SlaveGridSection;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class WaterSingleDaySlaveSection extends SlaveGridSection
{
    public WaterSingleDaySlaveSection(){
        super ("study", "waterAmount", "Order Additional Water for Today");
        //setClientStoreClass("WNPRC.ext.data.SingleAnimal.WaterClientStore");
       // setAllowBulkAdd(true);
    }
    public WaterSingleDaySlaveSection(String title){
        super ("study", "waterAmount", title);
        this.addConfigSource("WNPRC_Request");
        //setClientStoreClass("WNPRC.ext.data.SingleAnimal.WaterClientStore");
        // setAllowBulkAdd(true);
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
        return Arrays.asList("Id", "date", "volume", "assignedTo", "project","frequency");
    }
}
