package org.labkey.wnprc_virology.notification;

import org.apache.commons.lang3.StringUtils;
import org.labkey.api.data.Container;
import org.labkey.api.data.Results;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.ehr.notification.AbstractEHRNotification;
import org.labkey.api.ldk.notification.NotificationService;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryHelper;
import org.labkey.api.security.User;
import org.labkey.api.security.UserManager;
import org.labkey.api.security.UserPrincipal;
import org.labkey.api.security.ValidEmail;
import org.labkey.api.util.MailHelper;
import org.labkey.wnprc_virology.WNPRC_VirologyModule;

import javax.mail.Address;
import javax.mail.Message;
import java.sql.SQLException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.labkey.api.search.SearchService._log;

public class ViralLoadQueueNotification extends AbstractEHRNotification
{
    public String[] rowIds;
    public User currentUser;
    public String hostName;
    public String notifyEmails = "";
    public Container container;
    public String modifiedByFullName = "";
    public String modifiedByEmail = "";
    public Map<String, Integer> emailsAndCount = new HashMap<>();
    public Integer experimentNumber;
    public Integer positiveControl;
    public String vlPositiveControl;
    public String avgVLPositiveControl;
    public Double efficiency;
    public Map<String, Object> emailProps;
    protected final static SimpleDateFormat _dateTimeFormat = new SimpleDateFormat("yyyy-MM-dd kk:mm");

    public ViralLoadQueueNotification(Module owner)
    {
        super(owner);
    }

    public ViralLoadQueueNotification(Module owner, String [] rowids, User currentuser, Container c, Map<String, Object> emailprops) throws SQLException
    {
        super(owner);
        rowIds = rowids;
        currentUser = currentuser;
        container = c;
        emailProps = emailprops;
        hostName = (String) emailprops.get("hostName");
        experimentNumber = (Integer) emailprops.get("experimentNumber");
        positiveControl = (Integer) emailprops.get("positive_control");
        vlPositiveControl = (String) emailprops.get("vl_positive_control");
        avgVLPositiveControl = (String) emailprops.get("avg_vl_positive_control");
        efficiency = (Double) emailprops.get("efficiency");
        this.setUp();
    }

    public ViralLoadQueueNotification(Module owner, String [] rowids, User currentuser, Container c, Map<String, Object> emailprops, String serverUrl) throws SQLException
    {
        super(owner);
        rowIds = rowids;
        currentUser = currentuser;
        container = c;
        hostName = (String) emailprops.get("hostName");
        experimentNumber = (Integer) emailprops.get("experimentNumber");
        positiveControl = (Integer) emailprops.get("positive_control");
        vlPositiveControl = (String) emailprops.get("vl_positive_control");
        avgVLPositiveControl = (String) emailprops.get("avg_vl_positive_control");
        efficiency = (Double) emailprops.get("efficiency");
        this.setUp();
    }
    public void addEmail(String email)
    {
        if (emailsAndCount.containsKey(email))
        {
            Integer val = emailsAndCount.get(email);
            val++;
            emailsAndCount.replace(email,val);
        } else {
            emailsAndCount.put(email,1);
        }
    }

    //TODO if we are gathering the email list from data from RSEHR, we'll need to change/adapt how we build up the notifyEmails here.
    public void countEmailsAndPut(String emails, String createdyByEmail)
    {
        if (emails != null){
            //we should split by comma, semicolon, or new line
            String[] emailArray = notifyEmails.split(";|,|\n|\r\n|\r");
            for (String e : emailArray)
            {
                e = e.trim();
                if (!createdyByEmail.equals(e))
                {
                    addEmail(e);
                }
            }
        }

    }

    //if we can find their labkey user, get their full name, otherwise just use generic name
    public String getUserFullName(String email)
    {
        User u;
        String recipientName = "User";
        try
        {
            u = UserManager.getUser(new ValidEmail(email));
            if (u != null)
            {
                recipientName = u.getFullName();
            }
        }
        catch (ValidEmail.InvalidEmailException e)
        {
        }
        return recipientName;
    }

    //override setuUp method?

