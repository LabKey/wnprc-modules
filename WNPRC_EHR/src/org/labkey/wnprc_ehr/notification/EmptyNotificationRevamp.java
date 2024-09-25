package org.labkey.wnprc_ehr.notification;

import org.labkey.api.data.Container;
import org.labkey.api.module.Module;
import org.labkey.api.security.User;
import org.labkey.wnprc_ehr.notification.AbstractEHRNotification;
import org.labkey.wnprc_ehr.notification.NotificationToolkit;

public class EmptyNotificationRevamp extends AbstractEHRNotification {
    //Class Variables
    NotificationToolkit notificationToolkit = new NotificationToolkit();
    String notificationType = null;


    // Constructors
    /**
     * This constructor is used to register the notification in WNPRC_EHRModule.java.
     * @param owner
     */
    public EmptyNotificationRevamp(Module owner) {super(owner);}

    //This constructor is used to actually send the notification via the "TriggerScriptHelper.java" class.
    public EmptyNotificationRevamp(Module owner, String emptyNotificationType) {
        super(owner);
        this.notificationType = emptyNotificationType;
    }



    // Notification Details
    @Override
    public String getName() {
        return "Empty Notification";
    }
    @Override
    public String getDescription() {
        return "This email sends when any of the revamped notifications are triggered but do not contain data.";
    }
    @Override
    public String getEmailSubject(Container c) {
        String subject = "Empty Notification";
        if (notificationType != null) {
            subject += ": " + notificationType;
        }
        return subject;
    }
    @Override
    public String getScheduleDescription() {
        return "Triggered when an empty notification is sent.";
    }
    @Override
    public String getCategory() {
        return "Revamped Notifications";
    }



    // Sending Options
    public void sendManually (Container container, User user){
        notificationToolkit.sendNotification(this, user, container, null);
    }



    // Message Creation
    @Override
    public String getMessageBodyHTML(Container c, User u) {
        // Set up.
        StringBuilder messageBody = new StringBuilder();

        // Begins message info.
        messageBody.append("<p>A revamped notification was triggered, but the message body contained no data.</p>");
        if (notificationType != null) {
            messageBody.append("<p>Notification Type: " + notificationType + "</p>");
        }
        else {
            messageBody.append("<p>ERROR: Could not retrieve notification type.</p>");
        }

        // Returns message info.
        this.resetClass();
        return messageBody.toString();
    }

    public void resetClass() {
        this.notificationType = null;
    }
}