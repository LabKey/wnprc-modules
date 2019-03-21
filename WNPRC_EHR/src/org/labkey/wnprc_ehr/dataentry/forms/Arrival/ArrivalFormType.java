package org.labkey.wnprc_ehr.dataentry.forms.Arrival;

import org.labkey.api.ehr.dataentry.AnimalDetailsFormSection;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.TaskForm;
import org.labkey.api.ehr.dataentry.TaskFormSection;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.WNPRCConstants;
import org.labkey.wnprc_ehr.dataentry.forms.Arrival.FormSections.ArrivalFormSection;
import org.labkey.wnprc_ehr.dataentry.forms.Arrival.FormSections.TBTestsFormSection;
import org.labkey.wnprc_ehr.dataentry.forms.Arrival.FormSections.VirologyResultsFormSection;
import org.labkey.wnprc_ehr.dataentry.forms.Arrival.FormSections.WeightFormSection;

import java.util.Arrays;

public class ArrivalFormType extends TaskForm {
    public static final String NAME = "Arrival";

    public ArrivalFormType(DataEntryFormContext ctx, Module owner) {
        super(ctx, owner, NAME, "Enter Arrivals", WNPRCConstants.DataEntrySections.COLONY_RECORDS, Arrays.asList(
                new TaskFormSection(),
                new AnimalDetailsFormSection(),
                new ArrivalFormSection(),
                new WeightFormSection(),
                new TBTestsFormSection(),
                new VirologyResultsFormSection()
        ));

        addClientDependency(ClientDependency.fromPath("wnprc_ehr/model/sources/NewAnimal.js"));
    }
}
