package org.labkey.wnprc_ehr.notification;

import org.jetbrains.annotations.Nullable;
import org.labkey.api.data.Container;
import org.labkey.api.module.Module;
import org.labkey.api.security.User;

public class BloodAlertsNotificationRevampAnimalCare extends AbstractEHRNotification {
    //Class Variables
    NotificationToolkit notificationToolkit = new NotificationToolkit();
    NotificationToolkit.StyleToolkit styleToolkit = new NotificationToolkit.StyleToolkit();
    NotificationToolkit.DateToolkit dateToolkit = new NotificationToolkit.DateToolkit();



    //Constructors
    /**
     * This constructor is used to register the notification in WNPRC_EHRModule.java.
     * @param owner
     */
    public BloodAlertsNotificationRevampAnimalCare(Module owner) {super(owner);}



    //Notification Details
    @Override
    public String getName()
    {
        return "Blood Alerts Revamp (Animal Care)";
    }
    @Override
    public String getDescription() {
        return "This report contains any scheduled blood draws not marked as completed.";
    }
    @Override
    public String getEmailSubject(Container c) {
        return "Daily Blood Draw Alerts: " + dateToolkit.getCurrentTime();
    }
    @Override
    public String getScheduleDescription()
    {
        return "Every day at 1:00PM and 3:00PM";
    }
    @Override
    public String getCronString() {
        return notificationToolkit.createCronString("0", "1,3", "*");
    }
    @Override
    public String getCategory() {
        return "Revamped Notifications - Blood Draws";
    }



    //Message Creation
    @Override
    public String getMessageBodyHTML(Container c, User u) {
        BloodAlertsNotificationRevamp.BloodAlertNotificationShared bloodAlertShared = new BloodAlertsNotificationRevamp.BloodAlertNotificationShared();
        String testString = bloodAlertShared.getBloodDrawNotificationMessageBody(c, u, "Animal Care", "full");
        return testString;
    }
}
