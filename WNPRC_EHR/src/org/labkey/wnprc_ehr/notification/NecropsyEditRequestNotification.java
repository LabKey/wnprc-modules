package org.labkey.wnprc_ehr.notification;

import org.labkey.api.data.Container;
import org.labkey.api.module.Module;
import org.labkey.api.query.DetailsURL;
import org.labkey.api.security.User;
import org.labkey.api.util.Path;
import org.labkey.api.view.ActionURL;

import java.util.ArrayList;


public class NecropsyEditRequestNotification extends AbstractEHRNotification {
    //Class Variables
    NotificationToolkit notificationToolkit = new NotificationToolkit();
    NotificationToolkit.StyleToolkit styleToolkit = new NotificationToolkit.StyleToolkit();
    NotificationToolkit.DateToolkit dateToolkit = new NotificationToolkit.DateToolkit();
    String message = null;
    String animalId = null;
    String requestId = null;
    String baseUrl = null;
    ArrayList<String> emails = null;


    //Constructors
    /**
     * This constructor is used to register the notification in WNPRC_EHRModule.java.
     * @param owner
     */
    public NecropsyEditRequestNotification(Module owner) {super(owner);}

    //This constructor is used to actually send the notification via the "TriggerScriptHelper.java" class.
    public NecropsyEditRequestNotification(Module owner, String message, String animalId, String requestId, ArrayList<String> emails) {
        super(owner);
        this.message = message;
        this.animalId = animalId;
        this.requestId = requestId;
        this.emails = emails;
    }



    //Notification Details
    @Override
    public String getName() {
        return "Your Necropsy Request Requires Modification";
    }
    @Override
    public String getDescription() {
        return "This email warns sends a notification to the user who requested the necropsy requires modification.";
    }
    @Override
    public String getEmailSubject(Container c) {
        String subject = "Your Necropsy Requires Modification";
        if (this.animalId != null) {
            subject += ": " + animalId;
        }
        return subject;
    }
    @Override
    public String getScheduleDescription() {
        return "Triggered when an animal's necropsy needs modification.";
    }
    @Override
    public String getCategory() {
        return "Revamped Notifications - Necropsy Requirements`";
    }



    //Sending Options
    public void sendManually (Container container, User user){
        notificationToolkit.sendNotification(this, user, container, emails);
    }



    // Message Creation
    @Override
    public String getMessageBodyHTML(Container c, User u) {
        // Set up.
        StringBuilder messageBody = new StringBuilder();
        // Verifies blood is an overdraw.
        if (this.message!= null) {
            // message info.
            messageBody.append("<p>The pathology group is requesting changes for " + this.animalId + "</p>");
            DetailsURL details = DetailsURL.fromString("ehr-dataEntryForm.view?formType=NecropsyRequest&requestid=" + this.requestId, c);
            messageBody.append("<p>The following changes are requested:</p>");
            messageBody.append("<p>" + this.message+ "</p>");
            String editNecropsyRequestUrl = (new Path(new ActionURL().getBaseServerURI(), details.getActionURL().toString())).toString();
            messageBody.append("<p>You can edit the necropsy request " + notificationToolkit.createHyperlink("here", editNecropsyRequestUrl) + ".</p>");

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
        this.animalId = null;
        this.message = null;
    }

}
