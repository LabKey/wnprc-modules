package org.labkey.wnprc_ehr.dataentry.forms.Necropsy.FormSections;

import org.labkey.wnprc_ehr.WNPRC_EHREmail;
import org.labkey.wnprc_ehr.dataentry.generics.sections.HTMLSection;

/**
 * Created by jon on 3/4/16.
 */
public class NoticeSection extends HTMLSection {
    public NoticeSection() {
        super("Notice", "Notice");
    }

    @Override
    public String getHTML() {
        String pathToJsp = "/org/labkey/wnprc_ehr/dataentry/forms/Necropsy/FormSections/RequestNotice.jsp";

        WNPRC_EHREmail<NullModel> email = new WNPRC_EHREmail(pathToJsp);

        String text;
        try {
            text = email.renderEmail(new NullModel(), false);
        }
        catch (Exception e) {
            text = "An error occurred";
        }
        return text;
    }

    public static class NullModel {}
}
