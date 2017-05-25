package org.labkey.wnprc_ehr.dataentry.templates;

import org.json.JSONObject;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.DbScope;
import org.labkey.api.security.User;
import org.labkey.api.security.permissions.Permission;
import org.labkey.dbutils.api.SimpleQueryFactory;
import org.labkey.dbutils.api.SimpleQueryUpdater;
import org.labkey.dbutils.api.SimplerFilter;
import org.labkey.dbutils.api.exception.MissingPermissionsException;
import org.labkey.wnprc_ehr.dataentry.templates.message.DataEntryTemplateInfo;
import org.labkey.wnprc_ehr.dataentry.templates.message.ManageTemplatesInfo;
import org.labkey.wnprc_ehr.dataentry.templates.message.UpdateTemplateForm;
import org.labkey.wnprc_ehr.dataentry.templates.permission.TemplateAdminPermission;
import org.labkey.wnprc_ehr.service.dataentry.DataEntryService;

import java.util.ArrayList;

/**
 * Created by jon on 5/23/17.
 */
public abstract class AbstractTemplateService extends DataEntryService {
    public AbstractTemplateService(User user, Container container, Class<? extends Permission> ...requiredPermissions) throws MissingPermissionsException {
        super(user, container, requiredPermissions);
    }

    abstract boolean allowedToDelete(String templateId) throws Exception;

    public void deleteTemplate(String templateId) throws Exception {
        if (!allowedToDelete(templateId)) {
            throw new Exception("You must be a Template Admin or the owner of a template to delete a template.");
        }

        SimpleQueryFactory queryFactory = new SimpleQueryFactory(user, container);
        SimpleQueryUpdater templateUpdateService = new SimpleQueryUpdater(user, container, "ehr", "formtemplates");
        SimpleQueryUpdater templateRecordUpdateService = new SimpleQueryUpdater(user, container, "ehr", "formtemplaterecords");

        try (DbScope.Transaction transaction = getUpdateService("ehr", "formtemplates").getTableInfo().getSchema().getScope().ensureTransaction()) {
            // First, delete the records that reference the template
            JSONObject[] recordsToDelete = queryFactory.selectRows("ehr", "formtemplaterecords", new SimplerFilter("templateid", CompareType.EQUAL, templateId)).toJSONObjectArray();
            templateRecordUpdateService.delete(recordsToDelete);

            // Now, delete the template
            templateUpdateService.delete(getTemplate(templateId));

            transaction.commit();
        }
    }

    abstract protected boolean allowedToEdit(String templateId) throws Exception;

    protected JSONObject getTemplate(String id) throws Exception {
        SimpleQueryFactory queryFactory = new SimpleQueryFactory(user, container);
        JSONObject[] rows = queryFactory.selectRows("ehr", "formtemplates", new SimplerFilter("entityid", CompareType.EQUAL, id)).toJSONObjectArray();

        if (rows.length == 0) {
            throw new Exception("Template " + id + " does not exist.");
        }

        return rows[0];
    }

    public void updateTemplate(String templateId, UpdateTemplateForm form) throws Exception {
        if (!allowedToEdit(templateId)) {
            throw new Exception("You must be a Template Admin, template owner, or a member of the owning group of a template to rename a template.");
        }

        JSONObject template = getTemplate(templateId);
        template.put("title", form.title);
        template.put("description", form.description);
        template.put("userid", (form.owner == 0) ? null : form.owner);

        getUpdateService("ehr", "formtemplates").updateRow(template, "Updating Template Metadata");
    }

    static DataEntryTemplateInfo _generateTemplateInfo(JSONObject row) {
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

        return info;
    }

    public ManageTemplatesInfo getManageableTemplates() {
        ManageTemplatesInfo returnInfo = new ManageTemplatesInfo();
        returnInfo.templates = new ArrayList<>();
        returnInfo.isAdmin = isTemplateAdmin();

        SimpleQueryFactory queryFactory = new SimpleQueryFactory(user, container);

        for (JSONObject row : queryFactory.selectRows("ehr", "AllTemplates").toJSONObjectArray()) {
            returnInfo.templates.add(_generateTemplateInfo(row));
        }

        return returnInfo;
    }

    protected boolean isTemplateAdmin() {
        return container.hasPermission(user, TemplateAdminPermission.class);
    }
}
