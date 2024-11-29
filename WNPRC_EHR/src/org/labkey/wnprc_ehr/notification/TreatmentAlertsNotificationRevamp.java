package org.labkey.wnprc_ehr.notification;

import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.Sort;
import org.labkey.api.module.Module;
import org.labkey.api.security.User;

import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;

public class TreatmentAlertsNotificationRevamp extends AbstractEHRNotification {
    //Class Variables
    NotificationToolkit notificationToolkit = new NotificationToolkit();
    NotificationToolkit.DateToolkit dateToolkit = new NotificationToolkit.DateToolkit();
    NotificationToolkit.StyleToolkit styleToolkit = new NotificationToolkit.StyleToolkit();





    // Constructors
    /**
     * This constructor is used to register the notification in WNPRC_EHRModule.java.
     * @param owner
     */
    public TreatmentAlertsNotificationRevamp(Module owner) {super(owner);}





    // Notification Details
    @Override
    public String getName() {
        return "Treatment Alerts Notification Revamp";
    }
    @Override
    public String getDescription() {
        return "This email contains any scheduled treatments not marked as completed.";
    }
    @Override
    public String getEmailSubject(Container c) {
        return "Treatment Alerts: " + dateToolkit.getCurrentTime();
    }
    @Override
    public String getScheduleDescription() {
        return "Daily at 6:00AM, 10:00AM, 1:00PM, 3:00PM, 5:00PM, 7:00PM";
    }
    @Override
    public String getCronString() {
        return notificationToolkit.createCronString("0", "6,10,13,15,17,19", "*");
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
        TreatmentAlertsObject myTreatmentAlertsObject = new TreatmentAlertsObject(c, u);

        // Creates CSS.
        messageBody.append(styleToolkit.beginStyle());
        messageBody.append(styleToolkit.setBasicTableStyle());
        messageBody.append(styleToolkit.setHeaderRowBackgroundColor("#d9d9d9"));
        messageBody.append(styleToolkit.endStyle());

        // Begins message info.
        messageBody.append("This email contains any scheduled treatments not marked as completed.  It was run on: " + dateToolkit.getCurrentTime() + ".<p>");

        // Creates message.
        // 1. Shows all rooms lacking observations today.
        if (!myTreatmentAlertsObject.roomsLackingObservationsToday.isEmpty()) {
            messageBody.append("<b>WARNING: The following rooms do not have any obs for today as of: " + dateToolkit.getCurrentTime() + ".</b>");
            messageBody.append("" + notificationToolkit.createHyperlink("Click here to view them.</a><p>\n", myTreatmentAlertsObject.roomsLackingObservationsTodayUrlView));
            for (HashMap<String, String> result : myTreatmentAlertsObject.roomsLackingObservationsToday) {
                messageBody.append(result.get("room") + "<br>");
            }
            messageBody.append("<hr>\n");
        }
        // 2. Shows all treatments where the animal is not assigned to that project.
        if (!myTreatmentAlertsObject.treatmentsWithAnimalNotAssignedToProject.isEmpty()) {
            messageBody.append("<b>WARNING: There are " + myTreatmentAlertsObject.treatmentsWithAnimalNotAssignedToProject.size() + " scheduled treatments where the animal is not assigned to the project.</br><br>");
            messageBody.append("" + notificationToolkit.createHyperlink("Click here to view them.</a><br>\n", myTreatmentAlertsObject.treatmentsWithAnimalNotAssignedToProjectUrlView));
            messageBody.append("<hr>\n");
        }
        // 3. Shows treatments for each time of day.
        String[] timesOfDay = {"AM", "Noon", "PM", "Any Time", "Night"};
        String[] treatmentColumns = new String[]{"ID", "Treatment", "Route", "Concentration", "Amount To Give", "Volume", "Instructions", "Ordered By"};

        for (String timeOfDay : timesOfDay) {
            // Verifies there are treatments scheduled.
            Integer totalTreatments = myTreatmentAlertsObject.incompleteTreatmentsForEachTimeOfDay.get(timeOfDay).size() + myTreatmentAlertsObject.completedTreatmentCountsForEachTimeOfDay.get(timeOfDay);
            if (totalTreatments > 0) {
                messageBody.append("There are " + totalTreatments + " scheduled " + timeOfDay + " treatments.  " + myTreatmentAlertsObject.completedTreatmentCountsForEachTimeOfDay.get(timeOfDay) + " have been completed.  ");
                messageBody.append("" + notificationToolkit.createHyperlink("Click here to view them.</a></p>\n", myTreatmentAlertsObject.treatmentsForEachTimeOfDayUrlView.get(timeOfDay)));

                // Creates the current timeOfDay results sorted by (area --> room --> result).
                HashMap<String, HashMap<String, ArrayList<HashMap<String, String>>>> resultsByArea = new HashMap<>();

                for (HashMap<String, String> result : myTreatmentAlertsObject.incompleteTreatmentsForEachTimeOfDay.get(timeOfDay)) {
                    String currentArea = result.get("CurrentArea");
                    String currentRoom = result.get("CurrentRoom");
                    // Adds result if area does not yet exist.
                    if (!resultsByArea.containsKey(currentArea)) {
                        // Creates new treatments list.
                        ArrayList<HashMap<String, String>> roomTreatments = new ArrayList<>();
                        roomTreatments.add(result);
                        // Adds new treatments list to new room.
                        HashMap<String, ArrayList<HashMap<String, String>>> newRoom = new HashMap<>();
                        newRoom.put(currentRoom, roomTreatments);
                        // Adds new room to new area.
                        resultsByArea.put(currentArea, newRoom);
                    }
                    // Adds result if area exists but room does not yet exist.
                    else if (!resultsByArea.get(currentArea).containsKey(currentRoom)) {
                        // Creates new treatments list.
                        ArrayList<HashMap<String, String>> roomTreatments = new ArrayList<>();
                        roomTreatments.add(result);
                        // Adds new room to new area.
                        resultsByArea.get(currentArea).put(currentRoom, roomTreatments);
                    }
                    // Adds result if area and room both exist.
                    else {
                        resultsByArea.get(currentArea).get(currentRoom).add(result);
                    }
                }

                // Iterates through each area (sorted alphabetically).
                for (String currentArea : notificationToolkit.sortSetWithNulls(resultsByArea.keySet())) {
                    messageBody.append("<b>" + currentArea + ":</b><br>\n");
                    // Iterates through each room (sorted alphabetically)
                    for (String currentRoom : notificationToolkit.sortSetWithNulls(resultsByArea.get(currentArea).keySet())) {
                        messageBody.append(currentRoom + ": " + resultsByArea.get(currentArea).get(currentRoom).size() + "<br>\n");
                        // Reformats the treatment hashmap into a String[] List (to be compatible with the table creation function).
                        ArrayList<String []> formattedResults = new ArrayList<>();
                        for (HashMap<String, String> currentTreatment : resultsByArea.get(currentArea).get(currentRoom)) {
                            String[] newTableRow = new String[]{
                                    currentTreatment.get("Id"),
                                    currentTreatment.get("meaning"),
                                    currentTreatment.get("route"),
                                    currentTreatment.get("conc2"),
                                    currentTreatment.get("amount2"),
                                    currentTreatment.get("volume2"),
                                    currentTreatment.get("remark"),
                                    currentTreatment.get("performedby")
                            };
                            formattedResults.add(newTableRow);
                        }
                        // Displays table with results.
                        NotificationToolkit.NotificationRevampTable myTable = new NotificationToolkit.NotificationRevampTable(treatmentColumns, formattedResults);
                        messageBody.append(myTable.createBasicHTMLTable());
                    }
                }

            }
            else {
                messageBody.append("There are no scheduled " + timeOfDay + " treatments as of " + dateToolkit.getCurrentTime() + ".  Treatments could be added after this email was sent, so please check online closer to the time.");
            }
            messageBody.append("<hr>\n");
        }
        // 4. Shows any treatments from today that differ from the order.
        if (!myTreatmentAlertsObject.differentOrderTreatments.isEmpty()) {
            // Reformats the String List into a String[] List (to be compatible with the table creation function).
            ArrayList<String []> formattedResults = new ArrayList<>();
            for (String result : myTreatmentAlertsObject.differentOrderTreatments) {
                formattedResults.add(new String[]{result});
            }
            // Creates the necessary table.
            String[] diffTableColumns = new String[]{"DIFFERING TREATMENTS"};
            NotificationToolkit.NotificationRevampTable myTable = new NotificationToolkit.NotificationRevampTable(diffTableColumns, formattedResults);
            messageBody.append(myTable.createBasicHTMLTable());
            messageBody.append("<hr>\n");
        }
        // 5. Shows any treatments where the animal is not alive.
        if (!myTreatmentAlertsObject.treatmentsWhereAnimalIsNotAlive.isEmpty()) {
            messageBody.append("<b>WARNING: There are " + myTreatmentAlertsObject.treatmentsWhereAnimalIsNotAlive.size() + " active treatments for animals not currently at WNPRC.</b>");
            messageBody.append("" + notificationToolkit.createHyperlink("Click here to view and update them.</a><br>\n", myTreatmentAlertsObject.treatmentsWhereAnimalIsNotAliveURLView));
            messageBody.append("<hr>\n");
        }
        // 6. Find any problems where the animal is not alive.
        if (!myTreatmentAlertsObject.problemsWhereAnimalIsNotAlive.isEmpty()) {
            messageBody.append("<b>WARNING: There are " + myTreatmentAlertsObject.problemsWhereAnimalIsNotAlive.size() + " unresolved problems for animals not currently at WNPRC.</b>");
            messageBody.append("" + notificationToolkit.createHyperlink("Click here to view and update them.</a><br>\n", myTreatmentAlertsObject.problemsWhereAnimalIsNotAliveUrlView));
            messageBody.append("<hr>\n");
        }
        // 7. Checks for missing In Rooms after 2:30pm, as specified in the SOP.
        if (!myTreatmentAlertsObject.missingInRoomsAfterTwoThirty.isEmpty()) {
            messageBody.append("<b>WARNING: There are " + myTreatmentAlertsObject.missingInRoomsAfterTwoThirty.size() + " " + notificationToolkit.createHyperlink("animals without In Rooms", myTreatmentAlertsObject.missingInRoomsAfterTwoThirtyUrlView) + ".</b>");
        }


        return messageBody.toString();
    }

