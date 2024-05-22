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
        return "TODO (Blood Draw Alert B)";
    }
    @Override
    public String getEmailSubject(Container c) {
        return "TODO (Blood Draw Alert B)";
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

        // Lists all blood draws (today & future) where animal is not alive.
        if (!myBloodDrawReviewObject.nonAliveBloodDraws.isEmpty()) {
            messageBody.append("<p><b>There are " + myBloodDrawReviewObject.nonAliveBloodDraws.size() + " blood draws (today & future) where animal is not alive:</b></p>");

            // Creates table.
            String[] myTableColumns = new String[]{"Id", "Date of Blood Draw"};
            NotificationToolkit.NotificationRevampTable myTable = new NotificationToolkit.NotificationRevampTable(myTableColumns, myBloodDrawReviewObject.nonAliveBloodDraws);
            messageBody.append(myTable.createBasicHTMLTable());

//            for (HashMap<String, String> bloodDraw: myBloodDrawReviewObject.nonAliveBloodDraws) {
//                String bloodDrawID = bloodDraw.get("id");
//                String bloodDrawDate = bloodDraw.get("date");
//                messageBody.append(bloodDrawID + " - " + bloodDrawDate + "<br>\n");
//            }
        }
        else {
            messageBody.append("<b>There are no blood draws (today or future) where animal is not alive.</b>");
        }
        // Lists all blood draws (today & future) where animal is not assigned to a project.
        if (!myBloodDrawReviewObject.unassignedBloodDraws.isEmpty()) {
            messageBody.append("<p><b>There are " + myBloodDrawReviewObject.unassignedBloodDraws.size() + " blood draws (today & future) where animal is not assigned to a project:</b></p>");

            // Creates table.
            String[] myTableColumns = new String[]{"Id", "Date of Blood Draw", "Project"};
            NotificationToolkit.NotificationRevampTable myTable = new NotificationToolkit.NotificationRevampTable(myTableColumns, myBloodDrawReviewObject.unassignedBloodDraws);
            messageBody.append(myTable.createBasicHTMLTable());

//            for (HashMap<String, String> bloodDraw: myBloodDrawReviewObject.unassignedBloodDraws) {
//                String bloodDrawID = bloodDraw.get("id");
//                String bloodDrawDate = bloodDraw.get("date");
//                String bloodDrawProject = bloodDraw.get("project");
//                messageBody.append(bloodDrawID + " - " + bloodDrawDate + " - " + bloodDrawProject + "<br>\n");
//            }
        }
        else {
            messageBody.append("<b>There are no blood draws (today or future) where animal is not assigned to a project.</b>");
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
        }

        ArrayList<String[]> nonAliveBloodDraws = new ArrayList<>();
        // Gets all blood draws (today & future) where animal is not alive.
        void getNonAliveBloodDraws() {
            // Creates real filter.
//            Date todayDate = dateToolkit.getDateToday();
//            SimpleFilter myFilter = new SimpleFilter("Id/DataSet/Demographics/calculated_status", "Alive", CompareType.NEQ);
//            myFilter.addCondition("date", todayDate, CompareType.DATE_GTE);

            // Creates test filter.
            Calendar todayCalendar = Calendar.getInstance();
            todayCalendar.add(Calendar.DATE, -500);
            Date testDate = todayCalendar.getTime();
            SimpleFilter myFilter = new SimpleFilter("Id/DataSet/Demographics/calculated_status", "Alive", CompareType.NEQ);
            myFilter.addCondition("date", testDate, CompareType.DATE_GTE);

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
        }

        ArrayList<String[]> unassignedBloodDraws = new ArrayList<>();
        // Gets all blood draws (today & future) where animal is not assigned to a project.
        void getUnassignedBloodDraws() {
            // Creates real filter.
//            SimpleFilter myFilter = new SimpleFilter("Id/DataSet/Demographics/calculated_status", "Alive", CompareType.EQUAL);
//            myFilter.addCondition("qcstate/label", "Request: Denied", CompareType.NEQ);
//            myFilter.addCondition("projectStatus", "", CompareType.NONBLANK);
//            myFilter.addCondition("date", todayDate, CompareType.DATE_GTE);


            // Creates test filter.
            Calendar todayCalendar = Calendar.getInstance();
            todayCalendar.add(Calendar.DATE, -500);
            Date testDate = todayCalendar.getTime();
            SimpleFilter myFilter = new SimpleFilter("qcstate/label", "Request: Denied", CompareType.NEQ);
            myFilter.addCondition("projectStatus", "", CompareType.NONBLANK);
            myFilter.addCondition("date", testDate, CompareType.DATE_GTE);

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
        }

    }
}
