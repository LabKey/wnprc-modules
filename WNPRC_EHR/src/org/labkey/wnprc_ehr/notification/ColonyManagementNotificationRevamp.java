package org.labkey.wnprc_ehr.notification;

import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.Sort;
import org.labkey.api.module.Module;
import org.labkey.api.security.User;
import org.labkey.api.util.Path;
import org.labkey.api.view.ActionURL;

import java.util.ArrayList;
import java.util.HashMap;

public class ColonyManagementNotificationRevamp extends AbstractEHRNotification {
    //Class Variables
    NotificationToolkit notificationToolkit = new NotificationToolkit();
    NotificationToolkit.StyleToolkit styleToolkit = new NotificationToolkit.StyleToolkit();
    NotificationToolkit.DateToolkit dateToolkit = new NotificationToolkit.DateToolkit();



    //Constructors
    /**
     * This constructor is used to register the notification in WNPRC_EHRModule.java.
     * @param owner
     */
    public ColonyManagementNotificationRevamp(Module owner) {super(owner);}



    //Notification Details
    @Override
    public String getName() {
        return "Colony Management Alerts Revamp";
    }
    @Override
    public String getDescription() {
        return "The report is designed to identify potential problems with the colony, primarily related to weights, housing and assignments.";
    }
    @Override
    public String getEmailSubject(Container c) {
        return "Daily Colony Management Alerts: " + dateToolkit.getCurrentTime();
    }
    @Override
    public String getScheduleDescription() {
        return "Daily at 5:15AM";
    }
    @Override
    public String getCronString() {
        return notificationToolkit.createCronString("15", "5", "*");
    }
    @Override
    public String getCategory() {
        return "Revamped Notifications";
    }



