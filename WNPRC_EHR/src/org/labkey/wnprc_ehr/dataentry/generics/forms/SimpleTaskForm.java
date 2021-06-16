package org.labkey.wnprc_ehr.dataentry.generics.forms;

import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.ehr.dataentry.TaskForm;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.WNPRC_EHRModule;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Supplier;

/**
 * Created by jon on 3/1/16.
 */
public class SimpleTaskForm extends TaskForm {
    protected SimpleTaskForm(DataEntryFormContext ctx, Module owner, String name, String label, String category, List<FormSection> sections) {
        super(ctx, owner, name, label, category, sections);

        setJavascriptClass("WNPRC.ext.panel.TaskDataEntryPanel");
        setStoreCollectionClass("WNPRC.ext.data.TaskStoreCollection");

        for(Supplier<ClientDependency> dependency : WNPRC_EHRModule.getDataEntryClientDependencies()) {
            this.addClientDependency(dependency);
        }
    }

    @Override
    protected List<String> getButtonConfigs() {
        List<String> defaultButtons = new ArrayList<String>();

        defaultButtons.add("WNPRC_CANCEL");
        defaultButtons.add("WNPRC_SAVE");
        defaultButtons.add("WNPRC_SAVE_AND_EXIT");

        return defaultButtons;
    }

    @Override
    protected List<String> getMoreActionButtonConfigs() {
        List<String> defaultButtons = new ArrayList<String>();

        defaultButtons.add("WNPRC_FIX_QCSTATE");
        defaultButtons.add("DISCARD");
        defaultButtons.add("FORCESUBMIT");
        defaultButtons.add("VALIDATEALL");
        defaultButtons.add("REVIEW");
        defaultButtons.add("WNPRC_START_TASK");
        defaultButtons.add("WNPRC_SUBMIT_FINAL");
        defaultButtons.add("WNPRC_SAVE_AS_SCHEDULED");

        return defaultButtons;
    }
}
