package org.labkey.wnprc_ehr.dataentry.forms.SurgeryProcedureRequest.FormSections;

import org.labkey.wnprc_ehr.dataentry.generics.sections.SimpleGridSection;

import java.util.List;

public class SurgeryProcedureRoomsSection extends SimpleGridSection
{
    public SurgeryProcedureRoomsSection() {
        super("wnprc", "procedure_scheduled_rooms", "Rooms");
        setTemplateMode(TEMPLATE_MODE.NO_ID);
    }


    @Override
    public List<String> getTbarButtons()
    {
        List<String> defaultButtons = super.getTbarButtons();
        defaultButtons.add(1, "WNPRC_ADD_ROOM");
        defaultButtons.remove("ADDRECORD");

        return defaultButtons;
    }
}