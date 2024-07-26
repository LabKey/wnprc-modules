package org.labkey.wnprc_ehr.notification;

import org.checkerframework.checker.units.qual.A;
import org.labkey.api.action.Action;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.Parameter;
import org.labkey.api.data.Selector;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.Sort;
import org.labkey.api.data.Table;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.module.Module;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.reports.LabKeyScriptEngineManager;
import org.labkey.api.security.SecurityManager;
import org.labkey.api.security.User;
import org.labkey.api.util.FileUtil;
import org.labkey.api.util.Path;
import org.labkey.api.view.ActionURL;

import java.io.File;
import java.sql.Array;
import java.sql.ResultSet;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import org.labkey.api.data.ResultsImpl;
import org.labkey.api.data.Results;
import org.labkey.study.xml.Lab;

import javax.script.ScriptEngine;


/**
 * Created by Alex Schmidt on 12/27/23.
 */
public class ColonyAlertsNotificationRevamp extends AbstractEHRNotification {
    //Class Variables
    NotificationToolkit notificationToolkit = new NotificationToolkit();
    NotificationToolkit.StyleToolkit styleToolkit = new NotificationToolkit.StyleToolkit();
    NotificationToolkit.DateToolkit dateToolkit = new NotificationToolkit.DateToolkit();



    //Constructors
    /**
     * This constructor is used to register the notification in WNPRC_EHRModule.java.
     * @param owner
     */
    public ColonyAlertsNotificationRevamp(Module owner) {super(owner);}



