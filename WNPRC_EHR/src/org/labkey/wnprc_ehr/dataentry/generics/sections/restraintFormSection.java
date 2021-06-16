package org.labkey.wnprc_ehr.dataentry.generics.sections;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class restraintFormSection extends SlaveFormSection
{
    public restraintFormSection(){
        super("study","restraints","Other Restraint");
    }

    public restraintFormSection(String label) {
        super("study", "restraints", label);
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
        return Arrays.asList("Id", "date", "project","restraintType","remarks");
    }
}
