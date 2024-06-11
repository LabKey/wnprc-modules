package org.labkey.wnprc_ehr.notification;

import org.labkey.api.data.Container;
import org.labkey.api.module.Module;
import org.labkey.api.security.User;

public class BloodDrawsTodayVetStaff extends AbstractEHRNotification {
    //Class Variables
    NotificationToolkit notificationToolkit = new NotificationToolkit();
    NotificationToolkit.StyleToolkit styleToolkit = new NotificationToolkit.StyleToolkit();
    NotificationToolkit.DateToolkit dateToolkit = new NotificationToolkit.DateToolkit();



    //Constructors
    /**
     * This constructor is used to register the notification in WNPRC_EHRModule.java.
     * @param owner
     */
    public BloodDrawsTodayVetStaff(Module owner) {super(owner);}



    //Notification Details
    @Override
    public String getName() {
        return "Blood Draws Today (Vet Staff)";
    }
    @Override
    public String getDescription() {
        return "The report is designed to identify potential problems related to all blood draws (today) assigned to Vet Staff.";
    }
    @Override
    public String getEmailSubject(Container c) {
        return "Blood Draws Today (Vet Staff): " + dateToolkit.getCurrentTime();
    }
    @Override
    public String getScheduleDescription() {
        return "Daily at 6:00AM, 1:00PM, and 3:00PM";
    }
    @Override
    public String getCronString() {
        return notificationToolkit.createCronString("0", "6,13,15", "*");
    }
    @Override
    public String getCategory() {
        return "Revamped Notifications - Blood Draws Update";
    }



    //Message Creation
    @Override
    public String getMessageBodyHTML(Container c, User u) {
        // Gets BloodDrawNotificationObject.
        BloodDrawsTodayAll.BloodDrawsTodayObject myBloodDrawNotificationObject = new BloodDrawsTodayAll.BloodDrawsTodayObject(c, u, "vetStaff");

        // Begins message body.
        final StringBuilder messageBody = new StringBuilder();

        // Creates CSS.
        messageBody.append(styleToolkit.beginStyle());
        messageBody.append(styleToolkit.setBasicTableStyle());
        messageBody.append(styleToolkit.setHeaderRowBackgroundColor("#d9d9d9"));
        messageBody.append(styleToolkit.endStyle());

        // Begins message info.
        messageBody.append("<p>This email contains all scheduled blood draws for today (for Vet Staff only).  It was run on: " + dateToolkit.getCurrentTime() + "</p>");

        // Creates table.
        messageBody.append(myBloodDrawNotificationObject.printTablesAsHTML());

//        String[] myTableColumns = new String[]{"Id", "Blood Remaining", "Project Assignment", "Completion Status", "Group", "Other Groups Drawing Blood Today"};
//        NotificationToolkit.NotificationRevampTable myTable = new NotificationToolkit.NotificationRevampTable(myTableColumns, myBloodDrawNotificationObject.myTableData);
//        myTable.rowColors = myBloodDrawNotificationObject.myTableRowColors;
//        messageBody.append(myTable.createBasicHTMLTable());

        return messageBody.toString();
    }
}
