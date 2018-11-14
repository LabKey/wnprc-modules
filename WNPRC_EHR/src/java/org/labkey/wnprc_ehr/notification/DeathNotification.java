package org.labkey.wnprc_ehr.notification;

import org.labkey.api.data.Container;
import org.labkey.api.ldk.notification.Notification;
import org.labkey.api.ldk.notification.NotificationService;
import org.labkey.api.security.User;
import org.labkey.api.security.UserPrincipal;
import org.labkey.api.security.ValidEmail;

import javax.mail.Address;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

/**
 * Created by jon on 7/13/16.
 */
public class DeathNotification extends AbstractJspEmailNotification {
    public static String idParamName = "Id";

    @Override
    public String getName() {
        return "Death Notification";
    }

    @Override
    public String getEmailSubject(Container c) {
        String subject = "Death Notification";

        if (params.has(idParamName)) {
            subject += ": " + getParam(idParamName);
        }
        return subject;
    }

    @Override
    public String getCronString() {
        return null;
    }

    @Override
    public String getScheduleDescription() {
        return "Sent immediately when an animal is marked as dead";
    }

    @Override
    public String getDescription() {
        return "The report sends an alert whenever an animal is marked as dead.";
    }

    @Override
    String getPathToJsp() {
        return "/org/labkey/wnprc_ehr/email_templates/notifications/DeathNotification.jsp";
    }


    public void sendManually (Container container, User user){
        List<String> emails = getRecipientEmailAddresses(container);
        sendManually(container, user, emails);

    }

    public List<String> getRecipientEmailAddresses(Container container) {
        Set<UserPrincipal> recipients = NotificationService.get().getRecipients(this, container);

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
}
