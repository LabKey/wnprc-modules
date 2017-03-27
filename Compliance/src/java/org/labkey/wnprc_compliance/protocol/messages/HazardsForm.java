package org.labkey.wnprc_compliance.protocol.messages;

import com.github.jonathonrichardson.java2ts.annotation.SerializeToTS;

/**
 * Created by jon on 3/27/17.
 */
@SerializeToTS
public class HazardsForm {
    public boolean biological;
    public boolean chemical;
    public boolean physical;
    public boolean other;

    public String other_notes;
}
