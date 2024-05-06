package org.labkey.wnprc_ehr.notification;

import org.labkey.api.data.Container;
import org.labkey.api.module.Module;
import org.labkey.api.security.User;

public class AdminAlertsNotificationRevamp extends AbstractEHRNotification {
    //Class Variables
    NotificationToolkit notificationToolkit = new NotificationToolkit();
    NotificationToolkit.StyleToolkit styleToolkit = new NotificationToolkit.StyleToolkit();
    NotificationToolkit.DateToolkit dateToolkit = new NotificationToolkit.DateToolkit();



    //Constructors
    /**
     * This constructor is used to register the notification in WNPRC_EHRModule.java.
     * @param owner
     */
    public AdminAlertsNotificationRevamp(Module owner) {super(owner);}



    //Notification Details
    @Override
    public String getName() {
        return "Admin Alerts Revamp";
    }
    @Override
    public String getDescription() {
        return "This email contains a series of automatic alerts about the WNPRC colony.  It was run on: " + dateToolkit.getCurrentTime();
    }
    @Override
    public String getEmailSubject(Container c) {
        return "Daily Admin Alerts: " + dateToolkit.getCurrentTime();
    }
    @Override
    public String getScheduleDescription() {
        return "Daily at 11AM";
    }
    @Override
    public String getCronString() {
        return notificationToolkit.createCronString("0", "11", "*");
    }
    @Override
    public String getCategory() {
        return "Revamped Notifications";
    }



    //Message Creation
    @Override
    public String getMessageBodyHTML(Container c, User u) {
        //TODO
        return "Test.";
    }
}
