package org.labkey.wnprc_ehr.email;

import org.json.old.JSONObject;

import javax.mail.BodyPart;
import java.io.InputStream;

/**
 * Created by jon on 5/26/16.
 */
public class MessageHandler {
    public JSONObject handleAttachment(String filename, InputStream inputStream, BodyPart attachment) {
        JSONObject attachmentJSON = new JSONObject();
        return attachmentJSON;
    }
}
