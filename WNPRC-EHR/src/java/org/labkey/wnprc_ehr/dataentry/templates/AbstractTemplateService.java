package org.labkey.wnprc_ehr.dataentry.templates;

import org.json.JSONObject;
import org.labkey.api.data.Container;
import org.labkey.api.security.SecurityManager;
import org.labkey.api.security.User;
import org.labkey.api.security.permissions.Permission;
import org.labkey.api.view.UnauthorizedException;
import org.labkey.dbutils.api.SimpleQueryFactory;
import org.labkey.dbutils.api.exception.MissingPermissionsException;
import org.labkey.wnprc_ehr.dataentry.templates.message.DataEntryTemplateInfo;
import org.labkey.wnprc_ehr.dataentry.templates.message.ManageTemplatesInfo;
import org.labkey.wnprc_ehr.dataentry.templates.permission.TemplateAdminPermission;
import org.labkey.wnprc_ehr.service.dataentry.DataEntryService;
import sun.reflect.generics.reflectiveObjects.NotImplementedException;

import java.util.ArrayList;

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
        ManageTemplatesInfo returnInfo = new ManageTemplatesInfo();
        returnInfo.templates = new ArrayList<>();
        returnInfo.isAdmin = container.hasPermission(user, TemplateAdminPermission.class);

        SimpleQueryFactory queryFactory = new SimpleQueryFactory(user, container);

        for (JSONObject row : queryFactory.selectRows("ehr", "AllTemplates").toJSONObjectArray()) {
            DataEntryTemplateInfo info = new DataEntryTemplateInfo();

            info.entityid    = row.getString("entityid");
            info.title       = row.getString("title");
            info.ownerId     = row.optInt("owner_id", 0);
            info.ownerName   = row.getString("owner_name");
            info.formType    = row.getString("form_type");
            info.description = row.optString("description", "");
            info.isOwner     = row.getBoolean("is_owner");
            info.isPublic    = row.getBoolean("is_public");
            info.isInGroup   = row.getBoolean("is_in_group");
            info.createdBy   = row.optString("creator", "");

            returnInfo.templates.add(info);
        }

        return returnInfo;
    }
}