    //Notification Details
    @Override
    public String getName() {
        return "Colony Alerts Revamp";
    }
    @Override
    public String getDescription() {
        return "The report is designed to identify potential problems with the colony, primarily related to weights, housing and assignments.";
    }
    @Override
    public String getEmailSubject(Container c) {
        return "Daily Colony Alerts: " + dateToolkit.getCurrentTime();
    }
    @Override
    public String getScheduleDescription() {
        return "Daily at 6AM";
    }
    @Override
    public String getCronString() {
        return notificationToolkit.createCronString("0", "6", "*");
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
        ColonyInformationObject myColonyAlertObject = new ColonyInformationObject(c, u, "colonyAlert");

        //Begins message info.
        messageBody.append("<p> This email contains a series of automatic alerts about the colony.  It was run on: " + dateToolkit.getCurrentTime() + ".</p>");

        //Creates message.
        //1. Find all living animals without a weight.
        if (!myColonyAlertObject.livingAnimalsWithoutWeight.isEmpty()) {
            messageBody.append("<b>WARNING: The following animals do not have a weight:</b><br>");
            for (String result : myColonyAlertObject.livingAnimalsWithoutWeight) {
                messageBody.append(result + "<br>");
            }
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view these animals</p>", myColonyAlertObject.livingAnimalsWithoutWeightURL));
            messageBody.append("<hr>");
        }
        //2. Find all occupied cages without dimensions.
        if (!myColonyAlertObject.occupiedCagesWithoutDimensions.isEmpty()) {
            messageBody.append("<b>WARNING: The following cages have animals, but do not have known dimensions:</b><br>");
            for (String[] result : myColonyAlertObject.occupiedCagesWithoutDimensions) {
                messageBody.append(result[0] + "/" + result[1]);
            }
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view the problem cages</p>", myColonyAlertObject.occupiedCagesWithoutDimensionsURLView));
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to edit the cage list and fix the problem</p>", myColonyAlertObject.occupiedCagesWithoutDimensionsURLEdit));
            messageBody.append("<hr>");
        }
        //3. List all animals in protected contact without an adjacent pc animal.
        if (!myColonyAlertObject.livingAnimalsInProtectedContact.isEmpty()) {
            messageBody.append("<b>WARNING: The following animals are listed in protected contact, but do not appear to have an adjacent pc animal:</b><br>");
            for (String[] result : myColonyAlertObject.livingAnimalsInProtectedContact) {
                messageBody.append(result[0] + ";" + result[2] + ":" + result[1] + "<br>");
            }
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view all pc animals</p>\n", myColonyAlertObject.livingAnimalsInProtectedContactURLView));
            messageBody.append("<hr>");
        }
        //4. Find all living animals with multiple active housing records.
        if (!myColonyAlertObject.livingAnimalsWithMultipleActiveHousingRecords.isEmpty()) {
            messageBody.append("<b>WARNING: There are " + myColonyAlertObject.livingAnimalsWithMultipleActiveHousingRecords.size() + " animals with multiple active housing records:</b><br>");
            for (String result : myColonyAlertObject.livingAnimalsWithMultipleActiveHousingRecords) {
                messageBody.append(result + "<br>");
            }
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view these animals</p>", myColonyAlertObject.livingAnimalsWithMultipleActiveHousingRecordsURLView));
            messageBody.append(notificationToolkit.createHyperlink("Click here to edit housing to fix the problems<p>", myColonyAlertObject.livingAnimalsWithMultipleActiveHousingRecordsURLEdit));
            messageBody.append("<hr>");
        }
        //5. Find all animals where the housing snapshot doesn't match the housing table.
        if (!myColonyAlertObject.livingAnimalsWhereHousingSnapshotDoesNotMatchHousingTable.isEmpty()) {
            messageBody.append("<b>WARNING: There are " + myColonyAlertObject.livingAnimalsWhereHousingSnapshotDoesNotMatchHousingTable.size() + " animals where the housing snapshot doesn't match the housing table.  The snapshot has been automatically refreshed:</b><br>");
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view the report again</p>\n", myColonyAlertObject.livingAnimalsWhereHousingSnapshotDoesNotMatchHousingTableURLView));
            messageBody.append("<hr>");
        }
        //6. Find all records with potential housing condition problems.
        if (!myColonyAlertObject.recordsWithPotentialHousingConditionProblems.isEmpty()) {
            messageBody.append("<b>WARNING: There are " + myColonyAlertObject.recordsWithPotentialHousingConditionProblems.size() + " housing records with potential condition problems:</b><br>");
            for (String result : myColonyAlertObject.recordsWithPotentialHousingConditionProblems) {
                messageBody.append(result + "<br>");
            }
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view these records</p>", myColonyAlertObject.recordsWithPotentialHousingConditionProblemsURLView));
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to edit housing to fix the problems</p>", myColonyAlertObject.recordsWithPotentialHousingConditionProblemsURLEdit));
            messageBody.append("<hr>");
        }
        //7. Find open housing records where the animal is not alive.
        if (!myColonyAlertObject.openHousingRecordsWhereAnimalIsNotAlive.isEmpty()) {
            messageBody.append("<b>WARNING: There are " + myColonyAlertObject.openHousingRecordsWhereAnimalIsNotAlive.size() + " active housing records where the animal is not alive:</b><br>");
            for (String result : myColonyAlertObject.openHousingRecordsWhereAnimalIsNotAlive) {
                messageBody.append(result + "<br>");
            }
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view and update them</p>", myColonyAlertObject.openHousingRecordsWhereAnimalIsNotAliveURLView));
            messageBody.append("<hr>\n");
        }
        //8. Find living animals without an active housing record.
        if (!myColonyAlertObject.livingAnimalsWithoutActiveHousingRecord.isEmpty()) {
            messageBody.append("<b>WARNING: There are " + myColonyAlertObject.livingAnimalsWithoutActiveHousingRecord.size() + " living animals without an active housing record:</b><br>");
            for (String result : myColonyAlertObject.livingAnimalsWithoutActiveHousingRecord) {
                messageBody.append(result + "<br>");
            }
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view them<br>\n", myColonyAlertObject.livingAnimalsWithoutActiveHousingRecordURLView));
            messageBody.append("<hr>\n");
        }
        //9. Find all records with problems in the calculated_status field.
        if (!myColonyAlertObject.recordsWithCalculatedStatusFieldProblems.isEmpty()) {
            messageBody.append("<b>WARNING: There are " + myColonyAlertObject.recordsWithCalculatedStatusFieldProblems.size() + " animals with problems in the status field:</b><br>");
            for (String result : myColonyAlertObject.recordsWithCalculatedStatusFieldProblems) {
                messageBody.append(result + "<br>");
            }
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view these records</p>", myColonyAlertObject.recordsWithCalculatedStatusFieldProblemsURLView));
            messageBody.append("When you see these problems, it usually happens because the automatic process of calculating this field, which is triggered by births, deaths, departures or arrivals, didn't work right.  To force it to re-calculate, just edit the animal's record on one of these tables, maybe no changes, then hit submit.  That should force a re-calculation of the status field.<p>");
            messageBody.append("<hr>");
        }
        //10. Find all animals lacking any assignments.
        if (!myColonyAlertObject.animalsLackingAssignments.isEmpty()) {
            messageBody.append("<b>WARNING: There are " + myColonyAlertObject.animalsLackingAssignments.size() + " living animals without any active assignments:</b><br>");
            for (String result : myColonyAlertObject.animalsLackingAssignments) {
                messageBody.append(result + "<br>");
            }
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view these animals</p>", myColonyAlertObject.animalsLackingAssignmentsURLView));
            messageBody.append("<hr>");
        }
        //11. Find any active assignment where the animal is not alive.
        if (!myColonyAlertObject.activeAssignmentsWhereAnimalIsNotAlive.isEmpty()) {
            messageBody.append("<b>WARNING: There are " + myColonyAlertObject.activeAssignmentsWhereAnimalIsNotAlive.size() + " active assignments for animals not currently at WNPRC.</b><br>");
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view and update them<br>\n", myColonyAlertObject.activeAssignmentsWhereAnimalIsNotAliveURLView));
            messageBody.append("<hr>\n");
        }
        //12. Find any active assignment where the project lacks a valid protocol.
        if (!myColonyAlertObject.activeAssignmentsWhereProjectLacksValidProtocol.isEmpty()) {
            messageBody.append("<b>WARNING: There are " + myColonyAlertObject.activeAssignmentsWhereProjectLacksValidProtocol.size() + " active assignments to a project without a valid protocol.</b><br>");
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view them<br>\n", myColonyAlertObject.activeAssignmentsWhereProjectLacksValidProtocolURLView));
            messageBody.append("<hr>\n");
        }
        //13. Find any duplicate active assignments.
        if (!myColonyAlertObject.duplicateActiveAssignments.isEmpty()) {
            messageBody.append("<b>WARNING: There are " + myColonyAlertObject.duplicateActiveAssignments.size() + " animals double assigned to the same project.</b><br>");
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view them<br>\n", myColonyAlertObject.duplicateActiveAssignmentsURLView));
            messageBody.append("<hr>\n");
        }
        //14. Find all living siv+ animals not exempt from pair housing (20060202).
        if (!myColonyAlertObject.livingSivPosAnimalsNotExemptFromPairHousing.isEmpty()) {
            messageBody.append("<b>WARNING: There are " + myColonyAlertObject.livingSivPosAnimalsNotExemptFromPairHousing.size() + " animals with SIV in the medical field, but not actively assigned to exempt from paired housing (20060202):</b><br>");
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view them</p>\n", myColonyAlertObject.livingSivPosAnimalsNotExemptFromPairHousingURLView));
            messageBody.append("<hr>");
        }
        //15. Find all living shiv+ animals not exempt from pair housing (20060202).
        if (!myColonyAlertObject.livingShivPosAnimalsNotExemptFromPairHousing.isEmpty()) {
            messageBody.append("<b>WARNING: There are " + myColonyAlertObject.livingShivPosAnimalsNotExemptFromPairHousing.size() + " animals with SHIV in the medical field, but not actively assigned to exempt from paired housing (20060202):</b><br>");
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view them</p>\n", myColonyAlertObject.livingShivPosAnimalsNotExemptFromPairHousingURLView));
            messageBody.append("<hr>");
        }
        //16. Find open-ended treatments where the animal is not alive.
        if (!myColonyAlertObject.openEndedTreatmentsWhereAnimalIsNotAlive.isEmpty()) {
            messageBody.append("<b>WARNING: There are " + myColonyAlertObject.openEndedTreatmentsWhereAnimalIsNotAlive.size() + " active treatments for animals not currently at WNPRC.</b><br>");
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view and update them<br\n>", myColonyAlertObject.openEndedTreatmentsWhereAnimalIsNotAliveURLView));
            messageBody.append("<hr\n>");
        }
        //17. Find open-ended problems where the animal is not alive.
        if (!myColonyAlertObject.openEndedProblemsWhereAnimalIsNotAlive.isEmpty()) {
            messageBody.append("<b>WARNING: There are " + myColonyAlertObject.openEndedProblemsWhereAnimalIsNotAlive.size() + " unresolved problems for animals not currently at WNPRC.</b><br>");
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view and update them<br\n>", myColonyAlertObject.openEndedProblemsWhereAnimalIsNotAliveURLView));
            messageBody.append("<hr\n>");
        }
//        //18. Find open assignments where the animal is not alive.
//        if (!myColonyAlertObject.openAssignmentsWhereAnimalIsNotAlive.isEmpty()) {
//            messageBody.append("<b>WARNING: There are " + myColonyAlertObject.openAssignmentsWhereAnimalIsNotAlive.size() + " active assignments for animals not currently at WNPRC.</b><br>");
//            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view and update them<br\n>", myColonyAlertObject.openAssignmentsWhereAnimalIsNotAliveURLView));
//            messageBody.append("<hr>\n");
//        }
        //19. Find non-continguous housing records.
        if (!myColonyAlertObject.nonContiguousHousingRecords.isEmpty()) {
            messageBody.append("<b>WARNING: There are " + myColonyAlertObject.nonContiguousHousingRecords.size() + " housing records since " + dateToolkit.getCalendarDateToday() + " that do not have a contiguous previous or next record.</b><br>");
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view and update them<br>\n", myColonyAlertObject.nonContiguousHousingRecordsURLView));
            messageBody.append("<hr>\n");
        }
        //20. Find birth records in the past 90 days missing a gender.
        if (!myColonyAlertObject.birthRecordsMissingGender.isEmpty()) {
            messageBody.append("<b>WARNING: The following birth records were entered in the last 90 days, but are missing a gender:</b><br>");
            for (String[] result : myColonyAlertObject.birthRecordsMissingGender) {
                messageBody.append(result[0] + " (" + result[1] + ")<br>");
            }
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view these animals</p>\n", myColonyAlertObject.birthRecordsMissingGenderURLView));
            messageBody.append("<hr>");
        }
        //21. Find demographics records in the past 90 days missing a gender.
        if (!myColonyAlertObject.demographicsMissingGender.isEmpty()) {
            messageBody.append("<b>WARNING: The following demographics records were entered in the last 90 days, but are missing a gender:</b><br>");
            for (String[] result : myColonyAlertObject.demographicsMissingGender) {
                messageBody.append(result[0] + " (" + result[1] + ")<br>");
            }
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view these animals</p>\n", myColonyAlertObject.demographicsMissingGenderURLView));
            messageBody.append("<hr>");
        }
        //22. Find prenatal records in the past 90 days missing a gender.
        if (!myColonyAlertObject.prenatalRecordsMissingGender.isEmpty()) {
            messageBody.append("<b>WARNING: The following prenatal death records were entered in the last 90 days, but are missing a gender:</b><br>");
            for (String[] result : myColonyAlertObject.prenatalRecordsMissingGender) {
                messageBody.append(result[0] + " (" + result[1] + ")<br>");
            }
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view these animals</p>\n", myColonyAlertObject.prenatalRecordsMissingGenderURLView));
            messageBody.append("<hr>");
        }
        //23. Find prenatal records in the past 90 days missing species.
        if (!myColonyAlertObject.prenatalRecordsMissingSpecies.isEmpty()) {
            messageBody.append("<b>WARNING: The following prenatal death records were entered in the last 90 days, but are missing the species:</b><br>");
            for (String[] result : myColonyAlertObject.prenatalRecordsMissingSpecies) {
                messageBody.append(result[0] + " (" + result[1] + ")<br>");
            }
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view these animals</p>\n", myColonyAlertObject.prenatalRecordsMissingSpeciesURLView));
            messageBody.append("<hr>");
        }
        //24. Find all animals that died in the past 90 days where there isn't a weight within 7 days of death.
        if (!myColonyAlertObject.animalsThatDiedWithoutWeight.isEmpty()) {
            messageBody.append("<b>WARNING: There are " + myColonyAlertObject.animalsThatDiedWithoutWeight.size() + " animals that are dead, but do not have a weight within the previous 7 days.</b><br>");
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view them</p>\n", myColonyAlertObject.animalsThatDiedWithoutWeightURLView));
            messageBody.append("<hr>");
        }
        //25. Find TB records lacking a result more than 10 days old, but less than 90.
        if (!myColonyAlertObject.tbRecordsLackingResult.isEmpty()) {
            messageBody.append("<b>WARNING: There are " + myColonyAlertObject.tbRecordsLackingResult.size() + " TB Tests in the past 10-90 days that are missing results.</b><br>");
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view them<br>\n", myColonyAlertObject.tbRecordsLackingResultURLView));
            messageBody.append("<hr>\n");
        }
//        //26. Find protocols nearing the animal limit count.
//        if (!myColonyAlertObject.protocolsNearingAnimalLimitCount.isEmpty()) {
//            messageBody.append("<b>WARNING: There are " + myColonyAlertObject.protocolsNearingAnimalLimitCount.size() + " protocols with fewer than 5 remaining animals.</b><br>");
//            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view them<br>\n", myColonyAlertObject.protocolsNearingAnimalLimitCountURLView));
//            messageBody.append("<hr>\n");
//        }
//        //27. Find protocols nearing the animal limit percentage.
//        if (!myColonyAlertObject.protocolsNearingAnimalLimitPercentage.isEmpty()) {
//            messageBody.append("<b>WARNING: There are " + myColonyAlertObject.protocolsNearingAnimalLimitPercentage.size() + " protocols with fewer than 5% of their animals remaining.</b><br>");
//            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view them<br>\n", myColonyAlertObject.protocolsNearingAnimalLimitPercentageURLView));
//            messageBody.append("<hr>\n");
//        }
        //28. Find protocols expiring soon.
        if (!myColonyAlertObject.protocolsExpiringSoon.isEmpty()) {
            messageBody.append("<b>WARNING: There are " + myColonyAlertObject.protocolsExpiringSoon.size() + " protocols that will expire within the next " + myColonyAlertObject.expiringSoonNumDays + " days.</b><br>");
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view them<br>\n", myColonyAlertObject.protocolsExpiringSoonURLView));
            messageBody.append("<hr>\n");
        }
        //29. Find birth records without a corresponding demographics record.
        if (!myColonyAlertObject.birthRecordsWithoutDemographicsRecord.isEmpty()) {
            messageBody.append("<b>WARNING: There are " + myColonyAlertObject.birthRecordsWithoutDemographicsRecord.size() + " WNPRC birth records without a corresponding demographics record.</b><br>");
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view and update them<br>\n", myColonyAlertObject.birthRecordsWithoutDemographicsRecordURLView));
            messageBody.append("<hr>\n");
        }
        //30. Find death records without a corresponding demographics record.
        if (!myColonyAlertObject.deathRecordsWithoutDemographicsRecord.isEmpty()) {
            messageBody.append("<b>WARNING: There are " + myColonyAlertObject.deathRecordsWithoutDemographicsRecord.size() + " WNPRC death records without a corresponding demographics record.</b><br>");
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view and update them<br>\n", myColonyAlertObject.deathRecordsWithoutDemographicsRecordURLView));
            messageBody.append("<hr>\n");
        }
        //31. Find animals with hold codes, but not on pending.
        if (!myColonyAlertObject.animalsWithHoldCodesNotPending.isEmpty()) {
            messageBody.append("<b>WARNING: There are " + myColonyAlertObject.animalsWithHoldCodesNotPending.size() + " animals with a hold code, but not on the pending project.</b><br>");
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view them<br>\n", myColonyAlertObject.animalsWithHoldCodesNotPendingURLView));
            messageBody.append("<hr>\n");
        }
        //32. Find assignments with projected releases today.
        if (!myColonyAlertObject.assignmentsWithProjectedReleasesToday.isEmpty()) {
            messageBody.append("<b>ALERT: There are " + myColonyAlertObject.assignmentsWithProjectedReleasesToday.size() + " assignments with a projected release date for today that have not already been ended.</b><br>");
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view them<br>\n", myColonyAlertObject.assignmentsWithProjectedReleasesTodayURLView));
            messageBody.append("<hr>\n");
        }
        //33. Find assignments with projected releases tomorrow.
        if (!myColonyAlertObject.assignmentsWithProjectedReleasesTomorrow.isEmpty()) {
            messageBody.append("<b>ALERT: There are " + myColonyAlertObject.assignmentsWithProjectedReleasesTomorrow.size() + " assignments with a projected release date for tomorrow.</b><br>");
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view and update them<br>\n", myColonyAlertObject.assignmentsWithProjectedReleasesTomorrowURLView));
            messageBody.append("<hr>\n");
        }
        //34. Summarize events in the last 5 days.
        if (!myColonyAlertObject.birthsInLastFiveDays.isEmpty()) {
            messageBody.append("Births since " + dateToolkit.getDateXDaysFromNow(-5) + ":<br>");
            for (String result : myColonyAlertObject.birthsInLastFiveDays) {
                messageBody.append(result + "<br>");
            }
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view them<p>\n", myColonyAlertObject.birthsInLastFiveDaysURLView));
        }
        //35. Deaths in the last 5 days.
        if (!myColonyAlertObject.deathsInLastFiveDays.isEmpty()) {
            messageBody.append("Deaths since " + dateToolkit.getDateXDaysFromNow(-5) + ":<br>");
            for (String result : myColonyAlertObject.deathsInLastFiveDays) {
                messageBody.append(result + "<br>");
            }
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view them<p>\n", myColonyAlertObject.deathsInLastFiveDaysURLView));
        }
        //36. Prenatal deaths in the last 5 days.
        if (!myColonyAlertObject.prenatalDeathsInLastFiveDays.isEmpty()) {
            messageBody.append("Prenatal Deaths since " + dateToolkit.getDateXDaysFromNow(-5) + ":<br>");
            for (String result : myColonyAlertObject.prenatalDeathsInLastFiveDays) {
                messageBody.append(result + "<br>");
            }
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view them<p>\n", myColonyAlertObject.prenatalDeathsInLastFiveDaysURLView));
            messageBody.append("<hr>");
        }
        //37. Find the total finalized records with future dates.
        if (!myColonyAlertObject.totalFinalizedRecordsWithFutureDates.isEmpty()) {
            messageBody.append("<b>WARNING: There are " + myColonyAlertObject.totalFinalizedRecordsWithFutureDates.size() + " finalized records with future dates.</b><br>");
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view them<br>\n", myColonyAlertObject.totalFinalizedRecordsWithFutureDatesURLView));
            messageBody.append("<hr>\n");
        }

        //Returns string.
        return messageBody.toString();
    }



