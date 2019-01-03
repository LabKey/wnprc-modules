package org.labkey.wnprc_ehr.dataentry.generics.sections;

/**
 * Created by jon on 6/27/16.
 */
public class TaskFormSection extends org.labkey.api.ehr.dataentry.TaskFormSection {
    public TaskFormSection() {
        this.setClientStoreClass("WNPRC.ext.data.TaskClientStore");
    }
}
