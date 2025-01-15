package org.labkey.wnprc_ehr.notification;

import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.ldk.notification.NotificationService;
import org.labkey.api.module.Module;
import org.labkey.api.security.User;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;

public class SiteErrorAlertsRevamp extends AbstractEHRNotification {
    // Class Variables
    NotificationToolkit notificationToolkit = new NotificationToolkit();
    NotificationToolkit.DateToolkit dateToolkit = new NotificationToolkit.DateToolkit();




    // Constructors
    /**
     * This constructor is used to register the notification in WNPRC_EHRModule.java.
     * @param owner
     */
    public SiteErrorAlertsRevamp(Module owner) {super(owner);}





    // Notification Details
    @Override
    public String getName() {
        return "Site Error Alerts Revamp";
    }
    @Override
    public String getDescription() {
        return "This email contains alerts of any client errors recorded since the last time this email was sent.<p>";
    }
    @Override
    public String getEmailSubject(Container c) {
        return "Site Error Alerts:" + dateToolkit.getCurrentTime();
    }
    @Override
    public String getScheduleDescription() {
        return "Daily, hourly from at 7:25am - 5:25pm";
    }
    @Override
    public String getCronString() {
        return notificationToolkit.createCronString("25", "7,8,9,10,11,12,13,14,15,16,17", "*");
    }
    @Override
    public String getCategory() {
        return "Revamped Notifications";
    }





    //Message Creation
    @Override
    public String getMessageBodyHTML(Container c, User u) {
        // Creates variables & gets data.
        final StringBuilder messageBody = new StringBuilder();
        Date lastRunDate = new Date(NotificationService.get().getLastRun(this));

        // Creates filter.
        SimpleFilter myFilter = new SimpleFilter("date", lastRunDate, CompareType.GTE);
        myFilter.addCondition("key1", "LabKeyServer Backup", CompareType.NEQ);
        // Gets columns to retrieve.
        String[] targetColumns = new String[]{"id"};
        // Runs query.
        ArrayList<HashMap<String, String>> returnArray = notificationToolkit.getTableMultiRowMultiColumnWithFieldKeys(c, u, "auditlog", "audit", myFilter, null, targetColumns);
        // Creates URL.
        String queryURL = notificationToolkit.createQueryURL(c, "execute", "auditlog", "audit", myFilter);

        // Sends the message only if there are results (otherwise sends notification to admins via emptyNotificationRevamp).
        if (returnArray.isEmpty()) {
            notificationToolkit.sendEmptyNotificationRevamp(c, u, "Site Error Alerts Revamp");
            return null;
        }
        else {
            messageBody.append("<b>WARNING: There were " + returnArray.size() + " client errors since " + lastRunDate + ":</b>");
            messageBody.append(notificationToolkit.createHyperlink(queryURL, "<p>Click here to view them</p>\n"));
            messageBody.append("<hr>");
            return messageBody.toString();
        }
    }
    
}



