package org.labkey.wnprc_ehr.notification;

import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.Sort;
import org.labkey.api.module.Module;
import org.labkey.api.security.User;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

public class AnesthesiaRecoveryOpenRecoveriesNotification extends AbstractEHRNotification {
    // Class Variables
    NotificationToolkit notificationToolkit = new NotificationToolkit();
    NotificationToolkit.DateToolkit dateToolkit = new NotificationToolkit.DateToolkit();
    NotificationToolkit.StyleToolkit styleToolkit = new NotificationToolkit.StyleToolkit();





    // Constructors

    /**
     * This constructor is used to register the notification in WNPRC_EHRModule.java.
     *
     * @param owner
     */
    public AnesthesiaRecoveryOpenRecoveriesNotification(Module owner) { super(owner); }





    // Notification Details
    @Override
    public String getName() { return "Anesthesia Recovery Open Recoveries"; }

    @Override
    public String getDescription() {
        return "This report is designed to identify any recoveries in the Anesthesia Recoveries dataset that have not been closed yet.";
    }
    @Override
    public String getEmailSubject(Container c) {
        return "Anesthesia Recovery Open Recoveries: " + dateToolkit.getCurrentTime();
    }
    @Override
    public String getScheduleDescription() { return "Daily at 1:00PM and 3:00PM"; }
    @Override
    public String getCronString() { return notificationToolkit.createCronString("0", "13,15", "*"); }
    @Override
    public String getCategory() { return "iOS App Notifications"; }





    // Message Creation
    public String getMessageBodyHTML(Container c, User u) {
        // Creates variables & gets data.
        final StringBuilder messageBody = new StringBuilder();
        AnesthesiaRecoveryOpenRecoveriesNotification.AnesthesiaRecoveryReviewNotificationObject myRecoveriesObject = new AnesthesiaRecoveryReviewNotificationObject(c, u);

        // Creates CSS.
        messageBody.append(styleToolkit.beginStyle());
        messageBody.append(styleToolkit.setBasicTableStyle());
        messageBody.append(styleToolkit.setHeaderRowBackgroundColor("#d9d9d9"));
        messageBody.append(styleToolkit.endStyle());

        // Begins message info.
        messageBody.append("<p>This email contains any unclosed recoveries in Anesthesia Recovery dataset.  It was run on: " + dateToolkit.getCurrentTime() + "</p>");

        // Creates table.
        if (!myRecoveriesObject.unclosedRecoveries.isEmpty()) {
            messageBody.append("The following recoveries are still open and have not been closed yet:");
            for (HashMap<String, String> result : myRecoveriesObject.unclosedRecoveries) {
                messageBody.append(result.get("Id") + "<br>");
            }
            messageBody.append(notificationToolkit.createHyperlink("Click here to view all unclosed recoveries</p><hr>", myRecoveriesObject.unclosedRecoveriesURL));
        } else {
            notificationToolkit.sendEmptyNotificationRevamp(c, u, "Anesthesia Recovery Open Recoveries");
        }

        // Returns message.
        return messageBody.toString();
    }



    public static class AnesthesiaRecoveryReviewNotificationObject {
        Container c;
        User u;
        NotificationToolkit notificationToolkit = new NotificationToolkit();
        NotificationToolkit.DateToolkit dateToolkit = new NotificationToolkit.DateToolkit();

        // Constructor function.
        public AnesthesiaRecoveryReviewNotificationObject(Container currentContainer, User currentUser) {
            this.c = currentContainer;
            this.u = currentUser;
            this.getUnclosedAnesthesiaRecoveries();
        }

        // Find all anesthesia recoveries that have been opened, but not closed.
        ArrayList<HashMap<String, String>> unclosedRecoveries;
        String unclosedRecoveriesURL;
        private void getUnclosedAnesthesiaRecoveries() {
            // Creates filter.
            SimpleFilter openedFilter = new SimpleFilter("observation", "Imported", CompareType.EQUAL);
            SimpleFilter closedFilter = new SimpleFilter("observation", "Fully Recovered", CompareType.EQUAL);
            // Creates sort.
            Sort mySort = new Sort("Id");
            // Creates columns to retrieve.
            String[] targetColumns = new String[]{"Id", "recoveryId"};  // TODO: Change this to task after implementing TaskID (only needed if we remove recoveryId).
            // Runs query.
            ArrayList<HashMap<String, String>> openedArray = notificationToolkit.getTableMultiRowMultiColumnWithFieldKeys(c, u, "study", "anesthesiaRecovery", openedFilter, mySort, targetColumns);
            ArrayList<HashMap<String, String>> closedArray = notificationToolkit.getTableMultiRowMultiColumnWithFieldKeys(c, u, "study", "anesthesiaRecovery", closedFilter, mySort, targetColumns);

            // 1. Extract recoveryIds from closedArray into a Set.
            Set<String> closedIds = closedArray.stream()
                    .map(map -> map.get("recoveryId"))
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());
            // 2. Filter openedArray to find items NOT in the closedIds set.
            List<HashMap<String, String>> unclosedArray = openedArray.stream()
                    .filter(map -> !closedIds.contains(map.get("recoveryId")))
                    .toList();
            // 3. Creates a URL consisting of all unclosed ID's.  CompareType.IN requries a semicolon separated string list.
            List<String> unclosedRecoveryIds = unclosedArray.stream()
                    .map(map -> map.get("recoveryId"))
                    .filter(Objects::nonNull)
                    .toList();
            String unclosedRecoverIdsAsString = String.join(";", unclosedRecoveryIds);
            SimpleFilter unclosedFilter = new SimpleFilter("recoveryId", unclosedRecoverIdsAsString, CompareType.IN);
            String viewQueryURL = notificationToolkit.createQueryURL(c, "execute", "study", "anesthesiaRecovery", unclosedFilter);

            // Returns data.
            this.unclosedRecoveries = new ArrayList<>(unclosedArray);
            this.unclosedRecoveriesURL = viewQueryURL;
        }
    }

}
