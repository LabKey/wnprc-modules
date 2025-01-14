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

public class ClinpathAlertsRevamp extends AbstractEHRNotification {
    // Class Variables
    NotificationToolkit notificationToolkit = new NotificationToolkit();
    NotificationToolkit.DateToolkit dateToolkit = new NotificationToolkit.DateToolkit();





    // Constructors
    /**
     * This constructor is used to register the notification in WNPRC_EHRModule.java.
     * @param owner
     */
    public ClinpathAlertsRevamp(Module owner) {super(owner);}





    // Notification Details
    @Override
    public String getName() {
        return "Clinpath Alerts Notification Revamp";
    }
    @Override
    public String getDescription() {
        return "This report is designed to identify potential problems related to clinpath.";
    }
    @Override
    public String getEmailSubject(Container c) {
        return "Daily Clinpath Alerts: " + dateToolkit.getCurrentTime();
    }
    @Override
    public String getScheduleDescription() {
        return "Daily at 11:00am, 1:00pm, and 4:00pm";
    }
    @Override
    public String getCronString() {
        return notificationToolkit.createCronString("0", "11,13,16", "*");
    }
    @Override
    public String getCategory() {
        return "Revamped Notifications";
    }

    // Message Creation
    @Override
    public String getMessageBodyHTML(Container c, User u) {
        // Creates variables & retrieves data.
        Date lastRunDate = new Date(NotificationService.get().getLastRun(this));
        ClinpathAlertsObject myClinpathAlertsObject = new ClinpathAlertsObject(c, u, lastRunDate);
        final StringBuilder messageBody = new StringBuilder();

        // Begins message info.
        messageBody.append("This email contains reports on Clinpath Requests.  It was run on: " + dateToolkit.getDateToday() + ".<p>");

        // Displays requests created since the last time this email was sent.
        messageBody.append("<b>Clinpath requests created since the last time this email was sent (" + lastRunDate + "):</b><br>\n");
        if (!myClinpathAlertsObject.recordsRequestedSinceLastEmail.isEmpty()) {
            messageBody.append("There are " + myClinpathAlertsObject.recordsRequestedSinceLastEmail.size() + " requests.<br>");
            messageBody.append("<p>" + notificationToolkit.createHyperlink("Click here to view them", myClinpathAlertsObject.recordsRequestedSinceLastEmailUrlView) + "<br>\n");
        }
        else {
            messageBody.append("No requests have been entered.<br>");
        }
        messageBody.append("<hr>\n");

        // Displays clinpath requests that have not been approved or denied yet.
        messageBody.append("<b>Clinpath requests that have not been approved or denied yet:</b><br>\n");
        if (!myClinpathAlertsObject.recordsNotYetApproved.isEmpty()) {
            messageBody.append("WARNING: There are " + myClinpathAlertsObject.recordsNotYetApproved.size() + " requests that have not been approved or denied yet.<br>");
            messageBody.append("<p>" + notificationToolkit.createHyperlink("Click here to view them", myClinpathAlertsObject.recordsNotYetApprovedUrlView) + "<br>\n");
        }
        else {
            messageBody.append("There are no requests that have not been approved or denied yet.<br>");
        }
        messageBody.append("<hr>\n");

        // Displays records not completed where the date requested is today.
        if (!myClinpathAlertsObject.incompleteRecordsRequestedToday.isEmpty()) {
            messageBody.append("<b>WARNING: There are " + myClinpathAlertsObject.incompleteRecordsRequestedToday.size() + " requests that were requested for today or earlier, but have not been marked complete.</b><br>");
            messageBody.append("<p>" + notificationToolkit.createHyperlink("Click here to view them", myClinpathAlertsObject.incompleteRecordsRequestedTodayUrlView) + "<br>\n");
            messageBody.append("<hr>\n");
        }

        return messageBody.toString();
    }

    public static class ClinpathAlertsObject {
        // Set up.
        Container c;
        User u;
        Date dateLastRun;
        NotificationToolkit notificationToolkit = new NotificationToolkit();
        NotificationToolkit.DateToolkit dateToolkit = new NotificationToolkit.DateToolkit();



        // Constructor.
        public ClinpathAlertsObject(Container currentContainer, User currentUser, Date lastRun) {
            // Sets variables.
            this.c = currentContainer;
            this.u = currentUser;
            this.dateLastRun = lastRun;

            // Retrieves data.
            getRecordsRequestedSinceLastEmail();
            getRecordsNotYetApproved();
            getIncompleteRecordsRequestedToday();
        }



        // Gets any record requested since the last email.
        ArrayList<HashMap<String, String>> recordsRequestedSinceLastEmail;
        String recordsRequestedSinceLastEmailUrlView;
        private void getRecordsRequestedSinceLastEmail() {
            // Creates filter.
            SimpleFilter myFilter = new SimpleFilter("qcstate/label", "Request: Pending", CompareType.EQUAL);
            myFilter.addCondition("created", dateLastRun, CompareType.GTE);
            // Creates columns to retrieve.
            String[] targetColumns = new String[]{"created"};
            // Runs query.
            ArrayList<HashMap<String, String>> returnArray = notificationToolkit.getTableMultiRowMultiColumnWithFieldKeys(c, u, "study", "Clinpath Runs", myFilter, null, targetColumns);

            // Assigns data.
            this.recordsRequestedSinceLastEmail = returnArray;
            this.recordsRequestedSinceLastEmailUrlView = notificationToolkit.createQueryURL(c, "execute", "study", "Clinpath Runs", myFilter);
        }

        // Gets any requests not yet approved.
        ArrayList<HashMap<String, String>> recordsNotYetApproved;
        String recordsNotYetApprovedUrlView;
        private void getRecordsNotYetApproved() {
            // Creates filter.
            SimpleFilter myFilter = new SimpleFilter("qcstate/label", "Request: Pending", CompareType.EQUAL);
            myFilter.addCondition("date", dateToolkit.getDateToday(), CompareType.DATE_GTE);
            // Creates columns to retrieve.
            String[] targetColumns = new String[]{"id"};
            // Runs query.
            ArrayList<HashMap<String, String>> returnArray = notificationToolkit.getTableMultiRowMultiColumnWithFieldKeys(c, u, "study", "Clinpath Runs", myFilter, null, targetColumns);

            // Assigns data.
            this.recordsNotYetApproved = returnArray;
            this.recordsNotYetApprovedUrlView = notificationToolkit.createQueryURL(c, "execute", "study", "Clinpath Runs", myFilter);
        }

        // Gets any record not completed where the date requested is today.
        ArrayList<HashMap<String, String>> incompleteRecordsRequestedToday;
        String incompleteRecordsRequestedTodayUrlView;
        private void getIncompleteRecordsRequestedToday() {
            // Creates filter.
            SimpleFilter myFilter = new SimpleFilter("qcstate/label", "Completed", CompareType.NEQ);
            myFilter.addCondition("date", dateToolkit.getDateToday(), CompareType.DATE_LTE);
            String[] targetColumns = new String[]{"id"};
            // Runs query.
            ArrayList<HashMap<String, String>> returnArray = notificationToolkit.getTableMultiRowMultiColumnWithFieldKeys(c, u, "study", "Clinpath Runs", myFilter, null, targetColumns);

            // Assigns data.
            this.incompleteRecordsRequestedToday = returnArray;
            this.incompleteRecordsRequestedTodayUrlView = notificationToolkit.createQueryURL(c, "execute", "study", "Clinpath Runs", myFilter);
        }
    }
}
