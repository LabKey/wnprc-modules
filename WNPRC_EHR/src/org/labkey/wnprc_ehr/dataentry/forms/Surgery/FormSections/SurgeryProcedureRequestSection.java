package org.labkey.wnprc_ehr.dataentry.forms.Surgery.FormSections;

import org.labkey.wnprc_ehr.dataentry.generics.sections.SimpleFormSection;

import java.util.Arrays;
import java.util.List;

public class SurgeryProcedureRequestSection extends SimpleFormSection
{
    public SurgeryProcedureRequestSection() {
        super("study", "surgery_procedure", "Surgery or Procedure");
        //setTemplateMode(TEMPLATE_MODE.NONE);

        this.maxItemsPerColumn = 14;

        //setClientStoreClass("WNPRC.ext.data.SingleAnimal.SurgeryProcedureClientStore");
    }

    @Override
    protected List<String> getFieldNames() {
        return Arrays.asList(
                "Id",
                "date",
                "enddate",
                "proceduretype",
                "procedurename",
                "location",
                "project",
                "account",
                "surgeon",
                "consultRequest",
                "biopsyNeeded",
                "surgerytechneeded",
                "spineeded",
                "vetneeded",
                "vetneededreason",
                "equipment",
                "drugslab",
                "drugssurgery",
                "comments"
        );
    }
}