    //Message Creation
    @Override
    public String getMessageBodyHTML(Container c, User u) {
        // Creates variables & gets data.
        StringBuilder messageBody = new StringBuilder();
        ColonyAlertsNotificationRevamp.ColonyInformationObject myColonyInformationObject = new ColonyAlertsNotificationRevamp.ColonyInformationObject(c, u, "colonyManagement");

        // Creates CSS.
        messageBody.append(styleToolkit.beginStyle());
        messageBody.append(styleToolkit.setBasicTableStyle());
        messageBody.append(styleToolkit.setHeaderRowBackgroundColor("#d9d9d9"));
        messageBody.append(styleToolkit.endStyle());

        // Begins message info.
        messageBody.append("<p>This email contains a series of automatic alerts about the WNPRC colony.  It was run on: " + dateToolkit.getCurrentTime() + ".<p>");

        // Creates message.
        // 1. Find all living animals without a weight.
        if (!myColonyInformationObject.livingAnimalsWithoutWeight.isEmpty()) {
            messageBody.append("<b>WARNING: The following animals do not have a weight:</b><br>");
            for (String result : myColonyInformationObject.livingAnimalsWithoutWeight) {
                messageBody.append(result + "<br>");
            }
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view these animals</p>", myColonyInformationObject.livingAnimalsWithoutWeightURL));
            messageBody.append("<hr>");
        }
        // 2. Find all occupied cages without dimensions.
        if (!myColonyInformationObject.occupiedCagesWithoutDimensions.isEmpty()) {
            messageBody.append("<b>WARNING: The following cages have animals, but do not have known dimensions:</b><br>");
            for (String[] result : myColonyInformationObject.occupiedCagesWithoutDimensions) {
                messageBody.append(result[0] + "/" + result[1]);
            }
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view the problem cages</p>", myColonyInformationObject.occupiedCagesWithoutDimensionsURLView));
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to edit the cage list and fix the problem</p>", myColonyInformationObject.occupiedCagesWithoutDimensionsURLEdit));
            messageBody.append("<hr>");
        }
        // 3. List all animals in pc.
        if (!myColonyInformationObject.livingAnimalsInProtectedContact.isEmpty()) {
            messageBody.append("<b>WARNING: The following animals are listed in protected contact, but do not appear to have an adjacent pc animal:</b><br>");
            for (String[] result : myColonyInformationObject.livingAnimalsInProtectedContact) {
                messageBody.append(result[0] + ";" + result[2] + ":" + result[1] + "<br>");
            }
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view all pc animals</p>\n", myColonyInformationObject.livingAnimalsInProtectedContactURLView));
            messageBody.append("<hr>");
        }
        // 4. Find all records with potential housing condition problems.
        if (!myColonyInformationObject.recordsWithPotentialHousingConditionProblems.isEmpty()) {
            messageBody.append("<b>WARNING: There are " + myColonyInformationObject.recordsWithPotentialHousingConditionProblems.size() + " housing records with potential condition problems:</b><br>");
            for (String result : myColonyInformationObject.recordsWithPotentialHousingConditionProblems) {
                messageBody.append(result + "<br>");
            }
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view these records</p>", myColonyInformationObject.recordsWithPotentialHousingConditionProblemsURLView));
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to edit housing to fix the problems</p>", myColonyInformationObject.recordsWithPotentialHousingConditionProblemsURLEdit));
            messageBody.append("<hr>");
        }
        // 5. Find all animals with cage size problems.
        if (!myColonyInformationObject.cagesWithSizeProblems.isEmpty()) {
            messageBody.append("<b>WARNING: The following cages are too small for the animas currently in them:</b><br>");
            for (String result : myColonyInformationObject.cagesWithSizeProblems) {
                messageBody.append(result + "<br>");
            }
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view these cages</p>\n", myColonyInformationObject.cagesWithSizeProblemsURLView));
            messageBody.append("<hr>");
        }
        // 6. Find all animals lacking any assignments.
        if (!myColonyInformationObject.animalsLackingAssignments.isEmpty()) {
            messageBody.append("<b>WARNING: There are " + myColonyInformationObject.animalsLackingAssignments.size() + " living animals without any active assignments:</b><br>");
            for (String result : myColonyInformationObject.animalsLackingAssignments) {
                messageBody.append(result + "<br>");
            }
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view these animals</p>", myColonyInformationObject.animalsLackingAssignmentsURLView));
            messageBody.append("<hr>");
        }
        // 7. Find any active assignment where the animal is not alive.
        if (!myColonyInformationObject.activeAssignmentsWhereAnimalIsNotAlive.isEmpty()) {
            messageBody.append("<b>WARNING: There are " + myColonyInformationObject.activeAssignmentsWhereAnimalIsNotAlive.size() + " active assignments for animals not currently at WNPRC.</b><br>");
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view and update them<br>\n", myColonyInformationObject.activeAssignmentsWhereAnimalIsNotAliveURLView));
            messageBody.append("<hr>\n");
        }
        // 8.Find any active assignment where the project lacks a valid protocol.
        if (!myColonyInformationObject.activeAssignmentsWhereProjectLacksValidProtocol.isEmpty()) {
            messageBody.append("<b>WARNING: There are " + myColonyInformationObject.activeAssignmentsWhereProjectLacksValidProtocol.size() + " active assignments to a project without a valid protocol.</b><br>");
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view them<br>\n", myColonyInformationObject.activeAssignmentsWhereProjectLacksValidProtocolURLView));
            messageBody.append("<hr>\n");
        }
        // 9. Find any duplicate active assignments.
        if (!myColonyInformationObject.duplicateActiveAssignments.isEmpty()) {
            messageBody.append("<b>WARNING: There are " + myColonyInformationObject.duplicateActiveAssignments.size() + " animals double assigned to the same project.</b><br>");
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view them<br>\n", myColonyInformationObject.duplicateActiveAssignmentsURLView));
            messageBody.append("<hr>\n");
        }
        // 10. Find animals with hold codes, but not on pending.
        if (!myColonyInformationObject.animalsWithHoldCodesNotPending.isEmpty()) {
            messageBody.append("<b>WARNING: There are " + myColonyInformationObject.animalsWithHoldCodesNotPending.size() + " animals with a hold code, but not on the pending project.</b><br>");
            for (String[] result : myColonyInformationObject.animalsWithHoldCodesNotPending) {
                messageBody.append(result[0] + " (" + result[1] + ")<br>");
            }
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view them<br>\n", myColonyInformationObject.animalsWithHoldCodesNotPendingURLView));
            messageBody.append("<hr>\n");
        }
        // 11. Find protocols nearing the animal limit. (26)
        if (!myColonyInformationObject.protocolsNearingAnimalLimitCount.isEmpty()) {
            messageBody.append("<b>WARNING: There are " + myColonyInformationObject.protocolsNearingAnimalLimitCount.size() + " protocols with fewer than 5 remaining animals.</b><br>");
            String[] myTableColumns = new String[]{"Protocol", "PI", "Species", "# Allowed", "# Remining", "% Used"};
            ArrayList<String[]> myTableData = new ArrayList<>();
            for (HashMap<String, String> result : myColonyInformationObject.protocolsNearingAnimalLimitCount) {
                String[] myTableRow = new String[]{
                        result.get("protocol"),
                        result.get("protocol/inves"),
                        result.get("Species"),
                        result.get("allowed"),
                        result.get("TotalRemaining"),
                        result.get("PercentUsed")
                };
                myTableData.add(myTableRow);
            }
            NotificationToolkit.NotificationRevampTable myTable = new NotificationToolkit.NotificationRevampTable(myTableColumns, myTableData);
            messageBody.append(myTable.createBasicHTMLTable());
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view them<br>\n", myColonyInformationObject.protocolsNearingAnimalLimitCountURLView));
            messageBody.append("<hr>\n");
        }
        // 12. Find protocols nearing the animal limit. (27)
        if (!myColonyInformationObject.protocolsNearingAnimalLimitPercentage.isEmpty()) {
            messageBody.append("<b>WARNING: There are " + myColonyInformationObject.protocolsNearingAnimalLimitPercentage.size() + " protocols with fewer than 5% of their animals remaining.</b><br>");
            String[] myTableColumns = new String[]{"Protocol", "PI", "Species", "# Allowed", "# Remining", "% Used"};
            ArrayList<String[]> myTableData = new ArrayList<>();
            for (HashMap<String, String> result : myColonyInformationObject.protocolsNearingAnimalLimitPercentage) {
                String[] myTableRow = new String[]{
                        result.get("protocol"),
                        result.get("protocol/inves"),
                        result.get("Species"),
                        result.get("allowed"),
                        result.get("TotalRemaining"),
                        result.get("PercentUsed")
                };
                myTableData.add(myTableRow);
            }
            NotificationToolkit.NotificationRevampTable myTable = new NotificationToolkit.NotificationRevampTable(myTableColumns, myTableData);
            messageBody.append(myTable.createBasicHTMLTable());
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view them<br>\n", myColonyInformationObject.protocolsNearingAnimalLimitPercentageURLView));
            messageBody.append("<hr>\n");
        }
        return messageBody.toString();
    }
}
