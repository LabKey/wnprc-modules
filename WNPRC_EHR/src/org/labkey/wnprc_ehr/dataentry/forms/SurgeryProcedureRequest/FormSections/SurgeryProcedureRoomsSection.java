package org.labkey.wnprc_ehr.dataentry.forms.SurgeryProcedureRequest.FormSections;

import org.labkey.wnprc_ehr.dataentry.generics.sections.SimpleGridSection;

public class SurgeryProcedureRoomsSection extends SimpleGridSection
{
    public SurgeryProcedureRoomsSection() {
        super("wnprc", "procedure_scheduled_rooms", "Rooms");
        setTemplateMode(TEMPLATE_MODE.NO_ID);
    }
}