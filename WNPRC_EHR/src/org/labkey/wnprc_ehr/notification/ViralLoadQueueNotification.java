package org.labkey.wnprc_ehr.notification;

import org.apache.commons.lang3.StringUtils;
import org.labkey.api.data.Container;
import org.labkey.api.data.Results;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.ldk.notification.NotificationService;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryHelper;
import org.labkey.api.security.User;
import org.labkey.api.security.UserManager;
import org.labkey.api.security.UserPrincipal;
import org.labkey.api.util.MailHelper;
import org.labkey.wnprc_ehr.WNPRC_EHRModule;

import javax.mail.Address;
import javax.mail.Message;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.List;

import static org.labkey.api.search.SearchService._log;
import static org.labkey.ehr.pipeline.GeneticCalculationsJob.getContainer;

public class ViralLoadQueueNotification extends AbstractEHRNotification
{
    public Integer rowId;
    public User currentUser;
    public String animalId;
    public String hostName;
    public String email;
    public Container container;

    public ViralLoadQueueNotification(Module owner)
    {
        super(owner);
    }

    public ViralLoadQueueNotification(Module owner, Integer rowid, User currentuser, Container c, String hostname) throws SQLException
    {
        super(owner);
        rowId = rowid;
        currentUser = currentuser;
        hostName = hostname;
        container = c;
        this.setUp();
    }

    public void setUp() throws SQLException
    {
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("Key"), rowId);
        QueryHelper viralLoadQuery = new QueryHelper(container, currentUser, "lists", "vl_sample_queue");

        // Define columns to get
        List<FieldKey> columns = new ArrayList<>();
        columns.add(FieldKey.fromString("Key"));
        columns.add(FieldKey.fromString("CreatedBy"));
        columns.add(FieldKey.fromString("Status"));
        columns.add(FieldKey.fromString("Id"));

        // Execute the query
        Results rs = viralLoadQuery.select(columns, filter);
        Integer id = null;
        String animalid = null;

        if (rs.next()){
            id = rs.getInt(FieldKey.fromString("CreatedBy"));
            animalid = rs.getString(FieldKey.fromString("Id"));
        }
        rs.close();
        User u = UserManager.getUser(id);
        u.getEmail();
        this.email = u.getEmail();
        this.animalId = animalid;

    }

    @Override
    public String getCategory()
    {
        return ModuleLoader.getInstance().getModule(WNPRC_EHRModule.class).getName();
    }

    public String getName()
    {
        return "Viral Load Queue Notification";
    }

    public String getScheduleDescription()
    {
        return "As soon as Viral Load request has been completed";
    }

    public String getDescription()
    {
        return "This notification gets sent every time there is a viral load queue completed";
    }

    @Override
    public String getEmailSubject(Container c)
    {
        return "[EHR Services] Viral load request has been completed as of " + _dateTimeFormat.format(new Date());
    }

    @Override
    public String getMessageBodyHTML(Container c, User u)
    {
        final StringBuilder msg = new StringBuilder();
        Date now = new Date();
        msg.append("<p>There was a viral load sample completed on " +
                AbstractEHRNotification._dateFormat.format(now) +
                " at " +
                AbstractEHRNotification._timeFormat.format(now) +
                ".</p>");

        msg.append("<p>Click <a href=\"" +
                hostName +
                "/list/WNPRC/WNPRC_Units/Research_Services/Virology_Services/viral_load_sample_tracker/details.view?listId=3&pk=" +
                rowId +
                "\">here</a> to review the request.</p>");

        msg.append("<p>View the viral load queue " +
                "<a href=\"" +
                hostName +
                "/project/WNPRC/WNPRC_Units/Research_Services/Virology_Services/viral_load_sample_tracker/begin.view?\"" +
                " >here</a>.</p>");

        msg.append("<p>View the animal abstract " +
                "<a href=\"" +
                hostName +
                "/ehr/WNPRC/EHR/participantView.view?participantId=" +
                animalId +
                "#subjects:" +
                animalId +
                "&inputType:singleSubject&showReport:0&activeReport:abstract\"" +
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
        _log.info("ViralLoadNotification.java: sending animal request email...");
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
            //also add to the list of recipients the person who created the record
            emails.add(email);

            if (emails.size() == 0)
            {
                _log.warn("ViralLoadNotification.java: no emails, unable to send EHR trigger script email");
                return;
            }

            msg.setRecipients(Message.RecipientType.TO, StringUtils.join(emails, ","));
            msg.setEncodedHtmlContent(bodyHtml);

            MailHelper.send(msg, currentUser, getContainer());
        }
        catch (Exception e)
        {
            _log.error("ViralLoadNotification.java: unable to send email from EHR trigger script", e);
        }
    }

}
