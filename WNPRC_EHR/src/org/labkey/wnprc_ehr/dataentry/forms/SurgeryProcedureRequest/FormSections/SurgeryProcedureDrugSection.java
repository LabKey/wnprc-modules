package org.labkey.wnprc_ehr.dataentry.forms.SurgeryProcedureRequest.FormSections;

import org.labkey.wnprc_ehr.dataentry.generics.sections.SlaveGridSection;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class SurgeryProcedureDrugSection extends SlaveGridSection {

    public SurgeryProcedureDrugSection() {
        super("study", "drug", "Drugs");
    }

    @Override
    public Set<String>  getSlaveFields() {
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
        fieldNames.add("account");
        fieldNames.add("code");
        fieldNames.add("route");
        fieldNames.add("volume");
        fieldNames.add("vol_units");
        fieldNames.add("amount");
        fieldNames.add("remark");
        return fieldNames;
    }
}
