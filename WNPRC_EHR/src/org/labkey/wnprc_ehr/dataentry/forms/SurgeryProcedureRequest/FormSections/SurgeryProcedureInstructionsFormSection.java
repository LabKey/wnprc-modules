package org.labkey.wnprc_ehr.dataentry.forms.SurgeryProcedureRequest.FormSections;
import org.labkey.wnprc_ehr.dataentry.generics.sections.HTMLSection;

public class SurgeryProcedureInstructionsFormSection extends HTMLSection{
    public SurgeryProcedureInstructionsFormSection() {
        super("SurgeryProcedureInstructions", "Instructions for Form");
    }

    @Override
    public String getHTML() {
        return "<p style=\"padding: 10px\">\n" +
                "<strong>Start and end times for rooms must include ALL of the time that the room will be in use. This includes setup/prep time and time for any cleaning needed after the procedure.</strong>" +
                "</p>";
    }
}