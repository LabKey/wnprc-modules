package org.labkey.wnprc_ehr.notification;

import org.checkerframework.checker.units.qual.A;
import org.jetbrains.annotations.Nullable;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.ldk.notification.NotificationService;
import org.labkey.api.module.Module;
import org.labkey.api.security.User;

import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;

public class ClinpathAbnormalResultsAlertsRevamp extends AbstractEHRNotification {
    //Class Variables
    NotificationToolkit notificationToolkit = new NotificationToolkit();
    NotificationToolkit.DateToolkit dateToolkit = new NotificationToolkit.DateToolkit();
    NotificationToolkit.StyleToolkit styleToolkit = new NotificationToolkit.StyleToolkit();





    // Constructors
    /**
     * This constructor is used to register the notification in WNPRC_EHRModule.java.
     * @param owner
     */
    public ClinpathAbnormalResultsAlertsRevamp(Module owner) {super(owner);}





    // Notification Details
    @Override
    public String getName() {
        return "Clinpath Abnormal Results Alerts Notification Revamp";
    }
    @Override
    public String getDescription() {
        return "This report is designed to identify potential problems related to clinpath.";
    }
    @Override
    public String getEmailSubject(Container c) {
        return "Abnormal Clinpath Results: " + dateToolkit.getCurrentTime();
    }
    @Override
    public String getScheduleDescription() {
        return "Daily every hour from 7:05AM - 5:05PM";
    }
    @Override
    public String getCronString() {
        return notificationToolkit.createCronString("5", "7,8,9,10,11,12,13,14,15,16,17", "*");
    }
    @Override
    public String getCategory() {
        return "Revamped Notifications";
    }





