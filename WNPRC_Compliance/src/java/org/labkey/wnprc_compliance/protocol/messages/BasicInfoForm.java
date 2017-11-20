package org.labkey.wnprc_compliance.protocol.messages;

import com.github.jonathonrichardson.java2ts.annotation.SerializeToTS;

import java.util.Date;

/**
 * Created by Jon on 3/24/2017.
 */
@SerializeToTS
public class BasicInfoForm {
    public String revision_id;

    public String protocol_name;
    public String principal_investigator;
    public String spi_primary;
    public String spi_secondary;
    public Date approval_date;
}
