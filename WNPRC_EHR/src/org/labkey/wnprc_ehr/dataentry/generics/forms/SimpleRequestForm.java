package org.labkey.wnprc_ehr.dataentry.generics.forms;

import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.ehr.dataentry.RequestForm;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.WNPRC_EHRModule;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Supplier;

/**
 * Created by jon on 3/4/16.
 */
public class SimpleRequestForm extends RequestForm {
    protected SimpleRequestForm(DataEntryFormContext ctx, Module owner, String name, String label, String category, List<FormSection> sections) {
        super(ctx, owner, name, label, category, sections);

        for(Supplier<ClientDependency> dependency : WNPRC_EHRModule.getDataEntryClientDependencies()) {
            this.addClientDependency(dependency);
        }

        setStoreCollectionClass("WNPRC.ext.data.RequestStoreCollection");
    }

    @Override
    protected List<String> getMoreActionButtonConfigs() {
        List<String> ret = new ArrayList<>();
        ret.addAll(super.getMoreActionButtonConfigs());

        ret.remove("COPY_REQUEST");

        return ret;
    }
}
