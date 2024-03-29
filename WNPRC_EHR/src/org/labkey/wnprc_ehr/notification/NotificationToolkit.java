package org.labkey.wnprc_ehr.notification;


import jakarta.mail.Address;
import jakarta.mail.Message;
import org.apache.commons.lang3.StringUtils;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.FilterInfo;
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
import java.util.Collection;
import java.util.Date;
import java.util.List;

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
     * @param hours A string array of hours in military time (ex. {8, 12, 23}).
     * @return      A cron string representing the passed-in hours.
     */
    public final String createCronString(String[] hours) {

        //Creates variables.
        StringBuilder returnString = new StringBuilder("0 0");

        //Adds desired hours.
        for (int i = 0; i < hours.length; i++) {
            returnString.append(" " + hours[i]);
        }

        //Adds necessary format text to the end.
        returnString.append(" * * ?");

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
     * Gets a timestamp with the current date & time.
     * @return  A string representing the current date & time.
     */
    public final String getCurrentTime() {
        return AbstractEHRNotification._dateTimeFormat.format(new Date());
    }

    /**
     * Sends the email notification.
     * @param currentNotification   The java notification to be sent.
     * @param currentUser           The current user.
     * @param currentContainer      The current container.
     */
    public void sendNotification(Notification currentNotification, User currentUser, Container currentContainer) {

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

    /**
     * Gets an animal's weight as a 9-digit number with trailing zeroes removed.
     * @param currentContainer  The current container.
     * @param currentUser       The current user.
     * @param animalID          The animal ID to check the weight for.
     * @return                  A string representing the animal's weight.
     */
    public String getWeightFromAnimalID(Container currentContainer, User currentUser, String animalID) {
        //Gets the full animal weight.
        ArrayList<String> weightRow = getTableRowAsList(currentContainer, currentUser, "study", "weight", new Sort("-date"), "id", animalID, new String[]{"weight"});
        if (!weightRow.isEmpty()) {
            String fullWeight = weightRow.get(0);
            if (fullWeight != null) {
                //Gets animal weight rounded to 9 digits.
                String nineDigitWeight = StringUtils.substring(fullWeight, 0, 9);
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
        else {
            return "";
        }
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
                                updatedFee.append(rs.getString("prepaid"));
                            }
                        });
                    }
                }
                if (!updatedFee.isEmpty()) {
                    return updatedFee.toString();
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
            ArrayList<String> prenatalDeathRow = getTableRowAsList(c, u, "study", "prenatal", null, "id", animalID, new String[]{"gender"});
            if (!prenatalDeathRow.isEmpty()) {
                animalSexCode = prenatalDeathRow.get(0);
            }
        }
        //Gets sex from non-prenatal id.
        else {
            ArrayList<String> demographicTableRow = getTableRowAsList(c, u, "study", "demographics", null, "id", animalID, new String[]{"gender"});
            if (!demographicTableRow.isEmpty()) {
                animalSexCode = demographicTableRow.get(0);
            }
        }

        //Gets the gender meaning from the gender code.
        if (animalSexCode != null) {
            if (!animalSexCode.equals("") && !animalSexCode.equals("null")) {
                ArrayList<String> genderTableRow = getTableRowAsList(c, u, "ehr_lookups", "gender_codes", null, "code", animalSexCode, new String[]{"meaning"});
                if (!genderTableRow.isEmpty()) {
                    animalSexMeaning = genderTableRow.get(0);
                }
            }
        }

        //Returns animal sex.
        return animalSexMeaning;
    }

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

    /**
     * This is an object used in the WNPRC DeathNotification.java file that defines all the info presented for a dead animal's necropsy.
     * It contains the following data (returning blank strings for non-existent data):
     *  If necropsy exists (true/false).
     *  Necropsy case number.
     *  Necropsy task id hyperlink.
     *  Necropsy date.
     *  Necropsy time of death.
     *  Necropsy type of death.
     *  Necropsy grant number.
     *  Necropsy manner of death.
     *  Necropsy animal weight.
     *  Necropsy animal replacement fee.
     */
    public static class DeathNecropsyObject {
        Boolean necropsyExists = false;
        String necropsyCaseNumber = "";
        String necropsyTaskIdHyperlink = "";
        String necropsyDate = "";
        String necropsyTimeOfDeath = "";
        String necropsyTypeOfDeath = "";
        String necropsyGrantNumber = "";
        String necropsyMannerOfDeath = "";
        String animalWeight = "";
        String animalReplacementFee = "";

        public DeathNecropsyObject(Container c, User u, String animalID, String hostName, Boolean withHtmlPlaceHolders) {
            NotificationToolkit notificationToolkit = new NotificationToolkit();
            if (notificationToolkit.getTableRowCount(c, u, "study", "Necropsy", "notificationView") > 0) {  //Added this if/else check to getTableRowAsList(), I can remove this after testing.
                String[] targetColumns = {"caseno", "taskid", "date", "timeofdeath", "causeofdeath", "account", "mannerofdeath"};

                ArrayList<String> necropsyTableRow = notificationToolkit.getTableRowAsList(c, u, "study", "necropsy", null, "id", animalID, targetColumns);

                //Necropsy does exist.
                if (!necropsyTableRow.isEmpty()) {
                    this.necropsyExists = true;
                    //Gets necropsy data.
                    this.necropsyCaseNumber = necropsyTableRow.get(0);
                    this.necropsyDate = necropsyTableRow.get(2);
                    this.necropsyTimeOfDeath = necropsyTableRow.get(3);
                    this.necropsyTypeOfDeath = necropsyTableRow.get(4);
                    this.necropsyGrantNumber = necropsyTableRow.get(5);
                    this.necropsyMannerOfDeath = necropsyTableRow.get(6);
                    this.animalWeight = notificationToolkit.getWeightFromAnimalID(c, u, animalID);
                    this.animalReplacementFee = notificationToolkit.getAnimalReplacementFee(c, u, this.necropsyTypeOfDeath, animalID);

                    //Creates task id with hyperlink.
                    String necropsyTaskID = necropsyTableRow.get(1);
                    Path taskURL = new Path(ActionURL.getBaseServerURL(), "ehr", c.getPath(), "taskDetails.view");
                    String taskUrlAsString = taskURL.toString() + "?formtype=Necropsy&taskid=" + necropsyTaskID;
                    String taskRowID = "";
                    if (notificationToolkit.getTableRowCount(c, u, "ehr", "tasks", "") > 0) {  //Added this if/else check to getTableRowAsList(), I can remove this after testing.
                        ArrayList<String> taskRow = notificationToolkit.getTableRowAsList(c, u, "ehr", "tasks", null, "taskid", necropsyTaskID, new String[]{"rowid"});
                        if (!taskRow.isEmpty()) {
                            taskRowID = taskRow.get(0);
                        }
                        this.necropsyTaskIdHyperlink = notificationToolkit.createHyperlink(taskRowID, taskUrlAsString);
                    }
                }
            }
            if (withHtmlPlaceHolders) {
                String placeholderText = "<em>Not Specified</em>";
                if (this.necropsyCaseNumber == null) {
                    this.necropsyCaseNumber = placeholderText;
                }
                else if (this.necropsyCaseNumber.equals("") || this.necropsyCaseNumber.equals("null")) {
                    this.necropsyCaseNumber = placeholderText;
                }
                if (this.necropsyTaskIdHyperlink == null) {
                    this.necropsyTaskIdHyperlink = placeholderText;
                }
                else if (this.necropsyTaskIdHyperlink.equals("") || this.necropsyTaskIdHyperlink.equals("null")) {
                    this.necropsyTaskIdHyperlink = placeholderText;
                }
                if (this.necropsyDate == null) {
                    this.necropsyDate = placeholderText;
                }
                else if (this.necropsyDate.equals("") || this.necropsyDate.equals("null")) {
                    this.necropsyDate = placeholderText;
                }
                if (this.necropsyTimeOfDeath == null) {
                    this.necropsyTimeOfDeath = placeholderText;
                }
                else if (this.necropsyTimeOfDeath.equals("") || this.necropsyTimeOfDeath.equals("null")) {
                    this.necropsyTimeOfDeath = placeholderText;
                }
                if (this.necropsyTypeOfDeath == null) {
                    this.necropsyTypeOfDeath = placeholderText;
                }
                else if (this.necropsyTypeOfDeath.equals("") || this.necropsyTypeOfDeath.equals("null")) {
                    this.necropsyTypeOfDeath = placeholderText;
                }
                if (this.necropsyGrantNumber == null) {
                    this.necropsyGrantNumber = placeholderText;
                }
                else if (this.necropsyGrantNumber.equals("") || this.necropsyGrantNumber.equals("null")) {
                    this.necropsyGrantNumber = placeholderText;
                }
                if (this.necropsyMannerOfDeath == null) {
                    this.necropsyMannerOfDeath = placeholderText;
                }
                else if (this.necropsyMannerOfDeath.equals("") || this.necropsyMannerOfDeath.equals("null")) {
                    this.necropsyMannerOfDeath = placeholderText;
                }
                if (this.animalWeight == null) {
                    this.animalWeight = placeholderText;
                }
                else if (this.animalWeight.equals("") || this.animalWeight.equals("null")) {
                    this.animalWeight = placeholderText;
                }
                if (this.animalReplacementFee == null) {
                    this.animalReplacementFee = placeholderText;
                }
                else if (this.animalReplacementFee.equals("") || this.animalReplacementFee.equals("null")) {
                    this.animalReplacementFee = placeholderText;
                }
            }
        }
    }

    /**
     * This is an object used in the WNPRC DeathNotification.java file that defines all the info presented for a dead animal's demographics.
     * It contains the following data (returning blank strings for non-existent data):
     *  Animal ID hyperlink.
     *  Animal sex.
     */
    public static class DeathDemographicObject {
        String animalIdHyperlink = "";
        String animalSex = "";
        String animalDam = "";
        String animalSire = "";
        String animalConception = "";
        public DeathDemographicObject(Container c, User u, String animalID, Boolean withHtmlPlaceHolders) {
            NotificationToolkit notificationToolkit = new NotificationToolkit();
            //Gets hyperlink for animal id in animal history abstract.
            Path animalAbstractURL = new Path(ActionURL.getBaseServerURL(), "ehr", c.getPath(), "animalHistory.view");
            String animalAbstractUrlAsString = animalAbstractURL.toString() + "?#subjects:" + animalID + "&inputType:singleSubject&showReport:1&activeReport:abstract";
            this.animalIdHyperlink = notificationToolkit.createHyperlink(animalID, animalAbstractUrlAsString);

            //Gets animal sex.
            String animalsex = notificationToolkit.getSexFromAnimalID(c, u, animalID);
            this.animalSex = animalsex;

            //Gets prenatal information if necessary.
            if (notificationToolkit.checkIfPrenatalID(animalID)) {
                ArrayList<String> prenatalDeathRow = notificationToolkit.getTableRowAsList(c, u, "study", "prenatal", null, "id", animalID, new String[]{"dam", "sire", "conception"});
                if (!prenatalDeathRow.isEmpty())
                {
                    this.animalDam = prenatalDeathRow.get(0);
                    this.animalSire = prenatalDeathRow.get(1);
                    this.animalConception = prenatalDeathRow.get(2);
                }
            }

            //Adds HTML placeholders for empty fields.
            if (withHtmlPlaceHolders) {
                String placeholderText = "<em>Not Specified</em>";
                if (this.animalIdHyperlink == null) {
                    this.animalIdHyperlink = placeholderText;
                }
                else if (this.animalIdHyperlink.equals("") || this.animalIdHyperlink.equals("null")) {
                    this.animalIdHyperlink = placeholderText;
                }
                if (this.animalSex == null) {
                    this.animalSex = placeholderText;
                }
                else if (this.animalSex.equals("") || this.animalSex.equals("null")) {
                    this.animalSex = placeholderText;
                }
                if (this.animalDam == null) {
                    this.animalDam = placeholderText;
                }
                else if (this.animalDam.equals("") || this.animalDam.equals("null")) {
                    this.animalDam = placeholderText;
                }
                if (this.animalSire == null) {
                    this.animalSire = placeholderText;
                }
                else if (this.animalSire.equals("") || this.animalSire.equals("null")) {
                    this.animalSire = placeholderText;
                }
                if (this.animalConception == null) {
                    this.animalConception = placeholderText;
                }
                else if (this.animalConception.equals("") || this.animalConception.equals("null")) {
                    this.animalConception = placeholderText;
                }
            }
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
                return;
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
                        catch(Exception e) {
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
                throw new RuntimeException(e);
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
                    "th, td {padding: 5px; text-align: center}"
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
    }

}

