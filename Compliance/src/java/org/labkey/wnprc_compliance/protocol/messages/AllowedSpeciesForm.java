package org.labkey.wnprc_compliance.protocol.messages;

import com.github.jonathonrichardson.java2ts.annotation.SerializeToTS;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by Jon on 4/2/2017.
 */
@SerializeToTS
public class AllowedSpeciesForm {
    public List<SpeciesForm> species = new ArrayList<>();
}
