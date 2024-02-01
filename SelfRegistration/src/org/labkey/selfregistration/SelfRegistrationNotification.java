package org.labkey.selfregistration;

import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.security.User;
import org.labkey.api.util.MailHelper;
import org.apache.commons.lang3.StringUtils;

import jakarta.mail.Message;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import static org.labkey.api.search.SearchService._log;

public class SelfRegistrationNotification
{
    public String rowId;
    public String hostName;

    protected final static SimpleDateFormat _dateTimeFormat = new SimpleDateFormat("yyyy-MM-dd kk:mm");
    protected final static SimpleDateFormat _dateFormat = new SimpleDateFormat("yyyy-MM-dd");
    protected final static SimpleDateFormat _timeFormat = new SimpleDateFormat("kk:mm");
    protected static String _recepientEmails = "";
    protected final static String _fromEmail = "ehr-do-not-reply@primate.wisc.edu";
    protected final static String _issueTrackerDefName = "userregistrations";
    protected static String _issueTrackerFolderName = "";

    public static Module srModule = ModuleLoader.getInstance().getModule(SelfRegistrationModule.NAME);

    public SelfRegistrationNotification(String rowid, String hostname)
    {
        rowId = rowid;
        hostName = hostname;
        _issueTrackerFolderName = srModule.getModuleProperties().get(SelfRegistrationModule.ISSUE_TRACKER_FOLDER_LOCATION).getEffectiveValue(ContainerManager.getRoot());
        _recepientEmails = srModule.getModuleProperties().get(SelfRegistrationModule.EMAIL_NOTIFICATION_SEND_TO_LIST).getEffectiveValue(ContainerManager.getRoot());
    }

    public String getName()
    {
        return "Self Registration Notification";
    }

    public String getScheduleDescription()
    {
        return "As soon as Self Registration is submitted";
    }

    public String getDescription()
    {
        return "This notification gets sent every time there is a new Self Registration form submitted";
    }

    public String getEmailSubject(Container c)
    {
        return "[EHR Services] New Self Registration Form Submitted on " + _dateTimeFormat.format(new Date());
    }

    public String getMessageBodyHTML()
    {
        final StringBuilder msg = new StringBuilder();
        Date now = new Date();
        msg.append("<p>There was a new self registration request submitted on: " +
                _dateFormat.format(now) +
                " at " +
                _timeFormat.format(now) +
                ".</p>");

        msg.append("<p>Click <a href=\"" +
                hostName +
                "/issues/" + _issueTrackerFolderName + "/details.view?issueId=" +
                rowId +
                "\">here</a> to review the request.</p>");

        msg.append("<p>View all of the self registrations " +
                "<a href=\"" +
                hostName +
                "/query/" + _issueTrackerFolderName + "/executeQuery.view?schemaName=issues&query.queryName=" + _issueTrackerDefName + "\"" +
                " >here</a>.</p>");

        return msg.toString();
    }

    public void sendManually (Container container, User user)
    {
        //Collection<UserPrincipal> recipients = getRecipients(container);
        sendMessage(getEmailSubject(container),getMessageBodyHTML(),user,container);

    }

    public void sendMessage(String subject, String bodyHtml, User currentUser, Container container)
    {
        _log.info("SelfRegistrationNotification.java: sending self registration email...");
        try
        {
            //List<Address> addresses = NotificationService.get().getEmailsForPrincipal(u);
            MailHelper.MultipartMessage msg = MailHelper.createMultipartMessage();
            msg.setFrom(_fromEmail);
            msg.setSubject(subject);

            if (_recepientEmails.length() == 0)
            {
                _log.warn("SelfRegistrationNotification.java: no email addresses, unable to send email");
                return;
            }

            msg.setRecipients(Message.RecipientType.TO, _recepientEmails);
            msg.setEncodedHtmlContent(bodyHtml);

            MailHelper.send(msg, currentUser, container);
            _log.info("SelfRegistrationNotification.java: email sent.");
        }
        catch (Exception e)
        {
            _log.error("SelfRegistrationNotification.java: unable to send email", e);
        }
    }

}