    //this setup method does most of the work to get the notify list
    //if we want to change the location of where the notify list comes from we'll need to change this method
    public void setUp() throws SQLException
    {

        // Set up query to get records for each rowid
        Set<Integer> ids = new HashSet<Integer>();
        Integer arr[] = new Integer[rowIds.length];
        for (int i = 0; i < rowIds.length; i++){
            arr[i] = Integer.parseInt(rowIds[i]);
        }
        Collections.addAll(ids, arr);
        SimpleFilter filter = new SimpleFilter();
        filter.addInClause(FieldKey.fromString("Key"), ids);
        QueryHelper viralLoadQuery = new QueryHelper(container, currentUser, "lists", "vl_sample_queue");

        // Define columns to get
        List<FieldKey> columns = new ArrayList<>();
        columns.add(FieldKey.fromString("Key"));
        columns.add(FieldKey.fromString("CreatedBy"));
        columns.add(FieldKey.fromString("Status"));
        columns.add(FieldKey.fromString("Id"));
        columns.add(FieldKey.fromString("emails"));
        columns.add(FieldKey.fromString("ModifiedBy"));

        Integer createdByUserId = null;
        String notifyEmails = null;
        Integer modifiedBy = null;

        // Execute the query
        try (Results rs = viralLoadQuery.select(columns, filter))
        {
            User createdByUser = null;
            String createdByUserEmail = null;
            User mod = null;
            while (rs.next()){
                createdByUserId = rs.getInt(FieldKey.fromString("CreatedBy"));
                notifyEmails = rs.getString(FieldKey.fromString("emails"));
                modifiedBy = rs.getInt(FieldKey.fromString("ModifiedBy"));

                if (createdByUserId != null)
                {
                    createdByUser = UserManager.getUser(createdByUserId);
                    if (createdByUser != null)
                    {
                        createdByUserEmail = createdByUser.getEmail();
                    }
                }

                if (notifyEmails != null)
                {
                    this.notifyEmails = notifyEmails;
                }
                if (modifiedBy != null)
                {
                    mod = UserManager.getUser(modifiedBy);
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
                // old notes:
                //emails.put(createdByUserId, getEmailArray(notifyEmails)); - old way, user id is unique.
                //used to use public Map<Integer, List<String>> emails = new HashMap<Integer,List<String>>();
                //but ideally instead of Integer as the key it would be a a string of:
                //submitter email + notify email string(normalized = sorted in such a way there arent repeats).

                //add the submitter email, the modified by email, and also the rest in the "emails" column
                addEmail(createdByUserEmail);
                addEmail(modifiedByEmail);
                countEmailsAndPut(notifyEmails, createdByUserEmail);
            }
        }

    }

    @Override
    public String getCategory()
    {
        return ModuleLoader.getInstance().getModule(WNPRC_VirologyModule.class).getName();
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

    public String getMessageBodyHTML(String recipientName, Integer count)
    {

        final StringBuilder msg = new StringBuilder();
        msg.append("<p>Hello " +
                recipientName +
                ",</p>");
        msg.append("<p>Good news - Virology Services has completed viral load testing on " +
                count +
                " sample(s) you either submitted or were added to as part of a notify list. " +
                "The results can be found online, by using the following " +
                "<a href=\"" +
                emailProps.get("portalURL") +
                "\">link</a>.</p>");
        msg.append("<p>Below is a summary of the experiment:</p>");

        msg.append("<p><table><tbody>" +
                "<tr>" +
                "<td>Experiment #:</td>" + "<td>" + experimentNumber.toString() + "</td>" +
                "</tr>" +
                "<tr>" +
                "<td>Positive Control " + positiveControl.toString()  + ":</td>" + "<td>" + vlPositiveControl + " copies/ml</td>" +
                "</tr>" +
                "<tr>" +
                "<td>AVG Positive Control " + positiveControl  + ":</td>" + "<td>" + avgVLPositiveControl + " copies/ml</td>" +
                "</tr>" +
                "<tr>" +
                "<td>Efficiency:</td>" + "<td>" + efficiency.toString() + "</td>" +
                "</tr>" +
                "</tbody></table></p>"
                );

        msg.append("<p>Please feel free to contact " +
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

    @Override
    public String getMessageBodyHTML(Container c, User u)
    {
        return getMessageBodyHTML("overrideabove", 1);
    }

    public void sendManually (Container container)
    {
        Collection<UserPrincipal> subscribedRecipients = getRecipients(container);
        Iterator it =emailsAndCount.entrySet().iterator();
        //send a message for all subscribed users and for each "unique" user in a notify column / submitter column
        while (it.hasNext()){
            Map.Entry pair = (Map.Entry)it.next();
            String recipientEmail = (String) pair.getKey();
            Integer count = (Integer) pair.getValue();

            String recipientName = getUserFullName(recipientEmail);

            sendMessage(getEmailSubject(container),getMessageBodyHTML(recipientName, count), subscribedRecipients, recipientEmail,container);
        }

    }

    public Collection<UserPrincipal> getRecipients(Container container)
    {
        return NotificationService.get().getRecipients(this, container);
    }

    public void setRecipients(String emails)
    {
        this.notifyEmails = emails;
    }



    public void sendMessage(String subject, String bodyHtml, Collection<UserPrincipal> recipients, String recipient,Container container)
    {
        _log.info("ViralLoadNotification.java: sending viral sample queue update email...");
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

            emails.add(recipient);

            if (emails.size() == 0)
            {
                _log.warn("ViralLoadNotification.java: no emails, unable to send EHR trigger script email");
                return;
            }

            msg.setRecipients(Message.RecipientType.TO, StringUtils.join(emails, ","));
            msg.setEncodedHtmlContent(bodyHtml);

            MailHelper.send(msg, currentUser, container);
        }
        catch (Exception e)
        {
            _log.error("ViralLoadNotification.java: unable to send email from EHR trigger script", e);
        }
    }

}
