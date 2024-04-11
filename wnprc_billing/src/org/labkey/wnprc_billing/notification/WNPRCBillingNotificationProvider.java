package org.labkey.wnprc_billing.notification;

import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.ehr.EHRService;
import org.labkey.api.ehr_billing.EHR_BillingService;
import org.labkey.api.ehr_billing.notification.BillingNotificationProvider;
import org.labkey.api.ehr_billing.notification.FieldDescriptor;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryAction;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.User;
import org.labkey.api.view.ActionURL;
import org.labkey.wnprc_billing.WNPRC_BillingModule;
import org.labkey.wnprc_billing.WNPRC_BillingSchema;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class WNPRCBillingNotificationProvider implements BillingNotificationProvider
{
    private static final WNPRCBillingNotificationProvider INSTANCE = new WNPRCBillingNotificationProvider();
    public static WNPRCBillingNotificationProvider get()
    {
        return INSTANCE;
    }

    private static final String CATEGORY_PERDIEM = "Per Diems";
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
        categoryToQuery.put(CATEGORY_MISC_CHARGES, "miscChargesFeeRates");

        return categoryToQuery;
    }

    @Override
    public Map<String, Container> getQueryCategoryContainerMapping(Container c)
    {
        Map<String, Container> categoryContainerMap = new HashMap<>();
        categoryContainerMap.put(CATEGORY_MISC_CHARGES, EHRService.get().getEHRStudyContainer(c));
        categoryContainerMap.put(CATEGORY_PERDIEM, EHR_BillingService.get().getEHRBillingContainer(c));

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

    @Override
    public Map<String, Map<String, Object>> getAdditionalChargeCategoryInfo(User u, Container c, Date startDate, Date endDate)
    {
        Map<String, Map<String, Object>> additionalChargeCategoryInfo = new HashMap<>();

        //get Procedure queries listed in ehr_billing.procedureQueryChargeIdAssoc
        UserSchema us = QueryService.get().getUserSchema(u, c, "ehr_billing");
        TableInfo ti = us.getTable("procedureQueryChargeIdAssoc", null);
        TableSelector ts = new TableSelector(ti);
        Collection<Map<String, Object>> procedureQueries = ts.getMapCollection();

        ArrayList<ChargeInfo> chargeInfoArrayList = getChargeIdWithAssociatedInfo(u, c);

        // iterate through Procedure queries associated with a chargeId
        for (Map<String, Object> row : procedureQueries)
        {
            String procedureSchema = (String) row.get("schemaName");
            String procedureQuery = (String) row.get("queryName");
            String description = (String) row.get("description");
            int chargeId = (Integer) row.get("chargeId");

            // for each procedure query, get query results
            UserSchema schema = QueryService.get().getUserSchema(u, c, procedureSchema);
            TableInfo procedureQueryTi = schema.getTable(procedureQuery, null);
            if (null == procedureQueryTi)
            {
                continue;
            }

            //filter by startDate and endDate
            SimpleFilter filter = new SimpleFilter();
            filter.addCondition(FieldKey.fromString("date"), startDate, CompareType.DATE_GTE);
            filter.addCondition(FieldKey.fromString("date"), endDate, CompareType.DATE_LTE);
            TableSelector procedureQueryTs = new TableSelector(procedureQueryTi, filter, null);
            Collection<Map<String, Object>> procedureRows = procedureQueryTs.getMapCollection();

            Double totalCostPerCategory = 0.00;

            //iterate through procedure query results and get total cost
            for (Map<String, Object> procedureRow : procedureRows)
            {
                // for each row, associate chargeId
                procedureRow.put("chargeId", chargeId);

                // add charge info
                ChargeInfo ci = getChargeInfo(chargeId, chargeInfoArrayList, procedureRow.get("date"));

                // get cost
                Double unitCost = ci.getUnitCost();

                // total cost
                Double totalCost = unitCost * (Double) procedureRow.get("quantity");

                totalCostPerCategory += totalCost;
            }
            Map<String, Object> categoryInfo = new HashMap<>();

            // set total no. of rows per each charge category/procedure query
            categoryInfo.put("total", (procedureRows.size() * 1.00));

            // set total cost per each charge category/procedure query
            categoryInfo.put("totalCost", totalCostPerCategory);

            // set url for each category with startDate and endDate as parameters
            ActionURL url = QueryService.get().urlFor(u, c, QueryAction.executeQuery, procedureSchema, procedureQuery);
            SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd");
            url.addParameter("query.date~dategte", format.format(startDate));
            url.addParameter("query.date~datelte", format.format(endDate));
            categoryInfo.put("url", url.toString());

            additionalChargeCategoryInfo.put(description, categoryInfo);
        }
        return additionalChargeCategoryInfo;
    }

    private ChargeInfo getChargeInfo(int chargeId, ArrayList<ChargeInfo> chargeInfoArrayList, Object date)
    {
        Date chargeDate = (Date) date;
        List<ChargeInfo> chargeInfoList = chargeInfoArrayList.stream().filter(ci -> ci.getChargeId() == chargeId).toList();

        for (ChargeInfo ci : chargeInfoList)
        {
            if (chargeDate.after(ci.getChargeRateEndDate()) && chargeDate.before(ci.getChargeRateEndDate()))
            {
                return ci;
            }
        }

        return new ChargeInfo();
    }

    private ArrayList<ChargeInfo> getChargeIdWithAssociatedInfo(User u, Container c)
    {
        UserSchema us = QueryService.get().getUserSchema(u, c, "ehr_billing");
        TableInfo ti = us.getTable("chargeItemsWithRates", null);

        TableSelector ts = new TableSelector(ti, Set.of("chargeId", "unitCost", "chargeRateStartDate", "chargeRateEndDate"));
        ArrayList<ChargeInfo> chargeInfoArrayList = ts.getArrayList(ChargeInfo.class);

        return chargeInfoArrayList;
    }

    public static class ChargeInfo
    {
        private int _chargeId;
        private double _unitCost;
        private Date _chargeRateStartDate;
        private Date _chargeRateEndDate;

        public int getChargeId()
        {
            return _chargeId;
        }

        public void setChargeId(int chargeId)
        {
            _chargeId = chargeId;
        }

        public double getUnitCost()
        {
            return _unitCost;
        }

        public void setUnitCost(double unitCost)
        {
            _unitCost = unitCost;
        }

        public Date getChargeRateStartDate()
        {
            return _chargeRateStartDate;
        }

        public void setChargeRateStartDate(Date chargeRateStartDate)
        {
            _chargeRateStartDate = chargeRateStartDate;
        }

        public Date getChargeRateEndDate()
        {
            return _chargeRateEndDate;
        }

        public void setChargeRateEndDate(Date chargeRateEndDate)
        {
            _chargeRateEndDate = chargeRateEndDate;
        }
    }

}
