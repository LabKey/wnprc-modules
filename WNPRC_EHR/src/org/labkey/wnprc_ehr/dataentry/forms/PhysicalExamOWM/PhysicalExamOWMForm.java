package org.labkey.wnprc_ehr.dataentry.forms.PhysicalExamOWM;

import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.dataentry.forms.PhysicalExam.PhysicalExamForm;

public class PhysicalExamOWMForm extends PhysicalExamForm {
    public PhysicalExamOWMForm(DataEntryFormContext ctx, Module owner) {
        super(ctx, owner, "Physical Exam OWM");

        for(FormSection section: this.getFormSections()) {
            section.addConfigSource("PhysicalExamOWM");
        }

        this.addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/model/sources/PhysicalExamOWM.js"));
    }
}
