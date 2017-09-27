package org.labkey.wnprc_compliance.protocol.messages;

import com.github.jonathonrichardson.java2ts.annotation.SerializeToTS;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by jon on 4/19/17.
 */
@SerializeToTS
public class ProtocolRevisionsForm {
    public String name;
    public List<ProtocolRevisionForm> revisions = new ArrayList();
}