    // This class retrieves colony information through a number of different queries.
    //  There are 3 different ways to construct this object; each retrieves the necessary information for the corresponding type of notification.
    //  It can be constructed with the arguments:
    //      'colonyAlert'           --> For ColonyAlertsNotificationRevamp.java.
    //      'colonyManagement'      --> For ColonyManagementNotificationRevamp.java.
    //      'colonyAlertLite'       --> For ColonyAlertsLiteNotificationRevamp.java.
    public static class ColonyInformationObject {
        Container c;
        User u;
        Integer expiringSoonNumDays = 14;
        NotificationToolkit notificationToolkit = new NotificationToolkit();
        NotificationToolkit.DateToolkit dateToolkit = new NotificationToolkit.DateToolkit();

        // alertType can be 'colonyAlert' 'colonyManagement' or 'colonyAlertLite'.
        public ColonyInformationObject(Container currentContainer, User currentUser, String alertType) {
            this.c = currentContainer;
            this.u = currentUser;

            if (alertType.equals("colonyAlert")) {
                //1. Find all living animals without a weight.
                getLivingAnimalsWithoutWeight();
                //2. Find all occupied cages without dimensions.
                getOccupiedCagesWithoutDimensions();
                //3. List all animals in protected contact without an adjacent pc animal.
                getLivingAnimalsInProtectedContact();
                //4. Find all living animals with multiple active housing records.
                getLivingAnimalsWithMultipleActiveHousingRecords();
                //5. Find all animals where the housing snapshot doesn't match the housing table.
                getLivingAnimalsWhereHousingSnapshotDoesNotMatchHousingTable();
                //6. Find all records with potential housing condition problems.
                getAllRecordsWithPotentialHousingConditionProblems();
                //7. Find open housing records where the animal is not alive.
                getOpenHousingRecordsWhereAnimalIsNotAlive();
                //8. Find living animals without an active housing record.
                getLivingAnimalsWithoutActiveHousingRecord();
                //9. Find all records with problems in the calculated_status field.
                getAllRecordsWithCalculatedStatusFieldProblems();
                //10. Find all animals lacking any assignments.
                getAnimalsLackingAssignments();
                //11. Find any active assignment where the animal is not alive.
                getActiveAssignmentsWhereAnimalIsNotAlive();
                //12. Find any active assignment where the project lacks a valid protocol.
                getActiveAssignmentsWhereProjectLacksValidProtocol();
                //13. Find any duplicate active assignments.
                getDuplicateActiveAssignments();
                //14. Find all living siv+ animals not exempt from pair housing (20060202).
                getLivingSivPosAnimalsNotExemptFromPairHousing();
                //15. Find all living shiv+ animals not exempt from pair housing (20060202).
                getLivingShivPosAnimalsNotExemptFromPairHousing();
                //16. Find open-ended treatments where the animal is not alive.
                getOpenEndedTreatmentsWhereAnimalIsNotAlive();
                //17. Find open-ended problems where the animal is not alive.
                getOpenEndedProblemsWhereAnimalIsNotAlive();
                // REMOVED 18 - Duplicate of 11 (getOpenAssignmentsWhereAnimalIsNotAlive).
                //19. Find non-continguous housing records.
                getNonContiguousHousingRecords();
                //20. Find birth records in the past 90 days missing a gender.
                getBirthRecordsMissingGender();
                //21. Find demographics records in the past 90 days missing a gender.
                getDemographicsMissingGender();
                //22. Find prenatal records in the past 90 days missing a gender.
                getPrenatalRecordsMissingGender();
                //23. Find prenatal records in the past 90 days missing species.
                getPrenatalRecordsMissingSpecies();
                //24. Find all animals that died in the past 90 days where there isn't a weight within 7 days of death.
                getAnimalsThatDiedWithoutWeight();
                //25. Find TB records lacking a result more than 10 days old, but less than 90.
                getTbRecordsLackingResult();
                // REMOVED 26 & 27 per user request (getProtocolsNearingAnimalLimitCount & getProtocolsNearingAnimalLimitPercentage).
                //28. Find protocols expiring soon.
                getProtocolsExpiringSoon();
                //29. Find birth records without a corresponding demographics record.
                getBirthRecordsWithoutDemographicsRecord();
                //30. Find death records without a corresponding demographics record.
                getDeathRecordsWithoutDemographicsRecord();
                //31. Find animals with hold codes, but not on pending.
                getAnimalsWithHoldCodesNotPending();
                //32. Find assignments with projected releases today.
                getAssignmentsWithProjectedReleasesToday();
                //33. Find assignments with projected releases tomorrow.
                getAssignmentsWithProjectedReleasesTomorrow();
                //34. Summarize events in the last 5 days.
                getBirthsInLastFiveDays();
                //35. Deaths in the last 5 days.
                getDeathsInLastFiveDays();
                //36. Prenatal deaths in the last 5 days.
                getPrenatalDeathsInLastFiveDays();
                //37. Find the total finalized records with future dates.
                getTotalFinalizedRecordsWithFutureDates();
            }
            else if (alertType.equals("colonyManagement")) {
                // 1. Find all living animals without a weight.
                getLivingAnimalsWithoutWeight();
                // 2. Find all occupied cages without dimensions.
                getOccupiedCagesWithoutDimensions();
                // 3. List all animals in protected contact without an adjacent pc animal.
                getLivingAnimalsInProtectedContact();
                // 4. Find all records with potential housing condition problems.
                getAllRecordsWithPotentialHousingConditionProblems();
                // 5. Find all animals with cage size problems.
                getAnimalsWithCageSizeProblems();
                // 6. Find all animals lacking any assignments.
                getAnimalsLackingAssignments();
                // 7. Find any active assignment where the animal is not alive.
                getActiveAssignmentsWhereAnimalIsNotAlive();
                // 8. Find any active assignment where the project lacks a valid protocol.
                getActiveAssignmentsWhereProjectLacksValidProtocol();
                // 9. Find any duplicate active assignments.
                getDuplicateActiveAssignments();
                // 10. Find animals with hold codes, but not on pending.
                getAnimalsWithHoldCodesNotPending();
                // 11. Find protocols nearing the animal limit count.
                getProtocolsNearingAnimalLimitCount();
                // 12. Find protocols nearing the animal limit percentage.
                getProtocolsNearingAnimalLimitPercentage();
            }
            else if (alertType.equals("colonyAlertLite")) {
                // 1. Find all living animals with multiple active housing records.
                getLivingAnimalsWithMultipleActiveHousingRecords();
                // 2. Find all animals where the housing snapshot doesn't match the housing table.
                getLivingAnimalsWhereHousingSnapshotDoesNotMatchHousingTable();
                // 3. Find all records with potential housing condition problems.
                getAllRecordsWithPotentialHousingConditionProblems();
                // 4. Find non-continguous housing records.
                getNonContiguousHousingRecords();
                // 5. Find open housing records where the animal is not alive.
                getOpenHousingRecordsWhereAnimalIsNotAlive();
                // 6. Find living animals without an active housing record.
                getLivingAnimalsWithoutActiveHousingRecord();
                // 7. Find all records with problems in the calculated_status field.
                getAllRecordsWithCalculatedStatusFieldProblems();
                // 8. Find any active assignment where the animal is not alive.
                getActiveAssignmentsWhereAnimalIsNotAlive();
                // 9. Find any active assignment where the project lacks a valid protocol.
                getActiveAssignmentsWhereProjectLacksValidProtocol();
                // 10. Find any duplicate active assignments.
                getDuplicateActiveAssignments();
            }
        }

        // Find all living animals without a weight.
        ArrayList<String> livingAnimalsWithoutWeight;                                   //id
        String livingAnimalsWithoutWeightURL;                                           //url string (view)
        private void getLivingAnimalsWithoutWeight() {
            //Creates filter.
            SimpleFilter myFilter = new SimpleFilter("calculated_status", "Alive", CompareType.EQUAL);
            myFilter.addCondition("Id/MostRecentWeight/MostRecentWeightDate", "", CompareType.ISBLANK);
            //Creates sort.
            Sort mySort = new Sort("Id");
            //Runs query.
            ArrayList<String> returnArray = notificationToolkit.getTableMultiRowSingleColumn(c, u, "study", "Demographics", myFilter, mySort, "Id", null);

            //Creates URL.
            String viewQueryURL = notificationToolkit.createQueryURL(c, "execute", "study", "Demographics", myFilter);
//            Path viewQueryURL = new Path(ActionURL.getBaseServerURL(), "query", c.getPath(), "executeQuery.view?schemaName=study&query.queryName=Demographics&query.calculated_status~eq=Alive&query.Id/MostRecentWeight/MostRecentWeightDate~isblank");

            //Returns data.
            this.livingAnimalsWithoutWeight = returnArray;
            this.livingAnimalsWithoutWeightURL = viewQueryURL.toString();
        }

