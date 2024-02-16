package org.labkey.wnprc_ehr.notification;

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
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.Set;
import java.util.HashSet;
import java.util.Map;
import org.labkey.api.data.ResultsImpl;
import org.labkey.api.data.Results;

public class BloodAlertsNotificationRevamp extends AbstractEHRNotification {
    //Class Variables
    NotificationToolkit notificationToolkit = new NotificationToolkit();
    NotificationToolkit.StyleToolkit styleToolkit = new NotificationToolkit.StyleToolkit();



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
        return "Daily Blood Draw Alerts: " + notificationToolkit.getCurrentTime();
    }
    @Override
    public String getScheduleDescription() {
        return "every day at 5:15AM, 8:15AM, 9:15AM, 12:15PM, and 2:15PM";
    }
    @Override
    public String getCronString() {
        createCronString2("15", "5,8,9,12,14", "*");
        return notificationToolkit.createCronString(new String[]{"0"});
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

        //Begins message info.
        messageBody.append("<p>This email contains any scheduled blood draws not marked as completed.  It was run on: " + notificationToolkit.getCurrentTime() + "</p>");

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
            messageBody.append("<p>There are no blood draws scheduled for " + myBloodDrawAlertObject.getDateToday() + "</p>");
        }
        else {
            //Displays the number of scheduled blood draws for today.
            messageBody.append("<p>There are " + myBloodDrawAlertObject.incompleteBloodDrawsScheduledTodayByArea.size() + " scheduled blood draws for " + myBloodDrawAlertObject.getDateToday() + ". " + myBloodDrawAlertObject.completeCount + " have been completed.</p>");
            messageBody.append(notificationToolkit.createHyperlink("Click here for details.", myBloodDrawAlertObject.incompleteBloodDrawsScheduledTodayByAreaURLView));

            //Notifies user if all blood draws are completed.
            if (myBloodDrawAlertObject.incompleteCount == 0) {
                messageBody.append("<p>All scheduled blood draws have been marked complete as of " + myBloodDrawAlertObject.getDateToday() + "</p>");
            }
            else {
                messageBody.append("<p>The following blood draws have not been marked complete as of " + myBloodDrawAlertObject.getDateToday() + "</p>");

                //Displays totals by area.
                messageBody.append("<b>Totals by Area:</b><br>\n");
                //Goes through each area in billingHashMap.
                //TODO: Sort myBloodDrawAlertObject.billingHashMap by area key.
                for (String billingArea : myBloodDrawAlertObject.billingHashMap.keySet()) {
                    HashMap<String,Integer> currentBillingArea = myBloodDrawAlertObject.billingHashMap.get(billingArea);
                    messageBody.append(billingArea + ":<br>\n");
                    //TODO: Sort currentBillingArea by billedByTitle key.
                    for (String billedByTitle : currentBillingArea.keySet()) {
                        messageBody.append(billedByTitle + ": " + currentBillingArea.get(billedByTitle) + "<br>\n");
                    }
                }

                //Displays individual draws.
                messageBody.append("<p>\n");
                messageBody.append("<p><b>Individual Draws:</b></p>\n");
                //TODO: Sort myBloodDrawAlertObject.summaryHashMap by area key.
                for (String summaryArea : myBloodDrawAlertObject.summaryHashMap.keySet()) {
                    HashMap<String,bloodDrawRoom> currentSummaryArea = myBloodDrawAlertObject.summaryHashMap.get(summaryArea);
                    messageBody.append("<b>" + summaryArea + ":</b><br>\n");
                    //TODO: Sort currentSummaryArea by room key.
                    for (String summaryRoom : currentSummaryArea.keySet()) {
                        bloodDrawRoom currentSummaryRoom = currentSummaryArea.get(summaryRoom);
                        if (currentSummaryRoom.incomplete > 0) {
                            //Display the incomplete count for the current room.
                            messageBody.append(summaryRoom + ": " + currentSummaryRoom.incomplete);

                            //TODO: Add table from bloodAlerts.pl line 321.

                            for (HashMap<String, String> currentRecord : currentSummaryRoom.incompleteRecords) {
                                //TODO: Update current date to the correct format.
                                String currentDate = currentRecord.get("date");

                                //TODO: Update color based on current date.
                                String myColor = "";
                                //If current date meets a certain criteria, change this to yellow.
//                                if (criteriaIsMet) {
//                                    myColor = "yellow";
//                                }

                                //TODO: Update table.
                            }

                            //TODO: End table.
                        }
                    }
                }



                HashMap<String, HashMap<String, bloodDrawRoom>> summaryHashMap = new HashMap<>();                                           //Summary in OG.    (area -> (room -> (bloodDrawRoom -> complete/incomplete/incompleteRecords)))
                ArrayList<HashMap<String, String>> incompleteRecords = new ArrayList<HashMap<String, String>>();

            }
        }





            //14.
