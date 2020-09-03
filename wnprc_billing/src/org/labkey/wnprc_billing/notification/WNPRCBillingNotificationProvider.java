package org.labkey.wnprc_billing.notification;

import org.labkey.api.data.Container;
import org.labkey.api.ehr.EHRService;
import org.labkey.api.ehr_billing.EHR_BillingService;
import org.labkey.api.ehr_billing.notification.BillingNotificationProvider;
import org.labkey.api.ehr_billing.notification.FieldDescriptor;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.query.QueryService;
import org.labkey.api.security.User;
import org.labkey.wnprc_billing.WNPRC_BillingModule;
import org.labkey.wnprc_billing.WNPRC_BillingSchema;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class WNPRCBillingNotificationProvider implements BillingNotificationProvider
{
    private static final WNPRCBillingNotificationProvider INSTANCE = new WNPRCBillingNotificationProvider();
    public static WNPRCBillingNotificationProvider get()
    {
        return INSTANCE;
    }

    private static final String CATEGORY_PERDIEM = "Per Diems";
    private static final String CATEGORY_PROCEDURE_FEE_RATES = "Blood Draws";
    private static final String CATEGORY_MISC_CHARGES = "Misc. Charges";

    private WNPRCBillingNotificationProvider()
    {
    }

    @Override
    public Module getModule()
    {
        return ModuleLoader.getInstance().getModule(WNPRC_BillingModule.class);
    }

    @Override
    public String getName()
    {
        return "Billing Notification";
    }

    @Override
    public String getCronString()
    {
        return "0 0 8 * * ?"; //every day at 8:00 am
    }

    @Override
    public String getScheduleDescription()
    {
        return "Every Day at 8:00AM";
    }

    @Override
    public String getDescription()
    {
        return "This report is designed to provide a daily summary of current or projected charges since the last invoice date.  " +
                "It will summarize the total dollar amount, as well as flag suspicious or incomplete items.";
    }

    @Override
    public Map<String, String> getCategoriesToQuery()
    {
        Map<String, String> categoryToQuery = new HashMap<>();
        categoryToQuery.put(CATEGORY_PERDIEM, "perDiemFeeRates");
        categoryToQuery.put(CATEGORY_PROCEDURE_FEE_RATES, "procedureFeeRates");
        categoryToQuery.put(CATEGORY_MISC_CHARGES, "miscChargesFeeRates");

        return categoryToQuery;
    }

    @Override
    public Map<String, Container> getQueryCategoryContainerMapping(Container c)
    {
        Map<String, Container> categoryContainerMap = new HashMap<>();
        categoryContainerMap.put(CATEGORY_MISC_CHARGES, EHRService.get().getEHRStudyContainer(c));
        categoryContainerMap.put(CATEGORY_PERDIEM, EHR_BillingService.get().getEHRBillingContainer(c));
        categoryContainerMap.put(CATEGORY_PROCEDURE_FEE_RATES, EHR_BillingService.get().getEHRBillingContainer(c));

        return categoryContainerMap;
    }

    @Override
    public List<FieldDescriptor> getFieldDescriptor()
    {
        List<FieldDescriptor> fields = new ArrayList<FieldDescriptor>();

        //these fields are expected in the sql queries mentioned in getCategoriesToQuery() above

        fields.add(new FieldDescriptor("isMissingAccount", true, "Missing Account", true));
        fields.add(new FieldDescriptor("isExpiredAccount", true, "Expired/Invalid Account", true));
        fields.add(new FieldDescriptor("isAcceptingCharges", true, "Account Not Accepting Charges", true));
        fields.add(new FieldDescriptor("lacksRate", true, "Lacks Rate", true));
        fields.add(new FieldDescriptor("investigator", false, "Missing Investigator", true));
        fields.add(new FieldDescriptor("matchesProject", true, "Project Does Not Match Assignment", false));
        fields.add(new FieldDescriptor("isAdjustment", true, "Adjustment/Reversal", false));
        fields.add(new FieldDescriptor("isOldCharge", true, "Over 45 Days Old", false));
       return fields;
    }

    @Override
    public String getCenterName()
    {
        return "WNPRC";
    }

    @Override
    public boolean isBillingSchemaEnabled(User u, Container c, String alertType, StringBuilder msg)
    {
        if (QueryService.get().getUserSchema(u, c, "wnprc_billing_public") == null)
        {
            msg.append("<b>Warning: the WNPRC billing linked schema has not been enabled in this folder, so the " + alertType + " alert cannot run<p><hr>");
            return false;
        }
        return true;
    }

    @Override
    public String getCenterSpecificBillingSchema()
    {
        return WNPRC_BillingSchema.NAME;
    }

    @Override
    public List<StringBuilder> getAdditionalNotifications(User user)
    {
        return null;
    }

}
