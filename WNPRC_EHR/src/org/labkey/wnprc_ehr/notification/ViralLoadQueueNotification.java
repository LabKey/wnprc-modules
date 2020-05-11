package org.labkey.wnprc_ehr.notification;

import org.apache.commons.lang3.StringUtils;
import org.labkey.api.data.CompareType;
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
import java.util.Arrays;
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
import static org.labkey.ehr.pipeline.GeneticCalculationsJob.getContainer;

public class ViralLoadQueueNotification extends AbstractEHRNotification
{
    public Integer rowId;
    public String[] rowIds;
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
    public Map<Integer, List<String>> emails = new HashMap<Integer,List<String>>();
    public Map<String, Integer> recordCount = new HashMap<>();
    public Integer experimentNumber;

    public ViralLoadQueueNotification(Module owner)
    {
        super(owner);
    }

    public ViralLoadQueueNotification(Module owner, String [] rowids, User currentuser, Container c, String hostname, Integer number) throws SQLException
    {
        super(owner);
        rowIds = rowids;
        currentUser = currentuser;
        hostName = hostname;
        container = c;
        experimentNumber = number;
        this.setUp();
    }

    public List<String> getEmailArray(String emails)
    {
        List<String> emailList = new ArrayList<>();
        if (emails != null){
            //we should split by comma, semicolon, or new line
            String[] emailArray = notifyEmails.split(";|,|\n|\r\n|\r");
            for (String e : emailArray)
            {
                e = e.trim();
                emailList.add(e);
            }
        }
        return emailList;
    }

    public void setUp() throws SQLException
    {

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
        String animalid = null;
        String notifyEmails = null;
        Integer modifiedBy = null;

        // Execute the query
        //could have a sumbmitter -> modifiedBy -> NotifyList<String>
        try (Results rs = viralLoadQuery.select(columns, filter))
        {
            User createdByUser = null;
            User mod = null;
            while (rs.next()){
                createdByUserId = rs.getInt(FieldKey.fromString("CreatedBy"));
                animalid = rs.getString(FieldKey.fromString("Id"));
                notifyEmails = rs.getString(FieldKey.fromString("emails"));
                modifiedBy = rs.getInt(FieldKey.fromString("ModifiedBy"));

                if (createdByUserId != null)
                {
                    createdByUser = UserManager.getUser(createdByUserId);
                    if (createdByUser != null)
                    {
                        this.fullName = createdByUser.getFullName();
                        this.requestorEmail = createdByUser.getEmail();
                        this.animalId = animalid;
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
                emails.put(createdByUserId, getEmailArray(notifyEmails));
                if (recordCount.containsKey(createdByUser.getEmail()))
                {
                    Integer val = recordCount.get(createdByUser.getEmail());
                    val++;
                    recordCount.replace(createdByUser.getEmail(),val);
                }else {
                    recordCount.put(createdByUser.getEmail(),1);
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
                u.getFullName() +
                ",</p>");
        msg.append("<p>Good news - Virology Services has completed viral load testing on " +
                recordCount.get(u.getEmail()) +
                " sample(s) you submitted. " +
                "The results can be found in the Zika portal, and using the following " +
                "<a href=\"" +
                openResearchPortal +
                "&Dataset.experiment_number ~eq=" +
                experimentNumber.toString() +
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
        Collection<UserPrincipal> subscribedRecipients = getRecipients(container);
        Iterator it =emails.entrySet().iterator();
        while (it.hasNext()){
            List<String> extraRecipients = new ArrayList<String>();
            Map.Entry pair = (Map.Entry)it.next();
            User u = UserManager.getUser((Integer) pair.getKey());
            extraRecipients.add(u.getEmail());
            for (String s: (List<String>)pair.getValue()){
                extraRecipients.add(s);
            }
            it.remove(); // avoids a ConcurrentModificationException
            sendMessage(getEmailSubject(container),getMessageBodyHTML(container,u),subscribedRecipients, extraRecipients, user, u.getFullName());
        }

    }

    public Collection<UserPrincipal> getRecipients(Container container)
    {
        return NotificationService.get().getRecipients(this, container);
    }

    public void sendMessage(String subject, String bodyHtml, Collection<UserPrincipal> recipients, List<String> extraRecipients, User currentUser, String fullName)
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

            if (extraRecipients != null){
                for (String e : extraRecipients)
                {
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
