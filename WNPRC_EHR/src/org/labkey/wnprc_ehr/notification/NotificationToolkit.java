package org.labkey.wnprc_ehr.notification;


import jakarta.mail.Address;
import jakarta.mail.Message;
import org.apache.commons.lang3.StringUtils;
import org.junit.Assert;
import org.junit.Test;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.FilterInfo;
import org.labkey.api.data.Results;
import org.labkey.api.data.ResultsImpl;
import org.labkey.api.data.Selector;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.Sort;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.ldk.notification.Notification;
import org.labkey.api.ldk.notification.NotificationService;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.query.CustomView;
import org.labkey.api.query.CustomViewInfo;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.security.User;
import org.labkey.api.security.UserPrincipal;
import org.labkey.api.util.MailHelper;
import org.labkey.api.util.Path;
import org.labkey.api.view.ActionURL;
import org.labkey.wnprc_ehr.WNPRC_EHRModule;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.math.BigDecimal;
import java.nio.file.Paths;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Calendar;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.labkey.api.search.SearchService._log;


public class NotificationToolkit {

    /**
     * Retrieves the table as a list, then converts it to HTML.
     *      NOTE: The passed in .qview.xml file cannot contain value as an integer.  Not sure why.
     *      Example (this DOES NOT work, why?): <filter column="frequency" operator="eq" value="1"/>
     * @param c         The user's current container.
     * @param u         The current user.
     * @param tableName The name of the query(table) we're retrieving.
     * @param qViewName The name of the desired custom qview for the given table.  If using default, enter "" instead of null.
     * @return          An HTML representation of the passed-in table with the passed-in qview applied.
     */
    public String getTableAsHTML(Container c, User u, String tableName, String qViewName) {
        //Gets table as a list without headers.
        ArrayList<String[]> tableAsList = getTableAsList(c, u , tableName, qViewName);
        //Gets table headers.
        QviewObject myQviewParameters = new QviewObject(c, u, tableName, qViewName);
        String[] headersArray = myQviewParameters.columnTitles.toArray(new String[0]);

        //Gets variables.
        int numRows = tableAsList.size();   //TODO: Fix this, I should check table size here without creating the list, right?  Should be able to create a tableSelector and get count.
        int numColumns = headersArray.length;

        StringBuilder tempTable = new StringBuilder();
        tempTable.append("<table>");

        //Adds column headers.
        tempTable.append("<tr>");
        for (int i = 0; i < headersArray.length; i++) {
            tempTable.append("<th>" + headersArray[i] + "</th>");
        }
        tempTable.append("</tr>");

        //Cycles through each row.
        for (int currentRow = 0; currentRow < numRows; currentRow++) {
            tempTable.append("<tr>");
            //Cycles through each column in the current row.
            for (int currentColumn = 0; currentColumn < numColumns; currentColumn++) {
                tempTable.append("<th>" + tableAsList.get(currentRow)[currentColumn] + "</th>");
            }
            tempTable.append("</tr>");
        }

        //Returns the HTML table.
        tempTable.append("</table>");
        return tempTable.toString();
    }

    /**
     * Retrieves the table as an ArrayList of String[].  DOES NOT include table headers (to allow easier data manipulation).
     * @param c         The user's current container.
     * @param u         The current user.
     * @param tableName The name of the query(table) we're retrieving.
     * @param qViewName The name of the desired custom qview for the given table.  If using default, enter "" instead of null.
     * @return          A 2D array of the table data without headers included.
     */
    //Returns table data as an ArrayList of String[].  DOES NOT include table headers.
    public final ArrayList<String[]> getTableAsList(Container c, User u, String tableName, String qViewName) {
        //Creates return variable.
        ArrayList<String[]> returnList = new ArrayList<String[]>();

        //Gets table parameters from qView.
        QviewObject myQview = new QviewObject(c, u, tableName, qViewName);
        ArrayList<String> myTitles = myQview.columnTitles;
        ArrayList<String> myColumns = myQview.columnNames;
        SimpleFilter myFilter = myQview.queryFilter;
        Sort mySort = myQview.querySort;

        //Creates table.
        TableSelector myTable = new TableSelector(QueryService.get().getUserSchema(u, c, "study").getTable(tableName), myFilter, mySort);

        //Verifies table contains specified data before continuing.
        if (myTable.getRowCount() > 0) {
            //Iterates through each table row and adds them each to returnList.
            myTable.forEach(new Selector.ForEachBlock<ResultSet>() {
                @Override
                public void exec(ResultSet rs) throws SQLException {

                    //Creates a 'currentRow' with size equal to numColumns.
//                    String[] currentRow = new String[(int) columnNames.length];
                    String[] currentRow = new String[(int) myColumns.size()];

                    //Updates the 'currentRow' with table data.
//                    for (int i = 0; i < columnNames.length; i++) {
                    for (int i = 0; i < myColumns.size(); i++) {
                        //TODO: Should i verify table contains column name or just let it throw an error?
                        if (rs.getString(myColumns.get(i)) == null) {
//                        if (rs.getString(columnNames[i]) == null) {
                            currentRow[i] = "";
                        }
                        else {
//                            currentRow[i] = rs.getString(columnNames[i]);
                            currentRow[i] = rs.getString(myColumns.get(i));
                        }
                    }

                    //Adds 'currentRow' to our List.
                    returnList.add(currentRow);
                }
            });
        }

        //Returns list of data.
        return returnList;
    }

    /**
     * Retrieves the number of rows in a given qview-customized query (table).
     * @param c         The user's current container.
     * @param u         The current user.
     * @param tableName The name of the query(table) we're retrieving.
     * @param qViewName The name of the desired custom qview for the given table.  If using default, enter "" instead of null.
     * @return          The number of rows in the given table.  If none, returns 0.
     */
    public final long getTableRowCount(Container c, User u, String schema, String tableName, String qViewName) {
        // TODO: Change this to handle null (i.e. if null is passed in as qViewName, set qViewName = "").

        //Creates variables.
        StringBuilder returnString = new StringBuilder();

        //Gets table parameters from qView.
        QviewObject myQview = new QviewObject(c, u, tableName, qViewName);
        ArrayList<String> myTitles = myQview.columnTitles;
        ArrayList<String> myColumns = myQview.columnNames;
        SimpleFilter myFilter = myQview.queryFilter;
        Sort mySort = myQview.querySort;

        //Gets table.
        TableSelector ts = new TableSelector(QueryService.get().getUserSchema(u, c, schema).getTable(tableName), myFilter, mySort);

        //Returns table count.
        return(ts.getRowCount());
    }

    /**
     * This formats the notification's "hours sent" into a usable cron string.
     * @param minute    (0-59, * (all), or comma separated values with no spaces)
     * @param hour      (0-23, * (all), or comma separated values with no spaces)
     * @param dayOfWeek (1-7, * (all), or comma separated values with no spaces)
     * @return          A cron string defining the time(s) a notification should be sent.
     */
    public final String createCronString(String minute, String hour, String dayOfWeek) {
        //Creates variables.
        StringBuilder returnString = new StringBuilder("0 " + minute + " " + hour + " ? * " + dayOfWeek + " *");

        //Returns properly formatted cron string.
        return returnString.toString();
    }

    /**
     * Creates a bold, underlined, large-sized header.
     * This is a formatting tool for visually organizing an HTML notification.
     * @param headerTitle   The text a user wants to create into a header.
     * @return              A String containing the headerTitle surrounded by in-line CSS effects.
     */
    public final String createHTMLHeader(String headerTitle) {
        //Makes string bold.
        StringBuilder boldString = new StringBuilder("<strong>" + headerTitle + "</strong>");

        //Underlines string.
        StringBuilder underlinedString = new StringBuilder("<u>" + boldString + "</u>");

        //Increases text size.
        StringBuilder largeString = new StringBuilder("<p style=\"font-size:20px\">" + underlinedString + "</p>");

        //Returns string.
        return largeString.toString();
    }

