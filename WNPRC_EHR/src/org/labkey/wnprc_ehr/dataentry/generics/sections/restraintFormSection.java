package org.labkey.wnprc_ehr.dataentry.generics.sections;

import java.util.HashSet;
import java.util.Set;

public class restraintFormSection extends SlaveFormSection
{
    public restraintFormSection(){
        super("study","restraints","Restraint");
    }
    @Override
    public Set<String> getSlaveFields(){
        Set<String> fields = new HashSet<>();

        fields.add("Id");

        return fields;
    }
}
