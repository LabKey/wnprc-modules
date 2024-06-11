package org.labkey.wnprc_ehr.notification;

import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.Sort;
import org.labkey.api.module.Module;
import org.labkey.api.security.User;
import org.labkey.wnprc_ehr.WNPRC_EHRModule;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Set;
import java.util.TreeSet;

public class BloodDrawsTodayAll extends AbstractEHRNotification {
    //Class Variables
    NotificationToolkit notificationToolkit = new NotificationToolkit();
    NotificationToolkit.StyleToolkit styleToolkit = new NotificationToolkit.StyleToolkit();
    NotificationToolkit.DateToolkit dateToolkit = new NotificationToolkit.DateToolkit();



    //Constructors
    /**
     * This constructor is used to register the notification in WNPRC_EHRModule.java.
     * @param owner
     */
    public BloodDrawsTodayAll(Module owner) {super(owner);}



    //Notification Details
    @Override
    public String getName() {
        return "Blood Draws Today (All)";
    }
    @Override
    public String getDescription() {
        return "The report is designed to identify potential problems related to all blood draws (today) assigned to any group.";
    }
    @Override
    public String getEmailSubject(Container c) {
        return "Blood Draws Today (All): " + dateToolkit.getCurrentTime();
    }
    @Override
    public String getScheduleDescription() {
        return "Daily at 6:00AM, 1:00PM, and 3:00PM";
    }
    @Override
    public String getCronString() {
        return notificationToolkit.createCronString("0", "6,13,15", "*");
    }
    @Override
    public String getCategory() {
        return "Revamped Notifications - Blood Draws Update";
    }



    //Message Creation
    @Override
    public String getMessageBodyHTML(Container c, User u) {
        // Gets BloodDrawsTodayObject.
        BloodDrawsTodayObject myBloodDrawNotificationObject = new BloodDrawsTodayObject(c, u, "all");

        // Begins message body.
        final StringBuilder messageBody = new StringBuilder();

        // Creates CSS.
        messageBody.append(styleToolkit.beginStyle());
        messageBody.append(styleToolkit.setBasicTableStyle());
        messageBody.append(styleToolkit.setHeaderRowBackgroundColor("#d9d9d9"));
        messageBody.append(styleToolkit.endStyle());

        // Begins message info.
        messageBody.append("<p>This email contains all scheduled blood draws for today (for all groups).  It was run on: " + dateToolkit.getCurrentTime() + "</p>");

        // Prints all tables.
        if (myBloodDrawNotificationObject.resultsByArea.isEmpty()) {
            messageBody.append("There are no scheduled blood draws for this group today.");
        }
        else {
            messageBody.append(myBloodDrawNotificationObject.printTablesAsHTML());
        }

//        // Creates table.
//        String[] myTableColumns = new String[]{"Id", "Blood Remaining", "Project Assignment", "Completion Status", "Group", "Other Groups Drawing Blood Today"};
//        NotificationToolkit.NotificationRevampTable myTable = new NotificationToolkit.NotificationRevampTable(myTableColumns, myBloodDrawNotificationObject.myTableData);
//        myTable.rowColors = myBloodDrawNotificationObject.myTableRowColors;
//        messageBody.append(myTable.createBasicHTMLTable());

        return messageBody.toString();
    }



    //Gets all info for today's blood draws.
    public static class BloodDrawsTodayObject {
        //Set up.
        NotificationToolkit notificationToolkit = new NotificationToolkit();
        NotificationToolkit.DateToolkit dateToolkit = new NotificationToolkit.DateToolkit();

        ArrayList<String[]> myTableData = new ArrayList<>();        // List of all blood draws as [[id, blood remaining, project assignment, completion status, assigned to]]
//        ArrayList<String> myTableRowColors = new ArrayList<>();     // List of all row colors (same length as myTableData).
        HashMap<String, HashMap<String, ArrayList<String[]>>> resultsByArea = new HashMap<>();  // Area(Room(List of draws))


