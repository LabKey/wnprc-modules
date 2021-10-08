package org.labkey.wnprc_ehr.email;

import org.apache.commons.lang3.StringUtils;
import org.json.JSONArray;
import org.json.JSONObject;

import javax.mail.Address;
import javax.mail.BodyPart;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Multipart;
import javax.mail.Part;
import java.io.IOException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * Created by jon on 5/26/16.
 */
public class EmailMessageUtils {
    public static final String VIROLOGY_DATE_FORMAT = "yyyy/MM/dd kk:mm:ss";

    static public JSONObject convertMessageToJSON(Message message, MessageHandler messageHandler) {
        // Define the header information for our message JSON object.
        JSONObject messageJSON = new JSONObject();
        messageJSON.put("messageNumber", message.getMessageNumber());

        // Make an object to store errors that might occur in retrieval
        JSONArray errors = new JSONArray();
        messageJSON.put("errors", errors);

        DateFormat sdf = new SimpleDateFormat(VIROLOGY_DATE_FORMAT, Locale.ENGLISH);
        Date sent = null;
        try {
            sent = message.getSentDate();
        }
        catch (MessagingException e) {
            errors.put("Failed to retrieve the sent time.");
        }
        messageJSON.put("sent", sdf.format(sent));

        Address[] from = null;
        try {
            from = message.getFrom();
        }
        catch (MessagingException e) {
            errors.put("Failed to retrieve the sender of email.");
        }
        messageJSON.put("from", from);

        String subject = "";
        try {
            subject = message.getSubject();
        }
        catch (MessagingException e) {
            errors.put("Failed to retrieve subject of email.");
        }
        messageJSON.put("subject", subject);

        String contentType = "";
        try {
            contentType = message.getContentType();
        }
        catch (MessagingException e) {
            // Ignore the error.
        }

        Object messageContent = null;
        try {
            messageContent = message.getContent();
        }
        catch (IOException|MessagingException e) {
            errors.put("Failed to read message content.");
        }

        // Create an array to hold any attachments
        JSONArray attachments = new JSONArray();
        messageJSON.put("attachments", attachments);

        // Create an array to hold the content parts.  Oftentimes, this might include one HTML part and
        // another plaintext part, but it is hard to tell.  Sometimes there is only one plain text part.
        JSONArray contentParts = new JSONArray();
        messageJSON.put("contentParts", contentParts);

        // If the content type is plain text, add that to our content parts list.
        if (Pattern.compile("^text/plain").matcher(contentType).find()) {
            JSONObject contentPart = new JSONObject();
            contentPart.put("contentType", "text/plain");
            contentPart.put("content",     messageContent);

            // Add the content part to the container
            contentParts.put(contentPart);
        }
        // Otherwise, if we're a multipart message, we'll need to some iterating.
        else if (Pattern.compile("^multipart").matcher(contentType).find()) {
            try {
                Multipart multipart = (Multipart) messageContent;

                for (int i = 0; i < multipart.getCount(); i++) {
                    BodyPart bodyPart = multipart.getBodyPart(i);

                    // If this part is an attachment, add it to the list of attachments
                    if (Part.ATTACHMENT.equalsIgnoreCase(bodyPart.getDisposition()) && StringUtils.isNotBlank(bodyPart.getFileName())) {
                        String filename = bodyPart.getFileName();
                        JSONObject attachment = messageHandler.handleAttachment(filename, bodyPart.getInputStream(), bodyPart);

                        attachment.put("filename", filename);
                        attachment.put("size",     bodyPart.getSize());

                        attachments.put(attachment);
                    }
                    // Otherwise, assume that it's content, so add it to the content parts
                    else {
                        JSONObject contentPart = new JSONObject();
                        contentPart.put("type",        bodyPart.getContentType());
                        contentPart.put("disposition", bodyPart.getDisposition());
                        contentPart.put("contentType", bodyPart.getContentType());
                        contentPart.put("content",     bodyPart.getContent());

                        contentParts.put(contentPart);
                    }
                }
            }
            catch (IOException|MessagingException e) {
                JSONObject contentPart = new JSONObject();
                contentPart.put("errorMessage", "Failed to properly parse multipart email contents");
            }
        }

        return messageJSON;
    }

    static public Boolean fromListsAreIdentical(String[] from1, String[] from2) {
        // Make the first set
        Set<String> fromSet1 = new HashSet<>();
        for (String from : from1) {
            fromSet1.add(from);
        }

        // Make the second set
        Set<String> fromSet2 = new HashSet<>();
        for (String from : from2) {
            fromSet2.add(from);
        }

        return fromSet1.equals(fromSet2);
    }

    static public String[] convertAddressArrayToStringArray(Address[] addresses) {
        List<String> addressList = new ArrayList<>();
        for (Address address : addresses) {
            addressList.add(address.toString());
        }

        String[] addressStringArray = new String[addressList.size()];

        return addressList.toArray(addressStringArray);
    }
}
