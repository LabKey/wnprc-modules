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
        return "Colony Management Notification Revamp";
    }
    @Override
    public String getDescription() {
        return "The report is designed to identify potential problems with the colony, primarily related to weights, housing and assignments.  It was run on: " + dateToolkit.getCurrentTime();
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
        // 1. Find all living animals without a weight. (1)
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
        // 10. Find animals with hold codes, but not on pending.    TODO: Present info here.
        if (!myColonyInformationObject.animalsWithHoldCodesNotPending.isEmpty()) {
            messageBody.append("<b>WARNING: There are " + myColonyInformationObject.animalsWithHoldCodesNotPending.size() + " animals with a hold code, but not on the pending project.</b><br>");
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

//    public static class ColonyManagementObject {
//        Container c;
//        User u;
//        NotificationToolkit notificationToolkit = new NotificationToolkit();
//        NotificationToolkit.DateToolkit dateToolkit = new NotificationToolkit.DateToolkit();
//
//        public ColonyManagementObject(Container currentContainer, User currentUser) {
//            //1. Find all living animals without a weight.
//            getLivingAnimalsWithoutWeight();
//            //2. Find all occupied cages without dimensions.
//            getOccupiedCagesWithoutDimensions();
//            //3. List all animals in protected contact without an adjacent pc animal.
//            getLivingAnimalsInProtectedContact();
//            //4. Find all records with potential housing condition problems.
//            getAllRecordsWithPotentialHousingConditionProblems();
//            // 5 (new) Find all animals with cage size problems.
//            getAnimalsWithCageSizeProblems();   // TODO: Finish this.
//            //6. Find all animals lacking any assignments.
//            getAnimalsLackingAssignments();
//            //7. Find any active assignment where the animal is not alive.
//            getActiveAssignmentsWhereAnimalIsNotAlive();
//            //8. Find any active assignment where the project lacks a valid protocol.
//            getActiveAssignmentsWhereProjectLacksValidProtocol();
//            //9. Find any duplicate active assignments.
//            getDuplicateActiveAssignments();
//            //10. Find animals with hold codes, but not on pending.
//            getAnimalsWithHoldCodesNotPending();
//            // 11 (26 - gets&presents data differently though) Find protocols nearing the animal limit count.   // TODO: Update this.
//            getProtocolsNearingAnimalLimitCount();
//            // 12 (27 - gets&presents data differently though) Find protocols nearing the animal limit percentage.  // TODO: Update this.
//            getProtocolsNearingAnimalLimitPercentage();
//        }
//
//        //1. Find all living animals without a weight.
//        ArrayList<String> livingAnimalsWithoutWeight;                                   //id
//        String livingAnimalsWithoutWeightURL;                                           //url string (view)
//        private void getLivingAnimalsWithoutWeight() {
//            //Creates filter.
//            SimpleFilter myFilter = new SimpleFilter("calculated_status", "Alive", CompareType.EQUAL);
//            myFilter.addCondition("Id/MostRecentWeight/MostRecentWeightDate", "", CompareType.ISBLANK);
//            //Creates sort.
//            Sort mySort = new Sort("Id");
//            //Runs query.
//            ArrayList<String> returnArray = notificationToolkit.getTableMultiRowSingleColumn(c, u, "study", "Demographics", myFilter, mySort, "Id", null);
//
//            //Creates URL.
//            String viewQueryURL = notificationToolkit.createQueryURL(c, "execute", "study", "Demographics", myFilter);
//
//            //Returns data.
//            this.livingAnimalsWithoutWeight = returnArray;
//            this.livingAnimalsWithoutWeightURL = viewQueryURL.toString();
//        }
//
//        //2. Find all occupied cages without dimensions.
//        ArrayList<String[]> occupiedCagesWithoutDimensions;                             //room, cage
//        String occupiedCagesWithoutDimensionsURLView;                                   //url string (view)
//        String occupiedCagesWithoutDimensionsURLEdit;                                   //url string (edit)
//        private void getOccupiedCagesWithoutDimensions() {
//            //Runs query.
//            ArrayList<String[]> returnArray = notificationToolkit.getTableMultiRowMultiColumn(c, u, "ehr", "missingCages", null, null, new String[]{"room", "cage"});
//
//            //Creates URL.
//            String viewQueryURL = notificationToolkit.createQueryURL(c, "execute", "ehr", "missingCages", null);
//            String editQueryURL = notificationToolkit.createQueryURL(c, "update", "ehr", "missingCages", null);
//
//            //Returns data.
//            this.occupiedCagesWithoutDimensions = returnArray;
//            this.occupiedCagesWithoutDimensionsURLView = viewQueryURL.toString();
//            this.occupiedCagesWithoutDimensionsURLEdit = editQueryURL.toString();
//        }
//
//        //3. List all animals in protected contact without an adjacent pc animal.
//        ArrayList<String[]> livingAnimalsInProtectedContact;                            //id, cage, room
//        String livingAnimalsInProtectedContactURLView;                                  //url string (view)
//        private void getLivingAnimalsInProtectedContact() {
//            //Creates filter.
//            SimpleFilter myFilter = new SimpleFilter("Id/Dataset/Demographics/calculated_status", "Alive", CompareType.EQUAL);
//            myFilter.addCondition("cond", "pc", CompareType.EQUAL);
//            myFilter.addCondition("enddate", "", CompareType.ISBLANK);
//            //Creates sort.
//            Sort mySort = new Sort("Id");
//            //Runs query.
//            ArrayList<String[]> resultArray = notificationToolkit.getTableMultiRowMultiColumn(c, u, "study", "Housing", myFilter, mySort, new String[]{"Id", "cage", "room"});
//
//            //Loops through each result in the table.
//            ArrayList<String[]> returnArray = new ArrayList<String[]>();
//            for (int i = 0; i < resultArray.size(); i++) {
//                Boolean hasAdjacentPcAnimal = false;
//                String result1Id = resultArray.get(i)[0];
//                String result1Room = resultArray.get(i)[2];
//                //Loops through each result in the table.
//                for (int j = 0; j < resultArray.size(); j++) {
//                    String result2Id = resultArray.get(j)[0];
//                    String result2Room = resultArray.get(j)[2];
//                    //Animal shares the same room as another result, but is not the same animal.
//                    if ((result1Room.equals(result2Room)) && (!result1Id.equals(result2Id))) {
//                        try {
//                            Integer result2Cage = Integer.valueOf(resultArray.get(j)[1]);
//                            Integer result1Cage = Integer.valueOf(resultArray.get(i)[1]);
//                            //Checks to see if the cages are next to eachother.
//                            if (((result1Cage + 1) == result2Cage) || ((result1Cage - 1) == result2Cage)) {
//                                //Marks this animal as 'having an adjacent pc animal'.
//                                hasAdjacentPcAnimal = true;
//                            }
//                        }
//                        catch (NumberFormatException e) {
//                            //This makes sure results with non-numerical cages don't show up in query results.
//                            //According to Colony Records, pc animals will never be in non-numerical cages (ex. tmp1 or table1).
//                            hasAdjacentPcAnimal = true;
//                        }
//                    }
//                }
//                if (hasAdjacentPcAnimal == false) {
//                    returnArray.add(resultArray.get(i));
//                }
//            }
//
//            //Creates URL.
//            String viewQueryURL = notificationToolkit.createQueryURL(c, "execute", "study", "Housing", myFilter);
//
//            //Returns data.
//            this.livingAnimalsInProtectedContact = returnArray;
//            this.livingAnimalsInProtectedContactURLView = viewQueryURL.toString();
//        }
//
//        //4. Find all records with potential housing condition problems.
//        ArrayList<String> recordsWithPotentialHousingConditionProblems;                 //id
//        String recordsWithPotentialHousingConditionProblemsURLView;                     //url string (view)
//        String recordsWithPotentialHousingConditionProblemsURLEdit;                     //url string (edit)
//        private void getAllRecordsWithPotentialHousingConditionProblems() {
//            //Creates filter.
//            SimpleFilter myFilter = new SimpleFilter("conditionStatus", "ERROR", CompareType.EQUAL);
//            //Creates sort.
//            Sort mySort = new Sort("room, cage");
//            //Runs query.
//            ArrayList<String> returnArray = notificationToolkit.getTableMultiRowSingleColumn(c, u, "study", "housingConditionProblems", myFilter, mySort, "Id", null);
//
//            //Creates URL.
//            String viewQueryURL = notificationToolkit.createQueryURL(c, "execute", "study", "housingConditionProblems", myFilter);
//            StringBuilder idsToCheck = new StringBuilder();
//            for (String id : returnArray) {
//                idsToCheck.append(id + ";");
//            }
//            myFilter.addCondition("Id", idsToCheck.toString(), CompareType.IN);
//            myFilter.addCondition("enddate", "", CompareType.ISBLANK);
//            String editQueryURL = notificationToolkit.createQueryURL(c, "update", "study", "Housing", myFilter);
//
//            //Returns data.
//            this.recordsWithPotentialHousingConditionProblems = returnArray;
//            this.recordsWithPotentialHousingConditionProblemsURLView = viewQueryURL.toString();
//            this.recordsWithPotentialHousingConditionProblemsURLEdit = editQueryURL.toString();
//        }
//
//        // TODO: 5. Find all animals with cage size problems.
//        ArrayList<String> cagesWithSizeProblems;                                        //cage location
//        String cagesWithSizeProblemsURLView;                                            //url string (view)
//        private void getAnimalsWithCageSizeProblems() {
//            // TODO
//
//            // Creates filter.
//            SimpleFilter myFilter = new SimpleFilter("cageStatus", "ERROR", CompareType.EQUAL);
//            // Runs query.
//            ArrayList<String> returnArray = notificationToolkit.getTableMultiRowSingleColumn(c, u, "study", "CageReview", myFilter, null, "Location", null);
//
//            // Creates URL.
//            String viewQueryURL = notificationToolkit.createQueryURL(c, "execute", "study", "CageReview", myFilter);
//
//            // Returns data.
//            this.cagesWithSizeProblems = returnArray;
//            this.cagesWithSizeProblemsURLView = viewQueryURL.toString();
//        }
//
//        //6. Find all animals lacking any assignments.
//        ArrayList<String> animalsLackingAssignments;                                    //id
//        String animalsLackingAssignmentsURLView;                                        //url string (view)
//        private void getAnimalsLackingAssignments() {
//            //Creates filter.
//            SimpleFilter myFilter = new SimpleFilter("calculated_status", "Alive", CompareType.EQUAL);
//            myFilter.addCondition("Id/AssignmentSummary/NumActiveAssignments", 0, CompareType.EQUAL);
//            //Creates sort.
//            Sort mySort = new Sort("Id");
//            //Runs query.
//            ArrayList<String> returnArray = notificationToolkit.getTableMultiRowSingleColumn(c, u, "study", "Demographics", myFilter, mySort, "Id", null);
//
//            //Creates URL.
//            String viewQueryURL = notificationToolkit.createQueryURL(c, "execute", "study", "Demographics", myFilter);
//
//            //Returns data.
//            this.animalsLackingAssignments = returnArray;
//            this.animalsLackingAssignmentsURLView = viewQueryURL.toString();
//        }
//
//        //7. Find any active assignment where the animal is not alive.
//        ArrayList<String> activeAssignmentsWhereAnimalIsNotAlive;                       //id
//        String activeAssignmentsWhereAnimalIsNotAliveURLView;                           //url string (view)
//        private void getActiveAssignmentsWhereAnimalIsNotAlive() {
//            //Creates filter.
//            SimpleFilter myFilter = new SimpleFilter("Id/Dataset/Demographics/calculated_status", "Alive", CompareType.NEQ_OR_NULL);
//            myFilter.addCondition("enddate", "", CompareType.ISBLANK);
//            //Runs query.
//            ArrayList<String> returnArray = notificationToolkit.getTableMultiRowSingleColumn(c, u, "study", "Assignment", myFilter, null, "Id", null);
//
//            //Creates URL.
//            String viewQueryURL = notificationToolkit.createQueryURL(c, "execute", "study", "Assignment", myFilter);
//
//            //Returns data.
//            this.activeAssignmentsWhereAnimalIsNotAlive = returnArray;
//            this.activeAssignmentsWhereAnimalIsNotAliveURLView = viewQueryURL.toString();
//        }
//
//        //8. Find any active assignment where the project lacks a valid protocol.
//        //REVAMP EDIT: Changed from (calculated_status does not equal alive or is null) to (calculated_status equals alive).
//        ArrayList<String> activeAssignmentsWhereProjectLacksValidProtocol;              //id
//        String activeAssignmentsWhereProjectLacksValidProtocolURLView;                  //url string (view)
//        private void getActiveAssignmentsWhereProjectLacksValidProtocol() {
//            //Creates filter.
//            SimpleFilter myFilter = new SimpleFilter("Id/Dataset/Demographics/calculated_status", "Alive", CompareType.EQUAL);
//            myFilter.addCondition("enddate", "", CompareType.ISBLANK);
//            myFilter.addCondition("project/protocol", "", CompareType.ISBLANK);
//            //Runs query.
//            ArrayList<String> returnArray = notificationToolkit.getTableMultiRowSingleColumn(c, u, "study", "Assignment", myFilter, null, "Id", null);
//
//            //Creates URL.
//            String viewQueryURL = notificationToolkit.createQueryURL(c, "execute", "study", "Assignment", myFilter);
//
//            //Returns data.
//            this.activeAssignmentsWhereProjectLacksValidProtocol = returnArray;
//            this.activeAssignmentsWhereProjectLacksValidProtocolURLView = viewQueryURL.toString();
//        }
//
//        //9. Find any duplicate active assignments.
//        ArrayList<String> duplicateActiveAssignments;                                   //id
//        String duplicateActiveAssignmentsURLView;                                       //url string (view)
//        private void getDuplicateActiveAssignments() {
//            //Runs query.
//            ArrayList<String> returnArray = notificationToolkit.getTableMultiRowSingleColumn(c, u, "study", "duplicateAssignments", null, null, "Id", null);
//
//            //Creates URL.
//            String viewQueryURL = notificationToolkit.createQueryURL(c, "execute", "study", "duplicateAssignments", null);
//
//            //Returns data.
//            this.duplicateActiveAssignments = returnArray;
//            this.duplicateActiveAssignmentsURLView = viewQueryURL.toString();
//        }
//
//        //10. Find animals with hold codes, but not on pending.
//        ArrayList<String> animalsWithHoldCodesNotPending;                               //id
//        String animalsWithHoldCodesNotPendingURLView;                                   //url string (view)
//        private void getAnimalsWithHoldCodesNotPending() {
//            //Creates filter.
//            SimpleFilter myFilter = new SimpleFilter("hold", "", CompareType.NONBLANK);
//            myFilter.addCondition("Id/assignmentSummary/NumPendingAssignments", 0, CompareType.EQUAL);
//            //Creates sort.
//            Sort mySort = new Sort("Id");
//            //Runs query.
//            ArrayList<String> returnArray = notificationToolkit.getTableMultiRowSingleColumn(c, u, "study", "Demographics", myFilter, mySort, "Id", null);
//
//            //Creates URL.
//            String viewQueryURL = notificationToolkit.createQueryURL(c, "execute", "study", "Demographics", myFilter);
//
//            //Returns data.
//            this.animalsWithHoldCodesNotPending = returnArray;
//            this.animalsWithHoldCodesNotPendingURLView = viewQueryURL.toString();
//        }
//
//        //11. Find protocols nearing the animal limit count.
//        ArrayList<HashMap<String, String>> protocolsNearingAnimalLimitCount;            //protocol
//        String protocolsNearingAnimalLimitCountURLView;                                 //url string (view)
//        private void getProtocolsNearingAnimalLimitCount() {
//            // Creates filter.
//            SimpleFilter myFilter = new SimpleFilter("TotalRemaining", 5, CompareType.LT);
//            myFilter.addCondition("allowed", 0, CompareType.NEQ);
//            // Sets target columns.
//            String[] targetColumns = new String[]{"protocol", "allowed", "PercentUsed", "TotalRemaining", "Species", "protocol/inves"};
//            // Runs query.
//            ArrayList<HashMap<String, String>> returnArray = notificationToolkit.getTableMultiRowMultiColumnWithFieldKeys(c, u, "ehr", "protocolTotalAnimalsBySpecies", myFilter, null, targetColumns);
//
//            //Creates URL.
//            Path viewQueryURL = new Path(ActionURL.getBaseServerURL(), "query", c.getPath(), "executeQuery.view?schemaName=ehr&query.queryName=protocolTotalAnimalsBySpecies&query.TotalRemaining~lt=5&query.allowed~neqornull=0");
//
//            //Returns data.
//            this.protocolsNearingAnimalLimitCount = returnArray;
//            this.protocolsNearingAnimalLimitCountURLView = viewQueryURL.toString();
//        }
//
//        //12. Find protocols nearing the animal limit percentage.
//        ArrayList<HashMap<String, String>> protocolsNearingAnimalLimitPercentage;       //protocol
//        String protocolsNearingAnimalLimitPercentageURLView;                            //url string (view)
//        private void getProtocolsNearingAnimalLimitPercentage() {
//            //Creates filter.
//            SimpleFilter myFilter = new SimpleFilter("PercentUsed", 95, CompareType.GTE);
//            // Sets target columns.
//            String[] targetColumns = new String[]{"protocol", "allowed", "PercentUsed", "TotalRemaining", "Species", "protocol/inves"};
//            //Runs query.
//            ArrayList<HashMap<String, String>> returnArray = notificationToolkit.getTableMultiRowMultiColumnWithFieldKeys(c, u, "ehr", "protocolTotalAnimalsBySpecies", myFilter, null, targetColumns);
//
//            //Creates URL.
//            Path viewQueryURL = new Path(ActionURL.getBaseServerURL(), "query", c.getPath(), "executeQuery.view?schemaName=ehr&query.queryName=protocolTotalAnimalsBySpecies&query.PercentUsed~gte=95");
//
//            //Returns data.
//            this.protocolsNearingAnimalLimitPercentage = returnArray;
//            this.protocolsNearingAnimalLimitPercentageURLView = viewQueryURL.toString();
//        }
//    }
}
