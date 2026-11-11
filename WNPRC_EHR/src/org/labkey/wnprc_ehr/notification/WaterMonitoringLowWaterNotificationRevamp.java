package org.labkey.wnprc_ehr.notification;

import org.labkey.api.data.Container;
import org.labkey.api.module.Module;
import org.labkey.api.security.User;

public class WaterMonitoringLowWaterNotificationRevamp extends AbstractEHRNotification {
    // Class Variables
    NotificationToolkit notificationToolkit = new NotificationToolkit();
    NotificationToolkit.DateToolkit dateToolkit = new NotificationToolkit.DateToolkit();





    // Constructors
    private final Module owner;
    /**
     * This constructor is used to register the notification in WNPRC_EHRModule.java.
     * @param owner
     */
    public WaterMonitoringLowWaterNotificationRevamp(Module owner) {
        super(owner);
        this.owner = owner;
    }





    // Notification Details
    @Override
    public String getName() {
        return "Water Monitoring Low Water";
    }
    @Override
    public String getDescription() {
        return "This email lists regulated animals that got less than 10ml/kg of water today, including animals with no water total at all (blank) for: " + dateToolkit.getCurrentTime();
    }
    @Override
    public String getEmailSubject(Container c) {
        return "Water Monitoring Low Water: " + dateToolkit.getCurrentTime();
    }
    @Override
    public String getScheduleDescription() {
        return "Daily at 7:00pm";
    }
    @Override
    public String getCronString() {
        return notificationToolkit.createCronString("0", "19", "*");
    }
    @Override
    public String getCategory() {
        return "Revamped Notifications";
    }





    // Message Creation
    @Override
    public String getMessageBodyHTML(Container c, User u)
    {
        // Creates variables.
        final StringBuilder messageBody = new StringBuilder();

        // Retrieves data.
        WaterMonitoringNotification waterMonitoringFunctions = new WaterMonitoringNotification(owner);
        waterMonitoringFunctions.findAnimalsWithEnoughWater(c,u,messageBody,10);
        if (messageBody.isEmpty()) {
            // Sends the 'empty notification' if there are no results.
            notificationToolkit.sendEmptyNotificationRevamp(c, u, "Water Monitoring Low Water");
            return null;
        } else {
            // Sends this notification if there are results.
            return messageBody.toString();
        }
    }
}