        //Gets all info for the BloodDrawNotificationObject.
        //  assignementGroup can be 'all', 'animalCare', or 'vetStaff'.
        BloodDrawsTodayObject(Container c, User u, String assignmentGroup) {
            //Gets the blood remaining threshold.
            Float bloodThreshold = Float.parseFloat((new WNPRC_EHRModule()).getModuleProperties().get("BloodDrawThreshold").getEffectiveValue(c));

            // Creates filter.
            Date todayDate = dateToolkit.getDateToday();
            SimpleFilter myFilter = new SimpleFilter("Id/DataSet/Demographics/calculated_status", "Alive", CompareType.EQUAL);
            myFilter.addCondition("date", todayDate, CompareType.DATE_EQUAL);

            // Creates sort.
            Sort mySort = new Sort("date");
            // Creates columns to retrieve.
            String[] targetColumns = new String[]{"id", "qcstate/label", "projectStatus", "BloodRemaining/AvailBlood", "billedby/title", "Id/curLocation/room", "Id/curLocation/area"};
            //Runs query.
            ArrayList<HashMap<String,String>> returnArray = notificationToolkit.getTableMultiRowMultiColumnWithFieldKeys(c, u, "study", "BloodSchedule", myFilter, mySort, targetColumns);

            //Sorts through each blood draw result, then adds them to myTableData and myTableRowColors.
            for (HashMap<String, String> result : returnArray) {
                String[] myCurrentRow = new String[9];
                //  0: ID
                //  1: Available blood
                //  2: ASSIGNED/UNASSIGNED
                //  3: COMPLETE/INCOMPLETE
                //  4: Group
                //  5: Other groups drawing
                //  6: Area
                //  7: Room
                //  8: Row color

                // Updates id.
                myCurrentRow[0] = result.get("id");
                // Updates blood remaining.
                myCurrentRow[1] = result.get("BloodRemaining/AvailBlood");
                // Updates project status (this checks if animal is assigned to a project).
                if (!result.get("qcstate/label").equals("Request: Denied") && !result.get("projectStatus").isEmpty()) {
                    myCurrentRow[2] = "UNASSIGNED";
                }
                else {
                    myCurrentRow[2] = "";
                }
                // Updates completion status (this checks if blood draw has been completed).
                if (!result.get("qcstate/label").equals("Completed")) {
                    myCurrentRow[3] = "INCOMPLETE";
                }
                else {
                    myCurrentRow[3] = "";
                }
                // Updates the current group assigned to this animal.
                myCurrentRow[4] = result.get("billedby/title");
                // Updates the current area.
                if (!result.get("Id/curLocation/area").isEmpty()) {
                    myCurrentRow[6] = result.get("Id/curLocation/area");
                }
                else {
                    myCurrentRow[6] = "Unknown Area";
                }
                // Updates the current room.
                if (!result.get("Id/curLocation/room").isEmpty()) {
                    myCurrentRow[7] = result.get("Id/curLocation/room");
                }
                else {
                    myCurrentRow[7] = "Unknown Room";
                }

                //Updates row colors.
                myCurrentRow[8] = "white";
                if (!result.get("BloodRemaining/AvailBlood").isEmpty()) {
                    Float availBlood = Float.parseFloat(result.get("BloodRemaining/AvailBlood"));
                    if (availBlood <= 0) {
                        // If blood draw is over limit, color it red.
                        myCurrentRow[8] = "red";
                    }
                    else if (availBlood <= bloodThreshold) {
                        // If blood draw is over threshold limit, color it orange.
                        myCurrentRow[8] = "orange";
                    }
                }
//                String currentRowColor = "white";
//                if (!result.get("BloodRemaining/AvailBlood").isEmpty()) {
//                    Float availBlood = Float.parseFloat(result.get("BloodRemaining/AvailBlood"));
//                    if (availBlood <= 0) {
//                        // If blood draw is over limit, color it red.
//                        currentRowColor = "red";
//                    }
//                    else if (availBlood <= bloodThreshold) {
//                        // If blood draw is over threshold limit, color it orange.
//                        currentRowColor = "orange";
//                    }
//                }

                // Adds the current row to myTableData (based on group being queried).
                if (assignmentGroup.equals("animalCare")) {
                    if (result.get("billedby/title").equals("Animal Care")) {
                        myTableData.add(myCurrentRow);
//                        myTableRowColors.add(currentRowColor);
                    }
                }
                else if (assignmentGroup.equals("vetStaff")) {
                    if (result.get("billedby/title").equals("Vet Staff")) {
                        myTableData.add(myCurrentRow);
//                        myTableRowColors.add(currentRowColor);
                    }
                }
                else {
                    myTableData.add(myCurrentRow);
//                    myTableRowColors.add(currentRowColor);
                }
            }

            //Goes through each draw to find draws scheduled for more than one group, then updates myTableData with information.
            Integer counter = 0;
            for (String[] firstResult: myTableData) {
                String firstID = firstResult[0];
                String firstGroup = firstResult[4];
                Set<String> otherGroups = new TreeSet<>();
                for (String[] secondResult: myTableData) {
                    String secondID = secondResult[0];
                    String secondGroup = secondResult[4];
                    // If a different group is drawing blood from the same animal, add to list.
                    if (firstID.equals(secondID) && !firstGroup.equals(secondGroup)) {
                        otherGroups.add(secondGroup);
                    }
                }
                //Formats the text for the table cell.
                StringBuilder formattedGroups = new StringBuilder();
                if (!otherGroups.isEmpty()) {
                    for (String group: otherGroups) {
                        if (!formattedGroups.toString().isEmpty()) {
                            formattedGroups.append(", ");
                        }
                        formattedGroups.append(group);
                    }
                }
                //Adds extra group list to table.
                myTableData.get(counter)[5] = formattedGroups.toString();
                counter++;
            }

            // Goes through each draw and sorts them into a HashMap by Area & Room.
            for (String[] currentRow: myTableData) {
                String currentArea = currentRow[6];
                String currentRoom = currentRow[7];

                // Adds result if area does not yet exist.
                if (!resultsByArea.containsKey(currentArea)) {
                    // Creates room draws list.
                    ArrayList<String[]> roomDraws = new ArrayList<>();
                    roomDraws.add(currentRow);
                    // Adds room draws to rooms list.
                    HashMap<String, ArrayList<String[]>> newRoomEntry = new HashMap<>();
                    newRoomEntry.put(currentRoom, roomDraws);
                    // Adds rooms list to areas list.
                    resultsByArea.put(currentArea, newRoomEntry);
                }
                // Adds result if area exists but room does not yet exist.
                else if (!resultsByArea.get(currentArea).containsKey(currentRoom))
                {
                    // Creates room draws list.
                    ArrayList<String[]> roomDraws = new ArrayList<>();
                    roomDraws.add(currentRow);
                    // Adds room draws to rooms list.
                    resultsByArea.get(currentArea).put(currentRoom, roomDraws);
                }
                // Adds result if both area and room already exist.
                else {
                    resultsByArea.get(currentArea).get(currentRoom).add(currentRow);
                }
            }
        }

