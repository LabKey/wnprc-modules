package org.labkey.wnprc_ehr.notification;

import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.Sort;
import org.labkey.api.module.Module;
import org.labkey.api.security.User;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;

public class BloodDrawReviewDailyNotification extends AbstractEHRNotification {
    //Class Variables
    NotificationToolkit notificationToolkit = new NotificationToolkit();
    NotificationToolkit.StyleToolkit styleToolkit = new NotificationToolkit.StyleToolkit();
    NotificationToolkit.DateToolkit dateToolkit = new NotificationToolkit.DateToolkit();



    //Constructors
    /**
     * This constructor is used to register the notification in WNPRC_EHRModule.java.
     * @param owner
     */
    public BloodDrawReviewDailyNotification(Module owner) {super(owner);}



    //Notification Details
    @Override
    public String getName() {
        return "Blood Draw Review Notification (Daily)";
    }
    @Override
    public String getDescription() {
        return "This report is designed to identify blood draws (today & in the future) where the animal is no longer alive, or not assigned to a project.";
    }
    @Override
    public String getEmailSubject(Container c) {
        return "Blood Draws Issues (Today & Future): " + dateToolkit.getCurrentTime();
    }
    @Override
    public String getScheduleDescription() {
        return "Daily at 6:00AM";
    }
    @Override
    public String getCronString() {
        return notificationToolkit.createCronString("0", "6", "*");
    }
    @Override
    public String getCategory() {
        return "Revamped Notifications - Blood Draws Update";
    }



    //Message Creation
    @Override
    public String getMessageBodyHTML(Container c, User u) {
        // Set up.
        StringBuilder messageBody = new StringBuilder();
        BloodDrawReviewDailyObject myBloodDrawReviewObject = new BloodDrawReviewDailyObject(c, u);

        // Creates CSS.
        messageBody.append(styleToolkit.beginStyle());
        messageBody.append(styleToolkit.setBasicTableStyle());
        messageBody.append(styleToolkit.setHeaderRowBackgroundColor("#d9d9d9"));
        messageBody.append(styleToolkit.endStyle());

        //Begins message info.
        messageBody.append("<p>This email contains any scheduled blood draws (today & future) where animals are either unassigned to a project or no longer alive.  It was run on: " + dateToolkit.getCurrentTime() + "</p>");

        // Lists all blood draws (today & future) where animal has blood overdrawn.
        if (!myBloodDrawReviewObject.bloodOverdraws.isEmpty()) {
            messageBody.append("<p><b>There are " + myBloodDrawReviewObject.bloodOverdraws.size() + " blood draws (today & future) where animal's blood will be overdrawn:</b></p>");

            // Creates table.
            String[] myTableColumns = new String[]{"Id", "Date of Blood Draw", "Available Blood"};
            NotificationToolkit.NotificationRevampTable myTable = new NotificationToolkit.NotificationRevampTable(myTableColumns, myBloodDrawReviewObject.bloodOverdraws);
            messageBody.append(myTable.createBasicHTMLTable());
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view them<br>\n", myBloodDrawReviewObject.bloodOverdrawsURLView));
        }
        else {
            messageBody.append("<b>There are no blood draws (today or future) where the animal's blood will be overdrawn.</b><br>\n");
        }
        // Lists all blood draws (today & future) where animal is not alive.
        if (!myBloodDrawReviewObject.nonAliveBloodDraws.isEmpty()) {
            messageBody.append("<p><b>There are " + myBloodDrawReviewObject.nonAliveBloodDraws.size() + " blood draws (today & future) where animal is not alive:</b></p>");

            // Creates table.
            String[] myTableColumns = new String[]{"Id", "Date of Blood Draw"};
            NotificationToolkit.NotificationRevampTable myTable = new NotificationToolkit.NotificationRevampTable(myTableColumns, myBloodDrawReviewObject.nonAliveBloodDraws);
            messageBody.append(myTable.createBasicHTMLTable());
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view them<br>\n", myBloodDrawReviewObject.nonAliveBloodDrawsURLView));

//            for (HashMap<String, String> bloodDraw: myBloodDrawReviewObject.nonAliveBloodDraws) {
//                String bloodDrawID = bloodDraw.get("id");
//                String bloodDrawDate = bloodDraw.get("date");
//                messageBody.append(bloodDrawID + " - " + bloodDrawDate + "<br>\n");
//            }
        }
        else {
            messageBody.append("<b>There are no blood draws (today or future) where animal is not alive.</b><br>\n");
        }
        // Lists all blood draws (today & future) where animal is not assigned to a project.
        if (!myBloodDrawReviewObject.unassignedBloodDraws.isEmpty()) {
            messageBody.append("<p><b>There are " + myBloodDrawReviewObject.unassignedBloodDraws.size() + " blood draws (today & future) where animal is not assigned to a project:</b></p>");

            // Creates table.
            String[] myTableColumns = new String[]{"Id", "Date of Blood Draw", "Project"};
            NotificationToolkit.NotificationRevampTable myTable = new NotificationToolkit.NotificationRevampTable(myTableColumns, myBloodDrawReviewObject.unassignedBloodDraws);
            messageBody.append(myTable.createBasicHTMLTable());
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view them<br>\n", myBloodDrawReviewObject.unassignedBloodDrawsURLView));

//            for (HashMap<String, String> bloodDraw: myBloodDrawReviewObject.unassignedBloodDraws) {
//                String bloodDrawID = bloodDraw.get("id");
//                String bloodDrawDate = bloodDraw.get("date");
//                String bloodDrawProject = bloodDraw.get("project");
//                messageBody.append(bloodDrawID + " - " + bloodDrawDate + " - " + bloodDrawProject + "<br>\n");
//            }
        }
        else {
            messageBody.append("<b>There are no blood draws (today or future) where animal is not assigned to a project.</b><br>\n");
        }
        // Lists all blood draws (today & future) not yet approved.
        if (!myBloodDrawReviewObject.bloodDrawsNotApproved.isEmpty()) {
            messageBody.append("<p><b>WARNING: </b>There are " + myBloodDrawReviewObject.bloodDrawsNotApproved.size() + " blood draws requested that have not been approved or denied yet.</p>");
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view them<br>\n", myBloodDrawReviewObject.bloodDrawsNotApprovedURLView));
        }
        else {
            messageBody.append("<b>There are no blood draws (today or future) where blood draw is not yet approved.</b><br>\n");
        }
        // Lists all blood draws (today & future) not yet assigned to a group (i.e. SPI, Animal Care, Vet Staff).
        if (!myBloodDrawReviewObject.bloodDrawsNotAssignedToGroup.isEmpty()) {
            messageBody.append("<p><b>WARNING: </b>There are " + myBloodDrawReviewObject.bloodDrawsNotAssignedToGroup.size() + " blood draws requested that have not been assigned to a group.</p>");
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view them<br>\n", myBloodDrawReviewObject.bloodDrawsNotAssignedToGroupURLView));
        }
        else {
            messageBody.append("<b>There are no blood draws (today or future) where blood draw is not yet assigned to a group.</b><br>\n");
        }

        return messageBody.toString();
    }

