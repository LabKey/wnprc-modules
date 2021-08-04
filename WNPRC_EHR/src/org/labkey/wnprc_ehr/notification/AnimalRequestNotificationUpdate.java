package org.labkey.wnprc_ehr.notification;

import org.apache.commons.lang3.StringUtils;
import org.labkey.api.data.Container;
import org.labkey.api.data.TableInfo;
import org.labkey.api.ldk.notification.NotificationService;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.query.QueryService;
import org.labkey.api.security.User;
import org.labkey.api.security.UserPrincipal;
import org.labkey.api.security.permissions.AdminPermission;
import org.labkey.api.util.MailHelper;
import org.labkey.wnprc_ehr.TriggerScriptHelper;
import org.labkey.wnprc_ehr.WNPRC_EHRModule;
import org.labkey.wnprc_ehr.security.permissions.WNPRCAnimalRequestsEditPermission;

import javax.mail.Address;
import javax.mail.Message;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.Map;

import static org.labkey.api.search.SearchService._log;
import static org.labkey.ehr.pipeline.GeneticCalculationsJob.getContainer;

public class AnimalRequestNotificationUpdate extends AbstractEHRNotification
{
    public Integer _rowId;
    public User _currentUser;
    public String _hostName;
    public Map<String,Object> _row;
    public Map<String,Object> _oldrow;


    public AnimalRequestNotificationUpdate(Module owner)
    {
        super(owner);
    }

    public AnimalRequestNotificationUpdate(Module owner, Integer rowid, Map<String,Object> row, Map<String,Object> oldRow, User currentuser, String hostname)
    {
        super(owner);
        _rowId = rowid;
        _currentUser = currentuser;
        _hostName = hostname;
        _row = row;
        _oldrow = oldRow;
    }

    @Override
    public String getCategory()
    {
        return ModuleLoader.getInstance().getModule(WNPRC_EHRModule.class).getName();
    }

    public String getName()
    {
        return "Animal Request Notification Updates";
    }

    public String getScheduleDescription()
    {
        return "As soon as Animal Request is updated";
    }

    public String getDescription()
    {
        return "This notification gets sent every time an Animal Request is updated";
    }

    public String getUserName(User user)
    {
        if (!"".equals(user.getFullName()))
        {
            return user.getFullName();
        }
        if (!"".equals(user.getDisplayName(user)))
        {
            return user.getDisplayName(user);
        }
        return user.getEmail();
    }

    @Override
    public String getEmailSubject(Container c)
    {
        return "[EHR Services] Animal Request Updated on " + _dateTimeFormat.format(new Date());
    }


    @Override
    public String getMessageBodyHTML(Container c, User u)
    {
        final StringBuilder msg = new StringBuilder();
        TableInfo ti = QueryService.get().getUserSchema(u, c, "wnprc").getTable("animal_requests");
        Map<String, ArrayList<String>> theDifferences = TriggerScriptHelper.buildDifferencesMap(ti, _oldrow, _row);
        Date now = new Date();
        msg.append("<p>");
        msg.append(getUserName(_currentUser));
        msg.append(" updated an animal request entry on: " +
                AbstractEHRNotification._dateFormat.format(now) +
                " at " +
                AbstractEHRNotification._timeFormat.format(now) +
                ".</p>");
        msg.append("<p>The following changes were made: <br><br>");
        msg.append("<table style='border: 1px solid black;'><thead style='font-weight: bold;'><tr style='border: 1px solid black; padding: 5px' ><td style='border: 1px solid black; padding: 5px'>Field changed</td><td style='border: 1px solid black; padding: 5px'>Old value</td><td style='border: 1px solid black; padding: 5px'>New value</td></tr></thead>");

        for (Map.Entry<String, ArrayList<String>> change : theDifferences.entrySet())
        {
            msg.append("<tr style='border: 1px solid black; padding: 4px'>");
            msg.append("<td style='border: 1px solid black; padding: 4px'>");
            msg.append(change.getKey());
            msg.append("</td>");
            msg.append("<td style='border: 1px solid black; padding: 4px'>");
            msg.append(change.getValue().get(0));
            msg.append("</td>");
            msg.append("<td style='border: 1px solid black; padding: 4px'>");
            msg.append(change.getValue().get(1));
            msg.append("</td>");
            msg.append("</tr>");

        }

        msg.append("</table>");
        msg.append("</p>");

        msg.append("<p>Click <a href=\"" +
                _hostName +
                "/ehr/WNPRC/EHR/manageRecord.view?schemaName=wnprc&queryName=animal_requests&title=Animal%20Requests&keyField=rowid&key=" +
                _rowId +
                "\">here</a> to review the request.</p>");

        msg.append("<p>View all of the animal requests " +
                "<a href=\"" +
                _hostName +
                "/wnprc_ehr/WNPRC/EHR/dataEntry.view?#topTab:Requests&activeReport:AnimalRequests\"" +
                " >here</a>.</p>");

        return msg.toString();
    }

    public void sendManually (Container container, User user)
    {
        Collection<UserPrincipal> recipients = getRecipients(container);
        if (!container.hasPermission(_currentUser, WNPRCAnimalRequestsEditPermission.class) && !container.hasPermission(_currentUser, AdminPermission.class))
        {
            sendMessage(getEmailSubject(container),getMessageBodyHTML(container,user),recipients,user);
        }

    }

    public Collection<UserPrincipal> getRecipients(Container container)
    {
        return NotificationService.get().getRecipients(this, container);
    }

    public void sendMessage(String subject, String bodyHtml, Collection<UserPrincipal> recipients, User currentUser)
    {
        _log.info("AnimalRequestNotificationUpdate.java: sending animal request email...");
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
