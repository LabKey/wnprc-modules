package org.labkey.wnprc_ehr.dataentry.forms.PhysicalExamNWM;

import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.dataentry.forms.PhysicalExam.PhysicalExamForm;

public class PhysicalExamNWMForm extends PhysicalExamForm {
    public PhysicalExamNWMForm(DataEntryFormContext ctx, Module owner) {
        super(ctx, owner, "Physical Exam NWM");

        for(FormSection section: this.getFormSections()) {
            section.addConfigSource("PhysicalExamNWM");
        }

        this.addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/model/sources/PhysicalExamNWM.js"));
    }
}
