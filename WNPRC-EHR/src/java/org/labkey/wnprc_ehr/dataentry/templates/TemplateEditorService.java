package org.labkey.wnprc_ehr.dataentry.templates;

import org.labkey.api.data.Container;
import org.labkey.api.security.*;
import org.labkey.api.security.SecurityManager;
import org.labkey.dbutils.api.exception.MissingPermissionsException;
import org.labkey.wnprc_ehr.dataentry.templates.message.DataEntryTemplateInfo;

/**
 * Created by jon on 5/23/17.
 */
public class TemplateEditorService extends AbstractTemplateService {
    public TemplateEditorService(User user, Container container) throws MissingPermissionsException {
        super(user, container);
    }

    @Override
    boolean allowedToDelete(String templateId) throws Exception {
        if (isTemplateAdmin()) {
            return true;
        }

        DataEntryTemplateInfo template = _generateTemplateInfo(getTemplateWithMetaData(templateId));

        // If the record is public and we aren't an admin, we can't delete...
        if (template.ownerId == 0) {
            return false;
        }

        return template.ownerId == user.getUserId();
    }

    @Override
    protected boolean allowedToEdit(String templateId) throws Exception {
        if (isTemplateAdmin()) {
            return true;
        }

        DataEntryTemplateInfo template = _generateTemplateInfo(getTemplateWithMetaData(templateId));

        // If the record is public and we aren't an admin, we can't edit...
        if (template.ownerId == 0) {
            return false;
        }

        // If we are the owner, we can edit.
        if (template.ownerId == user.getUserId()) {
            return true;
        }

        // Check if the owner is a group.  Members of the group can edit the template.
        Group owningGroup = SecurityManager.getGroup(template.ownerId);
        if (owningGroup != null) {
            return user.isInGroup(template.ownerId);
        }

        return false;
    }
}
