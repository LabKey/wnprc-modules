package org.labkey.wnprc_ehr.notification;

import org.apache.commons.lang3.StringUtils;
import org.labkey.api.data.Container;
import org.labkey.api.ldk.notification.NotificationService;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.security.User;
import org.labkey.api.security.UserPrincipal;
import org.labkey.api.util.MailHelper;
import org.labkey.wnprc_ehr.WNPRC_EHRModule;

import javax.mail.Address;
import javax.mail.Message;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.List;

import static org.labkey.api.search.SearchService._log;

public class SurgeryScheduledNotification extends AbstractEHRNotification
{
    public String requestid;

    public SurgeryScheduledNotification(Module owner)
    {
        super(owner);
    }

    public SurgeryScheduledNotification(Module owner, String requestid)
    {
        super(owner);
        this.requestid = requestid;

        //TODO query for surgery data here
    }

    @Override
    public String getCategory()
    {
        return ModuleLoader.getInstance().getModule(WNPRC_EHRModule.class).getName();
    }

    public String getName()
    {
        return "Surgery Scheduled Notification";
    }

    public String getScheduleDescription()
    {
        return "As soon as a surgery is scheduled";
    }

    public String getDescription()
    {
        return "This notification gets sent to the original requestor (and anyone on the notify list) every time a surgery is scheduled.";
    }

    @Override
    public String getEmailSubject(Container c)
    {
        return "[IDS Services] Surgery scheduled for ";//TODO real date of surgery + _dateTimeFormat.format(new Date());
    }

    @Override
    public String getMessageBodyHTML(Container c, User u)
    {


        return null;
//        final StringBuilder msg = new StringBuilder();
//        Date now = new Date();
//        msg.append("<p>There was a new project request submitted on: " +
//                AbstractEHRNotification._dateFormat.format(now) +
//                " at " +
//                AbstractEHRNotification._timeFormat.format(now) +
//                ".</p>");
//
//        msg.append("<p>Click <a href=\"" +
//                hostName +
//                "/list/WNPRC/WNPRC_Units/IT/Public/details.view?listId=1679&pk=" +
//                rowId +
//                "\">here</a> to review the request.</p>");
//
//        msg.append("<p>View all of the project requests " +
//                "<a href=\"" +
//                hostName +
//                "/list/WNPRC/WNPRC_Units/IT/Public/grid.view?listId=1679\"" +
//                " >here</a>.</p>");
//
//        return msg.toString();
    }

    public void sendManually (Container container, User user)
    {
        Collection<UserPrincipal> recipients = getRecipients(container);
        sendMessage(getEmailSubject(container),getMessageBodyHTML(container,user),recipients,user,container);

    }

    public Collection<UserPrincipal> getRecipients(Container container)
    {
        return NotificationService.get().getRecipients(this, container);
    }

    public void sendMessage(String subject, String bodyHtml, Collection<UserPrincipal> recipients, User currentUser, Container container)
    {
        try
        {
            MailHelper.MultipartMessage msg = MailHelper.createMultipartMessage();
            msg.setFrom(NotificationService.get().getReturnEmail(container));
            msg.setSubject(subject);

            List<String> emails = new ArrayList<>();
            for (UserPrincipal u : recipients)
            {
                List<Address> addresses = NotificationService.get().getEmailsForPrincipal(u);
                if (addresses != null)
                {
                    for (Address a : addresses)
                    {
                        if (a.toString() != null)
                            emails.add(a.toString());
                    }
                }
            }

            if (emails.size() == 0)
            {
                _log.warn("SurgeryScheduledNotification.java: no emails, unable to send EHR trigger script email");
                return;
            }

            msg.setRecipients(Message.RecipientType.TO, StringUtils.join(emails, ","));
            msg.setEncodedHtmlContent(bodyHtml);

            MailHelper.send(msg, currentUser, container);
        }
        catch (Exception e)
        {
            _log.error("SurgeryScheduledNotification.java: unable to send email from EHR trigger script", e);
        }
    }

}
