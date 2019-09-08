package org.labkey.wnprc_ehr.notification;

import org.labkey.api.data.Container;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.security.User;
import org.labkey.api.util.MailHelper;
import org.labkey.wnprc_ehr.WNPRC_EHRModule;
import org.labkey.api.security.UserPrincipal;
import org.labkey.api.ldk.notification.NotificationService;
import org.apache.commons.lang3.StringUtils;

import javax.mail.Address;
import javax.mail.Message;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.List;

import static org.labkey.api.search.SearchService._log;
import static org.labkey.ehr.pipeline.GeneticCalculationsJob.getContainer;

public class AnimalRequestNotification extends AbstractEHRNotification
{
    public Integer rowId;
    public User currentUser;
    public String hostName;

    public AnimalRequestNotification(Module owner)
    {
        super(owner);
    }

    public AnimalRequestNotification(Module owner, Integer rowid, User currentuser, String hostname)
    {
        super(owner);
        rowId = rowid;
        currentUser = currentuser;
        hostName = hostname;

    }

    @Override
    public String getCategory()
    {
        return ModuleLoader.getInstance().getModule(WNPRC_EHRModule.class).getName();
    }

    public String getName()
    {
        return "Animal Request Notification";
    }

    public String getScheduleDescription()
    {
        return "As soon as Animal Request is submitted";
    }

    public String getDescription()
    {
        return "This notification gets sent every time there is a new Animal Request form submitted";
    }

    @Override
    public String getEmailSubject(Container c)
    {
        return "[EHR Services] New Animal Request Submitted on " + _dateTimeFormat.format(new Date());
    }

    @Override
    public String getMessageBodyHTML(Container c, User u)
    {
        final StringBuilder msg = new StringBuilder();
        Date now = new Date();
        msg.append("<p>There was a new animal request submitted on: " +
                AbstractEHRNotification._dateFormat.format(now) +
                " at " +
                AbstractEHRNotification._timeFormat.format(now) +
                ".</p>");

        msg.append("<p>Click <a href=\"" +
                hostName +
                "/ehr/WNPRC/EHR/manageRecord.view?schemaName=wnprc&queryName=animal_requests&title=Animal%20Requests&keyField=rowid&key=" +
                rowId +
                "\">here</a> to review the request.</p>");

        msg.append("<p>View all of the animal requests " +
                "<a href=\"" +
                hostName +
                "/wnprc_ehr/WNPRC/EHR/dataEntry.view?#topTab:Requests&activeReport:AnimalRequests\"" +
                " >here</a>.</p>");

        return msg.toString();
    }

    public void sendManually (Container container, User user)
    {
        Collection<UserPrincipal> recipients = getRecipients(container);
        sendMessage(getEmailSubject(container),getMessageBodyHTML(container,user),recipients,user);

    }

    public Collection<UserPrincipal> getRecipients(Container container)
    {
        return NotificationService.get().getRecipients(this, container);
    }

    public void sendMessage(String subject, String bodyHtml, Collection<UserPrincipal> recipients, User currentUser)
    {
        _log.info("AnimalRequestNotification.java: sending animal request email...");
        try
        {
            MailHelper.MultipartMessage msg = MailHelper.createMultipartMessage();
            msg.setFrom(NotificationService.get().getReturnEmail(getContainer()));
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
                _log.warn("AnimalRequestNotification.java: no emails, unable to send EHR trigger script email");
                return;
            }

            msg.setRecipients(Message.RecipientType.TO, StringUtils.join(emails, ","));
            msg.setEncodedHtmlContent(bodyHtml);

            MailHelper.send(msg, currentUser, getContainer());
        }
        catch (Exception e)
        {
            _log.error("AnimalRequestNotification.java: unable to send email from EHR trigger script", e);
        }
    }

}