    // Gets all info for Treatment Alerts.
    public static class TreatmentAlertsObject {
        //Set up.
        NotificationToolkit notificationToolkit = new NotificationToolkit();
        NotificationToolkit.DateToolkit dateToolkit = new NotificationToolkit.DateToolkit();
        Date todayDate = dateToolkit.getDateToday();

        TreatmentAlertsObject(Container c, User u) {
            getRoomsLackingObservationsToday(c, u);
            getTreatmentsWithAnimalNotAssignedToProject(c, u);
            getIncompleteTreatmentsForEachTimeOfDay(c, u);
            getDifferentOrderTreatments(c, u);
            getTreatmentsWhereAnimalIsNotAlive(c, u);
            getProblemsWhereAnimalIsNotAlive(c, u);
            getMissingInRoomsAfterTwoThirty(c, u);
        }

        // Gets any rooms lacking observations for today.
        ArrayList<HashMap<String, String>> roomsLackingObservationsToday;
        String roomsLackingObservationsTodayUrlView;
        private void getRoomsLackingObservationsToday(Container c, User u) {
            // Creates filter.
            SimpleFilter myFilter = new SimpleFilter("hasObs", "N", CompareType.EQUAL);
            // Creates columns to retrieve.
            String[] targetColumns = new String[]{"room"};
            // Runs query.
            ArrayList<HashMap<String, String>> returnArray = notificationToolkit.getTableMultiRowMultiColumnWithFieldKeys(c, u, "ehr", "RoomsWithoutObsToday", myFilter, null, targetColumns);

            // Assigns data.
            this.roomsLackingObservationsToday = returnArray;
            this.roomsLackingObservationsTodayUrlView = notificationToolkit.createQueryURL(c, "execute", "ehr", "RoomsWithoutObsToday", myFilter);
        }

