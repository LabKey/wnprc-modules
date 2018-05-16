package org.labkey.wnprc_ehr.dataentry.forms.FoodDeprivesRequest;

import org.labkey.api.ehr.dataentry.AnimalDetailsFormSection;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.wnprc_ehr.dataentry.generics.forms.SimpleRequestForm;
import org.labkey.api.ehr.dataentry.RequestFormSection;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.dataentry.forms.FoodDeprivesRequest.FormSections.FoodDeprivesRequestFormSections;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Created by fdnicolalde on 3/9/16.
 */
public class FoodDeprivesRequestForm extends SimpleRequestForm
{
    public static final String NAME = "Food Deprive Request";

    public FoodDeprivesRequestForm(DataEntryFormContext ctx, Module owner) {
        super(ctx, owner, NAME, "Requests Food Deprives" , "Requests", Arrays.asList(
                new RequestFormSection(),
                new AnimalDetailsFormSection(),
                new FoodDeprivesRequestFormSections()
        ));

        for (FormSection section: this.getFormSections()){
            section.addConfigSource("WNPRC_Request");
        }

        this.addClientDependency(ClientDependency.fromPath("wnprc_ehr/model/sources/Request.js"));

    }
    @Override
    protected List<String> getButtonConfigs(){
        List<String> ret = new ArrayList<>();
        ret.addAll(super.getButtonConfigs());
        ret.remove("REQUEST");
        ret.add("SCHEDULE");

        return ret;
    }
}
