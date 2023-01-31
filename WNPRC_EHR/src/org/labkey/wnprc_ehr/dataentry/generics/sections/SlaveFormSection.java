package org.labkey.wnprc_ehr.dataentry.generics.sections;

import org.json.JSONArray;
import org.json.JSONObject;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;

import java.util.Set;

/**
 * Created by jon on 4/13/16.
 */
abstract public class SlaveFormSection extends SimpleFormSection
{
    public SlaveFormSection(String schemaName, String queryName, String label)
    {
        super(schemaName, queryName, label);

        setClientStoreClass("WNPRC.ext.data.SingleAnimal.SlaveSectionClientStore");
    }

    @Override
    public JSONObject toJSON(DataEntryFormContext ctx, boolean includeFormElements)
    {
        JSONObject json = super.toJSON(ctx, includeFormElements);

        JSONArray slaveFields = new JSONArray();
        for (String field : getSlaveFields())
        {
            slaveFields.put(field);
        }
        json.put("slaveFieldsToInclude", slaveFields);

        return json;
    }

    abstract public Set<String> getSlaveFields();
}