        // Gets all treatments (today) where the animal is not assigned to that project.
        ArrayList<HashMap<String, String>> treatmentsWithAnimalNotAssignedToProject;
        String treatmentsWithAnimalNotAssignedToProjectUrlView;
        private void getTreatmentsWithAnimalNotAssignedToProject(Container c, User u) {
            // Creates filter.
            SimpleFilter myFilter = new SimpleFilter("Id/DataSet/Demographics/calculated_status", "Alive", CompareType.EQUAL);
            myFilter.addCondition("projectStatus", "", CompareType.NONBLANK);
            myFilter.addCondition("date", todayDate, CompareType.DATE_EQUAL);
            // Creates columns to retrieve.
            String[] targetColumns = new String[]{"Id"};
            // Runs query.
            ArrayList<HashMap<String, String>> returnArray = notificationToolkit.getTableMultiRowMultiColumnWithFieldKeys(c, u, "study", "treatmentSchedule", myFilter, null, targetColumns);

            // Assigns data.
            this.treatmentsWithAnimalNotAssignedToProject = returnArray;
            this.treatmentsWithAnimalNotAssignedToProjectUrlView = notificationToolkit.createQueryURL(c, "execute", "study", "treatmentSchedule", myFilter);
        }

        // Gets all treatments (today) for each time of the day (AM, Noon, PM, Any Time, Night).
        HashMap<String, ArrayList<HashMap<String, String>>> incompleteTreatmentsForEachTimeOfDay = new HashMap<>() {{
            put("AM", new ArrayList());
            put("Noon", new ArrayList());
            put("PM", new ArrayList());
            put("Any Time", new ArrayList());
            put("Night", new ArrayList());
        }};
        HashMap<String, Integer> completedTreatmentCountsForEachTimeOfDay = new HashMap<>() {{
            put("AM", 0);
            put("Noon", 0);
            put("PM", 0);
            put("Any Time", 0);
            put("Night", 0);
        }};
        HashMap<String, String> treatmentsForEachTimeOfDayUrlView = new HashMap<>();
        private void getIncompleteTreatmentsForEachTimeOfDay(Container c, User u) {
            // Creates filter.
            SimpleFilter myFilter = new SimpleFilter("Id/DataSet/Demographics/calculated_status", "Alive", CompareType.EQUAL);
            myFilter.addCondition("date", todayDate, CompareType.DATE_EQUAL);
            // Creates sort.
            Sort mySort = new Sort("CurrentArea,CurrentRoom");
            // Creates columns to retrieve.
            String[] targetColumns = new String[]{"timeofday", "Id", "CurrentArea", "CurrentRoom", "CurrentCage", "projectStatus", "treatmentStatus", "treatmentStatus/Label", "meaning", "code", "volume2", "conc2", "route", "amount2", "remark", "performedby"};
            // Runs query.
            ArrayList<HashMap<String, String>> returnArray = notificationToolkit.getTableMultiRowMultiColumnWithFieldKeys(c, u, "study", "treatmentSchedule", myFilter, mySort, targetColumns);

            if (!returnArray.isEmpty()) {
                // Sorts data for each time of day.
                for (HashMap<String, String> currentTreatment : returnArray) {
                    String treatmentTime = currentTreatment.get("timeofday");
                    // Verifies time of day is one of the 5 supported times.
                    if (treatmentTime != null) {
                        if (treatmentTime.equals("AM") || treatmentTime.equals("Noon") || treatmentTime.equals("PM") || treatmentTime.equals("Any Time") || treatmentTime.equals("Night")) {
                            if (currentTreatment.get("treatmentStatus/Label").equals("Completed")) {
                                Integer currentCount = completedTreatmentCountsForEachTimeOfDay.get(treatmentTime);
                                completedTreatmentCountsForEachTimeOfDay.put(treatmentTime, currentCount + 1);
                            }
                            else {
                                incompleteTreatmentsForEachTimeOfDay.get(treatmentTime).add(currentTreatment);
                            }
                        }
                    }
                }
                // Updates official class variable for each time of day's URL view.
                SimpleFilter amFilter = new SimpleFilter(myFilter);
                SimpleFilter noonFilter = new SimpleFilter(myFilter);
                SimpleFilter pmFilter = new SimpleFilter(myFilter);
                SimpleFilter anytimeFilter = new SimpleFilter(myFilter);
                SimpleFilter nightFilter = new SimpleFilter(myFilter);
                amFilter.addCondition("timeofday", "AM", CompareType.EQUAL);
                noonFilter.addCondition("timeofday", "Noon", CompareType.EQUAL);
                pmFilter.addCondition("timeofday", "PM", CompareType.EQUAL);
                anytimeFilter.addCondition("timeofday", "Any Time", CompareType.EQUAL);
                nightFilter.addCondition("timeofday", "Night", CompareType.EQUAL);
                this.treatmentsForEachTimeOfDayUrlView.put("AM", notificationToolkit.createQueryURL(c, "execute", "study", "treatmentSchedule", amFilter));
                this.treatmentsForEachTimeOfDayUrlView.put("Noon", notificationToolkit.createQueryURL(c, "execute", "study", "treatmentSchedule", noonFilter));
                this.treatmentsForEachTimeOfDayUrlView.put("PM", notificationToolkit.createQueryURL(c, "execute", "study", "treatmentSchedule", pmFilter));
                this.treatmentsForEachTimeOfDayUrlView.put("Any Time", notificationToolkit.createQueryURL(c, "execute", "study", "treatmentSchedule", anytimeFilter));
                this.treatmentsForEachTimeOfDayUrlView.put("Night", notificationToolkit.createQueryURL(c, "execute", "study", "treatmentSchedule", nightFilter));
            }
        }

