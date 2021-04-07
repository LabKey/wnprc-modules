package org.labkey.wnprc_ehr.dataentry.forms.InRooms;

import org.labkey.api.ehr.dataentry.AnimalDetailsFormSection;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.ehr.dataentry.TaskForm;
import org.labkey.api.ehr.dataentry.TaskFormSection;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.WNPRCConstants;
import org.labkey.wnprc_ehr.dataentry.forms.InRooms.FormSections.InRoomPerAnimalSection;

import java.util.Arrays;

public class InRoomsForm extends TaskForm {
    public static final String NAME = "In Rooms";

    public InRoomsForm(DataEntryFormContext ctx, Module owner) {
        super(ctx, owner, NAME, "Enter In Rooms", WNPRCConstants.DataEntrySections.CLINICAL_SPI, Arrays.asList(
                new TaskFormSection(),
                new AnimalDetailsFormSection(),
                new InRoomPerAnimalSection()
        ));

        for(FormSection section: this.getFormSections()) {
            section.addConfigSource("Task");
            section.addConfigSource("InRooms");
        }

        this.addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/model/sources/InRooms.js"));
    }
}
