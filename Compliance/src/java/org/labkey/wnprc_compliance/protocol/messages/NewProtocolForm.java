package org.labkey.wnprc_compliance.protocol.messages;

import com.github.jonathonrichardson.java2ts.annotation.SerializeToTS;

import java.util.Date;

/**
 * Created by Jon on 3/23/2017.
 */
@SerializeToTS
public class NewProtocolForm {
    public String id;
    public Date approval_date;
}
