package org.labkey.gringotts.api.model;

import org.apache.commons.collections4.map.CaseInsensitiveMap;

import java.util.Map;
import java.util.UUID;

/**
 * Created by jon on 10/21/16.
 */
public class RecordOriginalValues {
    // This maps the classes in the hierarchy to their record ids
    private Map<Class, UUID> idMap;

    //
    private Map<Class, CaseInsensitiveMap<String, String>> stringValues;
}
