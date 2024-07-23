package org.labkey.wnprc_ehr.notification;

import net.sf.cglib.core.Local;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.Sort;
import org.labkey.api.module.Module;
import org.labkey.api.security.User;

import java.lang.reflect.Array;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.Locale;

import static org.labkey.api.search.SearchService._log;

public class BloodDrawReviewTriggerNotification extends AbstractEHRNotification {
    //Class Variables
    NotificationToolkit notificationToolkit = new NotificationToolkit();
    NotificationToolkit.StyleToolkit styleToolkit = new NotificationToolkit.StyleToolkit();
    NotificationToolkit.DateToolkit dateToolkit = new NotificationToolkit.DateToolkit();
    //    String requestIdToCheck;
    String animalIdToCheck;
    String projectToCheck;
    String drawDateToCheck;
//    String requestor;


    //Constructors
    /**
     * This constructor is used to register the notification in WNPRC_EHRModule.java.
     * @param owner
     */
    public BloodDrawReviewTriggerNotification(Module owner) {super(owner);}

    //This constructor is used to actually send the notification via the "TriggerScriptHelper.java" class.
    public BloodDrawReviewTriggerNotification(Module owner, String animalID, String project, String drawDate) {
        super(owner);
//        this.requestIdToCheck = requestID;
        this.animalIdToCheck = animalID;
        this.projectToCheck = project;
        this.drawDateToCheck = drawDate;
//        this.requestor = requestor;
    }



    //Notification Details
    @Override
    public String getName() {
        return "Blood Draw Review Notification (Trigger)";
    }
    @Override
    public String getDescription() {
        return "This email warns users if a blood draw request was made for an animal no longer alive or unassigned to a project.";
    }
    @Override
    public String getEmailSubject(Container c) {
        String subject = "Blood Draw Warning";
        if (animalIdToCheck != null) {
            subject += ": " + animalIdToCheck;
        }
        return subject;
    }
    @Override
    public String getScheduleDescription() {
        return "Triggered when a blood draw request is submitted.";
    }
    @Override
    public String getCategory() {
        return "Revamped Notifications - Blood Draws Update";
    }



    //Sending Options
    public void sendManually (Container container, User user, ArrayList<String> extraRecipients){
        notificationToolkit.sendNotification(this, user, container, extraRecipients);
    }



    // Message Creation
    @Override
    public String getMessageBodyHTML(Container c, User u) {
        // Set up.
        StringBuilder messageBody = new StringBuilder();
        Boolean emptyMessage = true;
        Boolean isTesting = false;
        if (this.animalIdToCheck == null || this.projectToCheck == null || this.drawDateToCheck == null) {
            // This sets up the values for testing through Notification Manager > Run Report in Browser.
            isTesting = true;
            this.animalIdToCheck = "rh2514";
            this.projectToCheck = "20140704";
            this.drawDateToCheck = dateToolkit.getDateToday().toInstant().atZone(ZoneId.systemDefault()).toLocalDate().toString();
        }

        // Begins message info.
        messageBody.append("<p>This email contains warning information for a recently submitted blood draw request with a requested draw date of today.  It was sent on: " + dateToolkit.getCurrentTime() + "</p>");
        messageBody.append("<p>Animal ID: " + this.animalIdToCheck + "</p>");
        messageBody.append("<p>Project: " + this.projectToCheck + "</p>");

        // Verifies animal is alive.
        if (!notificationToolkit.checkIfAnimalIsAlive(c, u, animalIdToCheck)) {
            emptyMessage = false;
            messageBody.append("<p><b>WARNING:</b> This animal is no longer alive.</p>");
        }

        // Verifies animal is assigned to a project.
        if (!notificationToolkit.checkProjectAssignmentStatusOnDate(c, u,animalIdToCheck, Integer.valueOf(projectToCheck), drawDateToCheck) || isTesting) {
            emptyMessage = false;
            messageBody.append("<p><b>WARNING:</b> This animal is not assigned to a project on the date of the requested blood draw.</p>");
        }

        // Verifies there is a warning before sending.
        if (emptyMessage.equals(false)) {
            try {
                // Verifies this blood draw is for today before sending.
                DateFormat format = new SimpleDateFormat("yyyy-M-d", Locale.ENGLISH);
                Date formattedDrawDate = format.parse(drawDateToCheck);
                LocalDate drawDateWithoutTime = formattedDrawDate.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
                LocalDate todaysDateWithoutTime = dateToolkit.getDateToday().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
                if (drawDateWithoutTime.equals(todaysDateWithoutTime)) {
                    return messageBody.toString();
                }
                else {
                    return null;
                }
            }
            catch(Exception e) {
                _log.error("Error executing BloodDrawReviewTriggerNotification->getMessageBodyHTML().  Could not format date of blood draw into Date().", e);
                return null;
            }
        }
        else {
            return null;
        }
    }

}
