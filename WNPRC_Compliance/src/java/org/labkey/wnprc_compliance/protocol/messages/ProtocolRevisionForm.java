package org.labkey.wnprc_compliance.protocol.messages;

import com.github.jonathonrichardson.java2ts.annotation.SerializeToTS;

import java.util.Date;

/**
 * Created by jon on 4/19/17.
 */
@SerializeToTS
public class ProtocolRevisionForm {
    public String revision_id;
    public Date approval_date;
}
