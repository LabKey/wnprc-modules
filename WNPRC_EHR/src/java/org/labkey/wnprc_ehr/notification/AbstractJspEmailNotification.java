package org.labkey.wnprc_ehr.notification;

import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.Logger;
import org.json.JSONObject;
import org.labkey.api.data.Container;
import org.labkey.api.ldk.notification.Notification;
import org.labkey.api.ldk.notification.NotificationService;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.security.User;
import org.labkey.api.security.UserPrincipal;
import org.labkey.api.security.ValidEmail;
import org.labkey.api.study.StudyService;
import org.labkey.api.util.MailHelper;
import org.labkey.wnprc_ehr.WNPRC_EHRModule;
import org.labkey.wnprc_ehr.email.JspEmail;

import javax.mail.Address;
import javax.mail.Message;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

/**
 * Created by jon on 7/13/16.
 */
abstract public class AbstractJspEmailNotification implements Notification {
    protected static final Logger log = Logger.getLogger(AbstractJspEmailNotification.class);
    protected final JSONObject params = new JSONObject();

    @Override
    public String getCategory() {
        return ModuleLoader.getInstance().getModule(WNPRC_EHRModule.class).getName();
    }

    @Override
    public String getCronString() {
        return null;
    }

    public String getMessageBodyHTML(Container c, User u) {
        JspEmail email = new JspEmail(getPathToJsp());

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

    public boolean isAvailable(Container c) {
        if (!c.getActiveModules().contains(ModuleLoader.getInstance().getModule(WNPRC_EHRModule.class))) {
            return false;
        }

        if (StudyService.get().getStudy(c) == null) {
            return false;
        }

        return true;
    }

    abstract String getPathToJsp();

    public void sendManually(Container container, User user) {
        // Check to make sure the service is enabled before sending
        if (!NotificationService.get().isServiceEnabled()) {
            log.info("The notification service is not enabled, so notification (" + getPathToJsp() + ") will not be sent manually.");
            return;
        }

        // Grab the emails to send the email to, and make sure we have more than one recipient.
        List<String> emails = this.getRecipientEmailAddresses(container);
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
            msg.setHtmlContent(getMessageBodyHTML(container, user));

            MailHelper.send(msg, user, container);
        }
        catch (Exception e) {
            log.error("Failed to send notification manually", e);
        }
    }

    public List<String> getRecipientEmailAddresses(Container container) {
        Set<UserPrincipal> recipients = NotificationService.get().getRecipients(new DeathNotification(), container);

        List<String> emails = new ArrayList<>();
        for (UserPrincipal u : recipients) {
            try {
                List<Address> addresses = NotificationService.get().getEmailsForPrincipal(u);
                if (addresses != null) {
                    for (Address a : addresses) {
                        if (a.toString() != null) {
                            emails.add(a.toString());
                        }
                    }
                }
            }
            catch (ValidEmail.InvalidEmailException e) {
                log.error("Could not get emails for UserPrincipal " + u.getUserId() + " of type " + u.getType());
            }
        }

        return emails;
    }

    public String getParam(String key) {
        return params.getString(key);
    }

    public void setParam(String key, String val) {
        params.put(key, val);
    }
}
