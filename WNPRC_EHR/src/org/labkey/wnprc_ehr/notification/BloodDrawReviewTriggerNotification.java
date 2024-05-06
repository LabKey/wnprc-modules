package org.labkey.wnprc_ehr.notification;

import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.Sort;
import org.labkey.api.module.Module;
import org.labkey.api.security.User;

import java.lang.reflect.Array;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;

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
//        if (this.requestor != null) {
//            notificationToolkit.getEmailFromUsername(container, user, this.requestor);  // TODO: Finish this function in notificationToolkit.
//            notificationToolkit.sendNotification(this, user, container, this.requestor);    // TODO: Update this function in notificationToolkit to handle extra users.
//        }
//        else {
            notificationToolkit.sendNotification(this, user, container, extraRecipients);
//        }
    }



    // Message Creation
    @Override
    public String getMessageBodyHTML(Container c, User u) {
        // Set up.
        StringBuilder messageBody = new StringBuilder();
        if (this.animalIdToCheck == null || this.projectToCheck == null || this.drawDateToCheck == null) {
            // This sets up the values for testing through Notification Manager > Run Report in Browser.
            this.animalIdToCheck = "rh2514";
            this.projectToCheck = "20140704";
            this.drawDateToCheck = "2022-01-01 01:01:01.0";
//            this.requestor = null;
        }

        // Begins message info.
        messageBody.append("<p>This email contains warning information for a recently submitted blood draw request.  It was run on: " + dateToolkit.getCurrentTime() + "</p>");
        messageBody.append("<p>Animal ID: " + this.animalIdToCheck + "</p>");
        messageBody.append("<p>Project: " + this.projectToCheck + "</p>");

        // Verifies animal is alive.
        if (!notificationToolkit.checkIfAnimalIsAlive(c, u, animalIdToCheck)) {
            messageBody.append("<p><b>WARNING:</b> This animal is no longer alive.</p>");
        }

        //Verifies animal is assigned to a project.
        if (!notificationToolkit.checkProjectAssignmentStatusOnDate(c, u,animalIdToCheck, Integer.valueOf(projectToCheck), drawDateToCheck)) {
            messageBody.append("<p><b>WARNING:</b> This animal is not assigned to a project on the date of the requested blood draw.</p>");
        }

        return messageBody.toString();
    }

}
