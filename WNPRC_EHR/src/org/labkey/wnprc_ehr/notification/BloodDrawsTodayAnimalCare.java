package org.labkey.wnprc_ehr.notification;

import org.labkey.api.data.Container;
import org.labkey.api.module.Module;
import org.labkey.api.security.User;

public class BloodDrawsTodayAnimalCare extends AbstractEHRNotification {
    //Class Variables
    NotificationToolkit notificationToolkit = new NotificationToolkit();
    NotificationToolkit.StyleToolkit styleToolkit = new NotificationToolkit.StyleToolkit();
    NotificationToolkit.DateToolkit dateToolkit = new NotificationToolkit.DateToolkit();



    //Constructors
    /**
     * This constructor is used to register the notification in WNPRC_EHRModule.java.
     * @param owner
     */
    public BloodDrawsTodayAnimalCare(Module owner) {super(owner);}



    //Notification Details
    @Override
    public String getName() {
        return "Blood Draws Today (Animal Care)";
    }
    @Override
    public String getDescription() {
        return "TODO (Blood Draw Alert A - Animal Care)";
    }
    @Override
    public String getEmailSubject(Container c) {
        return "TODO (Blood Draw Alert A - Animal Care)";
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
        BloodDrawsTodayAll.BloodDrawsTodayObject myBloodDrawNotificationObject = new BloodDrawsTodayAll.BloodDrawsTodayObject(c, u, "animalCare");

        // Begins message body.
        final StringBuilder messageBody = new StringBuilder();

        // Creates CSS.
        messageBody.append(styleToolkit.beginStyle());
        messageBody.append(styleToolkit.setBasicTableStyle());
        messageBody.append(styleToolkit.setHeaderRowBackgroundColor("#d9d9d9"));
        messageBody.append(styleToolkit.endStyle());

        //Begins message info.
        messageBody.append("<p>This email contains all scheduled blood draws for today (for Animal Care only).  It was run on: " + dateToolkit.getCurrentTime() + "</p>");

        // Creates table.
        String[] myTableColumns = new String[]{"Id", "Blood Remaining", "Project Assignment", "Completion Status", "Group", "Other Groups Drawing Blood Today"};
        NotificationToolkit.NotificationRevampTable myTable = new NotificationToolkit.NotificationRevampTable(myTableColumns, myBloodDrawNotificationObject.myTableData);
        myTable.rowColors = myBloodDrawNotificationObject.myTableRowColors;
        messageBody.append(myTable.createBasicHTMLTable());

        return messageBody.toString();
    }
}
