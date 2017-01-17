package org.labkey.googledrive;

import org.json.JSONObject;
import org.labkey.api.action.ApiAction;
import org.labkey.api.action.SimpleViewAction;
import org.labkey.api.action.SpringActionController;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.security.ActionNames;
import org.labkey.api.security.RequiresPermission;
import org.labkey.api.security.RequiresSiteAdmin;
import org.labkey.api.security.permissions.ReadPermission;
import org.labkey.api.view.JspView;
import org.labkey.api.view.NavTree;
import org.labkey.googledrive.api.GoogleDriveService;
import org.labkey.googledrive.api.ServiceAccountForm;
import org.labkey.webutils.api.action.SimpleJspReportAction;
import org.springframework.validation.BindException;
import org.springframework.web.servlet.ModelAndView;

public class GoogleDriveController extends SpringActionController {
    private static final DefaultActionResolver _actionResolver = new DefaultActionResolver(GoogleDriveController.class);
    public static final String NAME = "googledrive";

    public GoogleDriveController() {
        setActionResolver(_actionResolver);

    }

    @RequiresPermission(ReadPermission.class)
    public class BeginAction extends SimpleViewAction {
        public ModelAndView getView(Object o, BindException errors) throws Exception {
            return new JspView("/org/labkey/googledrive/view/begin.jsp");
        }

        public NavTree appendNavTrail(NavTree root)
        {
            return root;
        }
    }

    public abstract class GoogleDrivePageAction extends SimpleJspReportAction {
        @Override
        public Module getModule() {
            return ModuleLoader.getInstance().getModule(GoogleDriveModule.class);
        }
    }

    @RequiresSiteAdmin()
    @ActionNames("ManageAccounts")
    public class manageAccounts extends GoogleDrivePageAction {
        @Override
        public String getPathToJsp() {
            return "view/ManageAccounts.jsp";
        }

        @Override
        public String getTitle() {
            return "Manage Accounts";
        }
    }

    @RequiresSiteAdmin()
    @ActionNames("RegisterAccountPage")
    public class AddAcountPage extends GoogleDrivePageAction {
        @Override
        public String getPathToJsp() {
            return "view/RegisterServiceAccount.jsp";
        }

        @Override
        public String getTitle() {
            return "Add Account";
        }
    }

    public static class RegisterServiceAccountForm extends ServiceAccountForm {
        public String displayName;

        public String getDisplayName() {
            return displayName;
        }

        public void setDisplayName(String displayName) {
            this.displayName = displayName;
        }
    }

    @RequiresSiteAdmin()
    @ActionNames("registerAccount")
    public class AddAcount extends ApiAction<RegisterServiceAccountForm> {
        @Override
        public Object execute(RegisterServiceAccountForm form, BindException errors) throws Exception {
            String id = GoogleDriveService.get().registerServiceAccount(form.getDisplayName(), form, getUser());
            JSONObject json = new JSONObject();
            json.put("id", id);
            return json;
        }
    }

    public static class AccountForm {
        public String id;

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }
    }

    public static class UpdateDisplayNameForm extends AccountForm {
        public String displayName;

        public String getDisplayName() {
            return displayName;
        }

        public void setDisplayName(String displayName) {
            this.displayName = displayName;
        }
    }

    @RequiresSiteAdmin()
    @ActionNames("updateAccountDisplayName")
    public class UpdateAccountDisplayName extends ApiAction<UpdateDisplayNameForm> {
        @Override
        public Object execute(UpdateDisplayNameForm form, BindException errors) throws Exception {
            GoogleDriveService.get().updateDisplayNameForAccount(form.getId(), form.getDisplayName());
            return new JSONObject();
        }
    }

    @RequiresSiteAdmin()
    @ActionNames("deleteAccount")
    public class DeleteAccount extends ApiAction<AccountForm> {
        @Override
        public Object execute(AccountForm form, BindException errors) throws Exception {
            GoogleDriveService.get().deleteAccount(form.getId());
            return new JSONObject();
        }
    }
}