        // Gets all treatments (today) that differ from the order.
        List<String> differentOrderTreatments;
        String differentOrderTreatmentsUrlView;
        private void getDifferentOrderTreatments(Container c, User u) {
            // Creates variable.
            List<String> resultsAsTableEntries = new ArrayList<>();
            // Creates filter.
            SimpleFilter myFilter = new SimpleFilter("date", todayDate, CompareType.DATE_EQUAL);
            // Creates columns to retrieve.
            String[] targetColumns = new String[]{"CurrentArea", "CurrentRoom", "id", "date", "meaning", "performedby", "drug_performedby", "route", "drug_route", "concentration", "drug_concentration", "conc_units", "drug_conc_units", "dosage", "drug_dosage", "dosage_units", "drug_dosage_units", "amount", "drug_amount", "amount_units", "drug_amount_units", "volume", "drug_volume", "vol_units", "drug_vol_units"};
            // Runs query.
            ArrayList<HashMap<String, String>> returnArray = notificationToolkit.getTableMultiRowMultiColumnWithFieldKeys(c, u, "study", "TreatmentsThatDiffer", myFilter, null, targetColumns);

            for (HashMap<String, String> currentTreatment : returnArray) {
                // Creates variable.
                StringBuilder currentTableEntry = new StringBuilder();

                // Displays the basic info for the current treatment.
                currentTableEntry.append("Id: " + currentTreatment.get("id") + "<br>\n");
                currentTableEntry.append("Date: " + currentTreatment.get("date") + "<br>\n");
                currentTableEntry.append("Treatment: " + currentTreatment.get("meaning") + "<br>\n");
                currentTableEntry.append("Ordered By: " + currentTreatment.get("performedby") + "<br>\n");
                currentTableEntry.append("Performed By: " + currentTreatment.get("drug_performedby") + "<br>\n");

                // Displays which order/entry field in the treatment does not match.
                // Compares the route.
                if (!currentTreatment.get("route").equals(currentTreatment.get("drug_route"))) {
                    currentTableEntry.append("Route Ordered: " + currentTreatment.get("route") + "<br>\n");
                    currentTableEntry.append("Route Entered: " + currentTreatment.get("drug_route") + "<br>\n");
                }
                // Compares the concentration & concentration units.
                if (!currentTreatment.get("concentration").equals(currentTreatment.get("drug_concentration")) || !currentTreatment.get("conc_units").equals(currentTreatment.get("drug_conc_units"))) {
                    currentTableEntry.append("Concentration Ordered: " + currentTreatment.get("concentration") + " " + currentTreatment.get("conc_units") + "<br>\n");
                    currentTableEntry.append("Concentration Entered: " + currentTreatment.get("drug_concentration") +  " " + currentTreatment.get("drug_conc_units") + "<br>\n");
                }
                // Compares the dosage & dosage units.
                if (!currentTreatment.get("dosage").equals(currentTreatment.get("drug_dosage")) || !currentTreatment.get("dosage_units").equals(currentTreatment.get("drug_dosage_units"))) {
                    currentTableEntry.append("Dosage Ordered: " + currentTreatment.get("dosage") + " " + currentTreatment.get("dosage_units") + "<br>\n");
                    currentTableEntry.append("Dosage Entered: " + currentTreatment.get("drug_dosage") +  " " + currentTreatment.get("drug_dosage_units") + "<br>\n");
                }
                // Compares the amount & amount units.
                if (!currentTreatment.get("amount").equals(currentTreatment.get("drug_amount")) || !currentTreatment.get("amount_units").equals(currentTreatment.get("drug_amount_units"))) {
                    currentTableEntry.append("Amount Ordered: " + currentTreatment.get("amount") + " " + currentTreatment.get("amount_units") + "<br>\n");
                    currentTableEntry.append("Amount Entered: " + currentTreatment.get("drug_amount") +  " " + currentTreatment.get("drug_amount_units") + "<br>\n");
                }
                // Compares the volume & volume units.
                if (!currentTreatment.get("volume").equals(currentTreatment.get("drug_volume")) || !currentTreatment.get("vol_units").equals(currentTreatment.get("drug_vol_units"))) {
                    currentTableEntry.append("Volume Ordered: " + currentTreatment.get("volume") + " " + currentTreatment.get("vol_units") + "<br>\n");
                    currentTableEntry.append("Volume Entered: " + currentTreatment.get("drug_volume") +  " " + currentTreatment.get("drug_vol_units") + "<br>\n");
                }

                // Adds treatment to table row list.
                resultsAsTableEntries.add(currentTableEntry.toString());
            }

            // Assigns data.
            this.differentOrderTreatments = resultsAsTableEntries;
            this.differentOrderTreatmentsUrlView = notificationToolkit.createQueryURL(c, "execute", "study", "TreatmentsThatDiffer", myFilter);
        }

