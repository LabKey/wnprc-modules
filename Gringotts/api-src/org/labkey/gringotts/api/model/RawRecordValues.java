package org.labkey.gringotts.api.model;

import org.apache.commons.collections15.map.CaseInsensitiveMap;
import org.joda.time.DateTime;

/**
 * Created by jon on 11/4/16.
 */
public class RawRecordValues {
    public final int version;

    public final CaseInsensitiveMap<String>   textValues = new CaseInsensitiveMap<>();
    public final CaseInsensitiveMap<DateTime> dateValues = new CaseInsensitiveMap<>();
    public final CaseInsensitiveMap<Integer>  intValues  = new CaseInsensitiveMap<>();

    public RawRecordValues(int version) {
        this.version = version;
    }
}
