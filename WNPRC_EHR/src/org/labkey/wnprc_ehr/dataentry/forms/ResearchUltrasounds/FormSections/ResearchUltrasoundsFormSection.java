package org.labkey.wnprc_ehr.dataentry.forms.ResearchUltrasounds.FormSections;

import org.json.JSONObject;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.SimpleFormSection;

import java.util.HashMap;
import java.util.Map;

public class ResearchUltrasoundsFormSection extends SimpleFormSection
{
    Integer maxItemsPerColumn = 20;

    public ResearchUltrasoundsFormSection() {
        super("study", "research_ultrasounds", "Research Ultrasounds", "ehr-formpanel");

//        setTemplateMode(TEMPLATE_MODE.NONE);

//        fieldNamesAtStartInOrder = Arrays.asList(
//                "dateRequested",
//                "Project"
//        );
    }

    @Override
    public JSONObject toJSON(DataEntryFormContext ctx, boolean includeFormElements) {
        JSONObject ret = super.toJSON(ctx, includeFormElements);

        Map<String, Object> formConfig = new HashMap<>();
        Map<String, Object> bindConfig = new HashMap<>();
        bindConfig.put("createRecordOnLoad", true);
        formConfig.put("bindConfig", bindConfig);

        if ( maxItemsPerColumn != null ) {
            // Make the form appear in two columns
            formConfig.put("maxItemsPerCol", maxItemsPerColumn);
        }

        ret.put("formConfig", formConfig);

        return ret;
    }
}
