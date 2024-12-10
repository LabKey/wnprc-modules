package org.labkey.wnprc_ehr.notification;

import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.ldk.notification.NotificationService;
import org.labkey.api.module.Module;
import org.labkey.api.security.User;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;

public class LargeInfantAlertsRevamp extends AbstractEHRNotification {
    // Class Variables
    NotificationToolkit notificationToolkit = new NotificationToolkit();
    NotificationToolkit.DateToolkit dateToolkit = new NotificationToolkit.DateToolkit();





    // Constructors
    /**
     * This constructor is used to register the notification in WNPRC_EHRModule.java.
     * @param owner
     */
    public LargeInfantAlertsRevamp(Module owner) {super(owner);}





    // Notification Details
    @Override
    public String getName() {
        return "Large Infant Alerts Revamp";
    }
    @Override
    public String getDescription() {
        return "This email lists orphans assigned to cages that do not meet minimum size requirements as of: " + dateToolkit.getCurrentTime();
    }
    @Override
    public String getEmailSubject(Container c) {
        return "Orphans Not in Compliant Cage Alert on " + dateToolkit.getCurrentTime();
    }
    @Override
    public String getScheduleDescription() {
        return "Daily at 6:12am";
    }
    @Override
    public String getCronString() {
        return notificationToolkit.createCronString("12", "6", "*");
    }
    @Override
    public String getCategory() {
        return "Revamped Notifications";
    }





    // Message Creation
    @Override
    public String getMessageBodyHTML(Container c, User u) {
        // Creates variables.
        final StringBuilder messageBody = new StringBuilder();

        // Retrieves data.
        String[] targetColumns = new String[]{"id"};
        ArrayList<HashMap<String, String>> returnArray = notificationToolkit.getTableMultiRowMultiColumnWithFieldKeys(c, u, "study", "InfantsWithExcessWeight", null, null, targetColumns);

        if (!returnArray.isEmpty()) {
            // Begins message info.
            messageBody.append("This email lists orphans assigned to cages that do not meet minimum size requirements as of: " + dateToolkit.getDateToday());

            // Prints number of results.
            if (returnArray.size() > 1) {
                messageBody.append("<b>WARNING: There are " + returnArray.size() + " orphans under the age of 6 months residing in cages that do not accommodate the animal's size. </b><br>");
            }
            else {
                messageBody.append("<b>WARNING: There is " + returnArray.size() + " orphan under the age of 6 months residing in a cage that does not accommodate the animal's size. </b><br>");
            }

            // Prints results.
            messageBody.append("<br><br>");
            messageBody.append("<u>Animal</u><br>");
            for (HashMap<String, String> result : returnArray) {
                if (!result.get("id").isEmpty()) {
                    messageBody.append(result.get("id"));
                    messageBody.append("<br>");
                }
            }
            messageBody.append("<br><br>");

            // Prints URL.
            String queryURL = notificationToolkit.createQueryURL(c, "execute", "study", "InfantsWithExcessWeight", null);
            messageBody.append(notificationToolkit.createHyperlink("<p>Click here to view them</p>", queryURL));
            messageBody.append("<hr>");

            // Returns message.
            return messageBody.toString();
        }
        else {
            notificationToolkit.sendEmptyNotificationRevamp(c, u, "Large Infant Alerts Revamp");
            return null;
        }
    }
}
