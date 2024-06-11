package org.labkey.wnprc_ehr.notification;

import org.apache.commons.math3.analysis.function.Abs;
import org.labkey.api.data.Container;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.security.User;
import org.labkey.api.util.MailHelper;
import org.labkey.api.util.Path;
import org.labkey.api.view.ActionURL;
import org.labkey.wnprc_ehr.WNPRC_EHRModule;
import org.labkey.api.security.UserPrincipal;
import org.labkey.api.ldk.notification.NotificationService;
import org.apache.commons.lang3.StringUtils;

import javax.mail.Address;
import javax.mail.Message;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.List;

import static org.labkey.api.search.SearchService._log;

public class AnimalRequestNotificationRevamp extends AbstractEHRNotification
{
    //Class Variables
    NotificationToolkit notificationToolkit = new NotificationToolkit();
    NotificationToolkit.StyleToolkit styleToolkit = new NotificationToolkit.StyleToolkit();
    NotificationToolkit.DateToolkit dateToolkit = new NotificationToolkit.DateToolkit();
    public Integer rowId;
    public User currentUser;
    public String hostName;



    //Constructors
    /**
     * This constructor is used to register the notification in WNPRC_EHRModule.java.
     * @param owner
     */
    public AnimalRequestNotificationRevamp(Module owner)
    {
        super(owner);
    }
    /**
     * This constructor is used to actually send the notification via the "TriggerScriptHelper.java" class.
     * @param owner
     * @param rowid
     * @param currentuser
     * @param hostname
     */
    public AnimalRequestNotificationRevamp(Module owner, Integer rowid, User currentuser, String hostname)
    {
        super(owner);
        rowId = rowid;
        currentUser = currentuser;
        hostName = hostname;
    }



    //Notification Details
    public String getName()
    {
        return "Animal Request Notification Revamp";
    }
    public String getDescription() {
        return "This notification gets sent every time there is a new Animal Request form submitted";
    }
    @Override
    public String getEmailSubject(Container c)
    {
        return "[EHR Services] (Revamp) New Animal Request Submitted on " + dateToolkit.getCurrentTime();
    }
    public String getScheduleDescription()
    {
        return "As soon as Animal Request is submitted";
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
        //Creates variables.
        final StringBuilder msg = new StringBuilder();
        Date now = new Date();

        //Sets data.
        String currentDate = AbstractEHRNotification._dateFormat.format(now);
        String currentTime = AbstractEHRNotification._timeFormat.format(now);
        //Creates 'single request' URL.
        Path singleRequestURL = new Path(ActionURL.getBaseServerURL(), "ehr", c.getPath(), "");
        String singleRequestUrlAsString = singleRequestURL.toString() + "manageRecord.view?schemaName=wnprc&queryName=animal_requests&title=Animal%20Requests&keyField=rowid&key=" + rowId;
        String singleRequestHyperlink = notificationToolkit.createHyperlink("here", singleRequestUrlAsString);
        //Creates 'all requests' URL.
        Path allRequestsURL = new Path(ActionURL.getBaseServerURL(), "ehr", c.getPath(), "");
        String allRequestsUrlAsString = allRequestsURL.toString() + "dataEntry.view?#topTab:Requests&activeReport:AnimalRequests\"";
        String allRequestsHyperlink = notificationToolkit.createHyperlink("here", allRequestsUrlAsString);

        //Creates message info.
        msg.append("<p>There was a new animal request submitted on: " + currentDate + " at " + currentTime + ".</p>");
        msg.append("<p>Click " + singleRequestHyperlink + " to review the request.</p>");
        msg.append("<p>View all of the animal requests " + allRequestsHyperlink + ".</p>");

        //Returns string.
        return msg.toString();
    }

}