    /**
     * Sends the email notification.
     * @param currentNotification   The java notification to be sent.
     * @param currentUser           The current user.
     * @param currentContainer      The current container.
     */
    public void sendNotification(Notification currentNotification, User currentUser, Container currentContainer, ArrayList<String> extraRecipients) {

        //Retrieves email details.
        Collection<UserPrincipal> recipients = NotificationService.get().getRecipients(currentNotification, currentContainer);
        String emailSubject = currentNotification.getEmailSubject(currentContainer);
        String notificationLogName = currentNotification.getName();
        String emailBody = currentNotification.getMessageBodyHTML(currentContainer, currentUser);

        //Logs email notification attempt.
        _log.info(notificationLogName + ": sending email...");

        //Attempts to send email.
        try{
            //Creates message details.
            MailHelper.MultipartMessage msg = MailHelper.createMultipartMessage();
            msg.setFrom(NotificationService.get().getReturnEmail(currentContainer));
            msg.setSubject(emailSubject);

            //Creates a list of recipients.
            List<String> emailRecipients = new ArrayList<>();
            for (UserPrincipal u : recipients) {
                List<Address> addresses = NotificationService.get().getEmailsForPrincipal(u);
                if (addresses != null) {
                    for (Address a : addresses) {
                        if (a.toString() != null) {
                            emailRecipients.add(a.toString());
                        }
                    }
                }
            }

            //Adds extra recipients if necessary.
            if (extraRecipients != null) {
                if (!extraRecipients.isEmpty()) {
                    for (String extraRecipient : extraRecipients) {
                        emailRecipients.add(extraRecipient);
                    }
                }
            }

            //Logs an error if there are no recipients.
            if (emailRecipients.size() == 0) {
                _log.warn(notificationLogName + ": no recipients, unable to send EHR trigger script email.");
            }
            //Sends email.
            else {
                msg.setRecipients(Message.RecipientType.TO, StringUtils.join(emailRecipients, ","));
                msg.setEncodedHtmlContent(emailBody);
                MailHelper.send(msg, currentUser, currentContainer);
            }
        }
        //Logs an error if email cannot be sent.
        catch (Exception e) {
            _log.error(notificationLogName + ": unable to send email from EHR trigger script.", e);
        }

    }

    /**
     * Creates an HTML formatted hyperlink.
     * @param displayText   Text displayed by the hyperlink.
     * @param url           URL navigated to by the hyperlink.
     * @return              An String containing an HTML-formatted hyperlink.
     */
    public String createHyperlink(String displayText, String url) {
        return("<a href=\"" + url + "\">" + displayText + "</a>");
    }

//    /**
//     * Gets an animal's weight as a 9-digit number with trailing zeroes removed.
//     * @param currentContainer  The current container.
//     * @param currentUser       The current user.
//     * @param animalID          The animal ID to check the weight for.
//     * @return                  A string representing the animal's weight.
//     */
//    public String getWeightFromAnimalID(Container currentContainer, User currentUser, String animalID) {
//        //Gets the full animal weight.
//        ArrayList<String> weightRow = getTableRowAsList(currentContainer, currentUser, "study", "weight", new Sort("-date"), "id", animalID, new String[]{"weight"});
//        if (!weightRow.isEmpty()) {
//            String fullWeight = weightRow.get(0);
//            if (fullWeight != null) {
//                //Gets animal weight rounded to 9 digits.
//                String nineDigitWeight = StringUtils.substring(fullWeight, 0, 9);
//                //Removes any trailing zeroes.
//                BigDecimal strippedValue = new BigDecimal(nineDigitWeight).stripTrailingZeros();
//                //Adds weight symbol.
//                String returnWeight = "" + strippedValue + "kg";
//                return returnWeight;
//            }
//            else {
//                return "";
//            }
//        }
//        else {
//            return "";
//        }
//    }

    /**
     * Gets an animal's weight as a 9-digit number with trailing zeroes removed.
     * @param currentContainer  The current container.
     * @param currentUser       The current user.
     * @param animalID          The animal ID to check the weight for.
     * @return                  A string representing the animal's weight.
     */
    public String getWeightFromAnimalID(Container currentContainer, User currentUser, String animalID) {
        // Creates filter.
        SimpleFilter myFilter = new SimpleFilter("id", animalID, CompareType.EQUAL);
        String[] myColumns = new String[]{"weight"};
        // Runs query.
        ArrayList<HashMap<String, String>> weightRow = getTableMultiRowMultiColumnWithFieldKeys(currentContainer, currentUser, "study", "weight", new SimpleFilter("id", animalID, CompareType.EQUAL), new Sort("-date"), new String[]{"weight"});

        // Gets the full animal weight.
        if (!weightRow.isEmpty()) {
            String fullWeight = weightRow.get(0).get("weight");
            if (fullWeight != null) {
                //Gets animal weight rounded to 9 digits.
                String nineDigitWeight = StringUtils.substring(fullWeight, 0, 9);
                if (!fullWeight.isEmpty()) {
                    //Removes any trailing zeroes.
                    BigDecimal strippedValue = new BigDecimal(nineDigitWeight).stripTrailingZeros();
                    //Adds weight symbol.
                    String returnWeight = "" + strippedValue + "kg";
                    return returnWeight;
                }
                else {
                    return "";
                }
            }
        }
        return "";
    }

    /**
     * Retrieves the replacement fee for a given cause of death.
     * @param currentContainer  The current container.
     * @param currentUser       The current user.
     * @param causeOfDeath      The cause of death.
     * @return                  A string containing one of the following 3 statements:
     *                              1. "Animal replacement fee to be paid (causeOfDeath death)".
     *                              2. "No animal replacement fee to be paid (causeOfDeath death)".
     *                              3. "".
     */
    public String getAnimalReplacementFee(Container currentContainer, User currentUser, String causeOfDeath, String animalID) {
        if (causeOfDeath == null) {
            return "";
        }
        else {
            //Sets up variables.
            StringBuilder returnFee = new StringBuilder();
            SimpleFilter queryFilter = new SimpleFilter(FieldKey.fromString("Value"), causeOfDeath, CompareType.EQUAL);
            TableSelector myTable = new TableSelector(QueryService.get().getUserSchema(currentUser, currentContainer, "ehr_lookups").getTable("death_cause"), queryFilter, null);

            //Gets fee type from table.
            if (myTable != null) {
                if (myTable.getRowCount() > 0) {
                    myTable.forEach(new Selector.ForEachBlock<ResultSet>() {
                        @Override
                        public void exec(ResultSet rs) throws SQLException {
                            returnFee.append(rs.getString("Category"));
                        }
                    });
                }
            }

            //Gets detailed (prepaid) fee (if available).
            if (returnFee.toString().equals("Fee")) {
                SimpleFilter feeFilter = new SimpleFilter("id", animalID, CompareType.EQUAL);
                TableSelector feeTable = new TableSelector(QueryService.get().getUserSchema(currentUser, currentContainer, "study").getTable("demographics"), feeFilter, null);
                //Gets fee from table.
                StringBuilder updatedFee = new StringBuilder();
                if (feeTable != null) {
                    if (feeTable.getRowCount() > 0) {
                        feeTable.forEach(new Selector.ForEachBlock<ResultSet>() {
                            @Override
                            public void exec(ResultSet rs) throws SQLException {
                                updatedFee.append(rs.getString("prepaid")); // When value is null, this returns "null" as a string.  This is why we need to check for "null" in the next if statement.
                            }
                        });
                    }
                }
                if (!updatedFee.isEmpty()) {
                    if (!updatedFee.toString().equals("null")) {
                        return updatedFee.toString();
                    }
                    else {
                        return ("Animal replacement fee to be paid (" + causeOfDeath + " death)");
                    }
                }
                else {
                    return ("Animal replacement fee to be paid (" + causeOfDeath + " death)");
                }
            }
            //Returns 'no fee'.
            else if (returnFee.toString().equals("No Fee")) {
                return ("No animal replacement fee to be paid (" + causeOfDeath + " death)");
            }
            //Returns an empty string if returnFee is blank.
            else {
                return "";
            }
        }
    }