    // Message Creation
    @Override
    public String getMessageBodyHTML(Container c, User u) {
        // Creates variables & gets data.
        final StringBuilder messageBody = new StringBuilder();

        // Creates CSS.
        messageBody.append(styleToolkit.beginStyle());
        messageBody.append(styleToolkit.setBasicTableStyle());
        messageBody.append(styleToolkit.setHeaderRowBackgroundColor("#d9d9d9"));
        messageBody.append(styleToolkit.endStyle());

        // Sets up variables.
        HashMap<String, HashMap<String, ArrayList<HashMap<String, String>>>> filteredResults = new HashMap<>(); // Areas > Rooms > Results List > Result
        Date lastRunDate = new Date(NotificationService.get().getLastRun(this));
        Calendar cal = Calendar.getInstance();
        cal.setTime(lastRunDate);
        cal.add(Calendar.DATE, -7);
        Date lastRunMinusWeek = cal.getTime();

        // Creates filter.
        SimpleFilter myFilter = new SimpleFilter("qcstate/PublicData", true, CompareType.EQUAL);
        myFilter.addCondition("taskid/datecompleted", lastRunDate, CompareType.GTE);
        myFilter.addCondition("taskid/datecompleted", "", CompareType.NONBLANK);
        myFilter.addCondition("date", lastRunMinusWeek, CompareType.GTE);
        // Creates columns to retrieve.
        String[] targetColumns = new String[]{"Id", "date", "Id/curLocation/area", "Id/curLocation/room", "Id/curLocation/cage", "alertStatus", "taskid/datecompleted", "testid", "result", "units", "status", "ref_range_min", "ref_range_max", "ageAtTime"};
        // Runs query.
        ArrayList<HashMap<String, String>> returnArray = notificationToolkit.getTableMultiRowMultiColumnWithFieldKeys(c, u, "study", "ClinpathRefRange", myFilter, null, targetColumns);
        // Creates URL.
        String clinpathTasksUrlView = notificationToolkit.createQueryURL(c, "execute", "study", "ClinpathRefRange", myFilter);

        // Organizes results into a list filtered by [Area > Room > Task].
        for (HashMap<String, String> result : returnArray) {
            // Verifies 'alert status' exists before adding results.
            if (!result.get("alertStatus").isEmpty()) {
                if (result.get("alertStatus").equals("t")) {
                    // Updates current location.
                    if (result.get("Id/curLocation/area").isEmpty()) {
                        result.put("Id/curLocation/area", "No Active Housing");
                    }
                    // Updates current room.
                    if (result.get("Id/curLocation/room").isEmpty()) {
                        result.put("Id/curLocation/room", "No Room");
                    }

                    // Adds to list if area does not exist yet.
                    if (!filteredResults.containsKey(result.get("Id/curLocation/area"))) {
                        // Creates new room results list.
                        ArrayList<HashMap<String, String>> newRoomList = new ArrayList<>();
                        newRoomList.add(result);
                        // Creates new room map.
                        HashMap<String, ArrayList<HashMap<String, String>>> newRoom = new HashMap<>();
                        newRoom.put(result.get("Id/curLocation/room"), newRoomList);
                        // Creates new area map and adds to the filtered results.
                        filteredResults.put(result.get("Id/curLocation/area"), newRoom);
                    }
                    // Adds to list if room does not exist yet.
                    else if (!filteredResults.get(result.get("Id/curLocation/area")).containsKey(result.get("Id/curLocation/room"))) {
                        // Creates new room results list.
                        ArrayList<HashMap<String, String>> newRoomList = new ArrayList<>();
                        newRoomList.add(result);
                        // Creates new room map and adds to the areas list.
                        filteredResults.get(result.get("Id/curLocation/area")).put(result.get("Id/curLocation/room"), newRoomList);
                    }
                    // Adds to list if area and room exist already.
                    else {
                        filteredResults.get(result.get("Id/curLocation/area")).get(result.get("Id/curLocation/room")).add(result);
                    }
                }
            }
        }

        // Prints text.
        messageBody.append("There have been " + returnArray.size() + " clinpath tasks completed since " + lastRunDate + "<br>");
        messageBody.append(notificationToolkit.createHyperlink("Click here to view them", clinpathTasksUrlView) + "<p>\n");
        messageBody.append("<p>Listed below are the abnormal records.<br>\n");

        // Prints table with all records.
        String[] tableColumns = new String[]{"Id", "Collect Date", "Date Completed", "Test ID", "Result", "Units", "Status", "Ref Range Min", "Ref Range Max", "Age At Time"};
        for (String currentArea : notificationToolkit.sortSetWithNulls(filteredResults.keySet())) {
            messageBody.append("<br>\n<b>" + currentArea + ":</b><br>\n");
            for (String currentRoom : notificationToolkit.sortSetWithNulls(filteredResults.get(currentArea).keySet())) {
                messageBody.append("<br>\n" + currentRoom + ":\n");
                // Reformats the hashmap into a String[] List (to be compatible with the table creation function).
                ArrayList<String []> currentTableData = new ArrayList<>();
                ArrayList<String> rowColorsList = new ArrayList<>();
                for (HashMap<String, String> currentRow : filteredResults.get(currentArea).get(currentRoom)) {
                    String[] newTableRow = new String[] {
                            currentRow.get("Id"),
                            currentRow.get("date"),
                            currentRow.get("taskid/datecompleted"),
                            currentRow.get("testid"),
                            currentRow.get("result"),
                            currentRow.get("units"),
                            currentRow.get("status"),
                            currentRow.get("ref_range_min"),
                            currentRow.get("ref_range_max"),
                            currentRow.get("ageAtTime"),
                    };
                    currentTableData.add(newTableRow);

                    if (!currentRow.get("ref_range_min").isBlank() && !currentRow.get("result").isBlank()) {
                        if (Double.parseDouble(currentRow.get("result")) < Double.parseDouble(currentRow.get("ref_range_min"))) {
                            rowColorsList.add("yellow");
                        }
                    }
                    if (!currentRow.get("ref_range_max").isBlank() && !currentRow.get("result").isBlank()) {
                        if (Double.parseDouble(currentRow.get("result")) > Double.parseDouble(currentRow.get("ref_range_max"))) {
                            rowColorsList.add("red");
                        }
                    }

                    if (currentTableData.size() > rowColorsList.size()) {
                        rowColorsList.add("white");
                    }
                }

                // Displays table.
                NotificationToolkit.NotificationRevampTable myTable = new NotificationToolkit.NotificationRevampTable(tableColumns, currentTableData);
                myTable.rowColors = rowColorsList;
                messageBody.append(myTable.createBasicHTMLTable());
            }
        }

        // Returns message.
        return messageBody.toString();
    }

}
