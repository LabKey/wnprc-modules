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
    public Integer[] rowIds;
    public User currentUser;
    public String animalId;
    public String hostName;
    public String requestorEmail = "";
    public String notifyEmails = "";
    public Container container;
    public String fullName = "";
    public String modifiedByFullName = "";
    public String modifiedByEmail = "";
    public final String openResearchPortal = "https://openresearch.labkey.com/study/ZEST/Private/dataset.view?datasetId=5080";

    public ViralLoadQueueNotification(Module owner)
    {
        super(owner);
    }

    public ViralLoadQueueNotification(Module owner, Integer[] rowids, User currentuser, Container c, String hostname) throws SQLException
    {
        super(owner);
        rowIds = rowids;
        currentUser = currentuser;
        hostName = hostname;
        container = c;
        this.setUp();
    }

    public void setUp() throws SQLException
    {

        //for each rowId lookup the record and find emails field?
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("Key"), rowId);
        QueryHelper viralLoadQuery = new QueryHelper(container, currentUser, "lists", "vl_sample_queue");

        // Define columns to get
        List<FieldKey> columns = new ArrayList<>();
        columns.add(FieldKey.fromString("Key"));
        columns.add(FieldKey.fromString("CreatedBy"));
        columns.add(FieldKey.fromString("Status"));
        columns.add(FieldKey.fromString("Id"));
        columns.add(FieldKey.fromString("emails"));
        columns.add(FieldKey.fromString("ModifiedBy"));

        Integer userid = null;
        String animalid = null;
        String notifyEmails = null;
        Integer modifiedBy = null;

        // Execute the query
        try (Results rs = viralLoadQuery.select(columns, filter))
        {
            if (rs.next()){
                userid = rs.getInt(FieldKey.fromString("CreatedBy"));
                animalid = rs.getString(FieldKey.fromString("Id"));
                notifyEmails = rs.getString(FieldKey.fromString("emails"));
                modifiedBy = rs.getInt(FieldKey.fromString("ModifiedBy"));
            }
        }
        if (userid != null)
        {
            User u = UserManager.getUser(userid);
            if (u != null)
            {
                this.fullName = u.getFullName();
                this.requestorEmail = u.getEmail();
                this.animalId = animalid;
            }
        }
        if (notifyEmails != null)
        {
            this.notifyEmails = notifyEmails;
        }
        if (modifiedBy != null)
        {
         User mod = UserManager.getUser(modifiedBy);
         if (mod != null)
         {
             this.modifiedByEmail = mod.getEmail();
             String fullName = mod.getFullName();
             if ("".equals(fullName))
             {
                 this.modifiedByFullName = "Virology Services";
             } else
             {
                 this.modifiedByFullName = fullName;
             }
         }
        }

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
        return "[EHR Server] Viral load results completed on " + _dateTimeFormat.format(new Date());
    }

    @Override
    public String getMessageBodyHTML(Container c, User u)
    {
        final StringBuilder msg = new StringBuilder();
        Date now = new Date();
        msg.append("<p>Hello " +
                fullName +
                ",</p>");
        msg.append("<p>Good news - Virology Services has completed viral load testing on a sample(s) you submitted. " +
                "The results can be found in the Zika portal, and using the following " +
                "<a href=\"" +
                openResearchPortal +
                "&Dataset.ParticipantId~eq=" +
                animalId +
                "\">link</a>. ");
        msg.append("Please feel free to contact " +
                "<a href=\"mailto:" +
                modifiedByEmail +
                "\">" +
                modifiedByEmail +
                "</a> " +
                "if you have any questions or concerns. We look forward to serving you again in the future.</p>");

        msg.append("Best,<br>" +
                modifiedByFullName);


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
        _log.info("ViralLoadNotification.java: sending viral sample queue update email...");
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
            if (requestorEmail != null) emails.add(requestorEmail);

            if (notifyEmails != null){
                //we should split by comma, semicolon, or new line
                String[] emailArray = notifyEmails.split(";|,|\n|\r\n|\r");
                for (String e : emailArray)
                {
                    e = e.trim();
                    emails.add(e);
                }
            }

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
