package org.labkey.wnprc_ehr.dataentry.forms.FoodDeprivesRequest.FormSections;

import org.labkey.api.ehr.dataentry.SimpleFormSection;
//import org.labkey.wnprc_ehr.dataentry.SimpleFormSection;

import java.util.List;

/**
 * Created by fdnicolalde on 3/9/16.
 */
public class FoodDeprivesRequestFormSections extends SimpleFormSection
{
    public FoodDeprivesRequestFormSections()
    {
        super ("study", "foodDeprives", "Food Deprives", "ehr-gridpanel");
        this.addConfigSource("WNPRC_Request");
        this.addConfigSource("Husbandry");
    }

    @Override
    public List<String> getTbarMoreActionButtons()
    {
        List<String> defaultButtons = super.getTbarMoreActionButtons();
        defaultButtons.add("REPEAT_SELECTED");

        return defaultButtons;
    }

}
