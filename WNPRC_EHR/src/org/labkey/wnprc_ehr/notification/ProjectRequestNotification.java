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
import static org.labkey.ehr.pipeline.GeneticCalculationsJob.getContainer;

public class ProjectRequestNotification extends AbstractEHRNotification
{
    public Integer rowId;
    public User currentUser;
    public String hostName;

    public ProjectRequestNotification(Module owner)
    {
        super(owner);
    }

    public ProjectRequestNotification(Module owner, User currentuser, String hostname)
    {
        super(owner);
        //rowId = key;
        currentUser = currentuser;
        hostName = hostname;

    }
    public ProjectRequestNotification(Module owner, Integer key, User currentuser, String hostname)
    {
        super(owner);
        rowId = key;
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
        return "Project Request Notification";
    }

    public String getScheduleDescription()
    {
        return "As soon as Project Request is submitted";
    }

    public String getDescription()
    {
        return "This notification gets sent every time there is a new Project Request form submitted";
    }

    @Override
    public String getEmailSubject(Container c)
    {
        return "[IDS Services] New Project Request Submitted on " + _dateTimeFormat.format(new Date());
    }

    @Override
    public String getMessageBodyHTML(Container c, User u)
    {
        final StringBuilder msg = new StringBuilder();
        Date now = new Date();
        msg.append("<p>There was a new project request submitted on: " +
                AbstractEHRNotification._dateFormat.format(now) +
                " at " +
                AbstractEHRNotification._timeFormat.format(now) +
                ".</p>");

        msg.append("<p>Click <a href=\"" +
                hostName +
                "/list/WNPRC/WNPRC_Units/IT/Public/details.view?listId=1679&pk=" +
                rowId +
                "\">here</a> to review the request.</p>");

        msg.append("<p>View all of the project requests " +
                "<a href=\"" +
                hostName +
                "/list/WNPRC/WNPRC_Units/IT/Public/grid.view?listId=1679\"" +
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
        _log.info("ProjectRequestNotification.java: sending Project request email...");
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
                _log.warn("ProjectRequestNotification.java: no emails, unable to send EHR trigger script email");
                return;
            }

            msg.setRecipients(Message.RecipientType.TO, StringUtils.join(emails, ","));
            msg.setEncodedHtmlContent(bodyHtml);

            MailHelper.send(msg, currentUser, getContainer());
        }
        catch (Exception e)
        {
            _log.error("ProjectRequestNotification.java: unable to send email from EHR trigger script", e);
        }
    }

}
