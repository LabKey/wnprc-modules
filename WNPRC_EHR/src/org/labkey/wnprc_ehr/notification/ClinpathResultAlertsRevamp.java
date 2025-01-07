package org.labkey.wnprc_ehr.notification;

import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.Sort;
import org.labkey.api.module.Module;
import org.labkey.api.security.User;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;

public class ClinpathResultAlertsRevamp extends AbstractEHRNotification {
    // Class Variables
    NotificationToolkit notificationToolkit = new NotificationToolkit();
    NotificationToolkit.DateToolkit dateToolkit = new NotificationToolkit.DateToolkit();
    NotificationToolkit.StyleToolkit styleToolkit = new NotificationToolkit.StyleToolkit();





    // Constructors
    /**
     * This constructor is used to register the notification in WNPRC_EHRModule.java.
     * @param owner
     */
    public ClinpathResultAlertsRevamp(Module owner) {super(owner);}





    // Notification Details
    @Override
    public String getName() {
        return "Clinpath Result Alerts Revamp";
    }
    @Override
    public String getDescription() {
        return "This report is designed to identify potential problems related to clinpath.";
    }
    @Override
    public String getEmailSubject(Container c) {
        return "New Clinpath Results: " + dateToolkit.getCurrentTime();
    }
    @Override
    public String getScheduleDescription() {
        return "Daily at 10:00am";
    }
    @Override
    public String getCronString() {
        return notificationToolkit.createCronString("0", "10", "*");
    }
    @Override
    public String getCategory() {
        return "Revamped Notifications";
    }





    // Message Creation
    @Override
    public String getMessageBodyHTML(Container c, User u) {
        // Creates variables & retrieves data.
        final StringBuilder messageBody = new StringBuilder();

        // Creates CSS.
        messageBody.append(styleToolkit.beginStyle());
        messageBody.append(styleToolkit.setBasicTableStyle());
        messageBody.append(styleToolkit.setHeaderRowBackgroundColor("#d9d9d9"));
        messageBody.append(styleToolkit.endStyle());

        // Creates filter.
        SimpleFilter myFilter = new SimpleFilter("qcstate/PublicData", true, CompareType.EQUAL);
        myFilter.addCondition("taskid/datecompleted", dateToolkit.getDateXDaysFromNow(-1), CompareType.DATE_GTE);
        myFilter.addCondition("taskid/datecompleted", "", CompareType.NONBLANK);
        // Creates sort.
        Sort mySort = new Sort("Id,date");
        // Creates columns to retrieve.
        String[] targetColumns = new String[]{"Id", "date", "Id/curLocation/area", "Id/curLocation/room", "Id/curLocation/cage", "serviceRequested", "requestid/description", "reviewedBy", "dateReviewed"};
        // Runs query.
        ArrayList<HashMap<String, String>> returnArray = notificationToolkit.getTableMultiRowMultiColumnWithFieldKeys(c, u, "study", "Clinpath Runs", myFilter, mySort, targetColumns);
        // Creates URL.
        String viewQueryURL = notificationToolkit.createQueryURL(c, "execute", "study", "Clinpath Runs", myFilter);

        // Creates filtered list.
        HashMap<String, HashMap<String, ArrayList<HashMap<String, String>>>> filteredResults = new HashMap<>(); // Areas > Rooms > Results List > Result

        // Begins message info.
        messageBody.append("This email contains clinpath results entered since: " + dateToolkit.getDateXDaysFromNow(-1) + ".<p>");

        // Displays if there is no data.
        if (returnArray.isEmpty()) {
            messageBody.append("No requests have been completed.<br><hr>\n");
        }
        // Displays if there IS data.
        else {
            // Updates message info.
            messageBody.append("There are " + returnArray.size() + " completed requests since " + dateToolkit.getDateXDaysFromNow(-1) + ".  ");
            messageBody.append("Below is a summary.  Click the animal ID for more detail.  <br>");
            messageBody.append(notificationToolkit.createHyperlink("Click here to view them.", viewQueryURL) + "<p>\n");

            // Sorts results into a list filtered by room & area.
            for (HashMap<String, String> result : returnArray) {
                // Updates current area if empty.
                if (result.get("Id/curLocation/area").isEmpty()) {
                    result.put("Id/curLocation/area", "No Active Housing");
                }
                // Updates current room if empty.
                if (result.get("Id/curLocation/room").isEmpty()) {
                    result.put("Id/curLocation/room", "No Room");
                }
                // Adds line separators when there are multiple values.
                if (!result.get("requestid/description").isEmpty()) {
                    String rawDescription = result.get("requestid/description");
                    String parsedDescription = rawDescription.replace(",", ",<br>\n");
                    result.put("requestid/description", parsedDescription);
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

            // Creates a table from the data.
            String[] tableColumns = new String[]{"Id", "Collect Date", "Service Requested", "Requestor", "Date Reviewed", "Reviewed By"};
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
                                currentRow.get("serviceRequested"),
                                currentRow.get("requestid/description"),
                                currentRow.get("dateReviewed"),
                                currentRow.get("reviewedBy"),
                        };
                        currentTableData.add(newTableRow);

                        if (currentRow.get("reviewedBy").isBlank()) {
                            rowColorsList.add("red");
                        }
                        else {
                            rowColorsList.add("white");
                        }
                    }

                    // Displays table.
                    NotificationToolkit.NotificationRevampTable myTable = new NotificationToolkit.NotificationRevampTable(tableColumns, currentTableData);
                    myTable.rowColors = rowColorsList;
                    messageBody.append(myTable.createBasicHTMLTable());
                }
            }
        }

        return messageBody.toString();
    }

}
