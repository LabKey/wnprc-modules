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
import java.util.Date;
import java.util.HashMap;

public class WeightAlertsRevamp extends AbstractEHRNotification {
    // Class Variables
    NotificationToolkit notificationToolkit = new NotificationToolkit();
    NotificationToolkit.DateToolkit dateToolkit = new NotificationToolkit.DateToolkit();
    NotificationToolkit.StyleToolkit styleToolkit = new NotificationToolkit.StyleToolkit();





    // Constructors
    /**
     * This constructor is used to register the notification in WNPRC_EHRModule.java.
     * @param owner
     */
    public WeightAlertsRevamp(Module owner) {super(owner);}




    // Notification Details
    @Override
    public String getName() {
        return "Weight Alerts Revamp";
    }
    @Override
    public String getDescription() {
        return "This email contains alerts of weight changes of +/- 10% or greater.  It was run on: " + dateToolkit.getCurrentTime() + ".<p>";
    }
    @Override
    public String getEmailSubject(Container c) {
        return "Weight Alerts:" + dateToolkit.getCurrentTime();
    }
    @Override
    public String getScheduleDescription() {
        return "Daily at 3:10pm";
    }
    @Override
    public String getCronString() {
        return notificationToolkit.createCronString("10", "3", "*");
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
        WeightAlertsObject myWeightAlertsObject = new WeightAlertsObject(c, u);

        // Creates CSS.
        messageBody.append(styleToolkit.beginStyle());
        messageBody.append(styleToolkit.setBasicTableStyle());
        messageBody.append(styleToolkit.setHeaderRowBackgroundColor("#d9d9d9"));
        messageBody.append(styleToolkit.endStyle());

        // Begins message.
        messageBody.append("This email contains alerts of weight changes of +/- 10% or greater.  It was run on: " + dateToolkit.getCurrentTime() + ".<p>");

        // Checks of living animals without a weight.
        messageBody.append("<b>Living animals without a weight:</b><br>");
        if (myWeightAlertsObject.livingAnimalsWithoutWeight.isEmpty()) {
            messageBody.append("There are no living animals without a weight.<hr>");
        }
        else {
            for (HashMap<String, String> result : myWeightAlertsObject.livingAnimalsWithoutWeight) {
                messageBody.append(result.get("Id") + "<br>");
            }
            messageBody.append("<p>" + notificationToolkit.createHyperlink("Click here to view these animals", myWeightAlertsObject.livingAnimalsWithoutWeightURL) + "</p>");
            messageBody.append("<hr>");
        }

        // Checks for significant weight changes in the past 30 days.
        String[] changeTypes = new String[]{"negative", "positive"};
        for (String changeType : changeTypes) {
            // Prints header.
            if (changeType.equals("negative")) {
                messageBody.append("<b>Weights since " + dateToolkit.getDateXDaysFromNow(-3) + " representing changes of -10% in the past 30 days:</b><br>");
            }
            else if (changeType.equals("positive")) {
                messageBody.append("<b>Weights since " + dateToolkit.getDateXDaysFromNow(-3) + " representing changes of +10% in the past 30 days:</b><br>");
            }

            // Creates the current weight change sorted by (area --> room --> result).
            ArrayList<HashMap<String, String>> currentResultList = new ArrayList<>();
            if (changeType.equals("negative")) {
                currentResultList = myWeightAlertsObject.negativeTenWeightChangesInPastThreeDays;
            }
            else if (changeType.equals("positive")) {
                currentResultList = myWeightAlertsObject.positiveTenWeightChangesInPastThreeDays;
            }

            if (currentResultList.isEmpty()) {
                messageBody.append("There are no changes during this period.<hr>");
            }
            else {
                // Reformats the weight change hashmap into a String[] List (to be compatible with the table creation function).
                ArrayList<String []> formattedResults = new ArrayList<>();
                String[] targetColumns = new String[]{"Id", "Area", "Room", "Cage", "Current Weight (kg)", "Weight Date", "Previous Weight (kg)", "Date", "Percent Change", "Days Between"};
                for (HashMap<String, String> currentWeightChange : currentResultList) {
                    String[] newTableRow = new String[]{
                            currentWeightChange.get("Id"),
                            currentWeightChange.get("Id/curLocation/area"),
                            currentWeightChange.get("Id/curLocation/room"),
                            currentWeightChange.get("Id/curLocation/cage"),
                            currentWeightChange.get("LatestWeight"),
                            currentWeightChange.get("LatestWeightDate"),
                            currentWeightChange.get("weight"),
                            currentWeightChange.get("date"),
                            currentWeightChange.get("PctChange"),
                            currentWeightChange.get("IntervalInDays"),
                    };
                    formattedResults.add(newTableRow);
                }
                // Displays table with results.
                NotificationToolkit.NotificationRevampTable myTable = new NotificationToolkit.NotificationRevampTable(targetColumns, formattedResults);
                messageBody.append(myTable.createBasicHTMLTable());
            }
        }

        return messageBody.toString();
    }





