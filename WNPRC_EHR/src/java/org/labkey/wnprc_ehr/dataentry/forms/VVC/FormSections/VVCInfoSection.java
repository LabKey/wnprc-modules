package org.labkey.wnprc_ehr.dataentry.forms.VVC.FormSections;

import org.labkey.wnprc_ehr.dataentry.generics.sections.SimpleFormSection;
//import org.labkey.api.ehr.dataentry.SimpleFormSection;

import java.util.Arrays;

public class VVCInfoSection extends SimpleFormSection{
    private String _clientModelClass = "EHR.model.DefaultClientModel";
    public VVCInfoSection(){
        super("wnprc", "vvc", "Veterinary Verification and Consultation");
        this.addConfigSource("Default");
       // addClientDependency(ClientDependency.fromPath("/ehr/panel/EnterDataPanel.js"));
        setTemplateMode(TEMPLATE_MODE.NONE);

        fieldNamesAtStartInOrder = Arrays.asList(
                "dateRequested",
                "Project"
        );

    }
    public String getClientModelClass()
    {
        return _clientModelClass;
    }

    protected void setClientModelClass(String clientModelClass)
    {
        _clientModelClass = clientModelClass;
    }

}