        // Find all occupied cages without dimensions.
        ArrayList<String[]> occupiedCagesWithoutDimensions;                             //room, cage
        String occupiedCagesWithoutDimensionsURLView;                                   //url string (view)
        String occupiedCagesWithoutDimensionsURLEdit;                                   //url string (edit)
        private void getOccupiedCagesWithoutDimensions() {
            //Runs query.
            ArrayList<String[]> returnArray = notificationToolkit.getTableMultiRowMultiColumn(c, u, "ehr", "missingCages", null, null, new String[]{"room", "cage"});

            //Creates URL.
            String viewQueryURL = notificationToolkit.createQueryURL(c, "execute", "ehr", "missingCages", null);
            String editQueryURL = notificationToolkit.createQueryURL(c, "update", "ehr", "missingCages", null);
//            Path viewQueryURL = new Path(ActionURL.getBaseServerURL(), "query", c.getPath(), "executeQuery.view?schemaName=ehr&query.queryName=missingCages");
//            Path editQueryURL = new Path(ActionURL.getBaseServerURL(), "query", c.getPath(), "executeQuery.view?schemaName=ehr_lookups&query.queryName=cage");

            //Returns data.
            this.occupiedCagesWithoutDimensions = returnArray;
            this.occupiedCagesWithoutDimensionsURLView = viewQueryURL.toString();
            this.occupiedCagesWithoutDimensionsURLEdit = editQueryURL.toString();
        }

        // List all animals in protected contact without an adjacent pc animal.
        ArrayList<String[]> livingAnimalsInProtectedContact;                            //id, cage, room
        String livingAnimalsInProtectedContactURLView;                                  //url string (view)
        private void getLivingAnimalsInProtectedContact() {
            //Creates filter.
            SimpleFilter myFilter = new SimpleFilter("Id/Dataset/Demographics/calculated_status", "Alive", CompareType.EQUAL);
            myFilter.addCondition("cond", "pc", CompareType.EQUAL);
            myFilter.addCondition("enddate", "", CompareType.ISBLANK);
            //Creates sort.
            Sort mySort = new Sort("Id");
            //Runs query.
            ArrayList<String[]> resultArray = notificationToolkit.getTableMultiRowMultiColumn(c, u, "study", "Housing", myFilter, mySort, new String[]{"Id", "cage", "room"});

            //Loops through each result in the table.
            ArrayList<String[]> returnArray = new ArrayList<String[]>();
            for (int i = 0; i < resultArray.size(); i++) {
                Boolean hasAdjacentPcAnimal = false;
                String result1Id = resultArray.get(i)[0];
                String result1Room = resultArray.get(i)[2];
                //Loops through each result in the table.
                for (int j = 0; j < resultArray.size(); j++) {
                    String result2Id = resultArray.get(j)[0];
                    String result2Room = resultArray.get(j)[2];
                    //Animal shares the same room as another result, but is not the same animal.
                    if ((result1Room.equals(result2Room)) && (!result1Id.equals(result2Id))) {
                        try {
                            Integer result2Cage = Integer.valueOf(resultArray.get(j)[1]);
                            Integer result1Cage = Integer.valueOf(resultArray.get(i)[1]);
                            //Checks to see if the cages are next to eachother.
                            if (((result1Cage + 1) == result2Cage) || ((result1Cage - 1) == result2Cage)) {
                                //Marks this animal as 'having an adjacent pc animal'.
                                hasAdjacentPcAnimal = true;
                            }
                        }
                        catch (NumberFormatException e) {
                            //This makes sure results with non-numerical cages don't show up in query results.
                            //According to Colony Records, pc animals will never be in non-numerical cages (ex. tmp1 or table1).
                            hasAdjacentPcAnimal = true;
                        }
                    }
                }
                if (hasAdjacentPcAnimal == false) {
                    returnArray.add(resultArray.get(i));
                }
            }

            //Creates URL.
            String viewQueryURL = notificationToolkit.createQueryURL(c, "execute", "study", "Housing", myFilter);
//            Path viewQueryURL = new Path(ActionURL.getBaseServerURL(), "query", c.getPath(), "executeQuery.view?schemaName=study&query.queryName=Housing&query.cond~eq=pc&query.enddate~isblank=");

            //Returns data.
            this.livingAnimalsInProtectedContact = returnArray;
            this.livingAnimalsInProtectedContactURLView = viewQueryURL.toString();
        }

        // Find all living animals with multiple active housing records.
        ArrayList<String> livingAnimalsWithMultipleActiveHousingRecords;                //id
        String livingAnimalsWithMultipleActiveHousingRecordsURLView;                    //url string (view)
        String livingAnimalsWithMultipleActiveHousingRecordsURLEdit;                    //url string (edit)
        private void getLivingAnimalsWithMultipleActiveHousingRecords() {
            //Creates sort.
            Sort mySort = new Sort("Id");
            //Runs query.
            ArrayList<String> returnArray = notificationToolkit.getTableMultiRowSingleColumn(c, u, "study", "housingProblems", null, mySort, "Id", null);

            //Creates 'view query' URL.
            String viewQueryURL = notificationToolkit.createQueryURL(c, "execute", "study", "housingProblems", null);
//            Path viewQueryURL = new Path(ActionURL.getBaseServerURL(), "query", c.getPath(), "executeQuery.view?schemaName=study&query.queryName=housingProblems");
            //Creates 'edit query' URL.
            StringBuilder idsToCheck = new StringBuilder();
            for (String id : returnArray) {
                idsToCheck.append(id + ";");
            }
            SimpleFilter myFilter = new SimpleFilter("Id", idsToCheck.toString(), CompareType.IN);
            myFilter.addCondition("enddate", "", CompareType.ISBLANK);
            String editQueryURL = notificationToolkit.createQueryURL(c, "update", "study", "Housing", myFilter);
//            Path editQueryURL = new Path(ActionURL.getBaseServerURL(), "ehr", c.getPath(), "updateQuery.view?schemaName=study&query.queryName=Housing&query.Id~in=" + idsToCheck + "&query.enddate~isblank");

            //Returns data.
            this.livingAnimalsWithMultipleActiveHousingRecords = returnArray;
            this.livingAnimalsWithMultipleActiveHousingRecordsURLView = viewQueryURL.toString();
            this.livingAnimalsWithMultipleActiveHousingRecordsURLEdit = editQueryURL.toString();
        }

        // Find all animals where the housing snapshot doesn't match the housing table.
        //TODO: Need to update snapshot.
        ArrayList<String> livingAnimalsWhereHousingSnapshotDoesNotMatchHousingTable;    //id
        String livingAnimalsWhereHousingSnapshotDoesNotMatchHousingTableURLView;        //url string (view)
        private void getLivingAnimalsWhereHousingSnapshotDoesNotMatchHousingTable() {
            //Runs query.
            ArrayList<String> returnArray = notificationToolkit.getTableMultiRowSingleColumn(c, u, "study", "ValidateHousingSnapshot", null, null, "Id", null);

//            //Update snapshot.
//            if (!returnArray.isEmpty()) {
//
//                ScriptEngine engine = null;
//                String ext = FileUtil.getExtension("/usr/local/labkey/tools/uupdateSnapshot.pl");
//                if (ext != null) {
//                    engine = LabKeyScriptEngineManager.get().getEngineByExtension(c, ext, LabKeyScriptEngineManager.EngineContext.pipeline);
//                }
//                if (engine != null) {
//                    File scriptDir = null;
//                    Context myContext = null;  //TODO: Add context here.
//                    try (SecurityManager.TransformSession session = SecurityManager.createTransformSession(myContext)) {
//                        scriptDir = getScriptDirectory
//                    }
//                }
//
//                //TODO: Update snapshot (line 210 in colonyAlerts.pl).
//                // The following line is how it's done in the perl script.
////                system("/usr/local/labkey/tools/updateSnapshot.pl");
//            }

            //Creates URL.
            String viewQueryURL = notificationToolkit.createQueryURL(c, "execute", "study", "ValidateHousingSnapshot", null);
//            Path viewQueryURL = new Path(ActionURL.getBaseServerURL(), "query", c.getPath(), "executeQuery.view?schemaName=study&query.queryName=ValidateHousingSnapshot");

            //Returns data.
            this.livingAnimalsWhereHousingSnapshotDoesNotMatchHousingTable = returnArray;
            this.livingAnimalsWhereHousingSnapshotDoesNotMatchHousingTableURLView = viewQueryURL.toString();
        }

        // Find all records with potential housing condition problems.
        ArrayList<String> recordsWithPotentialHousingConditionProblems;                 //id
        String recordsWithPotentialHousingConditionProblemsURLView;                     //url string (view)
        String recordsWithPotentialHousingConditionProblemsURLEdit;                     //url string (edit)
        private void getAllRecordsWithPotentialHousingConditionProblems() {
            //Creates filter.
            SimpleFilter myFilter = new SimpleFilter("conditionStatus", "ERROR", CompareType.EQUAL);
            //Creates sort.
            Sort mySort = new Sort("room, cage");
            //Runs query.
            ArrayList<String> returnArray = notificationToolkit.getTableMultiRowSingleColumn(c, u, "study", "housingConditionProblems", myFilter, mySort, "Id", null);

            //Creates 'view query' URL.
            String viewQueryURL = notificationToolkit.createQueryURL(c, "execute", "study", "housingConditionProblems", myFilter);
//            Path viewQueryURL = new Path(ActionURL.getBaseServerURL(), "query", c.getPath(), "executeQuery.view?schemaName=study&query.queryName=housingConditionProblems&query.viewName=Problems");
            //Creates 'edit query' URL.
            StringBuilder idsToCheck = new StringBuilder();
            for (String id : returnArray) {
                idsToCheck.append(id + ";");
            }
            myFilter.addCondition("Id", idsToCheck.toString(), CompareType.IN);
            myFilter.addCondition("enddate", "", CompareType.ISBLANK);
            String editQueryURL = notificationToolkit.createQueryURL(c, "update", "study", "Housing", myFilter);
//            Path editQueryURL = new Path(ActionURL.getBaseServerURL(), "ehr", c.getPath(), "updateQuery.view?schemaName=study&query.queryName=Housing&query.Id~in=" + idsToCheck + "&query.enddate~isblank");

            //Returns data.
            this.recordsWithPotentialHousingConditionProblems = returnArray;
            this.recordsWithPotentialHousingConditionProblemsURLView = viewQueryURL.toString();
            this.recordsWithPotentialHousingConditionProblemsURLEdit = editQueryURL.toString();
        }