    // Gets all info for Weight Alerts.
    public static class WeightAlertsObject {
        //Set up.
        NotificationToolkit notificationToolkit = new NotificationToolkit();
        NotificationToolkit.DateToolkit dateToolkit = new NotificationToolkit.DateToolkit();

        // Creates constructor.
        WeightAlertsObject(Container c, User u) {
            getLivingAnimalsWithoutWeight(c, u);
            getNegativeTenWeightChangesInPastThreeDays(c, u);
            getPositiveTenWeightChangesInPastThreeDays(c, u);
        }

        // Gets all living animals without a weight.
        ArrayList<HashMap<String, String>> livingAnimalsWithoutWeight;
        String livingAnimalsWithoutWeightURL;
        private void getLivingAnimalsWithoutWeight(Container c, User u) {
            // Creates filter.
            SimpleFilter myFilter = new SimpleFilter("calculated_status", "Alive", CompareType.EQUAL);
            myFilter.addCondition("Id/MostRecentWeight/MostRecentWeightDate", "", CompareType.ISBLANK);
            // Creates columns to retrieve.
            String[] targetColumns = new String[]{"Id"};
            // Runs query.
            ArrayList<HashMap<String, String>> returnArray = notificationToolkit.getTableMultiRowMultiColumnWithFieldKeys(c, u, "study", "Demographics", myFilter, null, targetColumns);

            // Assigns data.
            this.livingAnimalsWithoutWeight = returnArray;
            this.livingAnimalsWithoutWeightURL = notificationToolkit.createQueryURL(c, "execute", "study", "Demographics", myFilter);
        }

        ArrayList<HashMap<String, String>> negativeTenWeightChangesInPastThreeDays;
        private void getNegativeTenWeightChangesInPastThreeDays(Container c, User u) {
            // Creates filter.
            SimpleFilter myFilter = new SimpleFilter("Id/DataSet/Demographics/calculated_status", "Alive", CompareType.EQUAL);
            myFilter.addCondition("PctChange", -10, CompareType.LTE);
            myFilter.addCondition("LatestWeightDate", dateToolkit.getDateXDaysFromNow(-3), CompareType.DATE_GTE);
            myFilter.addCondition("IntervalInDays", 0, CompareType.GTE);
            myFilter.addCondition("IntervalInDays", 30, CompareType.LTE);
            // Creates columns to retrieve.
            String[] targetColumns = new String[]{"Id", "Id/curLocation/area", "Id/curLocation/room", "Id/curLocation/cage", "LatestWeightDate", "LatestWeight", "date", "weight", "PctChange", "IntervalInDays"};
            // Creates sort.
            Sort mySort = new Sort("+Id/curLocation/area,+Id/curLocation/room,+Id/curLocation/cage,+Id");

            // Runs query.
            ArrayList<HashMap<String, String>> returnArray = notificationToolkit.getTableMultiRowMultiColumnWithFieldKeys(c, u, "study", "weightRelChange", myFilter, mySort, targetColumns);

            // Assigns data.
            this.negativeTenWeightChangesInPastThreeDays = returnArray;
        }

        ArrayList<HashMap<String, String>> positiveTenWeightChangesInPastThreeDays;
        private void getPositiveTenWeightChangesInPastThreeDays(Container c, User u) {
            // Creates filter.
            SimpleFilter myFilter = new SimpleFilter("Id/DataSet/Demographics/calculated_status", "Alive", CompareType.EQUAL);
            myFilter.addCondition("PctChange", 10, CompareType.GTE);
            myFilter.addCondition("LatestWeightDate", dateToolkit.getDateXDaysFromNow(-3), CompareType.DATE_GTE);
            myFilter.addCondition("IntervalInDays", 0, CompareType.GTE);
            myFilter.addCondition("IntervalInDays", 30, CompareType.LTE);
            // Creates columns to retrieve.
            String[] targetColumns = new String[]{"Id", "Id/curLocation/area", "Id/curLocation/room", "Id/curLocation/cage", "LatestWeightDate", "LatestWeight", "date", "weight", "PctChange", "IntervalInDays"};
            // Creates sort.
            Sort mySort = new Sort("+Id/curLocation/area,+Id/curLocation/room,+Id/curLocation/cage,+Id");

            // Runs query.
            ArrayList<HashMap<String, String>> returnArray = notificationToolkit.getTableMultiRowMultiColumnWithFieldKeys(c, u, "study", "weightRelChange", myFilter, mySort, targetColumns);

            // Assigns data.
            this.positiveTenWeightChangesInPastThreeDays = returnArray;
        }


    }
}
