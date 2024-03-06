package org.labkey.wnprc_ehr.notification;

import net.sf.cglib.core.Local;
import org.checkerframework.checker.units.qual.A;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.Selector;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.Sort;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.module.Module;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.security.User;
import org.labkey.api.util.PageFlowUtil;
import org.labkey.api.view.ActionURL;
import org.labkey.api.util.Path;


import java.lang.reflect.Array;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.HashMap;
import java.util.Set;
import java.util.HashSet;
import java.util.Map;
import java.util.SortedSet;
import java.util.TreeSet;

import org.labkey.api.data.ResultsImpl;
import org.labkey.api.data.Results;

public class BloodAlertsNotificationRevamp extends AbstractEHRNotification {
    //Class Variables
    NotificationToolkit notificationToolkit = new NotificationToolkit();
    NotificationToolkit.StyleToolkit styleToolkit = new NotificationToolkit.StyleToolkit();
    NotificationToolkit.DateToolkit dateToolkit = new NotificationToolkit.DateToolkit();



    //Constructors
    /**
     * This constructor is used to register the notification in WNPRC_EHRModule.java.
     * @param owner
     */
    public BloodAlertsNotificationRevamp(Module owner) {super(owner);}



    //Notification Details
    @Override
    public String getName() {
        return "Blood Alerts Revamp";
    }
    @Override
    public String getDescription() {
        return "This report contains any scheduled blood draws not marked as completed.";
    }
    @Override
    public String getEmailSubject(Container c) {
        return "Daily Blood Draw Alerts: " + dateToolkit.getCurrentTime();
    }
    @Override
    public String getScheduleDescription() {
        return "every day at 5:15AM, 8:15AM, 9:15AM, 12:15PM, and 2:15PM";
    }
    @Override
    public String getCronString() {
        return notificationToolkit.createCronString("15", "5,8,9,12,14", "*");
    }
    @Override
    public String getCategory() {
        return "Revamped Notifications";
    }