        // Find open housing records where the animal is not alive.
        ArrayList<String> openHousingRecordsWhereAnimalIsNotAlive;                      //id
        String openHousingRecordsWhereAnimalIsNotAliveURLView;                          //url string (view)
        private void getOpenHousingRecordsWhereAnimalIsNotAlive() {
            //Creates filter.
            SimpleFilter myFilter = new SimpleFilter("Id/Dataset/Demographics/calculated_status", "Alive", CompareType.NEQ_OR_NULL);
            myFilter.addCondition("enddate", "", CompareType.ISBLANK);
            //Creates sort.
            Sort mySort = new Sort("Id");
            //Runs query.
            ArrayList<String> returnArray = notificationToolkit.getTableMultiRowSingleColumn(c, u, "study", "Housing", myFilter, mySort, "Id", null);

            //Creates URL.
            String viewQueryURL = notificationToolkit.createQueryURL(c, "execute", "study", "Housing", myFilter);
//            Path viewQueryURL = new Path(ActionURL.getBaseServerURL(), "query", c.getPath(), "executeQuery.view?schemaName=study&query.queryName=Housing&query.enddate~isblank&query.Id/Dataset/Demographics/calculated_status~neqornull=Alive");

            //Returns data.
            this.openHousingRecordsWhereAnimalIsNotAlive = returnArray;
            this.openHousingRecordsWhereAnimalIsNotAliveURLView = viewQueryURL.toString();
        }

        // Find living animals without an active housing record.
        ArrayList<String> livingAnimalsWithoutActiveHousingRecord;                      //id
        String livingAnimalsWithoutActiveHousingRecordURLView;                          //url string (view)
        private void getLivingAnimalsWithoutActiveHousingRecord() {
            //Creates filter.
            SimpleFilter myFilter = new SimpleFilter("calculated_status", "Alive", CompareType.EQUAL);
            myFilter.addCondition("Id/curLocation/room/room", "", CompareType.ISBLANK);
            //Creates sort.
            Sort mySort = new Sort("Id");
            //Runs query.
            ArrayList<String> returnArray = notificationToolkit.getTableMultiRowSingleColumn(c, u, "study", "Demographics", myFilter, mySort, "Id", null);

            //Creates URL.
            String viewQueryURL = notificationToolkit.createQueryURL(c, "execute", "study", "Demographics", myFilter);
//            Path viewQueryURL = new Path(ActionURL.getBaseServerURL(), "query", c.getPath(), "executeQuery.view?schemaName=study&query.queryName=Demographics&query.Id/curLocation/room~isblank&query.calculated_status~eq=Alive");

            //Returns data.
            this.livingAnimalsWithoutActiveHousingRecord = returnArray;
            this.livingAnimalsWithoutActiveHousingRecordURLView = viewQueryURL.toString();
        }

        // Find all records with problems in the calculated_status field.
        ArrayList<String> recordsWithCalculatedStatusFieldProblems;                     //id
        String recordsWithCalculatedStatusFieldProblemsURLView;                         //url string (view)
        String recordsWithCalculatedStatusFieldProblemsURLEdit;                         //url string (edit)
        private void getAllRecordsWithCalculatedStatusFieldProblems() {
            //Runs query.
            ArrayList<String> returnArray = notificationToolkit.getTableMultiRowSingleColumn(c, u, "study", "Validate_status", null, null, "Id", null);

            //Creates 'view query' URL.
            String viewQueryURL = notificationToolkit.createQueryURL(c, "execute", "study", "Validate_status", null);
//            Path viewQueryURL = new Path(ActionURL.getBaseServerURL(), "query", c.getPath(), "executeQuery.view?schemaName=study&query.queryName=Validate_status");
            //Creates 'edit query' URL.
            StringBuilder idsToCheck = new StringBuilder();
            for (String id : returnArray) {
                idsToCheck.append(id + ";");
            }
            SimpleFilter myFilter = new SimpleFilter("ID", idsToCheck.toString(), CompareType.IN);
//            myFilter.addCondition()
            String editQueryURL = notificationToolkit.createQueryURL(c, "update", "study", "Demographics", myFilter);

            //Returns data.
            this.recordsWithCalculatedStatusFieldProblems = returnArray;
            this.recordsWithCalculatedStatusFieldProblemsURLView = viewQueryURL.toString();
            this.recordsWithCalculatedStatusFieldProblemsURLEdit = editQueryURL.toString();
        }

        // Find all animals lacking any assignments.
        ArrayList<String> animalsLackingAssignments;                                    //id
        String animalsLackingAssignmentsURLView;                                        //url string (view)
        private void getAnimalsLackingAssignments() {
            //Creates filter.
            SimpleFilter myFilter = new SimpleFilter("calculated_status", "Alive", CompareType.EQUAL);
            myFilter.addCondition("Id/AssignmentSummary/NumActiveAssignments", 0, CompareType.EQUAL);
            //Creates sort.
            Sort mySort = new Sort("Id");
            //Runs query.
            ArrayList<String> returnArray = notificationToolkit.getTableMultiRowSingleColumn(c, u, "study", "Demographics", myFilter, mySort, "Id", null);

            //Creates URL.
            String viewQueryURL = notificationToolkit.createQueryURL(c, "execute", "study", "Demographics", myFilter);
//            Path viewQueryURL = new Path(ActionURL.getBaseServerURL(), "query", c.getPath(), "executeQuery.view?schemaName=study&query.queryName=Demographics&query.viewName=No Active Assigns");

            //Returns data.
            this.animalsLackingAssignments = returnArray;
            this.animalsLackingAssignmentsURLView = viewQueryURL.toString();
        }

        // Find any active assignment where the animal is not alive.
        ArrayList<String> activeAssignmentsWhereAnimalIsNotAlive;                       //id
        String activeAssignmentsWhereAnimalIsNotAliveURLView;                           //url string (view)
        private void getActiveAssignmentsWhereAnimalIsNotAlive() {
            //Creates filter.
            SimpleFilter myFilter = new SimpleFilter("Id/Dataset/Demographics/calculated_status", "Alive", CompareType.NEQ_OR_NULL);
            myFilter.addCondition("enddate", "", CompareType.ISBLANK);
            //Runs query.
            ArrayList<String> returnArray = notificationToolkit.getTableMultiRowSingleColumn(c, u, "study", "Assignment", myFilter, null, "Id", null);

            //Creates URL.
            String viewQueryURL = notificationToolkit.createQueryURL(c, "execute", "study", "Assignment", myFilter);
//            Path viewQueryURL = new Path(ActionURL.getBaseServerURL(), "query", c.getPath(), "executeQuery.view?schemaName=study&query.queryName=Assignment&query.enddate~isblank&query.Id/Dataset/Demographics/calculated_status~neqornull=Alive");

            //Returns data.
            this.activeAssignmentsWhereAnimalIsNotAlive = returnArray;
            this.activeAssignmentsWhereAnimalIsNotAliveURLView = viewQueryURL.toString();
        }

        // Find any active assignment where the project lacks a valid protocol.
        //REVAMP EDIT: Changed from (calculated_status does not equal alive or is null) to (calculated_status equals alive).
        ArrayList<String> activeAssignmentsWhereProjectLacksValidProtocol;              //id
        String activeAssignmentsWhereProjectLacksValidProtocolURLView;                  //url string (view)
        private void getActiveAssignmentsWhereProjectLacksValidProtocol() {
            //Creates filter.
            SimpleFilter myFilter = new SimpleFilter("Id/Dataset/Demographics/calculated_status", "Alive", CompareType.EQUAL);
            myFilter.addCondition("enddate", "", CompareType.ISBLANK);
            myFilter.addCondition("project/protocol", "", CompareType.ISBLANK);
            //Runs query.
            ArrayList<String> returnArray = notificationToolkit.getTableMultiRowSingleColumn(c, u, "study", "Assignment", myFilter, null, "Id", null);

            //Creates URL.
            String viewQueryURL = notificationToolkit.createQueryURL(c, "execute", "study", "Assignment", myFilter);
//            Path viewQueryURL = new Path(ActionURL.getBaseServerURL(), "query", c.getPath(), "executeQuery.view?schemaName=study&query.queryName=Assignment&query.enddate~isblank&query.Id/Dataset/Demographics/calculated_status~neqornull=Alive&query.project/protocol~isblank");

            //Returns data.
            this.activeAssignmentsWhereProjectLacksValidProtocol = returnArray;
            this.activeAssignmentsWhereProjectLacksValidProtocolURLView = viewQueryURL.toString();
        }

        // Find any duplicate active assignments.
        ArrayList<String> duplicateActiveAssignments;                                   //id
        String duplicateActiveAssignmentsURLView;                                       //url string (view)
        private void getDuplicateActiveAssignments() {
            //Runs query.
            ArrayList<String> returnArray = notificationToolkit.getTableMultiRowSingleColumn(c, u, "study", "duplicateAssignments", null, null, "Id", null);

            //Creates URL.
            String viewQueryURL = notificationToolkit.createQueryURL(c, "execute", "study", "duplicateAssignments", null);
//            Path viewQueryURL = new Path(ActionURL.getBaseServerURL(), "query", c.getPath(), "executeQuery.view?schemaName=study&query.queryName=duplicateAssignments");

            //Returns data.
            this.duplicateActiveAssignments = returnArray;
            this.duplicateActiveAssignmentsURLView = viewQueryURL.toString();
        }

