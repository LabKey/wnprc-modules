package org.labkey.wnprc_ehr.notification;

//import org.labkey.api.data.Container;
//import org.labkey.api.security.User;
//import org.labkey.api.data.TableSelector;
//import org.labkey.api.data.Selector;

import org.apache.commons.lang3.time.DateUtils;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.ConvertHelper;
import org.labkey.api.data.FilterInfo;
import org.labkey.api.data.Results;
import org.labkey.api.data.ResultsImpl;
import org.labkey.api.data.RuntimeSQLException;
import org.labkey.api.data.Selector;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.Sort;
import org.labkey.api.data.Table;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.query.CustomView;
import org.labkey.api.query.CustomViewInfo;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.QueryView;
import org.labkey.api.security.User;
import org.labkey.api.util.PageFlowUtil;
import org.labkey.api.util.Path;
import org.labkey.remoteapi.query.Filter;
import org.labkey.wnprc_ehr.WNPRC_EHREmail;
//import org.labkey.remoteapi.query.Sort;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.nio.file.Paths;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.Map;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.TreeMap;

import org.labkey.api.query.QueryService;
import org.labkey.wnprc_ehr.WNPRC_EHRModule;
import org.labkey.wnprc_ehr.notification.NotificationToolkit;

import javax.swing.*;
import javax.swing.table.DefaultTableModel;


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
        int numRows = tableAsList.size();
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
    public final long getTableRowCount(Container c, User u, String tableName, String qViewName) {

        //Creates variables.
        StringBuilder returnString = new StringBuilder();

        //Gets table parameters from qView.
        QviewObject myQview = new QviewObject(c, u, tableName, qViewName);
        ArrayList<String> myTitles = myQview.columnTitles;
        ArrayList<String> myColumns = myQview.columnNames;
        SimpleFilter myFilter = myQview.queryFilter;
        Sort mySort = myQview.querySort;

        //Gets table.
        TableSelector ts = new TableSelector(QueryService.get().getUserSchema(u, c, "study").getTable(tableName), myFilter, mySort);

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