        String printTablesAsHTML() {
            // Creates return variable.
            StringBuilder returnString = new StringBuilder();

            // Goes through each room in each area and presents a table showing all blood draws for that room.
            String[] myTableColumns = new String[]{"Id", "Blood Remaining", "Project Assignment", "Completion Status", "Group", "Other Groups Drawing Blood Today"};
            // Iterates through each area (sorted alphabetically).
            for (String currentArea : notificationToolkit.sortSetWithNulls(this.resultsByArea.keySet())) {
                returnString.append("<b>AREA: </b>" + currentArea + ":<br>\n");
                // Iterates through each room (sorted alphabetically)
                for (String currentRoom : notificationToolkit.sortSetWithNulls(this.resultsByArea.get(currentArea).keySet())) {
                    Integer numResultsForRoom = this.resultsByArea.get(currentArea).get(currentRoom).size();
                    returnString.append("<b>ROOM: </b>" + currentRoom + ": (" + numResultsForRoom + ")<br>\n");

                    // Creates variables.
                    ArrayList<String[]> unformattedDrawsList = this.resultsByArea.get(currentArea).get(currentRoom);
                    ArrayList<String[]> formattedDrawsList = new ArrayList<>();
                    ArrayList<String> rowColorsList = new ArrayList<>();

                    // Copies list of draws (for current area & room) to a temp variable.  This removes the area, room, and color.
                    for (String[] currentDrawRow : unformattedDrawsList) {
                        String[] newDrawRow = new String[]{
                                currentDrawRow[0],
                                currentDrawRow[1],
                                currentDrawRow[2],
                                currentDrawRow[3],
                                currentDrawRow[4],
                                currentDrawRow[5]
                        };
                        formattedDrawsList.add(newDrawRow);
                    }

                    // Creates temp colors list (for the rows in the current area & room).
                    for (int i = 0; i < unformattedDrawsList.size(); i++) {
                        rowColorsList.add(unformattedDrawsList.get(i)[8]);
                    }

                    // Creates blood draw table for current area & room and adds it to the message.
                    NotificationToolkit.NotificationRevampTable myTable = new NotificationToolkit.NotificationRevampTable(myTableColumns, formattedDrawsList);
                    myTable.rowColors = rowColorsList;
                    returnString.append(myTable.createBasicHTMLTable());
                }
            }

            // Returns HTML formatted string with all tables printed.
            return returnString.toString();
        }
    }
}
