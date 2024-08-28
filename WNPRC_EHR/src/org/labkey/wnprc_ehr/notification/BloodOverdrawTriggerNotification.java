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
    String animalID = null;
    String drawDate = null;


    //Constructors
    /**
     * This constructor is used to register the notification in WNPRC_EHRModule.java.
     * @param owner
     */
    public BloodOverdrawTriggerNotification(Module owner) {super(owner);}

    //This constructor is used to actually send the notification via the "TriggerScriptHelper.java" class.
    public BloodOverdrawTriggerNotification(Module owner, String drawAnimalID, String dateOfDraw) {
        super(owner);
        this.animalID = drawAnimalID;
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
        Double overdrawAmount = null;

        // This sets up the values for testing through Notification Manager > Run Report in Browser.
        if (this.animalID == null || this.drawDate == null) {
            this.animalID = "testID";
            this.drawDate = dateToolkit.getDateToday().toInstant().atZone(ZoneId.systemDefault()).toLocalDate().toString();
            overdrawAmount = Double.valueOf(-100);
        }
        else {
            overdrawAmount = notificationToolkit.checkIfBloodDrawIsOverdraw(c, u, this.animalID, this.drawDate);
        }

        // Verifies blood is an overdraw.
        if (overdrawAmount != null) {
            // Begins message info.
            messageBody.append("<p>This email contains warning information for an animal who just had their blood overdrawn.  It was sent on: " + dateToolkit.getCurrentTime() + "</p>");
            messageBody.append("<p>Animal ID: " + this.animalID + "</p>");
            messageBody.append("<p>Date of overdraw: " + this.drawDate + "</p>");
            messageBody.append("<p>Available blood: " + overdrawAmount + "</p>");

            // Returns message info.
            this.resetClass();
            return messageBody.toString();
        }
        // Sends no message if there is no overdraw.
        else {
            this.resetClass();
            return null;
        }

    }

    public void resetClass() {
        this.animalID = null;
        this.drawDate = null;
    }

}