    //Message Creation
    @Override
    public String getMessageBodyHTML(Container c, User u) {

        //Creates variables & gets data.
        final StringBuilder messageBody = new StringBuilder();
        BloodAlertObject myBloodDrawAlertObject = new BloodAlertObject(c, u);

        //Creates CSS.
        messageBody.append(styleToolkit.beginStyle());
        messageBody.append(styleToolkit.setBasicTableStyle());
        messageBody.append(styleToolkit.setHeaderRowBackgroundColor("#d9d9d9"));
        messageBody.append(styleToolkit.endStyle());

        //Begins message info.
        messageBody.append("<p>This email contains any scheduled blood draws not marked as completed.  It was run on: " + dateToolkit.getCurrentTime() + "</p>");

        //1. Finds any current or future blood draws where the animal is not alive.
        if (!myBloodDrawAlertObject.bloodDrawsWhereAnimalIsNotAlive.isEmpty()) {
            messageBody.append("<b>WARNING: There are " + myBloodDrawAlertObject.bloodDrawsWhereAnimalIsNotAlive.size() + " current or scheduled blood draws for animals not currently at WNPRC.</b><br>");
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view them</p>", myBloodDrawAlertObject.bloodDrawsWhereAnimalIsNotAliveURLView));
            messageBody.append("<br>\n<hr>\n");
        }

        //2. Finds any blood draws over the allowable limit.
        if (!myBloodDrawAlertObject.bloodDrawsOverAllowableLimit.isEmpty()) {
            messageBody.append("<b>WARNING: There are " + myBloodDrawAlertObject.bloodDrawsOverAllowableLimit.size() + " scheduled blood draws exceeding the allowable volume.</b><br>");
            for (String result : myBloodDrawAlertObject.bloodDrawsOverAllowableLimit) {
                messageBody.append(result + "<br>");
            }
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view them</p>.", myBloodDrawAlertObject.bloodDrawsOverAllowableLimitURLView));
            messageBody.append("<br>\n<hr>\n");
        }
        else {
            messageBody.append("<b>There are no future blood draws exceeding the allowable amount based on current weights.</b>");
            messageBody.append("<br><hr>\n");
        }

        //3. Finds any blood draws where the animal is not assigned to that project.
        if (!myBloodDrawAlertObject.bloodDrawsWhereAnimalNotAssignedToProject.isEmpty()) {
            messageBody.append("<b>WARNING: There are " + myBloodDrawAlertObject.bloodDrawsWhereAnimalNotAssignedToProject.size() + " blood draws scheduled today or in the future where the animal is not assigned to the project.</b><br>");
            for (String result : myBloodDrawAlertObject.bloodDrawsWhereAnimalNotAssignedToProject) {
                messageBody.append(result + "<br>");
            }
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view them</p>", myBloodDrawAlertObject.bloodDrawsWhereAnimalNotAssignedToProjectURLView));
            messageBody.append("<hr>\n");
        }
        else {
            messageBody.append("<b>All blood draws today and in the future have a valid project for the animal.</b>");
            messageBody.append("<br><hr>\n");
        }

        //4. Find any blood draws today where the animal is not assigned to that project.
        if (!myBloodDrawAlertObject.bloodDrawsTodayWhereAnimalNotAssignedToProject.isEmpty()) {
            messageBody.append("<b>WARNING: There are " + myBloodDrawAlertObject.bloodDrawsTodayWhereAnimalNotAssignedToProject.size() + " blood draws scheduled today where the animal is not assigned to the project.  DO NOT DRAW FROM THESE ANIMALS UNTIL FIXED.</b><br>");
            for (String result : myBloodDrawAlertObject.bloodDrawsTodayWhereAnimalNotAssignedToProject) {
                messageBody.append(result + "<br>");
            }
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view them</p>", myBloodDrawAlertObject.bloodDrawsTodayWhereAnimalNotAssignedToProjectURLView));
            messageBody.append("<br>\n<hr>\n");
        }

        //5. Find any incomplete blood draws scheduled today, by area.
        if (myBloodDrawAlertObject.incompleteBloodDrawsScheduledTodayByArea.isEmpty()) {
            //Displays if there are no scheduled blood draws for today.
            messageBody.append("<p>There are no blood draws scheduled for " + dateToolkit.getDateToday() + "</p>");
        }
        else {
            //Displays the number of scheduled blood draws for today.
            messageBody.append("<p>There are " + myBloodDrawAlertObject.incompleteBloodDrawsScheduledTodayByArea.size() + " scheduled blood draws for " + dateToolkit.getDateToday() + ". " + myBloodDrawAlertObject.completeCount + " have been completed.</p>");
            messageBody.append(notificationToolkit.createHyperlink("Click here for details.", myBloodDrawAlertObject.incompleteBloodDrawsScheduledTodayByAreaURLView));

            //Notifies user if all blood draws are completed.
            if (myBloodDrawAlertObject.incompleteCount == 0) {
                messageBody.append("<p>All scheduled blood draws have been marked complete as of " + dateToolkit.getDateToday() + "</p>");
            }
            //Shows all incomplete blood draws.
            else {
                messageBody.append("<p>The following blood draws have not been marked complete as of " + dateToolkit.getDateToday() + "</p>");

                //Displays totals by area.
                messageBody.append("<b>Totals by Area:</b><br>\n");
                //Iterates through each area.
                for (String billingArea : sortSetWithNulls(myBloodDrawAlertObject.billingHashMap.keySet())) {
                    messageBody.append(billingArea + ":<br>\n");
                    //Sorts currentBillingArea by room key.
                    HashMap<String,Integer> currentBillingArea = myBloodDrawAlertObject.billingHashMap.get(billingArea);
                    //Iterates through each room.
                    for (String billedByTitle : sortSetWithNulls(currentBillingArea.keySet())) {
                        messageBody.append(billedByTitle + ": " + currentBillingArea.get(billedByTitle) + "<br>\n");
                    }
                }

                //Displays individual draws.
                messageBody.append("<p>\n");
                messageBody.append("<p><b>Individual Draws:</b></p>\n");
                //Iterates through each area.
                for (String summaryArea : sortSetWithNulls(myBloodDrawAlertObject.summaryHashMap.keySet())) {
                    messageBody.append("<b>" + summaryArea + ":</b><br>\n");
                    //Sorts currentSummaryArea by room key.
                    HashMap<String,bloodDrawRoom> currentSummaryArea = myBloodDrawAlertObject.summaryHashMap.get(summaryArea);
                    //Iterates through each room.
                    for (String summaryRoom : sortSetWithNulls(currentSummaryArea.keySet())) {
                        bloodDrawRoom currentSummaryRoom = currentSummaryArea.get(summaryRoom);
                        if (currentSummaryRoom.incomplete > 0) {
                            //Goes through each record in the current room and updates the table with the info.
                            ArrayList<String[]> myTableData = new ArrayList<>();
                            ArrayList<String> myTableRowColors = new ArrayList<>();
                            for (HashMap<String, String> currentRecord : currentSummaryRoom.incompleteRecords) {
                                //Updates the current row.
                                String[] myCurrentRow = new String[8];
                                myCurrentRow[0] = currentRecord.get("date");
                                myCurrentRow[1] = currentRecord.get("Id");
                                myCurrentRow[2] = currentRecord.get("tube_vol");
                                myCurrentRow[3] = currentRecord.get("tube_type");
                                myCurrentRow[4] = currentRecord.get("num_tubes");
                                myCurrentRow[5] = currentRecord.get("quantity");
                                myCurrentRow[6] = currentRecord.get("additionalServices");
                                myCurrentRow[7] = currentRecord.get("billedby/title");
                                myTableData.add(myCurrentRow);

                                //Colors the row yellow if there is 15 mins or less until record time, or red if the record time has passed.
                                String currentRowColor = "white";
                                LocalDateTime currentTime = LocalDateTime.now();
                                LocalDateTime timeLimit = currentTime.plusMinutes(15);
                                LocalDateTime recordTime = LocalDateTime.parse(currentRecord.get("date"), DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
                                if (timeLimit.isAfter(recordTime)) {
                                    if (currentTime.isBefore(recordTime)) {
                                        currentRowColor = "yellow";
                                    }
                                    else {
                                        currentRowColor = "red";
                                    }
                                }
                                myTableRowColors.add(currentRowColor);
                            }

                            //Creates table.
                            String[] myTableColumns = new String[]{"Time Requested", "Id", "Tube Vol", "Tube Type", "# Tubes", "Total Quantity", "Additional Services", "Assigned To"};
                            NotificationToolkit.NotificationRevampTable myTable = new NotificationToolkit.NotificationRevampTable(myTableColumns, myTableData);
                            myTable.rowColors = myTableRowColors;

                            //Displays the incomplete count for the current room and shows the table.
                            messageBody.append(summaryRoom + ": " + currentSummaryRoom.incomplete);
                            messageBody.append(myTable.createBasicHTMLTable());
                        }
                    }
                }
            }
        }
        return messageBody.toString();
    }



    public static class BloodAlertObject {
        Container c;
        User u;
        NotificationToolkit.DateToolkit dateToolkit = new NotificationToolkit.DateToolkit();
        NotificationToolkit notificationToolkit = new NotificationToolkit();

        public BloodAlertObject(Container currentContainer, User currentUser) {
            //Sets object parameters.
            this.c = currentContainer;
            this.u = currentUser;

            //Retrieves object data.
            this.getBloodDrawsWhereAnimalIsNotAlive();
            this.getBloodDrawsOverAllowableLimit();
            this.getBloodDrawsWhereAnimalNotAssignedToProject();
            this.getBloodDrawsTodayWhereAnimalNotAssignedToProject();
            this.getIncompleteBloodDrawsScheduledTodayByArea();
        }

        //1. Finds any current or future blood draws where the animal is not alive.
        ArrayList<String> bloodDrawsWhereAnimalIsNotAlive;                              //id
        String bloodDrawsWhereAnimalIsNotAliveURLView;                                  //url string (view)
        private void getBloodDrawsWhereAnimalIsNotAlive() {
            //Gets info.
            Date todayDate = dateToolkit.getDateToday();

            Calendar testCal1 = new GregorianCalendar(2023, Calendar.DECEMBER, 28);
            testCal1.set(Calendar.HOUR_OF_DAY, 0);
            Date testDate1 = testCal1.getTime();
            Calendar testCal2 = new GregorianCalendar(2023, Calendar.DECEMBER, 28);
            testCal2.set(Calendar.HOUR_OF_DAY, 9);
            Date testDate2 = testCal2.getTime();
            Calendar testCal3 = new GregorianCalendar(2023, Calendar.DECEMBER, 28);
            testCal3.set(Calendar.HOUR_OF_DAY, 23);
            Date testDate3 = testCal3.getTime();

            //Creates filter.
            SimpleFilter myFilter = new SimpleFilter("Id/DataSet/Demographics/calculated_status", "Alive", CompareType.NEQ_OR_NULL);
            myFilter.addCondition("qcstate/label", "Request: Denied", CompareType.NEQ);
            myFilter.addCondition("date", todayDate, CompareType.DATE_GTE);
            //Runs query.
            ArrayList<String> returnArray = notificationToolkit.getTableMultiRowSingleColumn(c, u, "study", "Blood Draws", myFilter, null, "Id");

            //Creates URL.
            Path viewQueryURL = new Path(ActionURL.getBaseServerURL(), "query", c.getPath(), "executeQuery.view?schemaName=study&query.queryName=Blood Draws&query.date~dategte=" + todayDate + "&query.Id/DataSet/Demographics/calculated_status~neqornull=Alive&query.qcstate/label~neq=Request: Denied");

            //Returns data.
            this.bloodDrawsWhereAnimalIsNotAlive = returnArray;
            this.bloodDrawsWhereAnimalIsNotAliveURLView = viewQueryURL.toString();
        }

        //2. Finds any blood draws over the allowable limit.
        //TODO: Should this display ID's only once?  Also, should we be adding approved draws minus the allowable limit?
        ArrayList<String> bloodDrawsOverAllowableLimit;                                 //id
        String bloodDrawsOverAllowableLimitURLView;                                     //url string (view)
        private void getBloodDrawsOverAllowableLimit() {
            //Gets info.
            Date todayDate = dateToolkit.getDateToday();

//            //Creates filter.
//            SimpleFilter myFilter = new SimpleFilter("Id/DataSet/Demographics/calculated_status", "Alive", CompareType.EQUAL);
//            myFilter.addCondition("qcstate/label", "Request: Denied", CompareType.NEQ);
//            myFilter.addCondition("date", todayDate, CompareType.DATE_GTE);
//            myFilter.addCondition("BloodRemaining/AvailBlood", 0, CompareType.LT);

            //Runs query.
            ArrayList<String> returnArray = notificationToolkit.getTableMultiRowSingleColumn(c, u,  "study", "DailyOverDrawsWithThreshold", null, null, "Id");

            //Creates URL.
            Path viewQueryURL = new Path(ActionURL.getBaseServerURL(), "query", c.getPath(), "executeQuery.view?schemaName=study&query.queryName=DailyOverDrawsWithThreshold");
//            Path viewQueryURL = new Path(ActionURL.getBaseServerURL(), "query", c.getPath(), "executeQuery.view?schemaName=study&query.queryName=DailyOverDraws&query.viewName=Blood Summary&query.date~dategte=" + todayDate + "&query.Id/Dataset/Demographics/calculated_status~eq=Alive");

            //Returns data.
            this.bloodDrawsOverAllowableLimit = returnArray;
            this.bloodDrawsOverAllowableLimitURLView = viewQueryURL.toString();
        }

        //3. Finds any blood draws where the animal is not assigned to that project.
        ArrayList<String> bloodDrawsWhereAnimalNotAssignedToProject;                    //id
        String bloodDrawsWhereAnimalNotAssignedToProjectURLView;                        //url string (view)
        private void getBloodDrawsWhereAnimalNotAssignedToProject() {
            //Gets info.
            Date todayDate = dateToolkit.getDateToday();

            //Creates filter.
            SimpleFilter myFilter = new SimpleFilter("Id/DataSet/Demographics/calculated_status", "Alive", CompareType.EQUAL);
            myFilter.addCondition("qcstate/label", "Request: Denied", CompareType.NEQ);
            myFilter.addCondition("projectStatus", "", CompareType.NONBLANK);
            myFilter.addCondition("date", todayDate, CompareType.DATE_GTE);
            //Runs query.
            ArrayList<String> returnArray = notificationToolkit.getTableMultiRowSingleColumn(c, u, "study", "BloodSchedule", myFilter, null, "Id");

            //Creates URL.
            Path viewQueryURL = new Path(ActionURL.getBaseServerURL(), "query", c.getPath(), "executeQuery.view?schemaName=study&query.queryName=BloodSchedule&query.projectStatus~isnonblank&query.Id/DataSet/Demographics/calculated_status~eq=Alive&query.date~dategte=" + todayDate);

            //Returns data.
            this.bloodDrawsWhereAnimalNotAssignedToProject = returnArray;
            this.bloodDrawsWhereAnimalNotAssignedToProjectURLView = viewQueryURL.toString();
        }

        //4. Find any blood draws today where the animal is not assigned to that project.
        ArrayList<String> bloodDrawsTodayWhereAnimalNotAssignedToProject;               //id
        String bloodDrawsTodayWhereAnimalNotAssignedToProjectURLView;                   //url string (view)
        private void getBloodDrawsTodayWhereAnimalNotAssignedToProject() {
            //Gets info.
            Date todayDate = dateToolkit.getDateToday();

            //Creates filter.
            SimpleFilter myFilter = new SimpleFilter("Id/DataSet/Demographics/calculated_status", "Alive", CompareType.EQUAL);
            myFilter.addCondition("qcstate/label", "Request: Denied", CompareType.NEQ);
            myFilter.addCondition("projectStatus", "", CompareType.NONBLANK);
            myFilter.addCondition("date", todayDate, CompareType.DATE_EQUAL);

            //Runs query.
            ArrayList<String> returnArray = notificationToolkit.getTableMultiRowSingleColumn(c, u, "study", "BloodSchedule", myFilter, null, "Id");

            //Creates URL.
            //TODO: Why doesn't URL use qcstate/label.
            Path viewQueryURL = new Path(ActionURL.getBaseServerURL(), "query", c.getPath(), "executeQuery.view?schemaName=study&query.queryName=BloodSchedule&query.projectStatus~isnonblank&query.Id/DataSet/Demographics/calculated_status~eq=Alive&query.date~dateeq=" + todayDate);

            //Returns data.
            this.bloodDrawsTodayWhereAnimalNotAssignedToProject = returnArray;
            this.bloodDrawsTodayWhereAnimalNotAssignedToProjectURLView = viewQueryURL.toString();
        }

        //5. Find any incomplete blood draws scheduled today, by area.
        int completeCount = 0;
        int incompleteCount = 0;
        HashMap<String, HashMap<String, bloodDrawRoom>> summaryHashMap = new HashMap<>();                                           //Summary in OG.    (area -> (room -> (bloodDrawRoom -> complete/incomplete/incompleteRecords)))
        HashMap<String, HashMap<String, Integer>> billingHashMap = new HashMap<>();                                                 //Count in OG.      (area -> (billedByTitle -> count))
        ArrayList<HashMap<String,String>> incompleteBloodDrawsScheduledTodayByArea = new ArrayList<HashMap<String, String>>();      //
        String incompleteBloodDrawsScheduledTodayByAreaURLView;                                                                     //url string (view)
        private void getIncompleteBloodDrawsScheduledTodayByArea() {
            //Gets info.
            Date todayDate = dateToolkit.getDateToday();

            //Creates filter.
            SimpleFilter myFilter = new SimpleFilter("Id/DataSet/Demographics/calculated_status", "Alive", CompareType.EQUAL);
            myFilter.addCondition("date", todayDate, CompareType.DATE_EQUAL);
            //TODO: Ask about both updates below.
            //Update: Changed this from 'qcstate' to 'qcstate/Label' because 'qcstate' only returned number codes.
            //Update: Removed this condition because qcstate is checked later.
//            myFilter.addCondition("qcstate/Label", "Completed", CompareType.NEQ);
            //TODO: Add the following filter if separating this email between groups.
//            myFilter.addCondition("billedby/title", currentNotificationGroup, CompareType.EQUAL);
            //Creates sort.
            Sort mySort = new Sort("date");
            //Creates columns to retrieve.
            String[] targetColumns = new String[]{"drawStatus", "project", "date", "project/protocol", "taskid", "projectStatus", "tube_vol", "tube_type", "billedby", "billedby/title", "num_tubes", "Id/curLocation/area", "Id/curLocation/room", "Id/curLocation/cage", "additionalServices", "remark", "Id", "quantity", "qcstate", "qcstate/Label", "requestid"};
            //Runs query.
            ArrayList<HashMap<String,String>> returnArray = notificationToolkit.getTableMultiRowMultiColumnWithFieldKeys(c, u, "study", "BloodSchedule", myFilter, mySort, targetColumns);

            //Sorts through each blood draw result.
            for (HashMap<String, String> result : returnArray) {
                //Increases the 'completed' count if blood draw is completed.
                if (!result.get("qcstate/Label").isEmpty() && result.get("qcstate/Label").equals("Completed")) {
                    completeCount++;
                }
                else {
                    //If summary map does not contain the current area, add (summary > area) and (counts > area).
                    if (!summaryHashMap.containsKey(result.get("Id/curLocation/area"))) {
                        summaryHashMap.put(result.get("Id/curLocation/area"), new HashMap());
                        billingHashMap.put(result.get("Id/curLocation/area"), new HashMap<String, Integer>());
                    }
                    //If summary map does not contain the current room for the current area, add (summary > area > room > bloodDrawObject).
                    if (!summaryHashMap.get(result.get("Id/curLocation/area")).containsKey(result.get("Id/curLocation/room"))) {
                        summaryHashMap.get(result.get("Id/curLocation/area")).put(result.get("Id/curLocation/room"), new bloodDrawRoom());
                    }

                    //Updates info if billedByTitle exists.
                    if (!result.get("billedby/title").isEmpty()) {
                        //If counts map does not contain the current billedByTitle, add (counts > area > billedByTitle > 0).
                        if (!billingHashMap.get(result.get("Id/curLocation/area")).containsKey(result.get("billedby/title"))) {
                            billingHashMap.get(result.get("Id/curLocation/area")).put(result.get("billedby/title"), 0);
                        }
                        //Increments the count for (counts > area > billedByTitle).
                        int currentBillByCount = billingHashMap.get(result.get("Id/curLocation/area")).get(result.get("billedby/title"));
                        billingHashMap.get(result.get("Id/curLocation/area")).put(result.get("billedby/title"), currentBillByCount + 1);
                    }
                    //Updates info if billedByTitle does not exist.
                    else {
                        //If counts map does not contain the 'Not Assigned' key, add (counts > area > 'Not Assigned' > 0).
                        if (!billingHashMap.get(result.get("Id/curLocation/area")).containsKey("Not Assigned")) {
                            billingHashMap.get(result.get("Id/curLocation/area")).put("Not Assigned", 0);
                        }
                        //Increments the count for (counts > area > 'Not Assigned').
                        int currentNotAssignedCount = billingHashMap.get(result.get("Id/curLocation/area")).get("Not Assigned");
                        billingHashMap.get(result.get("Id/curLocation/area")).put("Not Assigned", currentNotAssignedCount + 1);
                    }

                    //Updates the summary map with the current record.
                    summaryHashMap.get(result.get("Id/curLocation/area")).get(result.get("Id/curLocation/room")).incomplete++;
                    summaryHashMap.get(result.get("Id/curLocation/area")).get(result.get("Id/curLocation/room")).incompleteRecords.add(result);

                    //Increases the incomplete count.
                    incompleteCount++;
                }
            }

            //Creates URL.
            Path viewQueryURL = new Path(ActionURL.getBaseServerURL(), "query", c.getPath(), "executeQuery.view?schemaName=study&query.queryName=BloodSchedule&query.date~dateeq=" + todayDate + "&query.Id/DataSet/Demographics/calculated_status~eq=Alive");

            //Returns data.
            this.incompleteBloodDrawsScheduledTodayByArea = returnArray;
            this.incompleteBloodDrawsScheduledTodayByAreaURLView = viewQueryURL.toString();
        }
    }





    //This function sorts a set that may or may not contain a null.  This is needed because all sort functions don't work with nulls.
    //Move to Notification Toolkit if used in more than one notification.
    public ArrayList<String> sortSetWithNulls(Set<String> setToSort) {
        //Converts set to ArrayList.
        ArrayList<String> sortedList = new ArrayList<>();
        sortedList.addAll(setToSort);

        //Removes null value if it exists.
        Boolean nullExists = false;
        if (sortedList.contains(null)) {
            sortedList.remove(null);
            nullExists = true;
        }

        //Sorts list.
        Collections.sort(sortedList);

        //Adds null back to list if needed.
        if (nullExists == true) {
            sortedList.add(null);
        }

        //Returns sorted list.
        return sortedList;
    }

    public static class bloodDrawRoom {
        int complete = 0;
        int incomplete = 0;
        ArrayList<HashMap<String, String>> incompleteRecords = new ArrayList<>();
    }






}