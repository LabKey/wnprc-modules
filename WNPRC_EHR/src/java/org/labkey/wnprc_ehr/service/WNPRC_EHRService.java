package org.labkey.wnprc_ehr.service;

import org.labkey.api.data.Container;
import org.labkey.api.security.User;
import org.labkey.dbutils.api.exception.MissingPermissionsException;
import org.labkey.wnprc_ehr.service.dataentry.BehaviorDataEntryService;

/**
 * Created by jon on 10/28/16.
 */
public class WNPRC_EHRService {
    static private WNPRC_EHRService _service;

    static public WNPRC_EHRService get() {
        return _service;
    }

    static public void set(WNPRC_EHRService service) {
        _service = service;
    }

    public BehaviorDataEntryService getBehaviorDataEntryService(User user, Container container) throws MissingPermissionsException {
        return new BehaviorDataEntryService(user, container);
    }
}
