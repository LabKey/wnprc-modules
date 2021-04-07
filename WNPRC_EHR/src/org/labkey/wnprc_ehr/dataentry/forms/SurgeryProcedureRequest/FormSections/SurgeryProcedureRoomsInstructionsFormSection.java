package org.labkey.wnprc_ehr.dataentry.forms.SurgeryProcedureRequest.FormSections;
import org.labkey.wnprc_ehr.dataentry.generics.sections.HTMLSection;

public class SurgeryProcedureRoomsInstructionsFormSection extends HTMLSection{
    public SurgeryProcedureRoomsInstructionsFormSection() {
        super("SurgeryProcedureRoomsInstructions", "Rooms Instructions");
    }

    @Override
    public String getHTML() {
        return "<p style=\"padding: 10px\">\n" +
                "<strong>Insert instruction text here.</strong>" +
                "</p>";
    }
}