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
import org.labkey.api.data.Results;
import org.labkey.api.data.ResultsImpl;
import org.labkey.api.data.RuntimeSQLException;
import org.labkey.api.data.Selector;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.Sort;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.module.Module;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.security.User;
import org.labkey.api.util.PageFlowUtil;
import org.labkey.wnprc_ehr.WNPRC_EHREmail;

import java.sql.ResultSet;
import java.sql.SQLException;
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





public class NotificationToolkit {

//    //TODO: Define errors and maybe add a catch for if there are no columnNames/displayNames/sortBy.
    /**
     * This function takes a table, orders it, and returns a list of data from necessary columns.
     * When creating the list, this function goes through each row and returns ONLY the first non-null value in the listed columns.
     * This function currently only works with up to 3 columns.  Modify for more columns if needed.
     * Arguments are:
     *      c                   The class's current container.
     *      u                   The class's current user.
     *      tableName           The string name of the desired table.
     *      columnNames         The name of the desired columns (up to 3) to return data from.
     *      columnDisplayNames  The display name for each column.
     *      sortBy              The name of the desired column to sort by.
     */
    public final String getDataFromTable(Container c, User u, String tableName, String[] columnNames, String[] columnDisplayNames, String sortBy) {

        //Creates variables.
        final StringBuilder returnMsg = new StringBuilder();

        //Creates sorted table.
        TableSelector myTable = new TableSelector(QueryService.get().getUserSchema(u, c, "study").getTable(tableName), null, new Sort(sortBy));

        //Creates a spaced list of all data in columnNames depending on number of columnNames.
        long numRows = myTable.getRowCount();
        if (numRows > 0) {
            myTable.forEach(new Selector.ForEachBlock<ResultSet>() {
                @Override
                public void exec(ResultSet rs) throws SQLException {
                    if (columnNames.length == 1) {
                        returnMsg.append(columnDisplayNames[0]);
                        returnMsg.append(rs.getString(columnNames[0]) + "<br>");
                    }
                    else if (columnNames.length == 2) {
                        if (rs.getString(columnNames[0]) == null) {
                            returnMsg.append(columnDisplayNames[1]);
                            returnMsg.append(rs.getString(columnNames[1]) + "<br>");
                        }
                        else {
                            returnMsg.append(columnDisplayNames[0]);
                            returnMsg.append(rs.getString(columnNames[0]) + "<br>");
                        }
                    }
                    else if (columnNames.length == 3) {
                        if (rs.getString(columnNames[0]) == null) {
                            if (rs.getString(columnNames[1]) == null) {
                                returnMsg.append(columnDisplayNames[2]);
                                returnMsg.append(rs.getString(columnNames[2]) + "<br>");
                            }
                            else {
                                returnMsg.append(columnDisplayNames[1]);
                                returnMsg.append(rs.getString(columnNames[1]) + "<br>");
                            }
                        }
                        else {
                            returnMsg.append(columnDisplayNames[0]);
                            returnMsg.append(rs.getString(columnNames[0]) + "<br>");
                        }
                    }
                    else {
                        returnMsg.append("ERROR: Cannot use this function with more than 3 columns.");
                    }
                }
            });
        }

        //Returns list of data.
        return returnMsg.toString();
    }

    //This function takes an input string and adds an extra newline every 2 lines.
    public final String addSpaceEveryOtherLine(String unspacedString) {

        //Creates variables.
        String[] unspacedStringSplit = unspacedString.toString().split("<br>");
        StringBuilder spacedString = new StringBuilder();

        //Goes through each line in unspacedString.
        for (int i = 0; i < unspacedStringSplit.length; i++) {
            spacedString.append(unspacedStringSplit[i]);
            spacedString.append("<br>");
            //Adds an extra line on odd indexes.
            if (i % 2 != 0) {
                spacedString.append("<br>");
            }
        }

        //Returns the formatted string.
        return spacedString.toString();
    }

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

    public final String createHeader(String headerTitle) {
        //Makes string bold.
        StringBuilder boldString = new StringBuilder("<strong>" + headerTitle + "</strong>");

        //Underlines string.
        StringBuilder underlinedString = new StringBuilder("<u>" + boldString + "</u>");

        //Increases text size.
        StringBuilder largeString = new StringBuilder("<p style=\"font-size:20px\">" + underlinedString + "</p>");

        //Returns string.
        return largeString.toString();
    }

    public final long getTableRowCount(Container c, User u, String tableName) {

        //Creates variables.
        StringBuilder returnString = new StringBuilder();

        //Gets table.
        TableSelector ts = new TableSelector(QueryService.get().getUserSchema(u, c, "study").getTable(tableName), null, null);

        //Returns table count.
        return(ts.getRowCount());
    }
}