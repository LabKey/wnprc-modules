package org.labkey.wnprc_ehr.notification;

import org.apache.commons.lang3.StringUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.json.JSONObject;
import org.labkey.api.data.Container;
import org.labkey.api.ldk.notification.Notification;
import org.labkey.api.ldk.notification.NotificationService;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.security.User;
import org.labkey.api.study.StudyService;
import org.labkey.api.util.MailHelper;
import org.labkey.wnprc_ehr.WNPRC_EHREmail;
import org.labkey.wnprc_ehr.WNPRC_EHRModule;

import javax.mail.Message;
import java.util.List;

/**
 * Created by jon on 7/13/16.
 */
abstract public class AbstractJspEmailNotification implements Notification {
    protected static final Logger log = LogManager.getLogger(AbstractJspEmailNotification.class);
    protected final JSONObject params = new JSONObject();

    @Override
    public String getCategory() {
        return ModuleLoader.getInstance().getModule(WNPRC_EHRModule.class).getName();
    }

    @Override
    public String getCronString() {
        return null;
    }

    @Override
    public String getMessageBodyHTML(Container c, User u) {
        WNPRC_EHREmail email = new WNPRC_EHREmail(getPathToJsp());

        String emailContents;
        try {
            emailContents = email.renderEmail(params);
        }
        catch (Exception e) {
            log.error("Failed to generate email contents for " + getPathToJsp() + " with params: " + params.toString(), e);
            emailContents = "An error occurred while generating the email contents.";
        }

        return emailContents;
    }

    @Override
    public boolean isAvailable(Container c) {
        if (!c.getActiveModules().contains(ModuleLoader.getInstance().getModule(WNPRC_EHRModule.class))) {
            return false;
        }

        return StudyService.get().getStudy(c) != null;
    }

    abstract String getPathToJsp();

    public void sendManually(Container container, User user, List<String> notificationEmails) {
        // Check to make sure the service is enabled before sending
        if (!NotificationService.get().isServiceEnabled()) {
            log.info("The notification service is not enabled, so notification (" + getPathToJsp() + ") will not be sent manually.");
            return;
        }

        // Grab the emails to send the email to, and make sure we have more than one recipient.
        List<String> emails = notificationEmails;
        if (emails.size() == 0) {
            log.warn("Not sending notification as there are no configured recipients");
            return;
        }

        try {
            MailHelper.MultipartMessage msg = MailHelper.createMultipartMessage();

            // Set from and to
            msg.setFrom(NotificationService.get().getReturnEmail(container));
            msg.setRecipients(Message.RecipientType.TO, StringUtils.join(emails, ","));

            // Set subject and body
            msg.setSubject(getEmailSubject(container));
            msg.setEncodedHtmlContent(getMessageBodyHTML(container, user));

            MailHelper.send(msg, user, container);
        }
        catch (Exception e) {
            log.error("Failed to send notification manually", e);
        }
    }

    public String getParam(String key) {
        return params.getString(key);
    }

    public void setParam(String key, String val) {
        params.put(key, val);
    }
}
