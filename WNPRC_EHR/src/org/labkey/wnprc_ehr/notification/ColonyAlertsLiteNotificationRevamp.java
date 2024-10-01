package org.labkey.wnprc_ehr.notification;

import org.labkey.api.data.Container;
import org.labkey.api.module.Module;
import org.labkey.api.security.User;

public class ColonyAlertsLiteNotificationRevamp extends AbstractEHRNotification {
    //Class Variables
    NotificationToolkit notificationToolkit = new NotificationToolkit();
    NotificationToolkit.StyleToolkit styleToolkit = new NotificationToolkit.StyleToolkit();
    NotificationToolkit.DateToolkit dateToolkit = new NotificationToolkit.DateToolkit();



    //Constructors
    /**
     * This constructor is used to register the notification in WNPRC_EHRModule.java.
     * @param owner
     */
    public ColonyAlertsLiteNotificationRevamp(Module owner) {super(owner);}



    //Notification Details
    @Override
    public String getName() {
        return "Colony Alerts Lite Revamp";
    }
    @Override
    public String getDescription() {
        return "The report is designed to identify potential problems with the colony, primarily related to weights, housing, and assignments.";
    }
    @Override
    public String getEmailSubject(Container c) {
        return "Colony Alerts: " + dateToolkit.getCurrentTime();
    }
    @Override
    public String getScheduleDescription() {
        return "Hourly from 9AM to 5PM";
    }
    @Override
    public String getCronString() {
        return notificationToolkit.createCronString("0", "9,10,11,12,13,14,15,16,17", "*");
    }
    @Override
    public String getCategory() {
        return "Revamped Notifications";
    }



