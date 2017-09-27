package org.labkey.wnprc_ehr.dataentry.forms.SimpleRemark;

import org.labkey.api.ehr.dataentry.AnimalDetailsFormSection;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.ehr.dataentry.TaskForm;
import org.labkey.api.ehr.dataentry.TaskFormSection;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.WNPRCConstants;
import org.labkey.wnprc_ehr.dataentry.forms.SimpleRemark.FormSections.RemarksSection;

import java.util.Arrays;

public class SimpleRemarkForm extends TaskForm {
    public static final String NAME = "Simple Remark";

    public SimpleRemarkForm(DataEntryFormContext ctx, Module owner) {
        super(ctx, owner, NAME, "Enter Simple Remark", WNPRCConstants.DataEntrySections.COLONY_RECORDS, Arrays.<FormSection>asList(
                new TaskFormSection(),
                new AnimalDetailsFormSection(),
                new RemarksSection()
        ));

        for(FormSection section: this.getFormSections()) {
            section.addConfigSource("Task");
            section.addConfigSource("SimpleRemarks");
        }

        this.addClientDependency(ClientDependency.fromPath("wnprc_ehr/model/sources/SimpleRemarks.js"));
    }
}
