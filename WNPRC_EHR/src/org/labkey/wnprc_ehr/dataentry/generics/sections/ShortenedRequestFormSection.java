package org.labkey.wnprc_ehr.dataentry.generics.sections;

import org.json.JSONObject;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.RequestFormSection;

/**
 * Created by jon on 3/15/16.
 */
public class ShortenedRequestFormSection extends RequestFormSection
{
    protected Integer maxItemsPerColumn = 3;

    @Override
    public JSONObject toJSON(DataEntryFormContext ctx, boolean includeFormElements)
    {
        JSONObject ret = super.toJSON(ctx, includeFormElements);

        if ( maxItemsPerColumn != null )
        {
            // Make the form appear in two columns
            JSONObject formConfig = new JSONObject(ret.get("formConfig"));
            formConfig.put("maxItemsPerCol", maxItemsPerColumn);
            ret.put("formConfig", formConfig);
        }

        return ret;
    }
}
