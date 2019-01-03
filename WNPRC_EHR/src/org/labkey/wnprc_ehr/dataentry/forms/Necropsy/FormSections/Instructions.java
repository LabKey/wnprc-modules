package org.labkey.wnprc_ehr.dataentry.forms.Necropsy.FormSections;

import org.labkey.wnprc_ehr.WNPRC_EHREmail;
import org.labkey.wnprc_ehr.dataentry.generics.sections.HTMLSection;

/**
 * Created by jon on 5/3/16.
 */
public class Instructions extends HTMLSection {
    public Instructions() {
        super("NecropsyRequestInstructions", "Instructions for Form");
    }

    @Override
    public String getHTML() {


        String pathToJsp = "/org/labkey/wnprc_ehr/dataentry/forms/Necropsy/FormSections/Instructions.jsp";

        WNPRC_EHREmail<NoticeSection.NullModel> email = new WNPRC_EHREmail(pathToJsp);

        String text;
        try {
            text = email.renderEmail(new NoticeSection.NullModel());
        }
        catch (Exception e) {
            text = "An error occurred";
        }
        return "<p style=\"padding: 10px\">\n" +
                "    In the form below, select a preferred time for the necropsy.  If you have any other preferences regarding the\n" +
                "    scheduling of the necropsy, such as a date range, AM vs PM, etc., please put these in the comments section.\n" +
                "</p>";
    }
}