    //Message Creation
    @Override
    public String getMessageBodyHTML(Container c, User u)
    {
        // Creates variables & gets data.
        StringBuilder messageBody = new StringBuilder();
        ColonyAlertsNotificationRevamp.ColonyInformationObject myColonyInformationObject = new ColonyAlertsNotificationRevamp.ColonyInformationObject(c, u, "colonyAlertLite");
        Boolean emptyMessage = true;

        // Begins message info.
        messageBody.append("<p>This email contains a series of automatic alerts about the WNPRC colony.  It was run on: " + dateToolkit.getCurrentTime() + ".<p>");

        // Creates message.
        // 1. Find all living animals with multiple active housing records.
        if (!myColonyInformationObject.livingAnimalsWithMultipleActiveHousingRecords.isEmpty()) {
            emptyMessage = false;
            messageBody.append("<b>WARNING: There are " + myColonyInformationObject.livingAnimalsWithMultipleActiveHousingRecords.size() + " animals with multiple active housing records:</b><br>");
            for (String result : myColonyInformationObject.livingAnimalsWithMultipleActiveHousingRecords) {
                messageBody.append(result + "<br>");
            }
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view these animals</p>", myColonyInformationObject.livingAnimalsWithMultipleActiveHousingRecordsURLView));
            messageBody.append(notificationToolkit.createHyperlink("Click here to edit housing to fix the problems<p>", myColonyInformationObject.livingAnimalsWithMultipleActiveHousingRecordsURLEdit));
            messageBody.append("<hr>");
        }
        // 2. Find all animals where the housing snapshot doesn't match the housing table.
        if (!myColonyInformationObject.livingAnimalsWhereHousingSnapshotDoesNotMatchHousingTable.isEmpty()) {
            emptyMessage = false;
            messageBody.append("<b>WARNING: There are " + myColonyInformationObject.livingAnimalsWhereHousingSnapshotDoesNotMatchHousingTable.size() + " animals where the housing snapshot doesn't match the housing table.  The snapshot has been automatically refreshed:</b><br>");
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view the report again</p>\n", myColonyInformationObject.livingAnimalsWhereHousingSnapshotDoesNotMatchHousingTableURLView));
            messageBody.append("<hr>");
        }
        // 3. Find all records with potential housing condition problems.
        if (!myColonyInformationObject.recordsWithPotentialHousingConditionProblems.isEmpty()) {
            emptyMessage = false;
            messageBody.append("<b>WARNING: There are " + myColonyInformationObject.recordsWithPotentialHousingConditionProblems.size() + " housing records with potential condition problems:</b><br>");
            for (String result : myColonyInformationObject.recordsWithPotentialHousingConditionProblems) {
                messageBody.append(result + "<br>");
            }
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view these records</p>", myColonyInformationObject.recordsWithPotentialHousingConditionProblemsURLView));
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to edit housing to fix the problems</p>", myColonyInformationObject.recordsWithPotentialHousingConditionProblemsURLEdit));
            messageBody.append("<hr>");
        }
        // 4. Find non-continguous housing records.
        if (!myColonyInformationObject.nonContiguousHousingRecords.isEmpty()) {
            emptyMessage = false;
            messageBody.append("<b>WARNING: There are " + myColonyInformationObject.nonContiguousHousingRecords.size() + " housing records since " + dateToolkit.getCalendarDateToday() + " that do not have a contiguous previous or next record.</b><br>");
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view and update them<br>\n", myColonyInformationObject.nonContiguousHousingRecordsURLView));
            messageBody.append("<hr>\n");
        }
        // 5. Find open housing records where the animal is not alive.
        if (!myColonyInformationObject.openHousingRecordsWhereAnimalIsNotAlive.isEmpty()) {
            emptyMessage = false;
            messageBody.append("<b>WARNING: There are " + myColonyInformationObject.openHousingRecordsWhereAnimalIsNotAlive.size() + " active housing records where the animal is not alive:</b><br>");
            for (String result : myColonyInformationObject.openHousingRecordsWhereAnimalIsNotAlive) {
                messageBody.append(result + "<br>");
            }
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view and update them</p>", myColonyInformationObject.openHousingRecordsWhereAnimalIsNotAliveURLView));
            messageBody.append("<hr>\n");
        }
        // 6. Find living animals without an active housing record.
        if (!myColonyInformationObject.livingAnimalsWithoutActiveHousingRecord.isEmpty()) {
            emptyMessage = false;
            messageBody.append("<b>WARNING: There are " + myColonyInformationObject.livingAnimalsWithoutActiveHousingRecord.size() + " living animals without an active housing record:</b><br>");
            for (String result : myColonyInformationObject.livingAnimalsWithoutActiveHousingRecord) {
                messageBody.append(result + "<br>");
            }
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view them<br>\n", myColonyInformationObject.livingAnimalsWithoutActiveHousingRecordURLView));
            messageBody.append("<hr>\n");
        }
        // 7. Find all records with problems in the calculated_status field.
        if (!myColonyInformationObject.recordsWithCalculatedStatusFieldProblems.isEmpty()) {
            emptyMessage = false;
            messageBody.append("<b>WARNING: There are " + myColonyInformationObject.recordsWithCalculatedStatusFieldProblems.size() + " animals with problems in the status field:</b><br>");
            for (String result : myColonyInformationObject.recordsWithCalculatedStatusFieldProblems) {
                messageBody.append(result + "<br>");
            }
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view these records</p>", myColonyInformationObject.recordsWithCalculatedStatusFieldProblemsURLView));
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to edit these records</p>", myColonyInformationObject.recordsWithCalculatedStatusFieldProblemsURLEdit));
//            messageBody.append("When you see these problems, it usually happens because the automatic process of calculating this field, which is triggered by births, deaths, departures or arrivals, didn't work right.  To force it to re-calculate, just edit the animal's record on one of these tables, maybe no changes, then hit submit.  That should force a re-calculation of the status field.<p>");
            messageBody.append("<hr>");
        }
        // 8. Find any active assignment where the animal is not alive.
        if (!myColonyInformationObject.activeAssignmentsWhereAnimalIsNotAlive.isEmpty()) {
            emptyMessage = false;
            messageBody.append("<b>WARNING: There are " + myColonyInformationObject.activeAssignmentsWhereAnimalIsNotAlive.size() + " active assignments for animals not currently at WNPRC.</b><br>");
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view and update them<br>\n", myColonyInformationObject.activeAssignmentsWhereAnimalIsNotAliveURLView));
            messageBody.append("<hr>\n");
        }
        // 9. Find any active assignment where the project lacks a valid protocol.
        if (!myColonyInformationObject.activeAssignmentsWhereProjectLacksValidProtocol.isEmpty()) {
            emptyMessage = false;
            messageBody.append("<b>WARNING: There are " + myColonyInformationObject.activeAssignmentsWhereProjectLacksValidProtocol.size() + " active assignments to a project without a valid protocol.</b><br>");
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view them<br>\n", myColonyInformationObject.activeAssignmentsWhereProjectLacksValidProtocolURLView));
            messageBody.append("<hr>\n");
        }
        // 10. Find any duplicate active assignments.
        if (!myColonyInformationObject.duplicateActiveAssignments.isEmpty()) {
            emptyMessage = false;
            messageBody.append("<b>WARNING: There are " + myColonyInformationObject.duplicateActiveAssignments.size() + " animals double assigned to the same project.</b><br>");
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view them<br>\n", myColonyInformationObject.duplicateActiveAssignmentsURLView));
            messageBody.append("<hr>\n");
        }

        //Returns string.
        if (emptyMessage == false) {
            return messageBody.toString();
        }
        else {
            notificationToolkit.sendEmptyNotificationRevamp(c, u, "Colony Alerts Lite");
            return null;
        }

    }
}