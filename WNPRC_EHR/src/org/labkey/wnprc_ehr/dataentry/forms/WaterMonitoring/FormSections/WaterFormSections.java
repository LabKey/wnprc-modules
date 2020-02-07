package org.labkey.wnprc_ehr.dataentry.forms.WaterMonitoring.FormSections;

import org.labkey.api.ehr.EHRService;
import org.labkey.api.ehr.dataentry.SimpleFormPanelSection;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.dataentry.generics.sections.SimpleFormSection;
import org.labkey.wnprc_ehr.dataentry.generics.sections.SimpleGridSection;
import org.labkey.wnprc_ehr.dataentry.generics.sections.SlaveFormSection;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class WaterFormSections extends SlaveFormSection
{
    public WaterFormSections ()
    {
        super ("study", "watergiven", "Water Given");




       /* this.addConfigSource("Task");
        _showLocation = true;*/

    }
    @Override
    public Set<String> getSlaveFields(){
        Set<String> fields = new HashSet<>();

        fields.add("Id");
        fields.add("date");

        return fields;
    }

}
