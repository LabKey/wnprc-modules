package org.labkey.wnprc_compliance.protocol.messages;

import com.github.jonathonrichardson.java2ts.annotation.SerializeToTS;

import java.util.Date;

/**
 * Created by jon on 3/27/17.
 */
@SerializeToTS
public class ProtocolListItem {
    public String mostRecentId;
    public Date mostRecentApprovalDate;

    public String protocol_number;

    public HazardsForm hazards;
}
