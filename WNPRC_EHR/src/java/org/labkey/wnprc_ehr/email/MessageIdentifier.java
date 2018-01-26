package org.labkey.wnprc_ehr.email;

import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.search.SearchTerm;
import java.util.Date;

/**
 * Created by jon on 5/31/16.
 */
public class MessageIdentifier {
    final private String subject;
    final private String[] from;
    final private Date sent;

    public MessageIdentifier(String subject, String[] from, Date sent) {
        this.subject = subject;
        this.from = from;
        this.sent = sent;
    }

    public String getSubject() {
        return this.subject;
    }

    public String[] getFrom() {
        return this.from;
    }

    public Date getSent() {
        return this.sent;
    }

    public SearchTerm getSearchTerm() {
        return new SearchTerm() {
            @Override
            public boolean match(Message message) {
                boolean isMatch;
                try {
                    if (message.getSubject().equals(subject) && message.getSentDate().equals(sent)) {
                        String[] curMessageFrom = EmailMessageUtils.convertAddressArrayToStringArray(message.getFrom());

                        if (EmailMessageUtils.fromListsAreIdentical(from, curMessageFrom).booleanValue()) {
                            isMatch = true;
                        }
                        else {
                            isMatch = false;
                        }
                    }
                    else {
                        isMatch = false;
                    }
                }
                catch (MessagingException e) {
                    isMatch = false;
                }

                return isMatch;
            }
        };
    }
}
