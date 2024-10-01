package org.labkey.wnprc_ehr.notification;

import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.Sort;
import org.labkey.api.module.Module;
import org.labkey.api.query.FieldKey;
import org.labkey.api.security.User;

import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;

public class AdminAlertsNotificationRevamp extends AbstractEHRNotification {
    //Class Variables
    NotificationToolkit notificationToolkit = new NotificationToolkit();
    NotificationToolkit.StyleToolkit styleToolkit = new NotificationToolkit.StyleToolkit();
    NotificationToolkit.DateToolkit dateToolkit = new NotificationToolkit.DateToolkit();



    //Constructors
    /**
     * This constructor is used to register the notification in WNPRC_EHRModule.java.
     * @param owner
     */
    public AdminAlertsNotificationRevamp(Module owner) {super(owner);}



    //Notification Details
    @Override
    public String getName() {
        return "Admin Alerts Revamp";
    }
    @Override
    public String getDescription() {
        return "This email contains a series of automatic alerts about the WNPRC colony.  It was run on: " + dateToolkit.getCurrentTime();
    }
    @Override
    public String getEmailSubject(Container c) {
        return "Daily Admin Alerts: " + dateToolkit.getCurrentTime();
    }
    @Override
    public String getScheduleDescription() {
        return "Daily at 11AM";
    }
    @Override
    public String getCronString() {
        return notificationToolkit.createCronString("0", "11", "*");
    }
    @Override
    public String getCategory() {
        return "Revamped Notifications";
    }



    //Message Creation
    @Override
    public String getMessageBodyHTML(Container c, User u) {
        // Gets AdminAlertsNotificationRevampObject.
        AdminAlertsNotificationObject myAdminAlertsNotificationObject = new AdminAlertsNotificationObject(c, u);
        Boolean messageIsEmpty = true;

        // Begins message body.
        StringBuilder messageBody = new StringBuilder();

        // Creates CSS.
        messageBody.append(styleToolkit.beginStyle());
        messageBody.append(styleToolkit.setBasicTableStyle());
        messageBody.append(styleToolkit.setHeaderRowBackgroundColor("#d9d9d9"));
        messageBody.append(styleToolkit.endStyle());

        // Begins message info.
        messageBody.append("<p>This email contains a series of automatic alerts about the WNPRC colony.  It was run on: " + dateToolkit.getCurrentTime() + ".</p>");

        // Summarizes site logins in the past 7 days.
        messageBody.append("<p>Site Logins In The Past 7 Days:</p>");
        if (!myAdminAlertsNotificationObject.siteUsageLastSevenDays.isEmpty()) {
            // Creates table.
            String[] myTableColumns = new String[]{"Day of Week", "Date", "Logins"};
            NotificationToolkit.NotificationRevampTable myTable = new NotificationToolkit.NotificationRevampTable(myTableColumns, myAdminAlertsNotificationObject.siteUsageLastSevenDays);
            messageBody.append(myTable.createBasicHTMLTable());
        }

        // Lists number of client errors since yesterday.
        messageBody.append("<br>\n<p><b>WARNING: There were " + myAdminAlertsNotificationObject.numClientErrorsSinceYesterday + " client errors since yesterday (" + dateToolkit.getDateXDaysFromNow(-1) + "):</b></p>");
        messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view them</p>", myAdminAlertsNotificationObject.numClientErrorsSinceYesterdayURLView));
        
        return messageBody.toString();
    }

    public static class AdminAlertsNotificationObject {
        // Set up.
        NotificationToolkit notificationToolkit = new NotificationToolkit();
        NotificationToolkit.DateToolkit dateToolkit = new NotificationToolkit.DateToolkit();
        Container currentContainer;
        User currentUser;

        // Data to retrieve.
        ArrayList<String[]> siteUsageLastSevenDays = new ArrayList<>();
        Long numClientErrorsSinceYesterday = Long.valueOf(0);
        String numClientErrorsSinceYesterdayURLView = "";

        // Creates constructor.
        AdminAlertsNotificationObject(Container c, User u) {
            // Sets variables.
            this.currentContainer = c;
            this.currentUser = u;

            // Gets data.
            getSiteUsageSummaryLastSevenDays();
            getNumClientErrorsSinceYesterday();
        }

        // 1. Summarizes site usage in the past 7 days (gets list of logins).
        void getSiteUsageSummaryLastSevenDays() {
            // Creates filter.
            Date dateSevenDaysAgo = dateToolkit.getDateXDaysFromNow(-50);
            SimpleFilter myFilter = new SimpleFilter("date", dateSevenDaysAgo, CompareType.DATE_GTE);
            // Creates sort.
            Sort mySort = new Sort("+date");
            // Creates columns to retrieve.
            String[] targetColumns = new String[]{"dayOfWeek", "date", "Logins"};
            // Runs query.
            ArrayList<HashMap<String, String>> returnArray = notificationToolkit.getTableMultiRowMultiColumnWithFieldKeys(currentContainer, currentUser, "core", "SiteUsageByDay", myFilter, mySort, targetColumns);
            // Formats return data into ArrayList<String[]> to pass in as table data.
            for (HashMap<String, String> currentSiteUsage : returnArray) {
                String currentDayOfWeek = currentSiteUsage.get("dayOfWeek");
                String currentDate = currentSiteUsage.get("date");
                String currentNumLogins = currentSiteUsage.get("Logins");
                String[] myTableDataRow = new String[]{currentDayOfWeek, currentDate, currentNumLogins};
                this.siteUsageLastSevenDays.add(myTableDataRow);
            }
        }

        // 2. Gets number of client errors since yesterday.
        void getNumClientErrorsSinceYesterday() {
            // Creates filter.
            Date dateYesterday = dateToolkit.getDateXDaysFromNow(-1);
            SimpleFilter myFilter = new SimpleFilter("date", dateYesterday, CompareType.DATE_GTE);
            myFilter.addCondition("key1", "LabKey Server Backup", CompareType.NEQ_OR_NULL);
            myFilter.addCondition("EventType", "Client API Actions", CompareType.EQUAL);

            // Runs query.
            ArrayList<String> returnArray = notificationToolkit.getTableMultiRowSingleColumn(currentContainer, currentUser, "auditlog", "audit", myFilter, null, "RowId", null);
            this.numClientErrorsSinceYesterday = Long.valueOf(returnArray.size());
            // Creates a URL to view number of client errors since yesterday.
            this.numClientErrorsSinceYesterdayURLView = notificationToolkit.createQueryURL(currentContainer, "execute", "auditlog", "audit", myFilter);
        }
    }
}
