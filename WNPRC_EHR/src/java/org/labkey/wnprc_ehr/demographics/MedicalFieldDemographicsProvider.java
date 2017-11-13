package org.labkey.wnprc_ehr.demographics;

import org.labkey.api.ehr.demographics.AbstractDemographicsProvider;
import org.labkey.api.module.Module;
import org.labkey.api.query.FieldKey;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

/**
 * Created by jon on 9/20/16.
 */
public class MedicalFieldDemographicsProvider extends AbstractDemographicsProvider {
    public MedicalFieldDemographicsProvider(Module owner) {
        super(owner, "study", "demographics");
    }

    @Override
    protected Collection<FieldKey> getFieldKeys() {
        Set<FieldKey> keys = new HashSet<>();

        keys.add(FieldKey.fromString("medical"));

        return keys;
    }

    @Override
    public String getName()
    {
        return "MedicalFieldDemographicsProvider";
    }
}