//                //TODO: Sort countsObject by area.
//                //  OG version has counts with 'area' as the key for each.
//                for (ArrayList area : countsObject) {
//                    //Print 'area:<br>\n'
//                    //Sort current area results.
//                    for (Object type : area) {
//                        //Print 'type:
//                    }
//                }


            //14. Using 'counts object', print each area, followed by a list of that area's types.
            // For each result (area) in counts object (sorted).
            // Create a variable 'types' and assign it counts object > result (area).
            // Print result: (area) with a break.
            // For each result (type) in types object (sorted).
            // Print result (type) with a break.

            //15. Add a header to the email.
            //Print 'individual draws'.

            //16.
            //Create a variable prevRoom.
            //For each result (area) in summary object (sorted).
            // Create a variable 'rooms' and set it to summary object > area.
            // Print 'area:' with a break.
            // For each result (room) in new 'rooms' variable (sorted).
            // If rooms > result (room) > incomplete is true.
            //Print 'room:' rooms > room > incomplete.
            // Print a table with: (Time Requested, Id, Tube Volume, Tube Type, Num Tubes, Total Quantity, Additional Services, Assigned To.
            // For each result (rec) in rooms > room > incompleteRecords.
            // Result (rec) > date = date format.
            // Create a variable called 'color'.
            // Set color to yellow based on certain conditions.
            // Color table as needed.


        return messageBody.toString();
    }





    public static class BloodAlertObject {
        Container c;
        User u;

        //TODO: Move to notification toolkit, also exists in ColonyAlertsNotificationRevamp.java.
        public Date getDateToday() {
            Calendar todayCalendar = Calendar.getInstance();
            Date todayDate = todayCalendar.getTime();
            return todayDate;
        }

        public BloodAlertObject(Container currentContainer, User currentUser) {
            //Sets object parameters.
            this.c = currentContainer;
            this.u = currentUser;

            //Retrieves object data.
            this.getBloodDrawsWhereAnimalIsNotAlive();
            this.getBloodDrawsOverAllowableLimit();
            this.getBloodDrawsWhereAnimalNotAssignedToProject();
            this.getBloodDrawsTodayWhereAnimalNotAssignedToProject();
            //TODO: 5. Find any incomplete blood draws scheduled today, by area.
            this.getIncompleteBloodDrawsScheduledTodayByArea();
        }







        //TODO: Need to test.
        //1. Finds any current or future blood draws where the animal is not alive.
        ArrayList<String> bloodDrawsWhereAnimalIsNotAlive;                              //id
        String bloodDrawsWhereAnimalIsNotAliveURLView;                                  //url string (view)
        private void getBloodDrawsWhereAnimalIsNotAlive() {
            //Gets info.
            Date todayDate = this.getDateToday();

            //Creates filter.
            SimpleFilter myFilter = new SimpleFilter("Id/DataSet/Demographics/calculated_status", "Alive", CompareType.NEQ_OR_NULL);
            myFilter.addCondition("qcstate/label", "Request: Denied", CompareType.NEQ);
            myFilter.addCondition("date", todayDate, CompareType.DATE_GTE);
            //Runs query.
            ArrayList<String> returnArray = ColonyAlertsNotificationRevamp.ColonyAlertObject.getTableMultiRowSingleColumn(c, u, "study", "Blood Draws", myFilter, null, "Id");

            //Creates URL.
            Path viewQueryURL = new Path(ActionURL.getBaseServerURL(), "query", c.getPath(), "executeQuery.view?schemaName=study&query.queryName=Blood Draws&query.date~dategte=" + todayDate + "&query.Id/DataSet/Demographics/calculated_status~neqornull=Alive&query.qcstate/label~neq=Request: Denied");

            //Returns data.
            this.bloodDrawsWhereAnimalIsNotAlive = returnArray;
            this.bloodDrawsWhereAnimalIsNotAliveURLView = viewQueryURL.toString();
        }

        //2. Finds any blood draws over the allowable limit.
        //TODO: Need to test.
        //TODO: Figure out why filter is muted in perl script, but URL in perl script uses date filter.
        ArrayList<String> bloodDrawsOverAllowableLimit;                                 //id
        String bloodDrawsOverAllowableLimitURLView;                                     //url string (view)
        private void getBloodDrawsOverAllowableLimit() {
            //Gets info.
            Date todayDate = this.getDateToday();

//            //Creates filter.
//            SimpleFilter myFilter = new SimpleFilter("Id/DataSet/Demographics/calculated_status", "Alive", CompareType.EQUAL);
//            myFilter.addCondition("qcstate/label", "Request: Denied", CompareType.NEQ);
//            myFilter.addCondition("date", todayDate, CompareType.DATE_GTE);
//            myFilter.addCondition("BloodRemaining/AvailBlood", 0, CompareType.LT);
            //Runs query.
            ArrayList<String> returnArray = ColonyAlertsNotificationRevamp.ColonyAlertObject.getTableMultiRowSingleColumn(c, u, "study", "DailyOverDraws", null, null, "Id");

            //Creates URL.
            Path viewQueryURL = new Path(ActionURL.getBaseServerURL(), "query", c.getPath(), "executeQuery.view?schemaName=study&query.queryName=DailyOverDraws&query.viewName=Blood Summary&query.date~dategte=" + todayDate + "&query.Id/Dataset/Demographics/calculated_status~eq=Alive");

            //Returns data.
            this.bloodDrawsOverAllowableLimit = returnArray;
            this.bloodDrawsOverAllowableLimitURLView = viewQueryURL.toString();
        }

        //3. Finds any blood draws where the animal is not assigned to that project.
        ArrayList<String> bloodDrawsWhereAnimalNotAssignedToProject;                    //id
        String bloodDrawsWhereAnimalNotAssignedToProjectURLView;                        //url string (view)
        private void getBloodDrawsWhereAnimalNotAssignedToProject() {
            //Gets info.
            Date todayDate = this.getDateToday();

            //Creates filter.
            SimpleFilter myFilter = new SimpleFilter("Id/DataSet/Demographics/calculated_status", "Alive", CompareType.EQUAL);
            myFilter.addCondition("qcstate/label", "Request: Denied", CompareType.NEQ);
            myFilter.addCondition("projectStatus", "", CompareType.NONBLANK);
            myFilter.addCondition("date", todayDate, CompareType.DATE_GTE);
            //Runs query.
            ArrayList<String> returnArray = ColonyAlertsNotificationRevamp.ColonyAlertObject.getTableMultiRowSingleColumn(c, u, "study", "BloodSchedule", myFilter, null, "Id");

            //Creates URL.
            Path viewQueryURL = new Path(ActionURL.getBaseServerURL(), "query", c.getPath(), "executeQuery.view?schemaName=study&query.queryName=BloodSchedule&query.projectStatus~isnonblank&query.Id/DataSet/Demographics/calculated_status~eq=Alive&query.date~dategte=" + todayDate);

            //Returns data.
            this.bloodDrawsWhereAnimalNotAssignedToProject = returnArray;
            this.bloodDrawsWhereAnimalNotAssignedToProjectURLView = viewQueryURL.toString();
        }

        //4. Find any blood draws today where the animal is not assigned to that project.
        //TODO: Does date need to remove time for this one?  I want blood draws all day, not just today at a certain time.
        ArrayList<String> bloodDrawsTodayWhereAnimalNotAssignedToProject;               //id
        String bloodDrawsTodayWhereAnimalNotAssignedToProjectURLView;                   //url string (view)
        private void getBloodDrawsTodayWhereAnimalNotAssignedToProject() {
            //Gets info.
            Date todayDate = this.getDateToday();

            //Creates filter.
            SimpleFilter myFilter = new SimpleFilter("Id/DataSet/Demographics/calculated_status", "Alive", CompareType.EQUAL);
            myFilter.addCondition("qcstate/label", "Request: Denied", CompareType.NEQ);
            myFilter.addCondition("projectStatus", "", CompareType.NONBLANK);
            myFilter.addCondition("date", todayDate, CompareType.DATE_EQUAL);
            //Runs query.
            ArrayList<String> returnArray = ColonyAlertsNotificationRevamp.ColonyAlertObject.getTableMultiRowSingleColumn(c, u, "study", "BloodSchedule", myFilter, null, "Id");

            //Creates URL.
            //TODO: Why doesn't URL use qcstate/label.
            Path viewQueryURL = new Path(ActionURL.getBaseServerURL(), "query", c.getPath(), "executeQuery.view?schemaName=study&query.queryName=BloodSchedule&query.projectStatus~isnonblank&query.Id/DataSet/Demographics/calculated_status~eq=Alive&query.date~dateeq=" + todayDate);

            //Returns data.
            this.bloodDrawsTodayWhereAnimalNotAssignedToProject = returnArray;
            this.bloodDrawsTodayWhereAnimalNotAssignedToProjectURLView = viewQueryURL.toString();
        }


        //TODO: 5. Find any incomplete blood draws scheduled today, by area.
        int completeCount = 0;
        int incompleteCount = 0;
        HashMap<String, HashMap<String, bloodDrawRoom>> summaryHashMap = new HashMap<>();                                           //Summary in OG.    (area -> (room -> (bloodDrawRoom -> complete/incomplete/incompleteRecords)))
        HashMap<String, HashMap<String, Integer>> billingHashMap = new HashMap<>();                                                 //Count in OG.      (area -> (billedByTitle -> count))
        ArrayList<HashMap<String,String>> incompleteBloodDrawsScheduledTodayByArea = new ArrayList<HashMap<String, String>>();      //
        String incompleteBloodDrawsScheduledTodayByAreaURLView;                                                                     //url string (view)
        private void getIncompleteBloodDrawsScheduledTodayByArea() {
            //Gets info.
            Date todayDate = this.getDateToday();

            //Creates filter.
//            SimpleFilter myFilter = new SimpleFilter("Id/DataSet/Demographics/calculated_status", "Alive", CompareType.EQUAL);
//            myFilter.addCondition("date", todayDate, CompareType.DATE_EQUAL);
//            myFilter.addCondition("qcstate", "Completed", CompareType.NEQ);
            SimpleFilter testFilter = new SimpleFilter("billedby/Title", "", CompareType.NONBLANK);
            //Creates sort.
            Sort mySort = new Sort("date");
            //Creates columns to retrieve.
            String[] targetColumns = new String[]{"drawStatus", "project", "date", "project/protocol", "taskid", "projectStatus", "tube_vol", "tube_type", "billedby", "billedby/title", "num_tubes", "Id/curLocation/area", "Id/curLocation/room", "Id/curLocation/cage", "additionalServices", "remark", "Id", "quantity", "qcstate", "qcstate/Label", "requestid"};
            //Runs query.
            ArrayList<HashMap<String,String>> returnArray = ColonyAlertsNotificationRevamp.ColonyAlertObject.NEWGetTableMultiRowMultiColumn(c, u, "study", "BloodSchedule", testFilter, null, targetColumns);

            //Sorts through each blood draw result.
            for (HashMap<String, String> result : returnArray) {
//                BloodDrawResult currentBloodDraw = new BloodDrawResult(c, u, result);         result.get("xxx")

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








    //TODO: This is the new version of the createCronString() function in NotificationToolkit.  Replace it after 23.11 upgrade.
    /**
     * This formats the notification's "hours sent" into a usable cron string.
     * @param minute    (0-59, *, or comma separated values with no spaces)
     * @param hour      (0-23, *, or comma separated values with no spaces)
     * @param dayOfWeek (1-7, *, or comma separated values with no spaces)
     * @return
     */
    public final String createCronString2(String minute, String hour, String dayOfWeek) {
        //Creates variables.
        StringBuilder returnString = new StringBuilder("0 " + minute + " " + hour + " ? * " + dayOfWeek + " *");

        //Returns properly formatted cron string.
        return returnString.toString();
    }

    public static class bloodDrawRoom {
        int complete = 0;
        int incomplete = 0;
        ArrayList<HashMap<String, String>> incompleteRecords = new ArrayList<HashMap<String, String>>();
    }
//    public static class BloodDrawResult {
//        Container c;
//        User u;
//        String drawStatus = "";
//        String project = "";
//        String date = "";
//        String projectProtocol = "";
//        String taskID = "";
//        String projectStatus = "";
//        String tubeVol = "";
//        String tubeType = "";
//        String billedBy = "";
//        String billedByTitle = "";
//        String numTubes = "";
//        String idCurLocationArea = "";
//        String idCurLocationRoom = "";
//        String idCurLocationCage = "";
//        String additionalServices = "";
//        String remark = "";
//        String id = "";
//        String quantity = "";
//        String qcState = "";
//        String qcStateLabel = "";
//        String requestID = "";
//
//        public BloodDrawResult(Container container, User user, HashMap<String,String> bloodDrawQueryResult) {
//            //Updates user & container.
//            this.c = container;
//            this.u = user;
//
//            //Updates object data.
//            this.drawStatus = bloodDrawQueryResult.get("drawStatus");
//            this.project = bloodDrawQueryResult.get("project");
//            this.date = bloodDrawQueryResult.get("date");
//            this.projectProtocol = bloodDrawQueryResult.get("project/protocol");
//            this.taskID = bloodDrawQueryResult.get("taskid");
//            this.projectStatus = bloodDrawQueryResult.get("projectStatus");
//            this.tubeVol = bloodDrawQueryResult.get("tube_vol");
//            this.tubeType = bloodDrawQueryResult.get("tube_type");
//            this.billedBy = bloodDrawQueryResult.get("billedby");
//            this.billedByTitle = bloodDrawQueryResult.get("billedby/title");
//            this.numTubes = bloodDrawQueryResult.get("num_tubes");
//            this.idCurLocationArea = bloodDrawQueryResult.get("Id/curLocation/area");
//            this.idCurLocationRoom = bloodDrawQueryResult.get("Id/curLocation/room");
//            this.idCurLocationCage = bloodDrawQueryResult.get("Id/curLocation/cage");
//            this.additionalServices = bloodDrawQueryResult.get("additionalServices");
//            this.remark = bloodDrawQueryResult.get("remark");
//            this.id = bloodDrawQueryResult.get("Id");
//            this.quantity = bloodDrawQueryResult.get("quantity");
//            this.qcState = bloodDrawQueryResult.get("qcstate");
//            this.qcStateLabel = bloodDrawQueryResult.get("qcstate/Label");
//            this.requestID = bloodDrawQueryResult.get("requestid");
//        }
//    }





}