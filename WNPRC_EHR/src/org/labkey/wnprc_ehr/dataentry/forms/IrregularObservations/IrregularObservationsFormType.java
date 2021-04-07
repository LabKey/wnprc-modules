package org.labkey.wnprc_ehr.dataentry.forms.IrregularObservations;

import org.labkey.api.ehr.dataentry.AnimalDetailsFormSection;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.ehr.dataentry.TaskForm;
import org.labkey.api.ehr.dataentry.TaskFormSection;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.WNPRCConstants;
import org.labkey.wnprc_ehr.dataentry.forms.IrregularObservations.FormSections.OKRoomsSection;
import org.labkey.wnprc_ehr.dataentry.forms.IrregularObservations.FormSections.ObservationsPerAnimalFormSection;
import org.labkey.wnprc_ehr.dataentry.forms.IrregularObservations.FormSections.ObservationsPerCageSection;

import java.util.Arrays;

public class IrregularObservationsFormType extends TaskForm {
    public static final String NAME = "Irregular Observations";

    public IrregularObservationsFormType(DataEntryFormContext ctx, Module owner) {
        super(ctx, owner, NAME, NAME, WNPRCConstants.DataEntrySections.CLINICAL_SPI, Arrays.asList(
                new TaskFormSection(),
                new AnimalDetailsFormSection(),
                new ObservationsPerAnimalFormSection(),
                new ObservationsPerCageSection(),
                new OKRoomsSection()
        ));

        this.addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/model/sources/IrregularObs_OKRooms.js"));
        this.addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/model/sources/IrregularObs.js"));

        for(FormSection section: this.getFormSections()) {
            section.addConfigSource("IrregularObservations");
            section.addConfigSource("Task");
        }
    }
}
