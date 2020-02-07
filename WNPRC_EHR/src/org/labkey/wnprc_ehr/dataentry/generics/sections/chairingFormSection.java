package org.labkey.wnprc_ehr.dataentry.generics.sections;

import java.util.HashSet;
import java.util.Set;

public class chairingFormSection extends SlaveFormSection
{
    public chairingFormSection(){
        super("study", "chairing", "Chairing");
    }

    @Override
    public Set<String> getSlaveFields(){
        Set<String> fields = new HashSet<>();

        fields.add("Id");

        return fields;
    }
}
