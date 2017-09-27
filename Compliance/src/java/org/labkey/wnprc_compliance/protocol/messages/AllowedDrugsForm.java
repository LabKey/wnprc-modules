package org.labkey.wnprc_compliance.protocol.messages;

import com.github.jonathonrichardson.java2ts.annotation.SerializeToTS;
import org.labkey.wnprc_compliance.lookups.SpeciesClass;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by Jon on 4/2/2017.
 */
@SerializeToTS
public class AllowedDrugsForm {
    public String protocol_revision_id;
    public SpeciesClass speciesClass;

    public List<AllowedDrug> drugs = new ArrayList<>();
}