        // Gets all treatments (today & future) where the animal is not alive.
        ArrayList<HashMap<String, String>> treatmentsWhereAnimalIsNotAlive;
        String treatmentsWhereAnimalIsNotAliveURLView;
        private void getTreatmentsWhereAnimalIsNotAlive(Container c, User u) {
            // Creates filter.
            SimpleFilter myFilter = new SimpleFilter("Id/DataSet/Demographics/calculated_status", "Alive", CompareType.NEQ_OR_NULL);
            myFilter.addCondition("enddate", "", CompareType.ISBLANK);
            // Creates columns to retrieve.
            String[] targetColumns = new String[]{"Id"};
            // Runs query.
            ArrayList<HashMap<String, String>> returnArray = notificationToolkit.getTableMultiRowMultiColumnWithFieldKeys(c, u, "study", "Treatment Orders", myFilter, null, targetColumns);

            // Assigns data.
            this.treatmentsWhereAnimalIsNotAlive = returnArray;
            this.treatmentsWhereAnimalIsNotAliveURLView = notificationToolkit.createQueryURL(c, "execute", "study", "Treatment Orders", myFilter);
        }

        // Gets any problems (today & future) where the animal is not alive.
        ArrayList<HashMap<String, String>> problemsWhereAnimalIsNotAlive;
        String problemsWhereAnimalIsNotAliveUrlView;
        private void getProblemsWhereAnimalIsNotAlive(Container c, User u) {
            // Creates filter.
            SimpleFilter myFilter = new SimpleFilter("Id/DataSet/Demographics/calculated_status", "Alive", CompareType.NEQ_OR_NULL);
            myFilter.addCondition("enddate", "", CompareType.ISBLANK);
            // Creates columns to retrieve.
            String[] targetColumns = new String[]{"Id"};
            // Runs query.
            ArrayList<HashMap<String, String>> returnArray = notificationToolkit.getTableMultiRowMultiColumnWithFieldKeys(c, u, "study", "Problem List", myFilter, null, targetColumns);

            // Assigns data.
            this.problemsWhereAnimalIsNotAlive = returnArray;
            this.problemsWhereAnimalIsNotAliveUrlView = notificationToolkit.createQueryURL(c, "execute", "study", "Problem List", myFilter);
        }

        // Checks for missing-in-rooms after 2:30pm, as specified in the SOP.
        ArrayList<HashMap<String, String>> missingInRoomsAfterTwoThirty;
        String missingInRoomsAfterTwoThirtyUrlView;
        private void getMissingInRoomsAfterTwoThirty(Container c, User u) {
            // Creates columns to retrieve.
            String[] targetColumns = new String[]{"Id"};
            // Runs query.
            ArrayList<HashMap<String, String>> returnArray = notificationToolkit.getTableMultiRowMultiColumnWithFieldKeys(c, u, "study", "inRoomNotSubmitted", null, null, targetColumns);

            // Assigns data.
            this.missingInRoomsAfterTwoThirty = returnArray;
            this.missingInRoomsAfterTwoThirtyUrlView = notificationToolkit.createQueryURL(c, "execute", "study", "inRoomNotSubmitted", null);
        }






    }

}
