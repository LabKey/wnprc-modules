package org.labkey.wnprc_ehr.dataentry.forms.SurgeryProcedureRequest.FormSections;

import org.labkey.wnprc_ehr.dataentry.generics.sections.SlaveGridSection;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class SurgeryProcedureFoodDepriveSection extends SlaveGridSection {

    public SurgeryProcedureFoodDepriveSection() {
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
    public Set<String> getSlaveFields() {
        Set<String> fields = new HashSet<>();
        fields.add("Id");
        fields.add("project");
        fields.add("account");
        return fields;
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
