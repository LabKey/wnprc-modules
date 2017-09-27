package org.labkey.wnprc_compliance.protocol.messages;

import com.github.jonathonrichardson.java2ts.annotation.SerializeToTS;

/**
 * Created by Jon on 3/24/2017.
 */
@SerializeToTS
public class NewProtocolResponse {
    public String protocol_id;
    public String revision_id;
}
