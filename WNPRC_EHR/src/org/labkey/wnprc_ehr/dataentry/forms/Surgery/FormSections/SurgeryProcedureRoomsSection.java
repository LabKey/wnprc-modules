package org.labkey.wnprc_ehr.dataentry.forms.Surgery.FormSections;

import org.labkey.api.ehr.dataentry.SimpleFormSection;
//import org.labkey.wnprc_ehr.dataentry.generics.sections.SimpleGridSection;

import java.util.Arrays;
import java.util.List;

public class SurgeryProcedureRoomsSection extends SimpleFormSection
{
    public SurgeryProcedureRoomsSection() {
        super("wnprc", "procedure_scheduled_rooms", "Rooms", "ehr-gridpanel");
        setTemplateMode(TEMPLATE_MODE.NO_ID);

//        this.maxItemsPerColumn = 14;

        //setClientStoreClass("WNPRC.ext.data.SingleAnimal.SurgeryProcedureClientStore");
    }

//    @Override
//    protected List<String> getFieldNames() {
//        return Arrays.asList(
//                "room",
//                "room_type",
//                "date",
//                "enddate"
//        );
//    }
}