    /**
     * Checks the first two characters of an animal's id to determine if the ID belongs to a prenatal animal.
     * @param idToCheck Animal ID to check.
     * @return          A Boolean representing if the ID is prenatal or not.
     */
    public Boolean checkIfPrenatalID(String idToCheck) {
        if (idToCheck != null) {
            if (idToCheck.length() > 2) {
                String idPrefix = "" + idToCheck.charAt(0) + idToCheck.charAt(1);
                if (idPrefix.equals("pd")) {
                    return true;
                }
                else {
                    return false;
                }
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    }

//    /**
//     * Gets an animal's sex from their id.
//     * @param c         The current container.
//     * @param u         The current user.
//     * @param animalID  The animal ID to check.
//     * @return          A string representing the animal's sex.
//     */
//    public String getSexFromAnimalID(Container c, User u, String animalID) {
//        String animalSexCode = "";
//        String animalSexMeaning = "";
//
//        //Gets sex from prenatal id.
//        if (checkIfPrenatalID(animalID)) {
//            ArrayList<String> prenatalDeathRow = getTableRowAsList(c, u, "study", "prenatal", null, "id", animalID, new String[]{"gender"});
//            if (!prenatalDeathRow.isEmpty()) {
//                animalSexCode = prenatalDeathRow.get(0);
//            }
//        }
//        //Gets sex from non-prenatal id.
//        else {
//            ArrayList<String> demographicTableRow = getTableRowAsList(c, u, "study", "demographics", null, "id", animalID, new String[]{"gender"});
//            if (!demographicTableRow.isEmpty()) {
//                animalSexCode = demographicTableRow.get(0);
//            }
//        }
//
//        //Gets the gender meaning from the gender code.
//        if (animalSexCode != null) {
//            if (!animalSexCode.equals("") && !animalSexCode.equals("null")) {
//                ArrayList<String> genderTableRow = getTableRowAsList(c, u, "ehr_lookups", "gender_codes", null, "code", animalSexCode, new String[]{"meaning"});
//                if (!genderTableRow.isEmpty()) {
//                    animalSexMeaning = genderTableRow.get(0);
//                }
//            }
//        }
//
//        //Returns animal sex.
//        return animalSexMeaning;
//    }

    /**
     * Gets an animal's sex from their id.
     * @param c         The current container.
     * @param u         The current user.
     * @param animalID  The animal ID to check.
     * @return          A string representing the animal's sex.
     */
    public String getSexFromAnimalID(Container c, User u, String animalID) {
        String animalSexCode = "";
        String animalSexMeaning = "";

        //Gets sex from prenatal id.
        if (checkIfPrenatalID(animalID)) {
            // Creates filter.
            SimpleFilter myFilter = new SimpleFilter("id", animalID, CompareType.EQUAL);
            String[] targetColumn = new String[]{"gender"};
            // Runs query.
            ArrayList<HashMap<String, String>> prenatalDeathRow = getTableMultiRowMultiColumnWithFieldKeys(c, u, "study", "prenatal", myFilter, null, targetColumn);

            // Checks return data.
            if (!prenatalDeathRow.isEmpty()) {
                animalSexCode = prenatalDeathRow.get(0).get("gender");
            }
        }
        //Gets sex from non-prenatal id.
        else {
            // Creates filter.
            SimpleFilter myFilter = new SimpleFilter("id", animalID, CompareType.EQUAL);
            String[] targetColumn = new String[]{"gender"};
            // Runs query.
            ArrayList<HashMap<String, String>> demographicTableRow = getTableMultiRowMultiColumnWithFieldKeys(c, u, "study", "demographics", myFilter, null, targetColumn);

            // Checks return data.
            if (!demographicTableRow.isEmpty()) {
                animalSexCode = demographicTableRow.get(0).get("gender");
            }
        }

        //Gets the gender meaning from the gender code.
        if (animalSexCode != null) {
            if (!animalSexCode.equals("") && !animalSexCode.equals("null")) {
                // Creates filter.
                SimpleFilter myFilter = new SimpleFilter("code", animalSexCode, CompareType.EQUAL);
                String[] targetColumn = new String[]{"meaning"};
                // Runs query.
                ArrayList<HashMap<String, String>> genderTableRow = getTableMultiRowMultiColumnWithFieldKeys(c, u, "ehr_lookups", "gender_codes", myFilter, null, targetColumn);

                // Checks return data.
                if (!genderTableRow.isEmpty()) {
                    animalSexMeaning = genderTableRow.get(0).get("meaning");
                }
            }
        }

        //Returns animal sex.
        return animalSexMeaning;
    }

    //TODO: Fix this so it only gets the FIRST row (check the myTable.forEach part).  Maybe add a counter and only update returnRow on first one.  (See: getTableRowAsListWithFieldKeys() -> "if (returnRow.isEmpty())")
    /**
     * Retrieves a specific row from a specific table with only necessary columns.
     * The schema, tableName, and column names can be found through the Query Schema Browser.
     *      EXAMPLE GOAL: Get animal rh1234's weight and gender, sorted by descending weight.
     *      EXAMPLE USE: getTableRowAsList(c, u, "study", "demographics", new Sort("-weight"), "id", "rh1234", new String[]{"weight", "gender"});
     *      EXAMPLE RETURNS: [1.234, male]
     * @param currentContainer  The current container.
     * @param currentUser       The current user.
     * @param schema            The current schema (ex. "ehr", "study", "ehr_lookups", etc.).
     * @param tableName         The specific table's name.
     * @param tableSort         (Optional) The type of Sort applied to the table.
     * @param targetColumnName  The name of the column holding the columnValue that specifies the target row (ex "id").
     * @param targetColumnValue The value under the columnName that corresponds to the target row (ex. "rh1234").
     * @param columnsToGet      The names of the columns in this row the user wants data for (ex. "weight", "gender", "species", etc.).
     * @return                  A list of Strings holding the values for each column in columnsToGet for our target row.
     */
    public ArrayList<String> getTableRowAsList(Container currentContainer, User currentUser, String schema, String tableName, Sort tableSort, String targetColumnName, String targetColumnValue, String[] columnsToGet) {
        ArrayList<String> returnRow = new ArrayList<String>();
        //Verifies table contains data before attempting to retrieve row.
        if (getTableRowCount(currentContainer, currentUser, schema, tableName, "") > 0) {
            //Sets up variables.
            SimpleFilter queryFilter = new SimpleFilter(FieldKey.fromString(targetColumnName), targetColumnValue, CompareType.EQUAL);
            TableSelector myTable = new TableSelector(QueryService.get().getUserSchema(currentUser, currentContainer, schema).getTable(tableName), queryFilter, tableSort);

            //Gets row from table.
            if (myTable != null) {
                myTable.forEach(new Selector.ForEachBlock<ResultSet>() {
                    @Override
                    public void exec(ResultSet rs) throws SQLException {
                        if (rs != null) {
                            for (int i = 0; i < columnsToGet.length; i++) {
                                returnRow.add(rs.getString(columnsToGet[i]));
                            }
                        }
                    }
                });
            }
        }
        return returnRow;
    }

    // TODO: WRITE DOCUMENTATION!!!  Also might be able to merge this with original getTableRowAsList().  Also need to add try/catch w/ exception maybe?
    //  NOTE: mySort can be null.
    //  NOTE: This gets the first non-empty result.
    public ArrayList<String> getTableRowAsListWithFieldKeys(Container currentContainer, User currentUser, String schema, String tableName, String targetColumnName, String targetColumnValue, String[] columnsToGet, Sort mySort) {
        ArrayList<String> returnRow = new ArrayList<String>();
        //Verifies table contains data before attempting to retrieve row.
        if (getTableRowCount(currentContainer, currentUser, schema, tableName, "") > 0) {
            //Updates table info.
            TableInfo myTableInfo = QueryService.get().getUserSchema(currentUser, currentContainer, schema).getTable(tableName);
            //Updates columns to be retrieved.
            Set<FieldKey> myKeys = new HashSet<>();
            for (String myColumn : columnsToGet) {
                myKeys.add(FieldKey.fromString(myColumn));
            }
            final Map<FieldKey, ColumnInfo> myColumns = QueryService.get().getColumns(myTableInfo, myKeys);
            //Sets up variables.
            SimpleFilter myFilter = new SimpleFilter(FieldKey.fromString(targetColumnName), targetColumnValue, CompareType.EQUAL);
            //Runs query with updated info.
            TableSelector myTable = new TableSelector(myTableInfo, myColumns.values(), myFilter, mySort);

            //Gets row from table.
            if (myTable != null) {
                myTable.forEach(new Selector.ForEachBlock<ResultSet>() {
                    @Override
                    public void exec(ResultSet rs) throws SQLException {
                        if (returnRow.isEmpty()) {
                            if (rs != null) {
                                Results myResults = new ResultsImpl(rs, myColumns);
                                //Goes through each column in current query row and updates currentRow.
                                for (int i = 0; i < columnsToGet.length; i++) {
                                    String currentColumnTitle = columnsToGet[i];
                                    String currentColumnValue = "";
                                    if (myResults.getString(FieldKey.fromString(currentColumnTitle)) != null) {
                                        currentColumnValue = myResults.getString(FieldKey.fromString(currentColumnTitle));
                                    }
                                    returnRow.add(currentColumnValue);
                                }
                            }
                        }
                    }
                });
            }
        }
        return returnRow;
    }

    /**
     * Retrieves the specified single column value for multiple rows in a dataset using a filter and sort.
     * This is the same as getTableMultiRowMultiColumn(), except each row returns a single column value instead of multiple column values.
     * The try/catch prevents error if the table, schema, target column, sort value, or filter do not exist.
     *      EXAMPLE GOAL:       Get all animal ID's in the Blood Draws dataset where animal is not alive sorted by date.
     *      EXAMPLE USE:        SimpleFilter myFilter = new SimpleFilter("Id/DataSet/Demographics/calculated_status", "Alive", CompareTType.NEQ_OR_NULL);
     *                          Sort mySort = new Sort("date");
     *                          getTableRowAsList(c, u, "study", "Blood Draws", myFilter, mySort, "Id");
     *      EXAMPLE RETURNS:    [rh1234, rh1235, rh1236]
     * @param c             The current container.
     * @param u             The current user.
     * @param schemaName    The current system schema (ex. "ehr", "study", "ehr_lookups", etc.).
     * @param tableName     The specific table's name (dataset name).
     * @param myFilter      A SimpleFilter object defining the column to filter under, the value to filter by, and the type of comparison to be used.
     * @param mySort        (Optional) The type of Sort applied to the table.
     * @param targetColumn  The name of the column the user wants data for.
     * @return              A list of Strings holding the column value for each row matching the filter parameters.
     */
    public static final ArrayList<String> getTableMultiRowSingleColumn(Container c, User u, String schemaName, String tableName, SimpleFilter myFilter, Sort mySort, String targetColumn, Map<String, Object> myParameters) {
        ArrayList<String> returnArray = new ArrayList<String>();
        try {
            TableSelector myTable = null;
            if (myParameters != null) {
                myTable = new TableSelector(QueryService.get().getUserSchema(u, c, schemaName).getTable(tableName), myFilter, mySort).setNamedParameters(myParameters);
            }
            else {
                myTable = new TableSelector(QueryService.get().getUserSchema(u, c, schemaName).getTable(tableName), myFilter, mySort);
            }
            //Verifies table exists.
            if (myTable != null) {
                //Verifies data exists.
                if (myTable.getRowCount() > 0) {
                    //Gets ID from each table row.
                    myTable.forEach(new Selector.ForEachBlock<ResultSet>() {
                        @Override
                        public void exec(ResultSet rs) throws SQLException {
                            if (rs != null) {
                                returnArray.add(rs.getString(targetColumn));
                            }
                        }
                    });
                }
            }
            return returnArray;
        }
        catch(Exception e) {
            _log.error("Error executing NotificationToolkit->getTableMultiRowSingleColumn().", e);
            return new ArrayList<String>();
        }
    }

    /**
     * Retrieves multiple specified column values for multiple rows in a dataset using a filter and sort.
     * This is the same as getTableMultiRowSingleColumn(), except each row returns multiple column values instead of just a single column value.
     * The try/catch prevents error if the table, schema, target column, sort value, or filter do not exist.
     * WARNING: This cannot be used with targetColumns referencing other datasets (ex. "Id/Dataset/Demographics/calculated_status").  For those, use getTableMultiRowMultiColumnWithFieldKeys().
     *      EXAMPLE GOAL:       Get ID, cage #, and room # for all animals in the 'Housing' dataset with their condition listed as Protected Contact, sorted by ID.
     *      EXAMPLE USE:        SimpleFilter myFilter = new SimpleFilter("cond", "pc", CompareType.EQUAL);
     *                          Sort mySort = new Sort("id");
     *                          getTableMultiRowMultiColumn(c, u, "study", "Housing", myFilter, mySort, new String[]{"Id", "cage", "room"});
     *      EXAMPLE RETURNS:    [[rh1234, cage1, room1], [rh1235, cage2, room2], [rh1236, cage3, room3]]
     *
     * @param c             The current container.
     * @param u             The current user.
     * @param schemaName    The current system schema (ex. "ehr", "study", "ehr_lookups", etc.).
     * @param tableName     The specific table's name (dataset name).
     * @param myFilter      A SimpleFilter object defining the column to filter under, the value to filter by, and the type of comparison to be used.
     * @param mySort        (Optional) The type of Sort applied to the table.
     * @param targetColumns The names of the columns the user wants data for.  THESE CANNOT REFERENCE OTHER DATASETS.  See warning above.
     * @return              A list of Strings holding the column values for each row matching the filter parameters.
     */
    public static final ArrayList<String[]> getTableMultiRowMultiColumn(Container c, User u, String schemaName, String tableName, SimpleFilter myFilter, Sort mySort, String[] targetColumns) {
        ArrayList<String[]> returnArray = new ArrayList<String[]>();
        try {
            TableSelector myTable = new TableSelector(QueryService.get().getUserSchema(u, c, schemaName).getTable(tableName), myFilter, mySort);
            //Verifies table exists.
            if (myTable != null) {
                //Verifies data exists.
                if (myTable.getRowCount() > 0) {
                    //Gets target column values for each row.
                    myTable.forEach(new Selector.ForEachBlock<ResultSet>() {
                        @Override
                        public void exec(ResultSet rs) throws SQLException {
                            if (rs != null) {
                                String[] columnArray = new String[targetColumns.length];
                                for (int i = 0; i < targetColumns.length; i++) {
                                    columnArray[i] = rs.getString(targetColumns[i]);
                                }
                                returnArray.add(columnArray);
                            }
                        }
                    });
                }
            }
            return returnArray;
        }
        catch(Exception e) {
            _log.error("Error executing NotificationToolkit->getTableMultiRowMultiColumn()", e);
            return new ArrayList<String[]>();
        }
    }

    /**
     * TODO: This is an update to getTableMultiRowMultiColumn() that allow targetColumns to reference other datasets.
     *  Refactor all usages of getTableMultiRowMultiColumn() to use this new format, then delete the getTableMultiRowSingleColumn() function.
     * Retrieves multiple specified column values for multiple rows in a dataset using a filter and sort.
     * This is the same as getTableMultiRowMultiColumn(), except this can be used with target columns that reference other datasets (ex. "Id/Dataset/Demographics/calculated_status").  This also returns a differently formatted value.
     * This does not return null values.  Any null values will be returned as an empty string.
     * The try/catch prevents error if the table, schema, target column, sort value, or filter do not exist.
     *      EXAMPLE GOAL:       Get ID, drawStatus, and billing group for all animals in the 'BloodSchedule' dataset with their date set for today, sorted by ID.
     *      EXAMPLE USE:        SimpleFilter myFilter = new SimpleFilter("date", dateToolkit.getDateToday(), CompareType.DATE_EQUAL);
     *                          Sort mySort = new Sort("Id");
     *                          getTableMultiRowMultiColumnWithFieldKeys(c, u, "study", "BloodSchedule", myFilter, mySort, new String[]{"Id", "drawStatus", "billedby/title"});
     *      EXAMPLE RETURNS:    [[Id -> rh1234, drawStatus -> Completed, billedby/title -> Research Staff], [Id -> rh1235, drawStatus -> Completed, billedby/title -> Colony Records]]
     * @param c             The current container.
     * @param u             The current user.
     * @param schemaName    The current system schema (ex. "ehr", "study", "ehr_lookups", etc.).
     * @param tableName     The specific table's name (dataset name).
     * @param myFilter      A SimpleFilter object defining the column to filter under, the value to filter by, and the type of comparison to be used.
     * @param mySort        (Optional) The type of Sort applied to the table.
     * @param targetColumns The names of the columns the user wants data for.
     * @return              A list of Hash Maps holding the column values for each row matching the filter parameters.
     */
    public static final ArrayList<HashMap<String,String>> getTableMultiRowMultiColumnWithFieldKeys(Container c, User u, String schemaName, String tableName, SimpleFilter myFilter, Sort mySort, String[] targetColumns) {
        //Creates array to return.
        ArrayList<HashMap<String, String>> returnArray = new ArrayList<HashMap<String, String>>();
        try {
            //Updates table info.
            TableInfo myTableInfo = QueryService.get().getUserSchema(u, c, schemaName).getTable(tableName);
            //Updates columns to be retrieved.
            Set<FieldKey> myKeys = new HashSet<>();
            for (String myColumn : targetColumns) {
                myKeys.add(FieldKey.fromString(myColumn));
            }
            final Map<FieldKey, ColumnInfo> myColumns = QueryService.get().getColumns(myTableInfo, myKeys);
            //Runs query with updated info.
            TableSelector myTable = new TableSelector(myTableInfo, myColumns.values(), myFilter, mySort);
            //Verifies table exists.
            if (myTable != null) {
                //Verifies data exists.
                if (myTable.getRowCount() > 0) {
                    //Gets target column values for each row.
                    myTable.forEach(new Selector.ForEachBlock<ResultSet>() {
                        @Override
                        public void exec(ResultSet rs) throws SQLException {
                            if (rs != null) {
                                Results myResults = new ResultsImpl(rs, myColumns);
                                HashMap<String, String> myRow = new HashMap<>();
                                //Goes through each column in current query row and updates currentRow.
                                for (int i = 0; i < targetColumns.length; i++) {
                                    String currentColumnTitle = targetColumns[i];
                                    String currentColumnValue = "";
                                    if (myResults.getString(FieldKey.fromString(currentColumnTitle)) != null) {
                                        currentColumnValue = myResults.getString(FieldKey.fromString(currentColumnTitle));
                                    }
                                    myRow.put(currentColumnTitle, currentColumnValue);
                                }
                                returnArray.add(myRow);
                            }
                        }
                    });
                }
            }
            return returnArray;
        }
        catch(Exception e) {
            _log.error("Error executing NotificationToolkit->getTableMultiRowMultiColumnWithFieldKeys().", e);
            return new ArrayList<HashMap<String, String>>();
        }
    }

    /**
     * This function sorts a set that may or may not contain a null.  This is needed because all sort functions don't work with nulls.
     * @param setToSort A set containing data to be sorted.
     * @return          A sorted set of the input data.
     */
    public ArrayList<String> sortSetWithNulls(Set<String> setToSort) {
        //Converts set to ArrayList.
        ArrayList<String> sortedList = new ArrayList<>();
        sortedList.addAll(setToSort);

        //Removes null value if it exists.
        Boolean nullExists = false;
        if (sortedList.contains(null)) {
            sortedList.remove(null);
            nullExists = true;
        }

        //Sorts list.
        Collections.sort(sortedList);

        //Adds null back to list if needed.
        if (nullExists == true) {
            sortedList.add(null);
        }

        //Returns sorted list.
        return sortedList;
    }

    // TODO: Remove "%3B" at the end of all queries - this is causing invalid query results.
    //      --> %3B is code for a semicolon.
    //      --> Update: removed semicolon being added, but now URL's containing IN:xxx,yyy,zzz don't work (i.e. cannot use multiple values for one key).
    //          --> Found out this is because the function removes ';' separator from multiple values.
    //          --> Currently causing errors in:
    //              ColonyInformationObject > getLivingAnimalsWithMultipleActiveHousingRecords
    //              ColonyInformationObject > getAllRecordsWithPotentialHousingConditionProblems
    //              ColonyInformationObject > getAllRecordsWithCalculatedStatusFieldProblems
    /**
     * Creates a URL for a query matching user arguments.
     * WARNING: This should only be used with a SimpleFilter that has clauses containing only one field key.  You can use multiple clauses and multiple values for each, but each clause should only have one key.
     * NOTE: ColonyAlertsNotificationRevamp -> getNonContiguousHousingRecords() uses this same function, but rewrites it to include a PARAMETER argument.  If this gets used frequently, update this function to include the paramter.
     * @param c                 The current container.
     * @param executeOrUpdate   A string that is either "execute" or "update".  The decides whether the presented query is editable.
     * @param schemaName        The current schema (ex. "ehr", "study", "ehr_lookups", etc.).
     * @param queryName         The specific table's name (dataset name).
     * @param queryFilter       (Optional) A SimpleFilter object defining the column to filter under, the value to filter by, and the type of comparison to be used.
     * @return                  A URL that directs a user to the LabKey query browser's result.
     */
    public String createQueryURL(Container c, String executeOrUpdate, String schemaName, String queryName, SimpleFilter queryFilter) {
        ActionURL queryURL = new ActionURL();
        // Creates the query string.
        if (executeOrUpdate.equals("execute")) {
            queryURL = new ActionURL("query", "executeQuery.view", c);
        }
        else if (executeOrUpdate.equals("update")) {
            queryURL = new ActionURL("ehr", "updateQuery.view", c);
        }
        else {
            return "";
        }
        queryURL.addParameter("schemaName", schemaName);
        queryURL.addParameter("query.queryName", queryName);

        // Creates the query filter.
        if (queryFilter != null) {
            // Adds parameters from queryFilter.
            for (SimpleFilter.FilterClause currentClause : queryFilter.getClauses()) {
                // Gets clause key.
                FieldKey clauseKey = currentClause.getFieldKeys().get(0);   //TODO: Add in comment that this should only be used with clauses containing one field key for each clause.

                // Gets clause value.
                StringBuilder clauseValue = new StringBuilder();
                if (currentClause.getParamVals() != null) {
                    for (Object paramValue : currentClause.getParamVals()) {
                        clauseValue.append(paramValue.toString());
//                        clauseValue.append(";");
                    }
                }

                // Gets clause compare.
                CompareType clauseCompare = null;
                if (currentClause instanceof CompareType.CompareClause) {
                    clauseCompare = ((CompareType.CompareClause)currentClause).getCompareType();
                }
                else if (currentClause instanceof SimpleFilter.InClause) {
                    clauseCompare = ((SimpleFilter.InClause) currentClause).getCompareType();
                }
                else {
                    return "";
                }

                // Adds filter.
                queryURL.addFilter("query", clauseKey, clauseCompare, clauseValue);
            }
        }

        //Creates URL to return.
        Path returnURL = new Path(new ActionURL().getBaseServerURI(), queryURL.toString());

        //Returns URL.
        return returnURL.toString();
    }

    public String createFormURL(Container c, String formType, String taskID) {
        // Creates URL.
        ActionURL formURL = new ActionURL();
        formURL = new ActionURL("ehr", "taskDetails.view", c);
        formURL.addParameter("formType", formType);
        formURL.addParameter("taskid", taskID);

        // Creates path.
        Path returnURL = new Path(new ActionURL().getBaseServerURI(), formURL.toString());

        // Returns URL.
        return returnURL.toString();
    }

    public String createAnimalHistoryURL(Container c, String subject) {
        // Creates URL.
        ActionURL animalHistoryURL = new ActionURL();
        animalHistoryURL = new ActionURL("ehr", "animalHistory.view", c);
        String animalHistoryURLWithID = animalHistoryURL.toString() + "#subjects:" + subject;   // TODO: Try and get commented code below to work instaed of hardcoding this.  For some reason, adding parameter gives me '#subjects=' instead of '#subjects:'.

//        animalHistoryURL.addParameter("#subjects", subject);
//        animalHistoryURL.addParameter("inputType", "singleSubject");
//        animalHistoryURL.addParameter("showReport", "0");
//        animalHistoryURL.addParameter("activeReport", "abstract");

        // Creates path.
        Path returnURL = new Path(new ActionURL().getBaseServerURI(), animalHistoryURLWithID);

        // Returns URL.
        return returnURL.toString();
    }

    // TODO: COMMENT!!!
    public Boolean checkIfAnimalIsAlive(Container c, User u, String idToCheck) {
        try {
            //Runs query.
//            ArrayList<String> animalDemographicRow = getTableRowAsList(c, u, "study", "Demographics", null, "id", idToCheck, new String[]{"calculated_status"});

            // Creates filter.
            SimpleFilter myFilter = new SimpleFilter("id", idToCheck, CompareType.EQUAL);
            // Creates columns to retrieve.
            String[] targetColumns = new String[]{"calculated_status"};
            //Runs query.
            ArrayList<HashMap<String,String>> returnArray = getTableMultiRowMultiColumnWithFieldKeys(c, u, "study", "Demographics", myFilter, null, targetColumns);

            if (!returnArray.isEmpty()) {
                if (returnArray.get(0).get("calculated_status") != null) {
                    if (returnArray.get(0).get("calculated_status").equals("Alive")) {
                        return true;
                    }
                }
            }
            return false;
        }
        catch (IndexOutOfBoundsException e) {
            // TODO: Log exception.
            return false;
        }
    }

    // TODO: COMMENT!!!
    //  This checks if an animal is assigned to a certain project on a given date.
    //      --> dateToCheck must be formatted as "yyyy-MM-dd.....".  Any trailing characters after 'dd' are ignored.
    //      --> returns 'true' if assigned to a project, 'false' if not.
    public Boolean checkProjectAssignmentStatusOnDate(Container c, User u, String idToCheck, Integer projectToCheck, String dateToCheck) {
        Boolean animalAssigned = false;
        // Checks if animal is assigned to a project.
        if (projectToCheck.equals("300901") || projectToCheck.equals("400901")) {
            animalAssigned = true;
        }
        // Gets everything in the 'assignment' dataset with the same 'id' and 'project' as the request, and an assignment 'start date' on or after the 'request date'.
        else {
            // Sets up query.
            SimpleFilter myFilter = new SimpleFilter("id", idToCheck, CompareType.EQUAL);
            myFilter.addCondition("project", projectToCheck, CompareType.EQUAL);   // TODO: Verify that currentProject will always be a numerical value.
            myFilter.addCondition("date", dateToCheck, CompareType.DATE_LTE);
            // Creates columns to retrieve.
            String[] targetColumns = new String[]{"Id", "enddate"};
            // Runs query.
            ArrayList<HashMap<String, String>> returnArray = getTableMultiRowMultiColumnWithFieldKeys(c, u, "study", "assignment", myFilter, null, targetColumns);

            // Looks through each assignment for the current animal.
            for (HashMap<String, String> assignmentRow : returnArray)
            {
                // Marks animal 'assigned' if there's no project end date.
                if (assignmentRow.get("enddate").isEmpty())
                {
                    animalAssigned = true;
                }
                // Marks animal 'assigned' if the project's 'end date' is on or after the 'request date'.
                else
                {
                    // Some times show up as 'yyyy-MM-dd 00:00:00.0'.  Time is inconsistent & irrelevant, so we'll just take the date.
                    String endDateWithoutTime = assignmentRow.get("enddate").substring(0, 10);
                    String drawDateWithoutTime = dateToCheck.substring(0, 10);
                    DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
                    LocalDate formattedEndDate = LocalDate.parse(endDateWithoutTime, dateFormatter);
                    LocalDate formattedDrawDate = LocalDate.parse(drawDateWithoutTime, dateFormatter);
                    if (formattedEndDate.compareTo(formattedDrawDate) >= 0)
                    {
                        animalAssigned = true;
                    }
                }
            }
        }
        return animalAssigned;
    }

    // TODO: Comment.  Returns null if there is no overdraw, or overdraw amount if there is an overdraw.
    public Double checkIfBloodDrawIsOverdraw(Container c, User u, String idToCheck, String dateToCheck) {
        // Creates filter.
        SimpleFilter myFilter = new SimpleFilter("Id", idToCheck, CompareType.EQUAL);
        myFilter.addCondition("date", dateToCheck, CompareType.DATE_EQUAL);
        // Runs query.
        String[] targetColumns = new String[]{"BloodRemaining/AvailBlood"};
        ArrayList<HashMap<String,String>> returnArray = getTableMultiRowMultiColumnWithFieldKeys(c, u, "study", "blood", myFilter, null, targetColumns);

        // Checks results.
        if (!returnArray.isEmpty()) {
            for (HashMap<String, String> result : returnArray) {
                if (!result.get("BloodRemaining/AvailBlood").isEmpty()) {
                    Double availableBlood = Double.valueOf(result.get("BloodRemaining/AvailBlood"));
                    if (availableBlood <=0) {
                        return availableBlood;
                    }
                }
            }
        }
        return null;
    }

    public void sendEmptyNotificationRevamp(Container c, User u, String notificationType) {
        Module ehr = ModuleLoader.getInstance().getModule("EHR");
        _log.info("Using NotificationToolkit to send email for Empty Notification Revamp (notificationType: " + notificationType + ").");
        EmptyNotificationRevamp notification = new EmptyNotificationRevamp(ehr, notificationType);
        if (notification != null) {
            notification.sendManually(c, u);
        }
    }






    /**
     * This is an object representation of a custom QView file.
     * It contains the following data:
     *  Column names.
     *  Column titles.
     *  Sort settings.
     *  Filter settings.
     */
    static class QviewObject {
        //The default column names.
        ArrayList<String> columnNames = new ArrayList<String>();
        //The fancy names.
        ArrayList<String> columnTitles = new ArrayList<String>();
        //The sort settings.
        Sort querySort = new Sort();
        //The filter settings.
        SimpleFilter queryFilter = new SimpleFilter();

        /**
         * This creates a Qview object from a table and custom qview.
         * This version retrieves the settings by creating a CustomView object.
         * @param c         The user's current container.
         * @param u         The current user.
         * @param queryName The name of the query(table) we're retrieving.
         * @param qviewName The name of the desired custom qview for the given table.  If using default, enter "" instead of null.
         */
        public QviewObject(Container c, User u, String queryName, String qviewName){
            //Gets table.
            TableInfo tableInfo = QueryService.get().getUserSchema(u, c, "study").getTable(queryName, null);

            //Gets qview.
            CustomView view = QueryService.get().getCustomView(u, c, null, "study", queryName, qviewName);

            try {
                //Extracts info from qview.
                CustomViewInfo.FilterAndSort fas = CustomViewInfo.FilterAndSort.fromString(view.getFilterAndSort());
//                CustomViewInfo.ColumnProperty.columnTitle

                //Gets filters and adds them to the queryFilter.
                List<FilterInfo> filters = fas.getFilter();
                for (int i = 0; i < filters.size(); i++) {
                    queryFilter.addCondition(filters.get(i).getField(), filters.get(i).getValue(), filters.get(i).getOp());
                }

                //Gets sorts and adds them to querySort.
                List<Sort.SortField> sorts = fas.getSort();
                for (int i = 0; i < sorts.size(); i++) {
                    querySort.appendSortColumn(sorts.get(i).getFieldKey(), sorts.get(i).getSortDirection(), false);
                }

                //Gets column titles.
                for (int i = 0; i < view.getColumns().size(); i++) {
                    String columnTitle = null;
                    //Verifies the current column contains at least one property.
                    if (view.getColumnProperties().get(i).getValue().values().size() > 0) {
                        //Goes through the column properties and retrieves the "columnTitle" property.
                        for (int x = 0; x < view.getColumnProperties().get(i).getValue().values().size(); x++) {
                            if (view.getColumnProperties().get(i).getValue().keySet().toArray()[x].toString().equals("columnTitle")) {
                                columnTitle = view.getColumnProperties().get(i).getValue().values().toArray()[x].toString();
                            }
                        }
                    }
                    //Adds the default column name if there's no title set.
                    if (columnTitle == null) {
                        columnTitle = view.getColumns().get(i).toString();
                    }
                    //Updates the column titles list with the new title.
                    columnTitles.add(columnTitle);
                }

                //Gets column names.
                for (int i = 0; i < view.getColumns().size(); i++) {
                    String columnName = view.getColumns().get(i).toString();
                    columnNames.add(columnName);
                }
            }
            catch(Exception e) {
                _log.error("Error executing NotificationToolkit->QviewObject(Container c, User u, String queryName, String qviewName).", e);
            }
        }

        /**
         * This creates a Qview object from a table and custom qview.
         * This version retrieves the settings by parsing through the .qview.xml file.
         * @param queryName The name of the query(table) we're retrieving.
         * @param qviewName The name of the desired custom qview for the given table.  If using default, enter "" instead of null.
         */
        //This was my original function to create a Qview Object.
        //It parses the given .qview.xml file and returns a qview object with filters and sorts filled in.
        public QviewObject(String queryName, String qviewName) {
            StringBuilder querySortBuilder = new StringBuilder();

            String qviewFilePath;
            if (qviewName == null) {
                qviewFilePath = ".qview.xml";
            }
            else {
                qviewFilePath = qviewName + ".qview.xml";
            }
            Module module = ModuleLoader.getInstance().getModule(WNPRC_EHRModule.class);
            File notificationQviewFile = new File(Paths.get(module.getExplodedPath().getAbsolutePath(), "queries", "study", "validationSuiteSuffixCheckerRhesusDamSire").toFile(), (qviewFilePath));

            try
            {
                BufferedReader notificationQviewReader = new BufferedReader(new FileReader(notificationQviewFile));
                String currentLine;
                Boolean newColumn = false;
                while ((currentLine = notificationQviewReader.readLine()) != null) {
                    //Gets column name.
                    if (currentLine.contains("<column name")) {
                        //Retrieves data for double or single quotes.
                        String columnName;
                        if (currentLine.contains("\"")) {
                            columnName = currentLine.split("\"")[1];
                        }
                        else {
                            columnName = currentLine.split("\'")[1];
                        }
                        //Adds placeholder to columnTitles list if previous line wasn't a title.
                        if (newColumn == true) {
                            columnTitles.add("null");
                        }
                        //Adds column name to the list.
                        columnNames.add(columnName);
                        newColumn = true;
                    }
                    //Gets column title.
                    else if (currentLine.contains("<property name")) {
                        //Retrieves data for double or single quotes.
                        String propertyName;
                        String propertyValue;
                        if (currentLine.contains("\"")) {
                            propertyName = currentLine.split("\"")[1];
                            propertyValue = currentLine.split("\"")[3];
                        }
                        else {
                            propertyName = currentLine.split("\'")[1];
                            propertyValue = currentLine.split("\'")[3];
                        }

                        //Adds column title to the list.
                        //TODO: Why did I compare this?  Is this a null check...?
                        if (propertyName.equals(propertyName)) {
                            columnTitles.add(propertyValue);
                        }
                        newColumn = false;
                    }
                    //Gets sorting options.
                    else if (currentLine.contains("<sort column")) {
                        //Retrieves data for double or single quotes.
                        String sortColumnName;
                        String sortIsDescending;
                        if (currentLine.contains("\"")) {
                            sortColumnName = currentLine.split("\"")[1];
                            sortIsDescending = currentLine.split("\"")[3];
                        }
                        else {
                            sortColumnName = currentLine.split("\'")[1];
                            sortIsDescending = currentLine.split("\'")[3];
                        }
                        //Adds a comma if the sort builder already contains data.
                        if (!querySortBuilder.isEmpty()) {
                            querySortBuilder.append(",");
                        }
                        //Adds a plus for ascending or a minus for descending.
                        if (sortIsDescending.equals("true")) {
                            querySortBuilder.append("-");
                        }
                        else {
                            querySortBuilder.append("+");
                        }
                        //Adds the column name.
                        querySortBuilder.append(sortColumnName);
                    }

                    //Gets filter options.
                    else if (currentLine.contains("<filter column")) {
                        //Retrieves data for double or single quotes.
                        String filterColumnName;
                        String filterOperator;
                        String filterValue;
                        if (currentLine.contains("\"")) {
                            filterColumnName = currentLine.split("\"")[1];
                            filterOperator = currentLine.split("\"")[3];
                            filterValue = currentLine.split("\"")[5];
                        }
                        else {
                            filterColumnName = currentLine.split("\'")[1];
                            filterOperator = currentLine.split("\'")[3];
                            filterValue = currentLine.split("\'")[5];
                        }
                        //Retrieves the filter value as either a string or an integer.
                        Object parsedFilterValue;
                        try {
                            parsedFilterValue = Integer.parseInt(filterValue);
                        }
                        catch(Exception e2) {
                            parsedFilterValue = filterValue;
                        }
                        //Creates the filter condition and adds it to the queryFilter.
                        CompareType myCompareType = CompareType.getByURLKey(filterOperator);
                        queryFilter.addCondition(FieldKey.fromString(filterColumnName), parsedFilterValue, myCompareType);
                    }
                }
                //Verifies number of columns and titles match.  Adds final title if necessary.
                if (columnNames.size() != columnTitles.size()) {
                    columnTitles.add("null");
                }
                //Converts all "null" titles into the base title.
                for (int i = 0; i < columnTitles.size(); i++) {
                    if (columnTitles.get(i).equals("null")) {
                        columnTitles.set(i, columnNames.get(i));
                    }
                }
                //Converts the query sort builder into a usable Sort object.
                if (!querySortBuilder.isEmpty()) {
                    querySort = new Sort(querySortBuilder.toString());
                }
            }
            catch (Exception e)
            {
                _log.error("Error executing NotificationToolkit->QviewObject(String queryName, String qviewName).", e);
//                throw new RuntimeException(e);
            }
        }
    }

    /**
     * This is the CSS generator for HTML notifications.
     * It must be used BEFORE writing the HTML as it adds a CSS header to the HTML script.
     * This toolkit can be used as follows:
     *  1. Call beginStyle()
     *  2. Add any desired functions from StyleToolkit.
     *  3. Call endStyle().
     */
    static class StyleToolkit {
        /**
         * This must be called first when customizing a notification's CSS style.
         * @return  A string containing CSS code.
         */
        public String beginStyle() {
            StringBuilder returnStyle = new StringBuilder();
            returnStyle.append(
                    "<head> <style>"
            );
            return returnStyle.toString();
        };

        /**
         * This must be called last when customizing a notification's CSS style.
         * @return  A string containing CSS code.
         */
        public String endStyle() {
            StringBuilder returnStyle = new StringBuilder();
            returnStyle.append(
                    "</style> </head>"
            );
            return returnStyle.toString();
        };

        /**
         * This is the default table style.  It includes:
         *  1px solid black border.
         *  Hover effect with grey color.
         *  5px padding.
         *  Centered text.
         */
        //This is the basic table style.  It includes:
        //
        public String setBasicTableStyle() {
            StringBuilder returnStyle = new StringBuilder();
            returnStyle.append(
                    //Adds a border to the table.
                    "table, th, tr { border: 1px solid black;}" +
                            //Adds a hover effect to rows.
                            "tr:hover {background-color: #d9d9d9;}" +
                            //Adds padding to each cell.
                            "th, td {padding: 5px; text-align: center}" +
                            //Adds vertical column lines (on right side of row's cells, but not on the row's final cell).
                            "th, td {border-right: 1px solid #000000}" +
                            "th:last-child, td:last-child {border-right: none}" +
                            //Adds horizontal row lines (on bottom side of row's cells, but not on the final row's cells).
                            "th, td {border-bottom: 1px solid #000000}" +
                            "tr:last-child td {border-bottom: none}"

                    //TODO: Figure out how to make the bottom 2 formats work.
                    //Sets the header text format.
//                    "th {font-weight: bold}" +
                    //Sets the table cell text format.
//                    "td {font-weight: normal}"
            );
            return returnStyle.toString();
        };

        /**
         * This sets the background color of the specified column.
         * @param columnToHighlight The index of the desired column.
         * @param highlightColor    The hex code of the desired color.
         * @return                  A string containing CSS code.
         */
        public String setColumnBackgroundColor(int columnToHighlight, String highlightColor) {
            StringBuilder returnStyle = new StringBuilder();
            returnStyle.append(
                    "th:nth-child(" + columnToHighlight + "), td:nth-child(" + columnToHighlight + ") {background: " + highlightColor + "}"
            );
            return returnStyle.toString();
        }

        /**
         * This sets the text color of the specified column.
         * @param columnToColor The index of the desired column.
         * @param textColor     The hex code of the desired color.
         * @return              A string containing CSS code.
         */
        public String setColumnTextColor(int columnToColor, String textColor) {
            StringBuilder returnStyle = new StringBuilder();
            returnStyle.append(
                    "th:nth-child(" + columnToColor + "), td:nth-child(" + columnToColor + ") {color: " + textColor + "}"
            );
            return returnStyle.toString();
        }

        /**
         * This sets the row background color for the first row (containing column titles).
         * @param headerColor   The hex code of the desired color.
         * @return              A string containing CSS code.
         */
        public String setHeaderRowBackgroundColor(String headerColor) {
            StringBuilder returnStyle = new StringBuilder();
            returnStyle.append(
                    "th:nth-child(n) {background: " + headerColor + "}"
            );
            return returnStyle.toString();
        }

    }

    static class NotificationRevampTable
    {
        //        Integer borderSize;                         //The size of the table border.
        String[] tableColumns;                      //The names of the columns.
        ArrayList<String[]> tableData;              //A 3D array of the table data. (ArrayList of rows, each containing a string array of column data.)
        ArrayList<String> rowColors;         //An optional list of colors for each row.  Must be the same size as 'tableData'.

        NotificationRevampTable(String[] TableColumns, ArrayList<String[]> TableData)
        {
            this.tableColumns = TableColumns;
            this.tableData = TableData;
            this.rowColors = null;
        }

        public String createBasicHTMLTable()
        {
            //Begin table.
            StringBuilder tempTable = new StringBuilder();
            tempTable.append("<table>");

            //Adds column headers.
            tempTable.append("<tr>");
            for (String columnName : tableColumns)
            {
                tempTable.append("<th>" + columnName + "</th>");
            }
            tempTable.append("</tr>");

            //Cycles through each row.
            Integer rowTracker = 0;
            for (String[] currentRow : tableData)
            {
                tempTable.append("<tr>");
                //Cycles through each column in the current row.
                for (String currentColumn : currentRow)
                {
                    //Updates row data.
                    if (this.rowColors == null)
                    {
                        tempTable.append("<td>" + currentColumn + "</td>");
                    }
                    //Updates row data with color.
                    else if (this.rowColors.size() == this.tableData.size())
                    {
                        tempTable.append("<td bgcolor=" + rowColors.get(rowTracker) + ">" + currentColumn + "</td>");
                    }
                }
                tempTable.append("</tr>");
                rowTracker++;
            }

            //Return table.
            tempTable.append("</table>");
            return tempTable.toString();
        }
    }

    static class DateToolkit {
        String DATE_FORMAT_STRING = "MM/dd/yyyy";

        //Returns today's date as Date (ex: "Wed Mar 06 13:11:02 CST 2024").
        public Date getDateToday() {
            Calendar todayCalendar = Calendar.getInstance();
            Date todayDate = todayCalendar.getTime();
            return todayDate;
        }

//        //Returns tomorrow's date as Date (ex: "Thu Mar 07 13:11:02 CST 2024").
//        public Date getDateTomorrow() {
//            Calendar todayCalendar = Calendar.getInstance();
//            todayCalendar.add(Calendar.DATE, 1);
//            Date tomorrowDate = todayCalendar.getTime();
//            return tomorrowDate;
//        }

//        //Returns five days ago's date as Date (ex: "Fri Mar 01 13:11:02 CST 2024").
//        public Date getDateFiveDaysAgo() {
//            Calendar todayCalendar = Calendar.getInstance();
//            todayCalendar.add(Calendar.DATE, -5);
//            Date fiveDaysAgoDate = todayCalendar.getTime();
//            return fiveDaysAgoDate;
//        }

        //Returns today's date +/- a specific number of days as Date (ex: "Fri Mar 01 13:11:02 CST 2024").
        public Date getDateXDaysFromNow(Integer numDaysFromNow) {
            Calendar todayCalendar = Calendar.getInstance();
            todayCalendar.add(Calendar.DATE, numDaysFromNow);
            Date dateToReturn = todayCalendar.getTime();
            return dateToReturn;
        }

        //Returns today's date as String (ex: "03/06/2024").
        public String getCalendarDateToday() {
            return  new SimpleDateFormat(DATE_FORMAT_STRING).format(new Date());
        }

        /**
         * Gets a timestamp with the current date & time.
         * @return  A string representing the current date & time (ex: "2024-03-06 13:11")
         */
        public final String getCurrentTime() {
            return AbstractEHRNotification._dateTimeFormat.format(new Date());
        }

    }

    // The unit test has to end in "UnitTest" to get registered and show up at http://localhost:8080/labkey/junit-begin.view?
    public static class DateToolkitUnitTest extends Assert
    {


        @Test
        public void testGetCalendarDateToday() {
            //test your dates here

            // Arrange
            DateToolkit dateToolkit = new DateToolkit();

            // Act
            String formattedDate = dateToolkit.getCalendarDateToday();

            // Assert
            // Since the actual date can change, validate the format (MM/DD/YYYY)
            SimpleDateFormat format = new SimpleDateFormat("MM/dd/yyyy");
            try {
                format.parse(formattedDate);
            } catch (Exception e) {
                fail("getCalendarDateToday should return a date formatted as MM/DD/YYYY");
            }
        }
    }

}

