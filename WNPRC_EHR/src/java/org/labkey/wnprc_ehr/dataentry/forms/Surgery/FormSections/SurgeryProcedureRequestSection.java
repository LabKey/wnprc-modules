package org.labkey.wnprc_ehr.dataentry.forms.Surgery.FormSections;

import org.labkey.api.ehr.dataentry.AbstractFormSection;
import org.labkey.wnprc_ehr.dataentry.generics.sections.SimpleFormSection;

public class SurgeryProcedureRequestSection extends SimpleFormSection
{
    public SurgeryProcedureRequestSection() {
        super("study", "surgery_procedure", "Surgery/Procedure");
        setTemplateMode(TEMPLATE_MODE.NONE);

        this.maxItemsPerColumn = 12;

        //setClientStoreClass("WNPRC.ext.data.SingleAnimal.SurgeryProcedureClientStore");
    }
}