        // Find all living siv+ animals not exempt from pair housing (20060202).
        ArrayList<String> livingSivPosAnimalsNotExemptFromPairHousing;                  //id
        String livingSivPosAnimalsNotExemptFromPairHousingURLView;                      //url string (view)
        private void getLivingSivPosAnimalsNotExemptFromPairHousing() {
            //Creates filter.
            SimpleFilter myFilter = new SimpleFilter("calculated_status", "Alive", CompareType.EQUAL);
            myFilter.addCondition("medical", "siv", CompareType.CONTAINS);
            myFilter.addCondition("Id/assignmentSummary/ActiveVetAssignments", "20060202", CompareType.DOES_NOT_CONTAIN);
            //Runs query.
            ArrayList<String> returnArray = notificationToolkit.getTableMultiRowSingleColumn(c, u, "study", "Demographics", myFilter, null, "Id", null);

            //Creates URL.
            String viewQueryURL = notificationToolkit.createQueryURL(c, "execute", "study", "Demographics", myFilter);
//            Path viewQueryURL = new Path(ActionURL.getBaseServerURL(), "query", c.getPath(), "executeQuery.view?schemaName=study&query.queryName=Demographics&query.viewName=Alive%2C%20at%20WNPRC&query.medical~contains=siv&query.Id%2FassignmentSummary%2FActiveVetAssignments~doesnotcontain=20060202");

            //Returns data.
            this.livingSivPosAnimalsNotExemptFromPairHousing = returnArray;
            this.livingSivPosAnimalsNotExemptFromPairHousingURLView = viewQueryURL.toString();
        }

        // Find all living shiv+ animals not exempt from pair housing (20060202).
        ArrayList<String> livingShivPosAnimalsNotExemptFromPairHousing;                 //id
        String livingShivPosAnimalsNotExemptFromPairHousingURLView;                     //url string (view)
        private void getLivingShivPosAnimalsNotExemptFromPairHousing() {
            //Creates filter.
            SimpleFilter myFilter = new SimpleFilter("calculated_status", "Alive", CompareType.EQUAL);
            myFilter.addCondition("medical", "shiv", CompareType.CONTAINS);
            myFilter.addCondition("Id/assignmentSummary/ActiveVetAssignments", "20060202", CompareType.DOES_NOT_CONTAIN);
            //Runs query.
            ArrayList<String> returnArray = notificationToolkit.getTableMultiRowSingleColumn(c, u, "study", "demographics", myFilter, null, "Id", null);

            //Creates URL.
            String viewQueryURL = notificationToolkit.createQueryURL(c, "execute", "study", "Demographics", myFilter);
//            Path viewQueryURL = new Path(ActionURL.getBaseServerURL(), "query", c.getPath(), "executeQuery.view?schemaName=study&query.queryName=Demographics&query.viewName=Alive%2C%20at%20WNPRC&query.medical~contains=shiv&query.Id%2FassignmentSummary%2FActiveVetAssignments~doesnotcontain=20060202");

            //Returns data.
            this.livingShivPosAnimalsNotExemptFromPairHousing = returnArray;
            this.livingShivPosAnimalsNotExemptFromPairHousingURLView = viewQueryURL.toString();
        }

        // Find open-ended treatments where the animal is not alive.
        ArrayList<String> openEndedTreatmentsWhereAnimalIsNotAlive;                     //id
        String openEndedTreatmentsWhereAnimalIsNotAliveURLView;                         //url string (view)
        private void getOpenEndedTreatmentsWhereAnimalIsNotAlive() {
            //Creates filter.
            SimpleFilter myFilter = new SimpleFilter("Id/Dataset/Demographics/calculated_status", "Alive", CompareType.NEQ_OR_NULL);
            myFilter.addCondition("enddate", "", CompareType.ISBLANK);
            //Runs query.
            ArrayList<String> returnArray = notificationToolkit.getTableMultiRowSingleColumn(c, u, "study", "Treatment Orders", myFilter, null, "Id", null);

            //Creates URL.
            String viewQueryURL = notificationToolkit.createQueryURL(c, "execute", "study", "Treatment Orders", myFilter);
//            Path viewQueryURL = new Path(ActionURL.getBaseServerURL(), "query", c.getPath(), "executeQuery.view?schemaName=study&query.queryName=Treatment Orders&query.enddate~isblank&query.Id/Dataset/Demographics/calculated_status~neqornull=Alive");

            //Returns data.
            this.openEndedTreatmentsWhereAnimalIsNotAlive = returnArray;
            this.openEndedTreatmentsWhereAnimalIsNotAliveURLView = viewQueryURL.toString();
        }

        // Find open-ended problems where the animal is not alive.
        ArrayList<String> openEndedProblemsWhereAnimalIsNotAlive;                       //id
        String openEndedProblemsWhereAnimalIsNotAliveURLView;                           //url string (view)
        private void getOpenEndedProblemsWhereAnimalIsNotAlive() {
            //Creates filter.
            SimpleFilter myFilter = new SimpleFilter("Id/Dataset/Demographics/calculated_status", "Alive", CompareType.NEQ_OR_NULL);
            myFilter.addCondition("enddate", "", CompareType.ISBLANK);
            //Runs query.
            ArrayList<String> returnArray = notificationToolkit.getTableMultiRowSingleColumn(c, u, "study", "Problem List", myFilter, null, "Id", null);

            //Creates URL.
            String viewQueryURL = notificationToolkit.createQueryURL(c, "execute", "study", "Problem List", myFilter);
//            Path viewQueryURL = new Path(ActionURL.getBaseServerURL(), "query", c.getPath(), "executeQuery.view?schemaName=study&query.queryName=Problem List&query.enddate~isblank&query.Id/Dataset/Demographics/calculated_status~neqornull=Alive");

            //Returns data.
            this.openEndedProblemsWhereAnimalIsNotAlive = returnArray;
            this.openEndedProblemsWhereAnimalIsNotAliveURLView = viewQueryURL.toString();
        }

        // Find non-continguous housing records.
        ArrayList<String> nonContiguousHousingRecords;                                  //id
        String nonContiguousHousingRecordsURLView;                                      //url string (view)
        private void getNonContiguousHousingRecords() {
            //Creates parameter.
            String todayCalendarDate = dateToolkit.getCalendarDateToday();
            Map<String, Object> myParams = new HashMap<>();
            myParams.put("MINDATE", todayCalendarDate);
            //Runs query.
            ArrayList<String> returnArray = notificationToolkit.getTableMultiRowSingleColumn(c, u, "study", "HousingCheck", null, null, "Id", myParams);

            //Creates URL.
            ActionURL queryURL = new ActionURL("query", "executeQuery.view", c);
            queryURL.addParameter("schemaName", "study");
            queryURL.addParameter("query.queryName", "HousingCheck");
            queryURL.addParameter("query.param.MINDATE", todayCalendarDate);
            String viewQueryURL = (new Path(new ActionURL().getBaseServerURI(), queryURL.toString())).toString();
//            Path viewQueryURL = new Path(ActionURL.getBaseServerURL(), "query", c.getPath(), "executeQuery.view?schemaName=study&query.queryName=HousingCheck&query.param.MINDATE=" + todayCalendarDate);

            //Returns data.
            this.nonContiguousHousingRecords = returnArray;
            this.nonContiguousHousingRecordsURLView = viewQueryURL.toString();
        }

        // Find birth records in the past 90 days missing a gender.
        ArrayList<String[]> birthRecordsMissingGender;                                  //id, date
        String birthRecordsMissingGenderURLView;                                        //url string (view)
        private void getBirthRecordsMissingGender() {
            //Creates filter.
            SimpleFilter myFilter = new SimpleFilter("gender", "", CompareType.ISBLANK);
            myFilter.addCondition("date", "-90d", CompareType.DATE_GTE);
            //Runs query.
            ArrayList<String[]> returnArray = notificationToolkit.getTableMultiRowMultiColumn(c, u, "study", "Birth", myFilter, null, new String[]{"Id", "date"});

            //Creates URL.
            String viewQueryURL = notificationToolkit.createQueryURL(c, "execute", "study", "Birth", myFilter);
//            Path viewQueryURL = new Path(ActionURL.getBaseServerURL(), "query", c.getPath(), "executeQuery.view?schemaName=study&query.queryName=Birth&query.gender~isblank=&query.date~dategte=-90d");

            //Returns data.
            this.birthRecordsMissingGender = returnArray;
            this.birthRecordsMissingGenderURLView = viewQueryURL.toString();
        }

        // Find demographics records in the past 90 days missing a gender.
        ArrayList<String[]> demographicsMissingGender;                                  //id, birth
        String demographicsMissingGenderURLView;                                        //url string (view)
        private void getDemographicsMissingGender() {
            //Creates filter.
            SimpleFilter myFilter = new SimpleFilter("gender", "", CompareType.ISBLANK);
            myFilter.addCondition("created", "-90d", CompareType.DATE_GTE);
            //Creates sort.
            Sort mySort = new Sort("Id");
            //Runs query.
            ArrayList<String[]> returnArray = notificationToolkit.getTableMultiRowMultiColumn(c, u, "study", "Demographics", myFilter, mySort, new String[]{"Id", "birth"});

            //Creates URL.
            String viewQueryURL = notificationToolkit.createQueryURL(c, "execute", "study", "Demographics", myFilter);
//            Path viewQueryURL = new Path(ActionURL.getBaseServerURL(), "query", c.getPath(), "executeQuery.view?schemaName=study&query.queryName=Demographics&query.gender~isblank=&query.created~dategte=-90d");

            //Returns data.
            this.demographicsMissingGender = returnArray;
            this.demographicsMissingGenderURLView = viewQueryURL.toString();
        }

        // Find prenatal records in the past 90 days missing a gender.
        ArrayList<String[]> prenatalRecordsMissingGender;                               //id, date
        String prenatalRecordsMissingGenderURLView;                                     //url string (view)
        private void getPrenatalRecordsMissingGender() {
            //Creates filter.
            SimpleFilter myFilter = new SimpleFilter("gender", "", CompareType.ISBLANK);
            myFilter.addCondition("date", "-90d", CompareType.DATE_GTE);
            //Creates sort.
            Sort mySort = new Sort("Id");
            //Runs query.
            ArrayList<String[]> returnArray = notificationToolkit.getTableMultiRowMultiColumn(c, u, "study", "Prenatal Deaths", myFilter, mySort, new String[]{"Id", "date"});

            //Creates URL.
            String viewQueryURL = notificationToolkit.createQueryURL(c, "execute", "study", "Prenatal Deaths", myFilter);
//            Path viewQueryURL = new Path(ActionURL.getBaseServerURL(), "query", c.getPath(), "executeQuery.view?schemaName=study&query.queryName=Prenatal Deaths&query.gender~isblank=&query.date~dategte=-90d");

            //Returns data.
            this.prenatalRecordsMissingGender = returnArray;
            this.prenatalRecordsMissingGenderURLView = viewQueryURL.toString();
        }

