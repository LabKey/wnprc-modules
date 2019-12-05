package org.labkey.wnprc_ehr.dataentry.forms.Surgery;

import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.ehr.dataentry.RequestFormSection;
import org.labkey.api.ehr.dataentry.SimpleFormSection;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.WNPRCConstants;
import org.labkey.wnprc_ehr.dataentry.forms.FoodDeprivesRequest.FormSections.FoodDeprivesRequestFormSections;
import org.labkey.wnprc_ehr.dataentry.forms.Surgery.FormSections.SurgeryProcedureRequestSection;
import org.labkey.wnprc_ehr.dataentry.generics.forms.SimpleRequestForm;
import org.labkey.wnprc_ehr.dataentry.generics.sections.AnimalDetailsPanel;
import org.labkey.wnprc_ehr.dataentry.generics.sections.SlaveGridSection;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class SurgeryProcedureRequestForm extends SimpleRequestForm
{

    public static final String NAME = "SurgeryProcedureRequest";

    public SurgeryProcedureRequestForm(DataEntryFormContext ctx, Module owner) {
        super(ctx, owner, NAME, "Request Surgery/Procedure", WNPRCConstants.DataEntrySections.PATHOLOGY_CLINPATH, Arrays.<FormSection>asList(
                new RequestFormSection(),
                new SurgeryProcedureRequestSection(),
                //new SimpleFormSection("study", "Drug Administration", "Treatments", "ehr-gridpanel"),
                new SlaveGridSection("study", "Drug Administration", "Drugs")
                {
                    @Override
                    public Set<String> getSlaveFields() {
                        Set<String> fields = new HashSet<>();

                        fields.add("Id");
                        fields.add("date");

                        return fields;
                    }

                    @Override
                    protected List<String> getFieldNames() {
                        return Arrays.asList("Id", "date", "tissue", "qualifier", "weight", "remark");
                    }
                },
                new FoodDeprivesRequestFormSections(),
                //new SimpleFormPanelSection("wnprc", "surgeries", "Surgery Request"),
                new AnimalDetailsPanel()
        ));

        for(FormSection section: this.getFormSections()) {
            section.addConfigSource("SurgeryProcedureRequest");
        }

        this.addClientDependency(ClientDependency.fromPath("wnprc_ehr/model/sources/SurgeryProcedureRequest.js"));
    }

    @Override
    protected List<String> getButtonConfigs() {
        List<String> buttons = new ArrayList<>();
        buttons.addAll(super.getButtonConfigs());

        buttons.remove("REQUEST");
        buttons.add("WNPRC_REQUEST");

        return buttons;
    }
}
