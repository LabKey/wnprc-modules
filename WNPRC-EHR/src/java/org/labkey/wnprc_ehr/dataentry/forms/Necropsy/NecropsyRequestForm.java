package org.labkey.wnprc_ehr.dataentry.forms.Necropsy;

import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.WNPRCConstants;
import org.labkey.wnprc_ehr.dataentry.forms.Necropsy.FormSections.Instructions;
import org.labkey.wnprc_ehr.dataentry.forms.Necropsy.FormSections.NecropsyRequestInfoSection;
import org.labkey.wnprc_ehr.dataentry.forms.Necropsy.FormSections.NoticeSection;
import org.labkey.wnprc_ehr.dataentry.forms.Necropsy.FormSections.OrganWeightsSection;
import org.labkey.wnprc_ehr.dataentry.forms.Necropsy.FormSections.TissueSamplesSection;
import org.labkey.wnprc_ehr.dataentry.generics.forms.SimpleRequestForm;
import org.labkey.wnprc_ehr.dataentry.generics.sections.AnimalDetailsPanel;
import org.labkey.wnprc_ehr.dataentry.generics.sections.ShortenedRequestFormSection;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Created by jon on 3/4/16.
 */
/**
 * Created by jon on 3/4/16.
 */
public class NecropsyRequestForm extends SimpleRequestForm {
    public static final String NAME = "NecropsyRequest";

    public NecropsyRequestForm(DataEntryFormContext ctx, Module owner) {
        super(ctx, owner, NAME, "Request Necropsy", WNPRCConstants.DataEntrySections.PATHOLOGY_CLINPATH, Arrays.<FormSection>asList(
                new NoticeSection(),
                new ShortenedRequestFormSection(),
                new Instructions(),
                new NecropsyRequestInfoSection(),
                new AnimalDetailsPanel(),
                new TissueSamplesSection(),
                new OrganWeightsSection()
        ));

        for(FormSection section: this.getFormSections()) {
            section.addConfigSource("Necropsy");
            section.addConfigSource("NecropsyRequest");
        }

        this.addClientDependency(ClientDependency.fromPath("wnprc_ehr/model/sources/NecropsyRequest.js"));
        this.addClientDependency(ClientDependency.fromPath("wnprc_ehr/model/sources/Pathology.js"));
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