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


public class VvcNotification extends AbstractEHRNotification
{
    public String requestId;
    public User currentUser;
    public String hostName;

    public VvcNotification(Module owner)
    {
        super(owner);
    }

    public VvcNotification(Module owner, String requestid, User currentuser, String hostname)
    {
        super(owner);
        requestId = requestid;
        currentuser = currentUser;
        hostname = hostName;
    }

    @Override
    public String getCategory()
    {
        return ModuleLoader.getInstance().getModule(WNPRC_EHRModule.class).getName();
    }

    @Override
    public String getName()
    {
        return "VVC Notification";
    }

    @Override
    public String getScheduleDescription()
    {
        return "As soon as VVC is submitted";
    }

    @Override
    public String getDescription()
    {
        return "This notification gets send every time there is a new VVC request";
    }

    @Override
    public String getEmailSubject(Container c)
    {
        return "New VVC Request Submitted on " + _dateTimeFormat.format(new Date());
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

    @Override
    public String getMessageBodyHTML(Container c, User u)
    {

        final StringBuilder msg = new StringBuilder();
        Date now = new Date();
        msg.append("<p>There was a new VVC request submitted.  It was submitted on: " + AbstractEHRNotification._dateFormat.format(now) + " at " + AbstractEHRNotification._timeFormat.format(now) + ".</p>");
        msg.append("<p>Click <a href =\"" + hostName + "/wnprc_ehr/WNPRC/EHR/dataEntry.view#topTab:Requests&activeReport:VVCRequests");

        return msg.toString();
    }

    public void sendMessage(String subject, String bodyHtml, Collection<UserPrincipal> recipients, User currentUser)
    {
        _log.info("VVCNotification.java: sending VVC request email...");
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
                _log.warn("VVCNotification.java: no emails, unable to send EHR trigger script email");
                return;
            }

            msg.setRecipients(Message.RecipientType.TO, StringUtils.join(emails, ","));
            msg.setEncodedHtmlContent(bodyHtml);

            MailHelper.send(msg, currentUser, getContainer());
        }
        catch (Exception e)
        {
            _log.error("VVCNotification.java: unable to send email from EHR trigger script", e);
        }
    }

}
