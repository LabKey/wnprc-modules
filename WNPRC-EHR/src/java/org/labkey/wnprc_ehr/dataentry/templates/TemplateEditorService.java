package org.labkey.wnprc_ehr.dataentry.templates;

import org.labkey.api.data.Container;
import org.labkey.api.security.User;
import org.labkey.dbutils.api.exception.MissingPermissionsException;

/**
 * Created by jon on 5/23/17.
 */
public class TemplateEditorService extends AbstractTemplateService {
    public TemplateEditorService(User user, Container container) throws MissingPermissionsException {
        super(user, container);
    }

    @Override
    boolean allowedToDelete(String templateId) {
        return false;
    }

    @Override
    protected boolean allowedToEdit(String templateId) {
        return false;
    }
}
