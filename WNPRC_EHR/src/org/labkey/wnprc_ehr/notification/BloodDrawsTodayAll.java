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
        return "TODO (Blood Draw Alert A - All)";
    }
    @Override
    public String getEmailSubject(Container c) {
        return "TODO (Blood Draw Alert A - All)";
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

        //Begins message info.
        messageBody.append("<p>This email contains all scheduled blood draws for today (for all groups).  It was run on: " + dateToolkit.getCurrentTime() + "</p>");

        // Creates table.
        String[] myTableColumns = new String[]{"Id", "Blood Remaining", "Project Assignment", "Completion Status", "Group", "Other Groups Drawing Blood Today"};
        NotificationToolkit.NotificationRevampTable myTable = new NotificationToolkit.NotificationRevampTable(myTableColumns, myBloodDrawNotificationObject.myTableData);
        myTable.rowColors = myBloodDrawNotificationObject.myTableRowColors;
        messageBody.append(myTable.createBasicHTMLTable());

        return messageBody.toString();
    }


    //Gets all info for today's blood draws.
    public static class BloodDrawsTodayObject {
        //Set up.
        NotificationToolkit notificationToolkit = new NotificationToolkit();
        NotificationToolkit.DateToolkit dateToolkit = new NotificationToolkit.DateToolkit();

        ArrayList<String[]> myTableData = new ArrayList<>();        // List of all blood draws as [[id, blood remaining, project assignment, completion status, assigned to]]
        ArrayList<String> myTableRowColors = new ArrayList<>();     // List of all row colors (same length as myTableData).


        //Gets all info for the BloodDrawNotificationObject.
        //  assignementGroup can be 'all', 'animalCare', or 'vetStaff'.
        BloodDrawsTodayObject(Container c, User u, String assignmentGroup) {
            //Gets the blood remaining threshold.
            Float bloodThreshold = Float.parseFloat((new WNPRC_EHRModule()).getModuleProperties().get("BloodDrawThreshold").getEffectiveValue(c));

            // Creates real filter.
//            Date todayDate = dateToolkit.getDateToday();
//            SimpleFilter myFilter = new SimpleFilter("Id/DataSet/Demographics/calculated_status", "Alive", CompareType.EQUAL);
//            myFilter.addCondition("date", todayDate, CompareType.DATE_EQUAL);

            // Creates test filter.
            Calendar todayCalendar = Calendar.getInstance();
            todayCalendar.add(Calendar.DATE, -500);
            Date testDate = todayCalendar.getTime();
            SimpleFilter myFilter = new SimpleFilter("date", testDate, CompareType.DATE_GTE);

            // Creates sort.
            Sort mySort = new Sort("date");
            // Creates columns to retrieve.
            String[] targetColumns = new String[]{"id", "qcstate/label", "projectStatus", "BloodRemaining/AvailBlood", "billedby/title"};
            //Runs query.
            ArrayList<HashMap<String,String>> returnArray = notificationToolkit.getTableMultiRowMultiColumnWithFieldKeys(c, u, "study", "BloodSchedule", myFilter, mySort, targetColumns);

            //Sorts through each blood draw result, then adds them to myTableData and myTableRowColors.
            for (HashMap<String, String> result : returnArray) {
                String[] myCurrentRow = new String[6];
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

                //Updates row colors.
                String currentRowColor = "white";
                if (!result.get("BloodRemaining/AvailBlood").isEmpty()) {
                    Float availBlood = Float.parseFloat(result.get("BloodRemaining/AvailBlood"));
                    if (availBlood <= 0) {
                        // If blood draw is over limit, color it red.
                        currentRowColor = "red";
                    }
                    else if (availBlood <= bloodThreshold) {
                        // If blood draw is over threshold limit, color it orange.
                        currentRowColor = "orange";
                    }
                }

                // Adds the current row to myTableData (based on group being queried).
                if (assignmentGroup.equals("animalCare")) {
                    if (result.get("billedby/title").equals("Animal Care")) {
                        myTableData.add(myCurrentRow);
                        myTableRowColors.add(currentRowColor);
                    }
                }
                else if (assignmentGroup.equals("vetStaff")) {
                    if (result.get("billedby/title").equals("Vet Staff")) {
                        myTableData.add(myCurrentRow);
                        myTableRowColors.add(currentRowColor);
                    }
                }
                else {
                    myTableData.add(myCurrentRow);
                    myTableRowColors.add(currentRowColor);
                }
            }

            //Goes through each draw to find draws scheduled for more than one group.
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
        }
    }
}
