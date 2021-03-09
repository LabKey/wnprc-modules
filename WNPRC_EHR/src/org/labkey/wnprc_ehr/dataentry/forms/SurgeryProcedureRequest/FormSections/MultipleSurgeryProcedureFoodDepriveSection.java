package org.labkey.wnprc_ehr.dataentry.forms.SurgeryProcedureRequest.FormSections;

import org.labkey.wnprc_ehr.dataentry.generics.sections.SimpleGridSection;

import java.util.ArrayList;
import java.util.List;

public class MultipleSurgeryProcedureFoodDepriveSection extends SimpleGridSection {

    public MultipleSurgeryProcedureFoodDepriveSection() {
        super ("study", "foodDeprives", "Food Deprives");
        this.addConfigSource("WNPRC_Request");
        this.addConfigSource("Husbandry");
    }

    @Override
    public List<String> getTbarMoreActionButtons()
    {
        List<String> defaultButtons = super.getTbarMoreActionButtons();
        defaultButtons.add("REPEAT_SELECTED");

        return defaultButtons;
    }

    @Override
    protected List<String> getFieldNames() {
        List<String> fieldNames = new ArrayList<>();
        fieldNames.add("Id");
        fieldNames.add("date");
        fieldNames.add("project");
        fieldNames.add("schedule");
        fieldNames.add("reason");
        fieldNames.add("remarks");
        fieldNames.add("assignedTo");
        fieldNames.add("protocolContact");
        return fieldNames;
    }
}
