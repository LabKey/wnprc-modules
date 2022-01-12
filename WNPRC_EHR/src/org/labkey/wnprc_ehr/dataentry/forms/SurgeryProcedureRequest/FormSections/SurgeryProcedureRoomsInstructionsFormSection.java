package org.labkey.wnprc_ehr.dataentry.forms.SurgeryProcedureRequest.FormSections;
import org.labkey.wnprc_ehr.dataentry.generics.sections.HTMLSection;

public class SurgeryProcedureRoomsInstructionsFormSection extends HTMLSection{
    public SurgeryProcedureRoomsInstructionsFormSection() {
        super("SurgeryProcedureRoomsInstructions", "Rooms Instructions");
    }

    @Override
    public String getHTML() {
        return "<p style=\"padding: 10px\">\n" +
                "<strong>You must select at least 1 room to reserve. Please make sure that the start and end times reflect the ENTIRE time that the room will be in use, including any prep and cleanup time.</strong>" +
                "</p>";
    }
}