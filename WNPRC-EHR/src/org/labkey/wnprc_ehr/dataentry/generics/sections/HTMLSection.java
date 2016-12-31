package org.labkey.wnprc_ehr.dataentry.generics.sections;

import org.json.JSONObject;
import org.labkey.api.data.TableInfo;
import org.labkey.api.ehr.dataentry.AbstractFormSection;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.ehr.dataentry.NonStoreFormSection;
import org.labkey.api.security.permissions.Permission;
import org.labkey.api.util.Pair;
import org.labkey.api.view.template.ClientDependency;

import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * Created by jon on 3/4/16.
 */
public abstract class HTMLSection extends NonStoreFormSection {
    private static String XTYPE = "panel";

    public HTMLSection(String name, String label) {
        super(name, label, XTYPE);
    }

    public abstract String getHTML();

    @Override
    public JSONObject toJSON(DataEntryFormContext ctx, boolean includeFormElements) {
        JSONObject json = super.toJSON(ctx, includeFormElements);

        // formConfig gets copied onto the section Ext4 config.
        JSONObject formConfig;
        if (json.containsKey("formConfig")) {
            formConfig = json.getJSONObject("formConfig");
        }
        else {
            formConfig = new JSONObject();
        }
        formConfig.put("html", getHTML());
        json.put("formConfig", formConfig);

        return json;
    }
}
