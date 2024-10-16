package org.labkey.wnprc_ehr.notification;

import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.Sort;
import org.labkey.api.module.Module;
import org.labkey.api.security.User;
import org.labkey.api.util.Path;
import org.labkey.api.view.ActionURL;

import java.util.ArrayList;
import java.util.HashMap;

/**
 * Created by Alex Schmidt on
 */
//public class DeathNotification extends AbstractJspEmailNotification {
public class DeathNotificationRevamp extends AbstractEHRNotification {
    //Class Variables
    NotificationToolkit notificationToolkit = new NotificationToolkit();
    NotificationToolkit.StyleToolkit styleToolkit = new NotificationToolkit.StyleToolkit();
    String deathID = null;
    User currentUser = null;
    String hostName = null;


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
        this.deathID = deathid;
        this.currentUser = currentuser;
        this.hostName = hostname;
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
                subject = "New Prenatal Death Notification";
            }
            else {
                subject = "New Death Notification";
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
        notificationToolkit.sendNotification(this, user, container, null);
    }



    //Message Creation
    @Override
    public String getMessageBodyHTML(Container c, User u) {
        //Creates variables & gets data.
        final StringBuilder messageBody = new StringBuilder();
        if (deathID == null) {
            //If no ID exists (testing purposes), this gets the most recent necropsy animal id.
            Sort mySort = new Sort("-date");
            String[] targetColumns = new String[]{"id"};
            ArrayList<HashMap<String, String>> necropsyList = notificationToolkit.getTableMultiRowMultiColumnWithFieldKeys(c, u, "study", "necropsy", null, mySort, targetColumns);
            deathID = necropsyList.get(0).get("id");
        }
        DeathDemographicObject deathDemographicObject = new DeathDemographicObject(c, u, deathID, true);
//        DeathNecropsyObject deathNecropsyObject = new DeathNecropsyObject(c, u, deathID, hostName, true);
        DeathNecropsyObject deathNecropsyObject = new DeathNecropsyObject(c, u, deathID, true);

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

        // Resets data.  This is necessary to get 'this.deathID' to reset everytime it's run in the browser.
        this.deathID = null;

        //Returns string.
        return messageBody.toString();
    }





    /**
     * This is an object used in the WNPRC DeathNotification.java file that defines all the info presented for a dead animal's necropsy.
     * It contains the following data (returning blank strings for non-existent data):
     *  If necropsy exists (true/false).
     *  Necropsy case number.
     *  Necropsy task id hyperlink.
     *  Necropsy date.
     *  Necropsy time of death.
     *  Necropsy type of death.
     *  Necropsy grant number.
     *  Necropsy manner of death.
     *  Necropsy animal weight.
     *  Necropsy animal replacement fee.
     */
    public static class DeathNecropsyObject {
        Boolean necropsyExists = false;
        String necropsyCaseNumber = "";
        String necropsyTaskIdHyperlink = "";
        String necropsyDate = "";
        String necropsyTimeOfDeath = "";
        String necropsyTypeOfDeath = "";
        String necropsyGrantNumber = "";
        String necropsyMannerOfDeath = "";
        String animalWeight = "";
        String animalReplacementFee = "";

        public DeathNecropsyObject(Container c, User u, String animalID, Boolean withHtmlPlaceHolders) {
            NotificationToolkit notificationToolkit = new NotificationToolkit();

            // Creates filter.
            SimpleFilter myFilter = new SimpleFilter("id", animalID, CompareType.EQUAL);
            String[] targetColumns = new String[]{"caseno", "taskid", "date", "timeofdeath", "causeofdeath", "account", "mannerofdeath"};
            // Runs query.
            ArrayList<HashMap<String, String>> animalNecropsy = notificationToolkit.getTableMultiRowMultiColumnWithFieldKeys(c, u, "study", "necropsy", myFilter, null, targetColumns);

            // Assigns values to object variables.
            if (!animalNecropsy.isEmpty()) {
                this.necropsyExists = true;
                //Gets necropsy data.
                this.necropsyCaseNumber = animalNecropsy.get(0).get("caseno");
                this.necropsyDate = animalNecropsy.get(0).get("date");
                this.necropsyTimeOfDeath = animalNecropsy.get(0).get("timeofdeath");
                this.necropsyTypeOfDeath = animalNecropsy.get(0).get("causeofdeath");
                this.necropsyGrantNumber = animalNecropsy.get(0).get("account");
                this.necropsyMannerOfDeath = animalNecropsy.get(0).get("mannerofdeath");
                this.animalWeight = notificationToolkit.getWeightFromAnimalID(c, u, animalID);
                this.animalReplacementFee = notificationToolkit.getAnimalReplacementFee(c, u, this.necropsyTypeOfDeath, animalID);

                //Creates task id with hyperlink.
                String necropsyTaskID = animalNecropsy.get(0).get("taskid");
                String taskUrlAsString = notificationToolkit.createFormURL(c, "necropsy", necropsyTaskID);

                // Creates filter.
                SimpleFilter myTaskFilter = new SimpleFilter("taskid", necropsyTaskID, CompareType.EQUAL);
                String[] targetTaskColumns = new String[]{"rowid"};
                // Runs query.
                ArrayList<HashMap<String, String>> necropsyTask = notificationToolkit.getTableMultiRowMultiColumnWithFieldKeys(c, u, "ehr", "tasks", myTaskFilter, null, targetTaskColumns);
                if (!necropsyTask.isEmpty()) {
                    String taskRowID = necropsyTask.get(0).get("rowid");
                    this.necropsyTaskIdHyperlink = notificationToolkit.createHyperlink(taskRowID, taskUrlAsString);
                }
            }

            // Assigns 'Not Specified' placeholders for blank values.
            if (withHtmlPlaceHolders) {
                String placeholderText = "<em>Not Specified</em>";
                if (this.necropsyCaseNumber.isEmpty()) {
                    this.necropsyCaseNumber = placeholderText;
                }
                if (this.necropsyTaskIdHyperlink.isEmpty()) {
                    this.necropsyTaskIdHyperlink = placeholderText;
                }
                if (this.necropsyDate.isEmpty()) {
                    this.necropsyDate = placeholderText;
                }
                if (this.necropsyTimeOfDeath.isEmpty()) {
                    this.necropsyTimeOfDeath = placeholderText;
                }
                if (this.necropsyTypeOfDeath.isEmpty()) {
                    this.necropsyTypeOfDeath = placeholderText;
                }
                if (this.necropsyGrantNumber.isEmpty()) {
                    this.necropsyGrantNumber = placeholderText;
                }
                if (this.necropsyMannerOfDeath.isEmpty()) {
                    this.necropsyMannerOfDeath = placeholderText;
                }
                if (this.animalWeight.isEmpty()) {
                    this.animalWeight = placeholderText;
                }
                if (this.animalReplacementFee.isEmpty()) {
                    this.animalReplacementFee = placeholderText;
                }
            }
        }
    }

    /**
     * This is an object used in the WNPRC DeathNotification.java file that defines all the info presented for a dead animal's demographics.
     * It contains the following data (returning blank strings for non-existent data):
     *  Animal ID hyperlink.
     *  Animal sex.
     */
    public static class DeathDemographicObject {
        String animalIdHyperlink = "";
        String animalSex = "";
        String animalDam = "";
        String animalSire = "";
        String animalConception = "";
        public DeathDemographicObject(Container c, User u, String animalID, Boolean withHtmlPlaceHolders) {
            NotificationToolkit notificationToolkit = new NotificationToolkit();

            //Gets hyperlink for animal id in animal history abstract.
            String animalAbstractUrlAsString = notificationToolkit.createAnimalHistoryURL(c, animalID);
            this.animalIdHyperlink = notificationToolkit.createHyperlink(animalID, animalAbstractUrlAsString);

            //Gets animal sex.
            String animalSex = notificationToolkit.getSexFromAnimalID(c, u, animalID);
            this.animalSex = animalSex;

            //Gets prenatal information if necessary.
            if (notificationToolkit.checkIfPrenatalID(animalID)) {
                // Creates filter.
                SimpleFilter myFilter = new SimpleFilter("id", animalID, CompareType.EQUAL);
                String[] targetColumns = new String[]{"dam", "sire", "conception"};
                // Runs query.
                ArrayList<HashMap<String, String>> prenatalDeathRow = notificationToolkit.getTableMultiRowMultiColumnWithFieldKeys(c, u, "study", "prenatal", myFilter, null, targetColumns);

                // Checks return data.
                if (!prenatalDeathRow.isEmpty()) {
                    this.animalDam = prenatalDeathRow.get(0).get("dam");
                    this.animalSire = prenatalDeathRow.get(0).get("sire");
                    this.animalConception = prenatalDeathRow.get(0).get("conception");
                }
            }

            //Adds HTML placeholders for empty fields.
            if (withHtmlPlaceHolders) {
                String placeholderText = "<em>Not Specified</em>";
                if (this.animalIdHyperlink.isEmpty()) {
                    this.animalIdHyperlink = placeholderText;
                }
                if (this.animalSex.isEmpty()) {
                    this.animalSex = placeholderText;
                }
                if (this.animalDam.isEmpty()) {
                    this.animalDam = placeholderText;
                }
                if (this.animalSire.isEmpty()) {
                    this.animalSire = placeholderText;
                }
                if (this.animalConception.isEmpty()) {
                    this.animalConception = placeholderText;
                }
            }
        }
    }
}