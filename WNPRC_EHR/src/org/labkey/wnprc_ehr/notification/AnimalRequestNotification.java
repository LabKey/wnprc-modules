package org.labkey.wnprc_ehr.notification;

import org.apache.commons.math3.analysis.function.Abs;
import org.labkey.api.data.Container;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.security.User;
import org.labkey.api.util.MailHelper;
import org.labkey.api.util.Path;
import org.labkey.api.view.ActionURL;
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

public class AnimalRequestNotification extends AbstractEHRNotification
{
    //Class Variables
    NotificationToolkit notificationToolkit = new NotificationToolkit();
    NotificationToolkit.StyleToolkit styleToolkit = new NotificationToolkit.StyleToolkit();
    public Integer rowId;
    public User currentUser;
    public String hostName;



    //Constructors

    /**
     * This constructor is used to register the notification in WNPRC_EHRModule.java.
     * TODO: Check if this constructor is used for the "Manually Trigger Email" option in WNPRC_EHRModule.java.
     * @param owner
     */
    public AnimalRequestNotification(Module owner)
    {
        super(owner);
    }

    /**
     * This constructor is used to actually send the notification via the "TriggerScriptHelper.java" class.
     * @param owner
     * @param rowid
     * @param currentuser
     * @param hostname
     */
    public AnimalRequestNotification(Module owner, Integer rowid, User currentuser, String hostname)
    {
        super(owner);
        rowId = rowid;
        currentUser = currentuser;
        hostName = hostname;

    }



    //Notification Details
    public String getName()
    {
        return "Animal Request Notification";
    }
    public String getDescription() {
        return "This notification gets sent every time there is a new Animal Request form submitted";
    }
    @Override
    public String getEmailSubject(Container c)
    {
        return "[EHR Services] New Animal Request Submitted on " + notificationToolkit.getCurrentTime();
    }
    public String getScheduleDescription()
    {
        return "As soon as Animal Request is submitted";
    }
    @Override
    public String getCategory()
    {
        return ModuleLoader.getInstance().getModule(WNPRC_EHRModule.class).getName();
    }



    //Sending Options
    public void sendManually (Container container, User user)
    {
        notificationToolkit.sendNotification(this, user, container);
        //START: To be removed.
//        Collection<UserPrincipal> recipients = getRecipients(container);
//        sendMessage(getEmailSubject(container),getMessageBodyHTML(container,user),recipients,user,container);
        //END: To be removed.
    }

    //START: To be removed.
//    public Collection<UserPrincipal> getRecipients(Container container)
//    {
//        return NotificationService.get().getRecipients(this, container);
//    }
//    public void sendMessage(String subject, String bodyHtml, Collection<UserPrincipal> recipients, User currentUser,Container container)
//    {
//        _log.info("AnimalRequestNotification.java: sending animal request email...");
//        try
//        {
//            MailHelper.MultipartMessage msg = MailHelper.createMultipartMessage();
//            msg.setFrom(NotificationService.get().getReturnEmail(container));
//            msg.setSubject(subject);
//
//            List<String> emails = new ArrayList<>();
//            for (UserPrincipal u : recipients)
//            {
//                List<Address> addresses = NotificationService.get().getEmailsForPrincipal(u);
//                if (addresses != null)
//                {
//                    for (Address a : addresses)
//                    {
//                        if (a.toString() != null)
//                            emails.add(a.toString());
//                    }
//                }
//            }
//
//            if (emails.size() == 0)
//            {
//                _log.warn("AnimalRequestNotification.java: no emails, unable to send EHR trigger script email");
//                return;
//            }
//
//            msg.setRecipients(Message.RecipientType.TO, StringUtils.join(emails, ","));
//            msg.setEncodedHtmlContent(bodyHtml);
//
//            MailHelper.send(msg, currentUser, container);
//        }
//        catch (Exception e)
//        {
//            _log.error("AnimalRequestNotification.java: unable to send email from EHR trigger script", e);
//        }
//    }
    //END: To be removed.



    //Message Creation
    @Override
    public String getMessageBodyHTML(Container c, User u)
    {
        //Creates variables.
        final StringBuilder msg = new StringBuilder();
        Date now = new Date();

        //Sets data.
        String currentDate = AbstractEHRNotification._dateFormat.format(now);
        String currentTime = AbstractEHRNotification._timeFormat.format(now);
        String singleRequestURL = (new Path(ActionURL.getBaseServerURL(), "ehr", c.getPath(), "").toString()) + "manageRecord.view?schemaName=wnprc&queryName=animal_requests&title=Animal%20Requests&keyField=rowid&key=" + rowId;
        String singleRequestHyperlink = notificationToolkit.createHyperlink("here", singleRequestURL);
        String allRequestsURL = (new Path(ActionURL.getBaseServerURL(), "ehr", c.getPath(), "").toString()) + "dataEntry.view?#topTab:Requests&activeReport:AnimalRequests\"";
        String allRequestsHyperlink = notificationToolkit.createHyperlink("here", allRequestsURL);

        //Creates message info.
        msg.append("<p>There was a new animal request submitted on: " + currentDate + " at " + currentTime + ".</p>");
        msg.append("<p>Click " + singleRequestHyperlink + " to review the request.</p>");
        msg.append("<p>View all of the animal requests " + allRequestsHyperlink + ".</p>");

        //START: To be removed.
//        msg.append("<p>There was a new animal request submitted on: " +
//                AbstractEHRNotification._dateFormat.format(now) +
//                " at " +
//                AbstractEHRNotification._timeFormat.format(now) +
//                ".</p>");
//
//        msg.append("<p>Click <a href=\"" +
//                hostName +
//                "/ehr/WNPRC/EHR/manageRecord.view?schemaName=wnprc&queryName=animal_requests&title=Animal%20Requests&keyField=rowid&key=" +
//                rowId +
//                "\">here</a> to review the request.</p>");
//
//        msg.append("<p>View all of the animal requests " +
//                "<a href=\"" +
//                hostName +
//                "/wnprc_ehr/WNPRC/EHR/dataEntry.view?#topTab:Requests&activeReport:AnimalRequests\"" +
//                " >here</a>.</p>");
        //END: To be removed.

        return msg.toString();
    }

}
