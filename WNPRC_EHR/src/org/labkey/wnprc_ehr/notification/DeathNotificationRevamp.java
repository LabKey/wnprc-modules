package org.labkey.wnprc_ehr.notification;

import org.labkey.api.data.Container;
import org.labkey.api.module.Module;
import org.labkey.api.security.User;

import java.util.ArrayList;

/**
 * Created by Alex Schmidt on
 */
//public class DeathNotification extends AbstractJspEmailNotification {
public class DeathNotificationRevamp extends AbstractEHRNotification {
    //Class Variables
    NotificationToolkit notificationToolkit = new NotificationToolkit();
    NotificationToolkit.StyleToolkit styleToolkit = new NotificationToolkit.StyleToolkit();
    public String deathID;
    public User currentUser;
    public String hostName;


    //Constructors
    /**
     * This constructor is used to register the notification in WNPRC_EHRModule.java.
     * It is also used to create an empty notification to check if notification is enabled in WNPRC_EHRModule.java.
     * @param owner
     */
    public DeathNotificationRevamp(Module owner) {super(owner);}
    /**
     * This constructor is used to actually send the notification via the "TriggerScriptHelper.java" class.
     * @param owner
     * @param deathid
     * @param currentuser
     * @param hostname
     */
    public DeathNotificationRevamp(Module owner, String deathid, User currentuser, String hostname) {
        super(owner);
        deathID = deathid;
        currentUser = currentuser;
        hostName = hostname;
    }



    //Notification Details
    @Override
    public String getName() {
        return "WNPRC Death Notification Revamp";
    }
    @Override
    public String getDescription() {
        return "The report sends an alert whenever an animal is marked as dead.";
    }
    @Override
    public String getEmailSubject(Container c) {
        String subject = "";
        if (deathID != null) {
            //Checks to see if death is prenatal or not.
            if (notificationToolkit.checkIfPrenatalID(deathID)) {
                subject = "Prenatal Death Notification";
            }
            else {
                subject = "Death Notification";
            }
            //Adds ID.
            if (!deathID.isEmpty()) {
                subject += ": " + deathID;
            }
        }
        return subject;
    }
    @Override
    public String getScheduleDescription() {
        return "Sent immediately when an animal is marked as dead";
    }
    @Override
    public String getCronString() {
        return null;
    }
    @Override
    public String getCategory() {
        return "Revamped Notifications";
    }



    //Sending Options
    public void sendManually (Container container, User user){
        notificationToolkit.sendNotification(this, user, container);
    }



    //Message Creation
    @Override
    public String getMessageBodyHTML(Container c, User u) {
        //Creates variables & gets data.
        final StringBuilder messageBody = new StringBuilder();
        if (deathID == null) {
            //If no ID exists (testing purposes), this gets the most recent necropsy animal id.
            ArrayList<String[]> necropsiesInOrder = notificationToolkit.getTableAsList(c, u, "necropsy", "mostRecentNecropsy");
            deathID = necropsiesInOrder.get(0)[0].toString();
        }
        NotificationToolkit.DeathDemographicObject deathDemographicObject = new NotificationToolkit.DeathDemographicObject(c, u, deathID, true);
        NotificationToolkit.DeathNecropsyObject deathNecropsyObject = new NotificationToolkit.DeathNecropsyObject(c, u, deathID, hostName, true);

        //Creates CSS.
        messageBody.append(styleToolkit.beginStyle());
        messageBody.append(styleToolkit.setBasicTableStyle());
        messageBody.append(styleToolkit.endStyle());

        //Begins message info.
        messageBody.append("<p>" + deathID + " has been marked as dead. More details can be found below.</p>");

        //Adds the demographic information.
        messageBody.append(notificationToolkit.createHTMLHeader("Demographic Information"));
        messageBody.append("<p><b>Animal ID:</b> " + deathDemographicObject.animalIdHyperlink + "</p>");
        messageBody.append("<p><b>Sex:</b> " + deathDemographicObject.animalSex + "</p>");
        //Adds prenatal demographic information.
        if (notificationToolkit.checkIfPrenatalID(deathID)) {
            messageBody.append("<p><b>Dam:</b> " + deathDemographicObject.animalDam + "</p>");
            messageBody.append("<p><b>Sire:</b> " + deathDemographicObject.animalSire + "</p>");
            messageBody.append("<p><b>Conception:</b> " + deathDemographicObject.animalConception + "</p>");
        }

        //Displays the necropsy data (if it exists).
        messageBody.append(notificationToolkit.createHTMLHeader("Necropsy Information"));
        if (!deathNecropsyObject.necropsyExists) {
            messageBody.append("<p>No necropsy exists for the current animal id.</p>");
        }
        else {
            //Adds necropsy data to message.
            messageBody.append("<p><b>Necropsy Case Number:</b> " + deathNecropsyObject.necropsyCaseNumber + "</p>");
            messageBody.append("<p><b>Task ID:</b> " + deathNecropsyObject. necropsyTaskIdHyperlink + "</p>");
            messageBody.append("<p><b>Date of Necropsy:</b> " + deathNecropsyObject.necropsyDate + "</p>");
            messageBody.append("<p><b>Weight:</b> " + deathNecropsyObject.animalWeight + "</p>");
            messageBody.append("<p><b>Time of Death:</b> " + deathNecropsyObject.necropsyTimeOfDeath + "</p>");
            messageBody.append("<p><b>Type of Death:</b> " + deathNecropsyObject.necropsyTypeOfDeath + "</p>");
            messageBody.append("<p><b>Grant #:</b> " + deathNecropsyObject.necropsyGrantNumber + "</p>");
            messageBody.append("<p><b>Animal Replacement Fee:</b> " + deathNecropsyObject.animalReplacementFee + "</p>");
            messageBody.append("<p><b>Manner of Death:</b> " + deathNecropsyObject.necropsyMannerOfDeath + "</p>");
        }

        //Returns string.
        return messageBody.toString();
    }
}