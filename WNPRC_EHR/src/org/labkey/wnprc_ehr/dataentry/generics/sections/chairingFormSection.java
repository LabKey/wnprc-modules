package org.labkey.wnprc_ehr.dataentry.generics.sections;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class chairingFormSection extends SlaveFormSection
{
    public chairingFormSection(){
        super("study", "chairing", "Chair Restraint");
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
        return Arrays.asList("Id","date","location","chairingStartTime","chairingEndTime","remarks", "project");
    }
}