        // Find prenatal records in the past 90 days missing species.
        ArrayList<String[]> prenatalRecordsMissingSpecies;                              //id, date
        String prenatalRecordsMissingSpeciesURLView;                                    //url string (view)
        private void getPrenatalRecordsMissingSpecies() {
            //Creates filter.
            SimpleFilter myFilter = new SimpleFilter("species", "", CompareType.ISBLANK);
            myFilter.addCondition("date", "-90d", CompareType.DATE_GTE);
            //Creates sort.
            Sort mySort = new Sort("Id");
            //Runs query.
            ArrayList<String[]> returnArray = notificationToolkit.getTableMultiRowMultiColumn(c, u, "study", "Prenatal Deaths", myFilter, mySort, new String[]{"Id", "date"});

            //Creates URL.
            String viewQueryURL = notificationToolkit.createQueryURL(c, "execute", "study", "Prenatal Deaths", myFilter);
//            Path viewQueryURL = new Path(ActionURL.getBaseServerURL(), "query", c.getPath(), "executeQuery.view?schemaName=study&query.queryName=Prenatal Deaths&query.species~isblank=&query.date~dategte=-90d");

            //Returns data.
            this.prenatalRecordsMissingSpecies = returnArray;
            this.prenatalRecordsMissingSpeciesURLView = viewQueryURL.toString();
        }

        // Find all animals that died in the past 90 days where there isn't a weight within 7 days of death.
        ArrayList<String> animalsThatDiedWithoutWeight;                                 //id
        String animalsThatDiedWithoutWeightURLView;                                     //url string (view)
        private void getAnimalsThatDiedWithoutWeight() {
            //Creates filter.
            SimpleFilter myFilter = new SimpleFilter("death", "-90d", CompareType.DATE_GTE);
            //Creates sort.
            Sort mySort = new Sort("Id");
            //Runs query.
            ArrayList<String> returnArray = notificationToolkit.getTableMultiRowSingleColumn(c, u, "study", "validateFinalWeights", myFilter, mySort, "Id", null);

            //Creates URL.
            String viewQueryURL = notificationToolkit.createQueryURL(c, "execute", "study", "validateFinalWeights", myFilter);
//            Path viewQueryURL = new Path(ActionURL.getBaseServerURL(), "query", c.getPath(), "executeQuery.view?schemaName=study&query.queryName=validateFinalWeights&query.death~dategte=-90d");

            //Returns data.
            this.animalsThatDiedWithoutWeight = returnArray;
            this.animalsThatDiedWithoutWeightURLView = viewQueryURL.toString();
        }

        // Find TB records lacking a result more than 10 days old, but less than 90.
        ArrayList<String> tbRecordsLackingResult;                                       //id
        String tbRecordsLackingResultURLView;                                           //url string (view)
        private void getTbRecordsLackingResult() {
            //Creates filter.
            SimpleFilter myFilter = new SimpleFilter("missingresults", true, CompareType.EQUAL);
            myFilter.addCondition("date", "-90d", CompareType.DATE_GTE);
            myFilter.addCondition("date", "-10d", CompareType.DATE_LTE);
            //Runs query.
            ArrayList<String> returnArray = notificationToolkit.getTableMultiRowSingleColumn(c, u, "study", "TB Tests", myFilter, null, "Id", null);

            //Creates URL.
            String viewQueryURL = notificationToolkit.createQueryURL(c, "execute", "study", "TB Tests", myFilter);
//            Path viewQueryURL = new Path(ActionURL.getBaseServerURL(), "query", c.getPath(), "executeQuery.view?schemaName=study&query.queryName=TB Tests&query.date~datelte=-10d&query.date~dategte=-90d&query.missingresults~eq=true");

            //Returns data.
            this.tbRecordsLackingResult = returnArray;
            this.tbRecordsLackingResultURLView = viewQueryURL.toString();
        }

        //REMOVED QUERIES 26 & 27 (per user request).

        // Find protocols expiring soon.
        ArrayList<String> protocolsExpiringSoon;                                        //protocol
        String protocolsExpiringSoonURLView;                                            //url string (view)
        private void getProtocolsExpiringSoon() {
            //Gets 'expiring soon' deadline.
            int daysToExpiration = expiringSoonNumDays;
            int expirationValue = (365 * 3 - daysToExpiration);
            String expirationFilterValue = ("-" + expirationValue + "d");
            //Creates filter.
            SimpleFilter myFilter = new SimpleFilter("Approve", expirationFilterValue, CompareType.DATE_LTE);
            //Runs query.
            ArrayList<String> returnArray = notificationToolkit.getTableMultiRowSingleColumn(c, u, "ehr", "protocol", myFilter, null, "protocol", null);

            //Creates URL.
            String viewQueryURL = notificationToolkit.createQueryURL(c, "execute", "ehr", "protocol", myFilter);
//            Path viewQueryURL = new Path(ActionURL.getBaseServerURL(), "query", c.getPath(), "executeQuery.view?schemaName=ehr&query.queryName=protocol&query.Approve~datelte=-" + expirationValue + "d");

            //Returns data.
            this.protocolsExpiringSoon = returnArray;
            this.protocolsExpiringSoonURLView = viewQueryURL.toString();
        }

        // Find birth records without a corresponding demographics record.
        ArrayList<String> birthRecordsWithoutDemographicsRecord;                        //id
        String birthRecordsWithoutDemographicsRecordURLView;                            //url string (view)
        private void getBirthRecordsWithoutDemographicsRecord() {
            //Creates filter.
            SimpleFilter myFilter = new SimpleFilter("Id/Dataset/Demographics/Id", "", CompareType.ISBLANK);
            //Creates sort.
            Sort mySort = new Sort("Id");
            //Runs query.
            ArrayList<String> returnArray = notificationToolkit.getTableMultiRowSingleColumn(c, u, "study", "Birth", myFilter, mySort, "Id", null);

            //Creates URL.
            String viewQueryURL = notificationToolkit.createQueryURL(c, "execute", "study", "Birth", myFilter);
//            Path viewQueryURL = new Path(ActionURL.getBaseServerURL(), "query", c.getPath(), "executeQuery.view?schemaName=study&query.queryName=Birth&query.Id/Dataset/Demographics/Id~isblank");

            //Returns data.
            this.birthRecordsWithoutDemographicsRecord = returnArray;
            this.birthRecordsWithoutDemographicsRecordURLView = viewQueryURL.toString();
        }

        // Find death records without a corresponding demographics record.
        ArrayList<String> deathRecordsWithoutDemographicsRecord;                        //id
        String deathRecordsWithoutDemographicsRecordURLView;                            //url string (view)
        private void getDeathRecordsWithoutDemographicsRecord() {
            //Creates filter.
            SimpleFilter myFilter = new SimpleFilter("Id/Dataset/Demographics/Id", "", CompareType.ISBLANK);
            myFilter.addCondition("notAtCenter", true, CompareType.NEQ_OR_NULL);
            //Creates sort.
            Sort mySort = new Sort("Id");
            //Runs query.
            ArrayList<String> returnArray = notificationToolkit.getTableMultiRowSingleColumn(c, u, "study", "Deaths", myFilter, mySort, "Id", null);

            //Creates URL.
            String viewQueryURL = notificationToolkit.createQueryURL(c, "execute", "study", "Deaths", myFilter);
//            Path viewQueryURL = new Path(ActionURL.getBaseServerURL(), "query", c.getPath(), "executeQuery.view?schemaName=study&query.queryName=Deaths&query.Id/Dataset/Demographics/Id~isblank&query.notAtCenter~neqornull=true");

            //Returns data.
            this.deathRecordsWithoutDemographicsRecord = returnArray;
            this.deathRecordsWithoutDemographicsRecordURLView = viewQueryURL.toString();
        }

        // Find animals with hold codes, but not on pending.
        ArrayList<String[]> animalsWithHoldCodesNotPending;                               //id
        String animalsWithHoldCodesNotPendingURLView;                                   //url string (view)
        private void getAnimalsWithHoldCodesNotPending() {
            //Creates filter.
            SimpleFilter myFilter = new SimpleFilter("hold", "", CompareType.NONBLANK);
            myFilter.addCondition("Id/assignmentSummary/NumPendingAssignments", 0, CompareType.EQUAL);
            //Creates sort.
            Sort mySort = new Sort("Id");
            //Runs query.
//            ArrayList<String> returnArray = notificationToolkit.getTableMultiRowSingleColumn(c, u, "study", "Demographics", myFilter, mySort, "Id", null);
            ArrayList<String[]> returnArray = notificationToolkit.getTableMultiRowMultiColumn(c, u, "study", "Demographics", myFilter, mySort, new String[]{"Id", "hold"});
            //Creates URL.
            String viewQueryURL = notificationToolkit.createQueryURL(c, "execute", "study", "Demographics", myFilter);
//            Path viewQueryURL = new Path(ActionURL.getBaseServerURL(), "query", c.getPath(), "executeQuery.view?schemaName=study&query.queryName=Demographics&query.hold~isnonblank&query.Id/assignmentSummary/NumPendingAssignments~eq=0");

            //Returns data.
            this.animalsWithHoldCodesNotPending = returnArray;
            this.animalsWithHoldCodesNotPendingURLView = viewQueryURL.toString();
        }

        // Find assignments with projected releases today.
        ArrayList<String> assignmentsWithProjectedReleasesToday;                        //id
        String assignmentsWithProjectedReleasesTodayURLView;                            //url string (view)
        private void getAssignmentsWithProjectedReleasesToday() {
            //Gets info.
            Date currentDate = dateToolkit.getDateToday();
            //Creates filter.
            SimpleFilter myFilter = new SimpleFilter("projectedRelease", currentDate, CompareType.DATE_EQUAL);
            myFilter.addCondition("enddate", "", CompareType.NONBLANK);
            //Creates sort.
            Sort mySort = new Sort("Id");
            //Runs query.
            ArrayList<String> returnArray = notificationToolkit.getTableMultiRowSingleColumn(c, u, "study", "Assignment", myFilter, mySort, "Id", null);

            //Creates URL.
            String viewQueryURL = notificationToolkit.createQueryURL(c, "execute", "study", "Assignment", myFilter);
//            Path viewQueryURL = new Path(ActionURL.getBaseServerURL(), "query", c.getPath(), "executeQuery.view?schemaName=study&query.queryName=Assignment&query.projectedRelease~dateeq="+ currentDate + "&query.enddate~isnonblank=");

            //Returns data.
            this.assignmentsWithProjectedReleasesToday = returnArray;
            this.assignmentsWithProjectedReleasesTodayURLView = viewQueryURL.toString();
        }

