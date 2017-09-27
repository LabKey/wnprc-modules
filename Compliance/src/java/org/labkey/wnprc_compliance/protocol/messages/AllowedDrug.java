package org.labkey.wnprc_compliance.protocol.messages;

import com.github.jonathonrichardson.java2ts.annotation.SerializeToTS;
import org.labkey.wnprc_compliance.lookups.SubstanceType;

/**
 * Created by Jon on 4/2/2017.
 */
@SerializeToTS
public class AllowedDrug {
    public String id;

    public String snomed_code;
    public SubstanceType substanceType;

    public Double dose_amount;
    public String dose_units;
    public String frequency_description;
}
