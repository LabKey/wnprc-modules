/*
 * Copyright (c) 2025-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.labkey.wnprc_ehr.notification;

import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.Sort;
import org.labkey.api.module.Module;
import org.labkey.api.security.User;

import java.util.ArrayList;
import java.util.HashMap;

public class OverdueWeightAlertsRevamp extends AbstractEHRNotification {
    // Class Variables
    NotificationToolkit notificationToolkit = new NotificationToolkit();
    NotificationToolkit.DateToolkit dateToolkit = new NotificationToolkit.DateToolkit();
    NotificationToolkit.StyleToolkit styleToolkit = new NotificationToolkit.StyleToolkit();




    // Constructors
    /**
     * This constructor is used to register the notification in WNPRC_EHRModule.java.
     * @param owner
     */
    public OverdueWeightAlertsRevamp(Module owner) {super(owner);}





    // Notification Details
    @Override
    public String getName() {
        return "Overdue Weight Alerts Revamp";
    }
    @Override
    public String getDescription() {
        return "This email contains alerts of animals not weighed in the past 60 days.  It was run on: " + dateToolkit.getCurrentTime() + ".<p>";
    }
    @Override
    public String getEmailSubject(Container c) {
        return "Overdue Weights:" + dateToolkit.getCurrentTime();
    }
    @Override
    public String getScheduleDescription() {
        return "Daily at 9:15am";
    }
    @Override
    public String getCronString() {
        return notificationToolkit.createCronString("15", "9", "*");
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
        OverdueWeightAlertsObject myOverdueWeightAlertsObject = new OverdueWeightAlertsObject(c, u);

        // Creates CSS.
        messageBody.append(styleToolkit.beginStyle());
        messageBody.append(styleToolkit.setBasicTableStyle());
        messageBody.append(styleToolkit.setHeaderRowBackgroundColor("#d9d9d9"));
        messageBody.append(styleToolkit.endStyle());

        // Lists all living animals without a weight.
        messageBody.append("<b>Living animals without a weight:</b><br>");
        if (myOverdueWeightAlertsObject.livingAnimalsWithoutWeight.isEmpty()) {
            messageBody.append("There are no living animals without a weight.<hr>");
        }
        else {
            for (HashMap<String, String> result : myOverdueWeightAlertsObject.livingAnimalsWithoutWeight) {
                messageBody.append(result.get("id") + "<br>");
            }
            messageBody.append(notificationToolkit.createHyperlink("Click here to view these animals</p><hr>", myOverdueWeightAlertsObject.livingAnimalsWithoutWeightURL));
        }

        // Lists all animals not weighed in the past 60 days.
        if (!myOverdueWeightAlertsObject.animalsNotWeighedInPastSixtyDays.isEmpty()) {
            messageBody.append("<b>WARNING: The following animals have not been weighed in the past 60 days:</b><br>");
            messageBody.append(notificationToolkit.createHyperlink("Click here to view them<p>\n", myOverdueWeightAlertsObject.animalsNotWeighedInPastSixtyDaysURL));

            // Prints table with all records.
            String[] tableColumns = new String[]{"Cage", "Id", "Days Since Weight"};
            for (String currentArea : notificationToolkit.sortSetWithNulls(myOverdueWeightAlertsObject.animalsNotWeighedInPastSixtyDays.keySet())) {
                messageBody.append("<b>" + currentArea + ":</b><br>\n");
                for (String currentRoom : notificationToolkit.sortSetWithNulls(myOverdueWeightAlertsObject.animalsNotWeighedInPastSixtyDays.get(currentArea).keySet())) {
                    messageBody.append(currentRoom + ":<br>\n");
                    // Reformats the hashmap into a String[] List (to be compatible with the table creation function).
                    ArrayList<String []> currentTableData = new ArrayList<>();
                    for (HashMap<String, String> currentRow : myOverdueWeightAlertsObject.animalsNotWeighedInPastSixtyDays.get(currentArea).get(currentRoom)) {
                        String[] newTableRow = new String[] {
                                currentRow.get("Id/curLocation/cage"),
                                currentRow.get("Id"),
                                currentRow.get("Id/MostRecentWeight/DaysSinceWeight")
                        };
                        currentTableData.add(newTableRow);
                    }

                    // Displays table.
                    NotificationToolkit.NotificationRevampTable myTable = new NotificationToolkit.NotificationRevampTable(tableColumns, currentTableData);
                    messageBody.append(myTable.createBasicHTMLTable());
                }
            }
        }

        return messageBody.toString();
    }

    public static class OverdueWeightAlertsObject {
        Container c;
        User u;
        NotificationToolkit notificationToolkit = new NotificationToolkit();
        NotificationToolkit.DateToolkit dateToolkit = new NotificationToolkit.DateToolkit();

        // Constructor function.
        public OverdueWeightAlertsObject(Container currentContainer, User currrentUser) {
            this.c = currentContainer;
            this.u = currrentUser;
            this.getLivingAnimalsWithoutWeight();
            this.getAnimalsNotWeighedInPastSixtyDays();
        }

        // Find all living animals without a weight.
        ArrayList<HashMap<String, String>> livingAnimalsWithoutWeight;                                   // id
        String livingAnimalsWithoutWeightURL;                                                           // url string (view)
        private void getLivingAnimalsWithoutWeight() {
            //Creates filter.
            SimpleFilter myFilter = new SimpleFilter("calculated_status", "Alive", CompareType.EQUAL);
            myFilter.addCondition("Id/MostRecentWeight/MostRecentWeightDate", "", CompareType.ISBLANK);
            //Creates sort.
            Sort mySort = new Sort("Id");
            // Creates columns to retrieve.
            String[] targetColumns = new String[]{"id"};
            //Runs query.
            ArrayList<HashMap<String, String>> returnArray = notificationToolkit.getTableMultiRowMultiColumnWithFieldKeys(c, u, "study", "Demographics", myFilter, mySort, targetColumns);

            //Creates URL.
            String viewQueryURL = notificationToolkit.createQueryURL(c, "execute", "study", "Demographics", myFilter);

            //Returns data.
            this.livingAnimalsWithoutWeight = returnArray;
            this.livingAnimalsWithoutWeightURL = viewQueryURL.toString();
        }

        // Find animals not weighed in the past 60 days.
        HashMap<String, HashMap<String, ArrayList<HashMap<String, String>>>>  animalsNotWeighedInPastSixtyDays;     // Areas > Rooms > Results List > Result
        String animalsNotWeighedInPastSixtyDaysURL;                                                                 // url string (view)
        private void getAnimalsNotWeighedInPastSixtyDays() {
            // Creates filter.
            SimpleFilter myFilter = new SimpleFilter("calculated_status", "Alive", CompareType.EQUAL);
            myFilter.addCondition("Id/MostRecentWeight/DaysSinceWeight", 60, CompareType.GT);
            //Creates sort.
            Sort mySort = new Sort("Id");
            // Creates columns to retrieve.
            String[] targetColumns = new String[]{"Id/curLocation/cage", "Id", "Id/MostRecentWeight/DaysSinceWeight", "Id/curLocation/area", "Id/curLocation/room"};
            //Runs query.
            ArrayList<HashMap<String, String>> returnArray = notificationToolkit.getTableMultiRowMultiColumnWithFieldKeys(c, u, "study", "Demographics", myFilter, mySort, targetColumns);

            //Creates URL.
            String viewQueryURL = notificationToolkit.createQueryURL(c, "execute", "study", "Demographics", myFilter);
            // TODO: I do not add the 'Weight Detail' qview filter on the original .pl script.  Verify it still works correctly.

            // Organizes results into a list filtered by [Area > Room > Cage/ID/DaysSinceWeight]
            HashMap<String, HashMap<String, ArrayList<HashMap<String, String>>>> filteredResults = new HashMap<>(); // Areas > Rooms > Results List > Result
            for (HashMap<String, String> result : returnArray) {
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

            //Returns data.
            this.animalsNotWeighedInPastSixtyDays = filteredResults;
            this.animalsNotWeighedInPastSixtyDaysURL = viewQueryURL.toString();
        }
    }
}