        // Find assignments with projected releases tomorrow.
        ArrayList<String> assignmentsWithProjectedReleasesTomorrow;                     //id
        String assignmentsWithProjectedReleasesTomorrowURLView;                         //url string (view)
        private void getAssignmentsWithProjectedReleasesTomorrow() {
            //Gets info.
            Date tomorrowDate = dateToolkit.getDateXDaysFromNow(1);
            //Creates filter.
            SimpleFilter myFilter = new SimpleFilter("projectedRelease", tomorrowDate, CompareType.DATE_EQUAL);
            //Runs query.
            ArrayList<String> returnArray = notificationToolkit.getTableMultiRowSingleColumn(c, u, "study", "Assignment", myFilter, null, "Id", null);

            //Creates URL.
            String viewQueryURL = notificationToolkit.createQueryURL(c,"execute", "study", "Assignment", myFilter);
//            Path viewQueryURL = new Path(ActionURL.getBaseServerURL(), "query", c.getPath(), "executeQuery.view?schemaName=study&query.queryName=Assignment&query.projectedRelease~dateeq=" + tomorrowDate);

            //Returns data.
            this.assignmentsWithProjectedReleasesTomorrow = returnArray;
            this.assignmentsWithProjectedReleasesTomorrowURLView = viewQueryURL.toString();
        }

        // Summarize events in the last 5 days.
        ArrayList<String> birthsInLastFiveDays;                                         //id
        String birthsInLastFiveDaysURLView;                                             //url string (view)
        private void getBirthsInLastFiveDays() {
            //Gets info.
            Date fiveDaysAgoDate = dateToolkit.getDateXDaysFromNow(-5);
            //Creates filter.
            SimpleFilter myFilter = new SimpleFilter("date", fiveDaysAgoDate, CompareType.DATE_GTE);
            //Creates sort.
            Sort mySort = new Sort("Id");
            //Runs query.
            ArrayList<String> returnArray = notificationToolkit.getTableMultiRowSingleColumn(c, u, "study", "Birth", myFilter, mySort, "Id", null);

            //Creates URL.
            String viewQueryURL = notificationToolkit.createQueryURL(c, "execute", "study", "Birth", myFilter);
//            Path viewQueryURL = new Path(ActionURL.getBaseServerURL(), "query", c.getPath(), "executeQuery.view?schemaName=study&query.queryName=Birth&query.date~dategte=" + fiveDaysAgoDate);

            //Returns data.
            this.birthsInLastFiveDays = returnArray;
            this.birthsInLastFiveDaysURLView = viewQueryURL.toString();
        }

        // Deaths in the last 5 days.
        ArrayList<String> deathsInLastFiveDays;                                         //id
        String deathsInLastFiveDaysURLView;                                             //url string (view)
        private void getDeathsInLastFiveDays() {
            //Gets info.
            Date fiveDaysAgoDate = dateToolkit.getDateXDaysFromNow(-5);
            //Creates filter.
            SimpleFilter myFilter = new SimpleFilter("date", fiveDaysAgoDate, CompareType.DATE_GTE);
            //Creates sort.
            Sort mySort = new Sort("Id");
            //Runs query.
            ArrayList<String> returnArray = notificationToolkit.getTableMultiRowSingleColumn(c, u, "study", "Deaths", myFilter, mySort, "Id", null);

            //Creates URL.
            String viewQueryURL = notificationToolkit.createQueryURL(c, "execute", "study", "Deaths", myFilter);
//            Path viewQueryURL = new Path(ActionURL.getBaseServerURL(), "query", c.getPath(), "executeQuery.view?schemaName=study&query.queryName=Deaths&query.date~dategte=" + fiveDaysAgoDate);

            //Returns data.
            this.deathsInLastFiveDays = returnArray;
            this.deathsInLastFiveDaysURLView = viewQueryURL.toString();
        }

        // Prenatal deaths in the last 5 days.
        ArrayList<String> prenatalDeathsInLastFiveDays;                                 //id
        String prenatalDeathsInLastFiveDaysURLView;                                     //url string (view)
        private void getPrenatalDeathsInLastFiveDays() {
            //Gets info.
            Date fiveDaysAgoDate = dateToolkit.getDateXDaysFromNow(-5);
            //Creates filter.
            SimpleFilter myFilter = new SimpleFilter("date", fiveDaysAgoDate, CompareType.DATE_GTE);
            //Creates sort.
            Sort mySort = new Sort("Id");
            //Runs query.
            ArrayList<String> returnArray = notificationToolkit.getTableMultiRowSingleColumn(c, u, "study", "Prenatal Deaths", myFilter, mySort, "Id", null);

            //Creates URL.
            String viewQueryURL = notificationToolkit.createQueryURL(c, "execute", "study", "Prenatal Deaths", myFilter);
//            Path viewQueryURL = new Path(ActionURL.getBaseServerURL(), "query", c.getPath(), "executeQuery.view?schemaName=study&query.queryName=Prenatal Deaths&query.date~dategte=" + fiveDaysAgoDate);

            //Returns data.
            this.prenatalDeathsInLastFiveDays = returnArray;
            this.prenatalDeathsInLastFiveDaysURLView = viewQueryURL.toString();
        }

        // Find the total finalized records with future dates.
        ArrayList<String> totalFinalizedRecordsWithFutureDates;                         //id
        String totalFinalizedRecordsWithFutureDatesURLView;                             //url string (view)
        private void getTotalFinalizedRecordsWithFutureDates() {
            //Gets info.
            Date todayDate = dateToolkit.getDateToday();
            //Creates filter.
            SimpleFilter myFilter = new SimpleFilter("Id/Dataset/Demographics/QCState/PublicData", true, CompareType.EQUAL);
            myFilter.addCondition("date", todayDate, CompareType.DATE_GT);
            myFilter.addCondition("dataset/label", "Treatment Orders", CompareType.NEQ);
            myFilter.addCondition("dataset/label", "Assignment", CompareType.NEQ);
            //Runs query.
            ArrayList<String> returnArray = notificationToolkit.getTableMultiRowSingleColumn(c, u, "study", "StudyData", myFilter, null, "Id", null);

            //Creates URL.
            String viewQueryURL = notificationToolkit.createQueryURL(c, "execute", "study", "StudyData", myFilter);
//            Path viewQueryURL = new Path(ActionURL.getBaseServerURL(), "query", c.getPath(), "executeQuery.view?schemaName=study&query.queryName=StudyData&query.date~dategt=" + todayDate + "&query.Id/Dataset/Demographics/QCState/PublicData~eq=1&query.dataset/label~neq=Treatment Orders&query.dataset/label~neq=Assignment");

            //Returns data.
            this.totalFinalizedRecordsWithFutureDates = returnArray;
            this.totalFinalizedRecordsWithFutureDatesURLView = viewQueryURL.toString();
        }

        // Find all animals with cage size problems.
        ArrayList<String> cagesWithSizeProblems;                                        //cage location
        String cagesWithSizeProblemsURLView;                                            //url string (view)
        private void getAnimalsWithCageSizeProblems() {
            // Creates filter.
            SimpleFilter myFilter = new SimpleFilter("cageStatus", "ERROR", CompareType.EQUAL);
            // Runs query.
            ArrayList<String> returnArray = notificationToolkit.getTableMultiRowSingleColumn(c, u, "study", "CageReview", myFilter, null, "Location", null);

            // Creates URL.
            String viewQueryURL = notificationToolkit.createQueryURL(c, "execute", "study", "CageReview", myFilter);

            // Returns data.
            this.cagesWithSizeProblems = returnArray;
            this.cagesWithSizeProblemsURLView = viewQueryURL.toString();
        }

        // Find protocols nearing the animal limit count.
        ArrayList<HashMap<String, String>> protocolsNearingAnimalLimitCount;            //protocol
        String protocolsNearingAnimalLimitCountURLView;                                 //url string (view)
        private void getProtocolsNearingAnimalLimitCount() {
            // Creates filter.
            SimpleFilter myFilter = new SimpleFilter("TotalRemaining", 5, CompareType.LT);
            myFilter.addCondition("allowed", 0, CompareType.NEQ);
            // Sets target columns.
            String[] targetColumns = new String[]{"protocol", "allowed", "PercentUsed", "TotalRemaining", "Species", "protocol/inves"};
            // Runs query.
            ArrayList<HashMap<String, String>> returnArray = notificationToolkit.getTableMultiRowMultiColumnWithFieldKeys(c, u, "ehr", "protocolTotalAnimalsBySpecies", myFilter, null, targetColumns);

            //Creates URL.
            String viewQueryURL = notificationToolkit.createQueryURL(c, "execute", "ehr", "protocolTotalAnimalsBySpecies", myFilter);

            //Returns data.
            this.protocolsNearingAnimalLimitCount = returnArray;
            this.protocolsNearingAnimalLimitCountURLView = viewQueryURL;
        }

        // Find protocols nearing the animal limit percentage.
        ArrayList<HashMap<String, String>> protocolsNearingAnimalLimitPercentage;       //protocol
        String protocolsNearingAnimalLimitPercentageURLView;                            //url string (view)
        private void getProtocolsNearingAnimalLimitPercentage() {
            //Creates filter.
            SimpleFilter myFilter = new SimpleFilter("PercentUsed", 95, CompareType.GTE);
            // Sets target columns.
            String[] targetColumns = new String[]{"protocol", "allowed", "PercentUsed", "TotalRemaining", "Species", "protocol/inves"};
            //Runs query.
            ArrayList<HashMap<String, String>> returnArray = notificationToolkit.getTableMultiRowMultiColumnWithFieldKeys(c, u, "ehr", "protocolTotalAnimalsBySpecies", myFilter, null, targetColumns);

            //Creates URL.
            String viewQueryURL = notificationToolkit.createQueryURL(c, "execute", "ehr", "protocolTotalAnimalsBySpecies", myFilter);

            //Returns data.
            this.protocolsNearingAnimalLimitPercentage = returnArray;
            this.protocolsNearingAnimalLimitPercentageURLView = viewQueryURL;
        }
    }
}

