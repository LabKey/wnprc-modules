package org.labkey.wnprc_ehr.dataentry.generics.sections;

import org.labkey.wnprc_ehr.dataentry.generics.sections.SimpleFormSection;
import java.util.Arrays;

public class SingleEncounterSection extends SimpleFormSection
{
    public SingleEncounterSection() {

        super("study", "singleGeneralEncounter", "Single Animal Encounter");
        fieldNamesAtStartInOrder = Arrays.asList(
                "Id",
                "date",
                "project"

        );

        maxItemsPerColumn = 3;
        setClientStoreClass("WNPRC.ext.data.SingleAnimal.MasterSectionClientStore");
        //setClientStoreClass("wnprc.ext.data.HusbandryServerStore");
        //this.addClientDependency(ClientDependency.fromPath("wnprc_ehr/data/HusbandryServerStore.js"));
    }

}
