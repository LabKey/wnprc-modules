package org.labkey.wnprc_ehr.dataentry.templates;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.json.JSONObject;
import org.labkey.api.action.ApiAction;
import org.labkey.api.action.SpringActionController;
import org.labkey.api.security.ActionNames;
import org.labkey.api.security.RequiresLogin;
import org.labkey.dbutils.api.exception.MissingPermissionsException;
import org.labkey.webutils.api.action.LegacyJspPageAction;
import org.labkey.webutils.api.action.annotation.JspPath;
import org.labkey.webutils.api.action.annotation.PageTitle;
import org.labkey.wnprc_ehr.dataentry.templates.permission.TemplateAdminPermission;
import org.springframework.validation.BindException;

/**
 * Created by jon on 5/23/17.
 */
public class TemplateController extends SpringActionController {
    public static final String NAME = "wnprc_ehr-templates";

    private static final DefaultActionResolver _actionResolver = new DefaultActionResolver(TemplateController.class);

    public TemplateController() {
        setActionResolver(_actionResolver);
    }

    public abstract class TemplatePageAction extends LegacyJspPageAction {
        @Override
        public Class getBaseClass() {
            return TemplateController.class;
        }
    }

    public abstract class TemplateApiAction<FORM> extends ApiAction<FORM> {
        protected AbstractTemplateService getService() throws MissingPermissionsException {
            if (getContainer().hasPermission(getUser(), TemplateAdminPermission.class)) {
                return new TemplateAdminService(getUser(), getContainer());
            }
            else {
                return new TemplateEditorService(getUser(), getContainer());
            }
        }

        protected String getTemplateId() {
            return getViewContext().getRequest().getParameter("templateid");
        }
    }

    public static class NullForm {}

    @ActionNames("deleteTemplate")
    @RequiresLogin()
    public class DeleteTemplateAPI extends TemplateApiAction<NullForm> {
        @Override
        public Object execute(NullForm nullForm, BindException e) throws Exception {
            getService().deleteTemplate(getTemplateId());
            return new JSONObject();
        }
    }

    @ActionNames("renameTemplate")
    @RequiresLogin()
    public class RenameTemplateAPI extends TemplateApiAction<NullForm> {
        @Override
        public Object execute(NullForm nullForm, BindException e) throws Exception {
            getService().renameTemplate(getTemplateId(), getViewContext().getRequest().getParameter("newname"));
            return new JSONObject();
        }
    }

    @ActionNames("getManageableTemplates")
    @RequiresLogin()
    public class GetManageableTemplatesAPI extends TemplateApiAction<NullForm> {
        @Override
        public Object execute(NullForm nullForm, BindException e) throws Exception {
            ObjectMapper mapper = new ObjectMapper();
            mapper.setVisibilityChecker(
                    mapper.getSerializationConfig()
                            .getDefaultVisibilityChecker()
                            .withGetterVisibility(JsonAutoDetect.Visibility.NONE)
            );

            return new JSONObject(mapper.writeValueAsString(getService().getManageableTemplates()));
        }
    }

    @ActionNames("manageTemplates")
    @JspPath("view/ManageTemplates.jsp")
    @PageTitle("Manage Templates")
    @RequiresLogin()
    public class ManageTemplatesPage extends TemplatePageAction {}
}
