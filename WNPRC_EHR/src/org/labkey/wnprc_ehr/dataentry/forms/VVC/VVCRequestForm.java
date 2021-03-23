package org.labkey.wnprc_ehr.dataentry.forms.VVC;


import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.ehr.dataentry.RequestFormSection;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.WNPRC_EHRModule;
import org.labkey.wnprc_ehr.dataentry.forms.VVC.FormSections.VVCInfoSection;
import org.labkey.wnprc_ehr.dataentry.generics.forms.SimpleRequestForm;
import java.util.Arrays;
import java.util.function.Supplier;

public class VVCRequestForm extends SimpleRequestForm
{
    public static final String NAME = "VVCRequest";

    public VVCRequestForm (DataEntryFormContext ctx, Module owner){
        super (ctx,owner,NAME,"Request VVC", "Requests", Arrays.asList(
                new RequestFormSection(),
                new VVCInfoSection()
        ));
        for(Supplier<ClientDependency> dependency : WNPRC_EHRModule.getDataEntryClientDependencies()) {
            this.addClientDependency(dependency);
        }

        for (FormSection s: getFormSections()){
            s.addConfigSource("Default");
        }
        this.addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/model/sources/Default.js"));



    }
}
