package org.labkey.wnprc_ehr.notification;

import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.Sort;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.queryprofiler.Query;
import org.labkey.api.module.Module;
import org.labkey.api.query.QueryService;
import org.labkey.api.security.User;
import org.labkey.api.util.Path;
import org.labkey.api.view.ActionURL;
import org.labkey.wnprc_ehr.TriggerScriptHelper;

import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class AnimalRequestUpdateNotificationRevamp extends AbstractEHRNotification
{
    //Class Variables
    NotificationToolkit notificationToolkit = new NotificationToolkit();
    NotificationToolkit.StyleToolkit styleToolkit = new NotificationToolkit.StyleToolkit();
    NotificationToolkit.DateToolkit dateToolkit = new NotificationToolkit.DateToolkit();
    public User currentUser;
    public Container currentContainer;
    public String hostName;
    public Map<String,Object> newRow;
    public Map<String,Object> oldRow;
    public Integer rowID;

    //Constructors
    /**
     * This constructor is used to register the notification in WNPRC_EHRModule.java.
     * @param owner
     */
    public AnimalRequestUpdateNotificationRevamp(Module owner)
    {
        super(owner);
    }
    /**
     * This constructor is used to actually send the notification via the "TriggerScriptHelper.java" class.
     * @param owner
     * @param myRowID
     * @param myCurrentUser
     * @param myHostName
     * @param myNewRow
     * @param myOldRow
     */
    public AnimalRequestUpdateNotificationRevamp(Module owner, Integer myRowID, User myCurrentUser, Container myCurrentContainer, String myHostName, Map<String,Object> myNewRow, Map<String,Object> myOldRow)
    {
        super(owner);
        this.currentUser = myCurrentUser;
        this.rowID = myRowID;
        this.currentContainer = myCurrentContainer;
        this.hostName = myHostName;
        this.newRow = myNewRow;
        this.oldRow = myOldRow;
    }



    //Notification Details
    public String getName()
    {
        return "Animal Request Update Notification Revamp";
    }
    public String getDescription() {
        return "This notification gets sent every time there is an Animal Request that gets updated.";
    }
    @Override
    public String getEmailSubject(Container c)
    {
        return "[EHR Services] (Revamp) Animal Request Updated on " + dateToolkit.getCurrentTime();
    }
    public String getScheduleDescription()
    {
        return "As soon as Animal Request is updated.";
    }
    @Override
    public String getCategory()
    {
        return "Revamped Notifications";
    }



    //Sending Options
    public void sendManually (Container container, User user)
    {
        notificationToolkit.sendNotification(this, user, container, null);
    }



    //Message Creation
    @Override
    public String getMessageBodyHTML(Container c, User u)
    {
        // Assigns data if none exists.  This is used for testing with the 'Run Report in Browser' option.  This compares the two most recent rows.
        if ((this.newRow == null) || (this.oldRow == null)) {
            // Creates filters.  For testing, we retrieve the most recent entry for 1 animal, and the most recent entry for 2 animals.
            SimpleFilter myFilter1 = new SimpleFilter("numberofanimals", 1, CompareType.EQUAL);
            SimpleFilter myFilter2 = new SimpleFilter("numberofanimals", 2, CompareType.EQUAL);
            // Creates sort.
            Sort mySort = new Sort("-date");
            // Creates columns to retrieve.
            String[] targetColumns = new String[]{"rowid", "numberofanimals"};
            // Runs query.
            ArrayList<HashMap<String, String>> returnArray1 = notificationToolkit.getTableMultiRowMultiColumnWithFieldKeys(c, u, "wnprc", "animal_requests", myFilter1, mySort, targetColumns);
            ArrayList<HashMap<String, String>> returnArray2 = notificationToolkit.getTableMultiRowMultiColumnWithFieldKeys(c, u, "wnprc", "animal_requests", myFilter2, mySort, targetColumns);

            // Assigns most recent row to this.newRow and the second most recent row to this.oldRow.
            if ((!returnArray1.isEmpty()) && (!returnArray2.isEmpty())) {
                // Assigns new row id.
                this.rowID = Integer.valueOf(returnArray1.get(0).get("rowid"));
                // Assigns new row.
                this.newRow = new HashMap<>() {{
                    put("numberOfAnimals", returnArray1.get(0).get("numberofanimals"));
                }};
                // Assigns old row.
                this.oldRow = new HashMap<>() {{
                    put("numberOfAnimals", returnArray2.get(0).get("numberofanimals"));
                }};
            }
        }

        //Creates 'single request' URL.
        Path singleRequestURL = new Path(ActionURL.getBaseServerURL(), "ehr", c.getPath(), "");
        String singleRequestUrlAsString = singleRequestURL.toString() + "manageRecord.view?schemaName=wnprc&queryName=animal_requests&title=Animal%20Requests&keyField=rowid&key=" + this.rowID;
        //Creates 'all requests' URL.
        Path allRequestsURL = new Path(ActionURL.getBaseServerURL(), "ehr", c.getPath(), "");
        String allRequestsUrlAsString = allRequestsURL.toString() + "dataEntry.view?#topTab:Requests&activeReport:AnimalRequests\"";

        // Creates variables.
        final StringBuilder msg = new StringBuilder();
        String updaterName = "";
        // Gets the name of the user updating this Animal Request.
        if (u != null) {
            if (!u.getFullName().isEmpty()) {
                updaterName = u.getFullName();
            }
            else if (!u.getDisplayName(u).isEmpty()) {
                updaterName = u.getDisplayName(u);
            }
        }
        // Gets the row differences.
        TableInfo rowDifferencesTable = QueryService.get().getUserSchema(u, c, "wnprc").getTable("animal_requests");
        Map<String, ArrayList<String>> rowDifferences = TriggerScriptHelper.buildDifferencesMap(rowDifferencesTable, this.oldRow, this.newRow);
        // Gets the table.
        String[] myTableColumns = new String[]{"Field Changed", "Old Value", "New Value"};
        List<String[]> myTableData = new ArrayList<>();
        for (Map.Entry<String, ArrayList<String>> change : rowDifferences.entrySet()) {
            String[] newTableRow = new String[] {
                    change.getKey(),
                    change.getValue().get(0),
                    change.getValue().get(1)
            };
            myTableData.add(newTableRow);
        }
        NotificationToolkit.NotificationRevampTable myTable = new NotificationToolkit.NotificationRevampTable(myTableColumns, (ArrayList<String[]>) myTableData);

        // Creates CSS.
        msg.append(styleToolkit.beginStyle());
        msg.append(styleToolkit.setBasicTableStyle());
        msg.append(styleToolkit.setHeaderRowBackgroundColor("#d9d9d9"));
        msg.append(styleToolkit.endStyle());

        // Begins message info.
        msg.append("<p>" + updaterName + " updated an animal request entry on: " + dateToolkit.getDateXDaysFromNow(0) + ".</p>");
        msg.append("<p> The following changes were made: <br><br>");
        msg.append(myTable.createBasicHTMLTable());
        msg.append("<p>Click " + notificationToolkit.createHyperlink("here", singleRequestUrlAsString) + " to review the request.</p>");
        msg.append("<p>View all of the animal requests " + notificationToolkit.createHyperlink("here", allRequestsUrlAsString) + ".</p>");

        //Returns string.
        this.resetClass();
        return msg.toString();
    }

    public void resetClass() {
        this.currentUser = null;
        this.currentContainer = null;
        this.oldRow = null;
        this.newRow = null;
        this.hostName = null;
    }
}
