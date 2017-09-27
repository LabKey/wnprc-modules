package org.labkey.api.ehr.dataentry;

import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.Logger;
import org.json.JSONObject;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.ldk.notification.NotificationService;
import org.labkey.api.security.*;
import org.labkey.api.security.SecurityManager;
import org.labkey.api.util.MailHelper;
import org.labkey.dbutils.api.SimpleQueryFactory;
import org.labkey.dbutils.api.SimplerFilter;

import javax.mail.Address;
import javax.mail.Message;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Created by jon on 4/4/17.
 */
public class RequestHelper {
    protected static final Logger log = Logger.getLogger(RequestHelper.class);

    private String _requestId;
    private JSONObject _row;
    private User _user;
    private Container _container;

    public RequestHelper(String requestId, User user, Container container) {
        this._requestId = requestId;
        this._user = user;
        this._container = container;

        _updateRow();
    }

    private void _updateRow() {
        SimplerFilter requestIdFilter = new SimplerFilter("requestid", CompareType.EQUAL, _requestId);
        JSONObject[] rows = _getQueryFactory().selectRows("ehr", "requests", requestIdFilter).toJSONObjectArray();

        if (rows.length == 0) {
            // TODO: throw a better error.
            throw new RuntimeException("Request not found");
        }

        if (rows.length > 1) {
            throw new RuntimeException("Multiple rows returned with key of " + _requestId);
        }

        this._row = rows[0];
    }

    private SimpleQueryFactory _getQueryFactory() {
        return new SimpleQueryFactory(_user, _container);
    }

    public void sendEmail(String subject, String htmlContents) {
        List<String> emails = getRecipients();

        if (emails.size() == 0) {
            log.info(String.format("No contacts set for request %s, so no email will be sent", _requestId));
        }

        try {
            MailHelper.MultipartMessage msg = MailHelper.createMultipartMessage();

            // Set from and to
            msg.setFrom(NotificationService.get().getReturnEmail(_container));
            msg.setRecipients(Message.RecipientType.TO, StringUtils.join(emails, ","));

            // Set subject and body
            msg.setSubject(subject);
            msg.setEncodedHtmlContent(htmlContents);

            MailHelper.send(msg, _user, _container);
        }
        catch (Exception e) {
            log.error("Failed to send mail: ", e);
        }
    }

    private List<String> getRecipients() {
        List<String> recipients = new ArrayList<>();

        for (String fieldName : Arrays.asList("notify1", "notify2", "notify3")) {
            Integer userid = null;

            if (_row.has(fieldName) && !_row.isNull(fieldName)) {
                userid = _row.getInt(fieldName);
            }

            if (userid != null) {
                UserPrincipal notifiedUser = UserManager.getUser(userid);
                if (notifiedUser == null) {
                    notifiedUser = SecurityManager.getGroup(userid);
                }

                try {
                    List<Address> addresses = NotificationService.get().getEmailsForPrincipal(notifiedUser);

                    if (addresses != null) {
                        recipients.add(addresses.get(0).toString());
                    }
                    else {
                        log.info(String.format("No email address found for %s (%s), so they will not receive the notification.", notifiedUser.getName(), notifiedUser.getUserId()));
                    }
                } catch (ValidEmail.InvalidEmailException e) {
                    log.error("Could not get emails for UserPrincipal " + notifiedUser.getUserId() + " of type " + notifiedUser.getType());
                }
            }
        }

        return recipients;
    }
}
