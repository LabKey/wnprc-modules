package org.labkey.wnprc_ehr.notification;

import org.labkey.api.data.Container;
import org.labkey.api.module.Module;
import org.labkey.api.security.User;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.Locale;

import static org.labkey.api.search.SearchService._log;

public class BloodOverdrawTriggerNotification extends AbstractEHRNotification {
    //Class Variables
    NotificationToolkit notificationToolkit = new NotificationToolkit();
    NotificationToolkit.StyleToolkit styleToolkit = new NotificationToolkit.StyleToolkit();
    NotificationToolkit.DateToolkit dateToolkit = new NotificationToolkit.DateToolkit();
    String animalID;
    String availableBlood;
    String drawDate;


    //Constructors
    /**
     * This constructor is used to register the notification in WNPRC_EHRModule.java.
     * @param owner
     */
    public BloodOverdrawTriggerNotification(Module owner) {super(owner);}

    //This constructor is used to actually send the notification via the "TriggerScriptHelper.java" class.
    public BloodOverdrawTriggerNotification(Module owner, String drawAnimalID, String availBlood, String dateOfDraw) {
        super(owner);
//        this.requestIdToCheck = requestID;
        this.animalID = drawAnimalID;
        this.availableBlood = availBlood;
        this.drawDate = dateOfDraw;
    }



    //Notification Details
    @Override
    public String getName() {
        return "Blood Overdraw Trigger Notification";
    }
    @Override
    public String getDescription() {
        return "This email warns users if an animal had their blood overdrawn.";
    }
    @Override
    public String getEmailSubject(Container c) {
        String subject = "Blood Overdraw Notification";
        if (animalID != null) {
            subject += ": " + animalID;
        }
        return subject;
    }
    @Override
    public String getScheduleDescription() {
        return "Triggered when an animal's blood is overdrawn.";
    }
    @Override
    public String getCategory() {
        return "Revamped Notifications - Blood Draws Update";
    }



    //Sending Options
    public void sendManually (Container container, User user){
        notificationToolkit.sendNotification(this, user, container, null);
    }



    // Message Creation
    @Override
    public String getMessageBodyHTML(Container c, User u) {
        // Set up.
        StringBuilder messageBody = new StringBuilder();

//         TODO: Set this up for testing.
        if (this.animalID == null || this.availableBlood == null || this.drawDate == null) {
            // This sets up the values for testing through Notification Manager > Run Report in Browser.
            this.animalID = "testID";
            this.availableBlood = "testAvailBlood";
            this.drawDate = dateToolkit.getDateToday().toInstant().atZone(ZoneId.systemDefault()).toLocalDate().toString();
        }
        else {
            // Begins message info.
            messageBody.append("<p>This email contains warning information for an animal who just had their blood overdrawn.  It was sent on: " + dateToolkit.getCurrentTime() + "</p>");
            messageBody.append("<p>Animal ID: " + this.animalID + "</p>");
            messageBody.append("<p>Available Blood: " + this.availableBlood + "</p>");
        }

        // Returns message info.
        return messageBody.toString();
    }

}
