package org.labkey.wnprc_ehr.dataentry.templates;

import org.labkey.api.data.Container;
import org.labkey.api.security.User;
import org.labkey.dbutils.api.exception.MissingPermissionsException;
import org.labkey.wnprc_ehr.dataentry.templates.permission.TemplateAdminPermission;

/**
 * Created by jon on 5/23/17.
 */
public class TemplateAdminService extends AbstractTemplateService {
    public TemplateAdminService(User user, Container container) throws MissingPermissionsException {
        super(user, container, TemplateAdminPermission.class);
    }

    @Override
    boolean allowedToDelete(String templateId) {
        return true;
    }

    @Override
    protected boolean allowedToEdit(String templateId) {
        return true;
    }
}
