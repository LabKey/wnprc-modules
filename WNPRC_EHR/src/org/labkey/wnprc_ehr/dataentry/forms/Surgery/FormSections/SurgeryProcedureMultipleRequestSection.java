package org.labkey.wnprc_ehr.dataentry.forms.Surgery.FormSections;

import org.labkey.wnprc_ehr.dataentry.generics.sections.SimpleGridSection;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class SurgeryProcedureMultipleRequestSection extends SimpleGridSection
{
    public SurgeryProcedureMultipleRequestSection() {
        super("study", "surgery_procedure", "Surgeries or Procedures");
        //setTemplateMode(TEMPLATE_MODE.NONE);

        //this.maxItemsPerColumn = 14;

        //setClientStoreClass("WNPRC.ext.data.SingleAnimal.SurgeryProcedureClientStore");
    }

    @Override
    protected List<String> getFieldNames() {
        return Arrays.asList(
                "Id",
                "date",
                "enddate",
                "procedurecategory",
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

//    @Override
//    public List<String> getTbarButtons() {
//        List<String> defaultButtons = new ArrayList<>();
//        defaultButtons.addAll(super.getTbarButtons());
//
//        defaultButtons.remove("COPYFROMSECTION");
//
//        return defaultButtons;
//    }
}