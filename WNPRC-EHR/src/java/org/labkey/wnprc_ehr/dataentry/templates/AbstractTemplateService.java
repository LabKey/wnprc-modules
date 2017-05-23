package org.labkey.wnprc_ehr.dataentry.templates;

import org.labkey.api.data.Container;
import org.labkey.api.security.User;
import org.labkey.api.security.permissions.Permission;
import org.labkey.api.view.UnauthorizedException;
import org.labkey.dbutils.api.exception.MissingPermissionsException;
import org.labkey.wnprc_ehr.dataentry.templates.message.ManageTemplatesInfo;
import org.labkey.wnprc_ehr.service.dataentry.DataEntryService;
import sun.reflect.generics.reflectiveObjects.NotImplementedException;

/**
 * Created by jon on 5/23/17.
 */
public abstract class AbstractTemplateService extends DataEntryService {
    public AbstractTemplateService(User user, Container container, Class<? extends Permission> ...requiredPermissions) throws MissingPermissionsException {
        super(user, container, requiredPermissions);
    }

    abstract boolean allowedToDelete(String templateId);

    public void deleteTemplate(String templateId) {
        if (!allowedToDelete(templateId)) {
            throw new UnauthorizedException("You must be a Template Admin or the owner of a template to delete a template.");
        }

        throw new NotImplementedException();
    }

    abstract protected boolean allowedToEdit(String templateId);

    public void renameTemplate(String templateId, String newName) {
        if (!allowedToEdit(templateId)) {
            throw new UnauthorizedException("You must be a Template Admin, template owner, or a member of the owning group of a template to rename a template.");
        }

        throw new NotImplementedException();
    }

    public void setHiddenStatusForTemplate(String templateId, boolean shouldBeHidden) {
        if (!allowedToEdit(templateId)) {
            throw new UnauthorizedException("You must be a Template Admin, template owner, or a member of the owning group of a template to edit a template.");
        }

        throw new NotImplementedException();
    }

    public ManageTemplatesInfo getManageableTemplates() {
        throw new NotImplementedException();
    }
}
