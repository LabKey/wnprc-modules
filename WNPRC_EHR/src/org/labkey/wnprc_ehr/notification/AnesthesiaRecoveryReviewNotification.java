package org.labkey.wnprc_ehr.notification;

import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.Sort;
import org.labkey.api.module.Module;
import org.labkey.api.security.User;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

public class AnesthesiaRecoveryReviewNotification extends AbstractEHRNotification {
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
    public AnesthesiaRecoveryReviewNotification(Module owner) { super(owner); }





    // Notification Details
    @Override
    public String getName() { return "Anesthesia Recovery Review"; }

    @Override
    public String getDescription() {
        return "This report is designed to identify any rows in the Anesthesia Recoveries dataset that have been marked as 'Review Required'.";
    }
    @Override
    public String getEmailSubject(Container c) {
        return "Anesthesia Recovery Review: " + dateToolkit.getCurrentTime();
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
        AnesthesiaRecoveryReviewReviewRequiredObject myRequiredReviewsObject = new AnesthesiaRecoveryReviewReviewRequiredObject(c, u);

        // Creates CSS.
        messageBody.append(styleToolkit.beginStyle());
        messageBody.append(styleToolkit.setBasicTableStyle());
        messageBody.append(styleToolkit.setHeaderRowBackgroundColor("#d9d9d9"));
        messageBody.append(styleToolkit.endStyle());

        // Begins message info.
        messageBody.append("<p>This email contains any rows marked as 'Review Required' in the Anesthesia Recovery dataset.  It was run on: " + dateToolkit.getCurrentTime() + "</p>");

        // Creates table.
        if (!myRequiredReviewsObject.reviewRequiredRecoveries.isEmpty()) {
            messageBody.append("The following recoveries have been flagged as 'Review Required':");
            for (HashMap<String, String> result : myRequiredReviewsObject.reviewRequiredRecoveries)
            {
                messageBody.append(result.get("Id") + "<br>");
            }
            messageBody.append(notificationToolkit.createHyperlink("Click here to view all 'Review Required' recoveries</p><hr>", myRequiredReviewsObject.reviewRequiredRecoveriesURL));
        } else {
            notificationToolkit.sendEmptyNotificationRevamp(c, u, "Anesthesia Recovery Review");
        }

        // Returns message.
        return messageBody.toString();
    }

    public static class AnesthesiaRecoveryReviewReviewRequiredObject {
        Container c;
        User u;
        NotificationToolkit notificationToolkit = new NotificationToolkit();
        NotificationToolkit.DateToolkit dateToolkit = new NotificationToolkit.DateToolkit();

        // Constructor function.
        public AnesthesiaRecoveryReviewReviewRequiredObject(Container currentContainer, User currentUser) {
            this.c = currentContainer;
            this.u = currentUser;
            this.getRecoveriesWithReviewRequired();
        }

        // Find all anesthesia recoveries marked as 'review required'.
        ArrayList<HashMap<String, String>> reviewRequiredRecoveries;
        String reviewRequiredRecoveriesURL;
        private void getRecoveriesWithReviewRequired() {
            // Creates filter.
            SimpleFilter reviewRequiredFilter = new SimpleFilter("qcstate/label", "Review Required", CompareType.EQUAL);
            // Creates sort.
            Sort mySort = new Sort("Id");
            // Creates columns to retrieve.
            String[] targetColumns = new String[]{"Id", "recoveryId"};
            // Runs query.
            ArrayList<HashMap<String, String>> allRows = notificationToolkit.getTableMultiRowMultiColumnWithFieldKeys(c, u, "study", "anesthesiaRecovery", reviewRequiredFilter, mySort, targetColumns);

            // 1. Keeps only the first row per recoveryId.
            Set<String> seen = new LinkedHashSet<>();
            List<HashMap<String, String>> openedArray = allRows.stream()
                    .filter(map -> map.get("recoveryId") != null)
                    .filter(map -> seen.add(map.get("recoveryId")))
                    .toList();

            // 2. Creates a URL consisting of all review required ID's.  CompareType.IN requries a semicolon separated string list.
            String reviewRequiredIdsAsString = String.join(";", seen);
            SimpleFilter unclosedFilter = new SimpleFilter("recoveryId", reviewRequiredIdsAsString, CompareType.IN);
            String viewQueryURL = notificationToolkit.createQueryURL(c, "execute", "study", "anesthesiaRecovery", unclosedFilter);

            // Returns data.
            this.reviewRequiredRecoveries = new ArrayList<>(openedArray);
            this.reviewRequiredRecoveriesURL = viewQueryURL;
        }
    }
}