    public static class BloodDrawReviewDailyObject {
        //Set up.
        Container c;
        User u;
        NotificationToolkit notificationToolkit = new NotificationToolkit();
        NotificationToolkit.DateToolkit dateToolkit = new NotificationToolkit.DateToolkit();

        BloodDrawReviewDailyObject(Container currentContainer, User currentUser) {
            this.c = currentContainer;
            this.u = currentUser;
            getNonAliveBloodDraws();
            getUnassignedBloodDraws();
            getBloodOverdraws();
            getBloodDrawsNotApproved();
            getBloodDrawsNotAssignedToGroup();
        }

        ArrayList<String[]> nonAliveBloodDraws = new ArrayList<>();
        String nonAliveBloodDrawsURLView;
        // Gets all blood draws (today & future) where animal is not alive.
        void getNonAliveBloodDraws() {
            // Creates filter.
            Date todayDate = dateToolkit.getDateToday();
            SimpleFilter myFilter = new SimpleFilter("Id/DataSet/Demographics/calculated_status", "Alive", CompareType.NEQ);
            myFilter.addCondition("date", todayDate, CompareType.DATE_GTE);

            // Creates sort.
            Sort mySort = new Sort("date");
            // Creates columns to retrieve.
            String[] targetColumns = new String[]{"id", "date"};
            // Runs query.
            ArrayList<HashMap<String,String>> unformattedNonAliveBloodDraws = notificationToolkit.getTableMultiRowMultiColumnWithFieldKeys(c, u, "study", "BloodSchedule", myFilter, mySort, targetColumns);

            // Converts map to list (for displaying in table).
            for (HashMap<String, String> currentDraw : unformattedNonAliveBloodDraws) {
                String[] currentRow = {currentDraw.get("id"), currentDraw.get("date")};
                nonAliveBloodDraws.add(currentRow);
            }

            // Creates URL.
            String viewQueryURL = notificationToolkit.createQueryURL(c, "execute", "study", "BloodSchedule", myFilter);
            this.nonAliveBloodDrawsURLView = viewQueryURL;
        }

