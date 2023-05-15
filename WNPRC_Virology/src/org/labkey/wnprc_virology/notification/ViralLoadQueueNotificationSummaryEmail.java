package org.labkey.wnprc_virology.notification;

import org.apache.commons.lang3.StringUtils;
import org.apache.logging.log4j.Logger;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.ehr.notification.AbstractEHRNotification;
import org.labkey.api.ldk.notification.NotificationService;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.security.User;
import org.labkey.api.security.UserPrincipal;
import org.labkey.api.util.MailHelper;
import org.labkey.api.util.logging.LogHelper;
import org.labkey.wnprc_virology.WNPRC_VirologyModule;

import javax.mail.Address;
import javax.mail.Message;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


/* This notification class is designed to work with, and be called from the ViralLoadQueueNotification class */
public class ViralLoadQueueNotificationSummaryEmail extends AbstractEHRNotification
{

    /* The data structure of these email contents is like so, using hashmaps of "key" -> val
        emailContents:
                      "account #1" -> List [
                                        "PortalURL" -> url val,
                                        "emails" -> [ list of email vals ]
                                        "count" -> num of samples
                                      ]
                      "account #2" -> [
                                        "PortalURL" -> url val,
                                        "emails" -> [ list of email vals ]
                                        "count" -> num of samples
                                      ]
                      "account #N" -> [
                                        "PortalURL" -> url val,
                                        "emails" -> [ list of email vals ]
                                        "count" -> num of samples
                                      ]

     */
    public String _dateComplete;
    public Map<String, Object> _emailSummaryTable;
    public String _experimentInfoTable;
    public Map<Integer, String> _accounts;
    public User _currentUser;
    private static final Logger _log = LogHelper.getLogger(ViralLoadQueueNotificationSummaryEmail.class, "Server-side logger for WNPRC_Virology notifications");

    public ViralLoadQueueNotificationSummaryEmail(Module owner)
    {
        super(owner);
    }
    public ViralLoadQueueNotificationSummaryEmail(Module owner, User currentuser, Map<String, Object> emailSummaryTable, String dateComplete, String experimentInfoTable, Map<Integer, String> accounts)
    {
        super(owner);
        _emailSummaryTable = emailSummaryTable;
        _currentUser = currentuser;
        _dateComplete = dateComplete;
        _experimentInfoTable = experimentInfoTable;
        _accounts = accounts;
    }

    @Override
    public String getCategory()
    {
        return ModuleLoader.getInstance().getModule(WNPRC_VirologyModule.class).getName();
    }

    public String getName()
    {
        return "Viral Load Queue Notification Summary Email";
    }

    public String getScheduleDescription()
    {
        return "As soon as Viral Load request has been completed sends a summary email";
    }

    public String getDescription()
    {
        return "This notification gets sent every time there is a viral load sample tracker data that's been batch completed";
    }

    @Override
    public String getEmailSubject(Container c)
    {
        return "[EHR Server] Summary information for viral load results completed on " + _dateComplete;
    }

    public String getMessageBodyHTML()
    {
        final StringBuilder msg = new StringBuilder();
        msg.append("<p>");
        msg.append("This email contains a summary of the emails that were sent to users about their viral load results on " + _dateComplete + ".");
        msg.append("</p>");
        msg.append(_experimentInfoTable);
        msg.append("<p>");
        msg.append("Below is a summary of the viral load email notifications that were sent:");
        msg.append("</p>");

        msg.append("<table style='border: 1px solid black;'><thead style='font-weight: bold;'><tr style='border: 1px solid black; padding: 5px' >" +
                "<td style='border: 1px solid black; padding: 5px'>Recipient</td>" +
                "<td style='border: 1px solid black; padding: 5px'>Link Sent</td>" +
                "<td style='border: 1px solid black; padding: 5px'>Account #</td>" +
                "<td style='border: 1px solid black; padding: 5px'># of Samples Complete</td></tr></thead>");
        for (Map.Entry<String, Object> entry : _emailSummaryTable.entrySet()) {
            String key = entry.getKey();
            ArrayList<HashMap<String,Object>> value = (ArrayList<HashMap<String,Object>>) entry.getValue();
            for (HashMap<String,Object> item : value )
            {
                msg.append("<tr style='border: 1px solid black; padding: 4px'>");
                msg.append("<td style='border: 1px solid black; padding: 4px'>");
                msg.append( String.join(", ", (List<String>) item.get("emails")));
                msg.append("</td>");
                msg.append("<td style='border: 1px solid black; padding: 4px'>");
                msg.append("<a href=\"" + item.get("portalURL") + "\">" + "RSEHR Data Link" + "</a>");
                msg.append("</td>");
                msg.append("<td style='border: 1px solid black; padding: 4px'>");
                msg.append(_accounts.get(Integer.parseInt(key)));
                msg.append("</td>");
                msg.append("<td style='border: 1px solid black; padding: 4px'>");
                msg.append(item.get("count"));
                msg.append("</td>");
                msg.append("</tr>");
            }
        }
        msg.append("</table>");

        msg.append("<p>");
        msg.append("Please contact the EHR administrators if there are any issues seen in the above content.");
        msg.append("</p>");
        return msg.toString();
    }

    @Override
    public String getMessageBodyHTML(Container c, User u)
    {
        return getMessageBodyHTML();
    }

    public void sendManually (Container container)
    {
            Collection<UserPrincipal> subscribedRecipients = getRecipients(container);
            sendMessage(getEmailSubject(container),getMessageBodyHTML(), subscribedRecipients, container);
    }

    public Collection<UserPrincipal> getRecipients(Container container)
    {
        return NotificationService.get().getRecipients(this, container);
    }

    public void sendMessage(String subject, String bodyHtml, Collection<UserPrincipal> recipients, Container container)
    {
        _log.info(this.getClass().getName() + ": sending viral sample queue update email...");
        try
        {
            MailHelper.MultipartMessage msg = MailHelper.createMultipartMessage();
            Address returnEmail = NotificationService.get().getReturnEmail(container);
            if (returnEmail == null)
            {
                returnEmail = NotificationService.get().getReturnEmail(ContainerManager.getRoot());
            }
            msg.setFrom(returnEmail);
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
                _log.warn(this.getClass().getName() + ": no emails, unable to send EHR trigger script email");
                return;
            }

            msg.setRecipients(Message.RecipientType.TO, StringUtils.join(emails, ","));
            msg.setEncodedHtmlContent(bodyHtml);

            MailHelper.send(msg, _currentUser, container);
        }
        catch (Exception e)
        {
            _log.error(this.getClass().getName() + " unable to send email from EHR trigger script", e);
        }
    }

}
