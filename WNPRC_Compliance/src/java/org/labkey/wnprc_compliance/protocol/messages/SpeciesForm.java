package org.labkey.wnprc_compliance.protocol.messages;

import com.github.jonathonrichardson.java2ts.annotation.SerializeToTS;
import org.labkey.wnprc_compliance.lookups.SpeciesClass;

/**
 * Created by Jon on 4/2/2017.
 */
@SerializeToTS
public class SpeciesForm {
    public SpeciesClass speciesClass;
    public Integer maxNumberOfAnimals;
}