        ArrayList<String[]> unassignedBloodDraws = new ArrayList<>();
        String unassignedBloodDrawsURLView;
        // Gets all blood draws (today & future) where animal is not assigned to a project.
        void getUnassignedBloodDraws() {
            // Creates filter.
            Date todayDate = dateToolkit.getDateToday();
            SimpleFilter myFilter = new SimpleFilter("Id/DataSet/Demographics/calculated_status", "Alive", CompareType.EQUAL);
            myFilter.addCondition("qcstate/label", "Request: Denied", CompareType.NEQ);
            myFilter.addCondition("projectStatus", "", CompareType.NONBLANK);
            myFilter.addCondition("date", todayDate, CompareType.DATE_GTE);

            // Creates sort.
            Sort mySort = new Sort("date");
            // Creates columns to retrieve.
            String[] targetColumns = new String[]{"id", "date", "project"};
            // Runs query.
            ArrayList<HashMap<String, String>> unformattedUnassignedBloodDraws = notificationToolkit.getTableMultiRowMultiColumnWithFieldKeys(c, u, "study", "BloodSchedule", myFilter, mySort, targetColumns);

            // Converts map to list (for displaying in table).
            for (HashMap<String, String> currentDraw : unformattedUnassignedBloodDraws) {
                String[] currentRow = {currentDraw.get("id"), currentDraw.get("date"), currentDraw.get("project")};
                unassignedBloodDraws.add(currentRow);
            }

            // Creates URL.
            String viewQueryURL = notificationToolkit.createQueryURL(c, "execute", "study", "BloodSchedule", myFilter);
            this.unassignedBloodDrawsURLView = viewQueryURL;
        }

        ArrayList<String[]> bloodOverdraws = new ArrayList<>();
        String bloodOverdrawsURLView;
        // Gets all blood draws (today & future) where animal has their blood overdrawn.
        void getBloodOverdraws() {
            // Creates filter.
            Date todayDate = dateToolkit.getDateToday();
            SimpleFilter myFilter = new SimpleFilter("date", todayDate, CompareType.DATE_GTE);

            // Creates sort.
            Sort mySort = new Sort("date");
            // Creates columns to retrieve.
            String[] targetColumns = new String[]{"id", "date", "BloodRemaining/allowableBlood"};
            // Runs query.
            ArrayList<HashMap<String, String>> unformattedUpcomingBloodDraws = notificationToolkit.getTableMultiRowMultiColumnWithFieldKeys(c, u, "study", "BloodSchedule", myFilter, mySort, targetColumns);

            // Converts map to list (for displaying in table).
            for (HashMap<String, String> currentDraw : unformattedUpcomingBloodDraws) {
                // Verifies there is data because some older blood draws don't list available blood.
                if (!currentDraw.get("BloodRemaining/allowableBlood").isEmpty()) {
                    if (Double.valueOf(currentDraw.get("BloodRemaining/allowableBlood")) <= 0) {
                        String[] currentRow = {currentDraw.get("id"), currentDraw.get("date"), currentDraw.get("BloodRemaining/allowableBlood")};
                        bloodOverdraws.add(currentRow);
                    }
                }
            }

            // Creates URL.
            String viewQueryURL = notificationToolkit.createQueryURL(c, "execute", "study", "BloodSchedule", myFilter);
            this.bloodOverdrawsURLView = viewQueryURL;
        }

        ArrayList<HashMap<String, String>> bloodDrawsNotApproved = new ArrayList<>();
        String bloodDrawsNotApprovedURLView;
        void getBloodDrawsNotApproved() {
            // Creates filter.
            Date todayDate = dateToolkit.getDateToday();
            SimpleFilter myFilter = new SimpleFilter("Id/DataSet/Demographics/calculated_status", "Alive", CompareType.EQUAL);
            myFilter.addCondition("qcstate/label", "Request: Pending", CompareType.EQUAL);
            myFilter.addCondition("date", todayDate, CompareType.DATE_GTE);

            // Creates sort.
            Sort mySort = new Sort("date");
            // Creates columns to retrieve.
            String[] targetColumns = new String[]{"id"};
            // Runs query.
            bloodDrawsNotApproved = notificationToolkit.getTableMultiRowMultiColumnWithFieldKeys(c, u, "study", "Blood Draws", myFilter, mySort, targetColumns);

            // Creates URL.
            String viewQueryURL = notificationToolkit.createQueryURL(c, "execute", "study", "Blood Draws", myFilter);
            this.bloodDrawsNotApprovedURLView = viewQueryURL;
        }

        ArrayList<HashMap<String, String>> bloodDrawsNotAssignedToGroup = new ArrayList<>();
        String bloodDrawsNotAssignedToGroupURLView;
        void getBloodDrawsNotAssignedToGroup() {
            Date todayDate = dateToolkit.getDateToday();
            SimpleFilter myFilter = new SimpleFilter("Id/DataSet/Demographics/calculated_status", "Alive", CompareType.EQUAL);
            myFilter.addCondition("qcstate/label", "Request: Denied", CompareType.NEQ);
            myFilter.addCondition("billedby", "", CompareType.ISBLANK);
            myFilter.addCondition("date", todayDate, CompareType.DATE_GTE);

            // Creates sort.
            Sort mySort = new Sort("date");
            // Creates columns to retrieve.
            String[] targetColumns = new String[]{"id"};
            // Runs query.
            bloodDrawsNotAssignedToGroup = notificationToolkit.getTableMultiRowMultiColumnWithFieldKeys(c, u, "study", "Blood Draws", myFilter, mySort, targetColumns);

            // Creates URL.
            String viewQueryURL = notificationToolkit.createQueryURL(c, "execute", "study", "Blood Draws", myFilter);
            this.bloodDrawsNotAssignedToGroupURLView = viewQueryURL;
        }

    }
}
