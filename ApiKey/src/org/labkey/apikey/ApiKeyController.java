package org.labkey.apikey;

import org.json.JSONObject;
import org.labkey.api.action.ReadOnlyApiAction;
import org.labkey.api.action.SimpleViewAction;
import org.labkey.api.action.SpringActionController;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.security.RequiresNoPermission;
import org.labkey.api.security.RequiresPermission;
import org.labkey.api.security.permissions.ReadPermission;
import org.labkey.api.view.JspView;
import org.labkey.api.view.NavTree;
import org.labkey.apikey.api.ApiKey;
import org.labkey.apikey.api.ApiKeyService;
import org.labkey.apikey.api.JsonService;
import org.labkey.apikey.api.JsonServiceManager;
import org.labkey.apikey.api.exception.InvalidApiKey;
import org.springframework.validation.BindException;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;

public class ApiKeyController extends SpringActionController {
    private static final DefaultActionResolver _actionResolver = new DefaultActionResolver(ApiKeyController.class);
    public static final String NAME = "apikey";

    public ApiKeyController()
    {
        setActionResolver(_actionResolver);
    }

    @RequiresPermission(ReadPermission.class)
    public class BeginAction extends SimpleViewAction {
        public ModelAndView getView(Object o, BindException errors) throws Exception {
            return new JspView("/org/labkey/apikey/view/hello.jsp");
        }

        public NavTree appendNavTrail(NavTree root)
        {
            return root;
        }
    }

    @RequiresNoPermission
    public class ExecuteServiceAction extends ReadOnlyApiAction<Void>
    {
        @Override
        public Object execute(Void v, BindException errors) throws Exception {
            HttpServletRequest req = getViewContext().getRequest();

            String moduleName   = req.getHeader("ModuleName");
            String serviceName  = req.getHeader("ServiceName");
            String apiKeyString = req.getHeader("API-Key");

            Module module = ModuleLoader.getInstance().getModule(moduleName);

            if (module == null) {
                throw new Exception(moduleName + " is not a valid module name");
            }

            JSONObject jsonObject = new JSONObject(req.getParameter("jsonText"));

            // Set the user, so anything assuming a ViewContext will be fine,
            // *cough* EHR trigger scripts *cough*
            ApiKey key = ApiKeyService.get().loadKey(apiKeyString);
            if (key != null) {
                getViewContext().setUser(key.getUser());
            }

            return JsonServiceManager.get().executeService(module, getContainer(), serviceName, apiKeyString, jsonObject);
        }
    }

    @RequiresNoPermission
    public class GetKeyInfoAction extends ReadOnlyApiAction<Void> {
        @Override
        public Object execute(Void v, BindException errors) throws Exception {
            HttpServletRequest req = getViewContext().getRequest();

            String apiKeyString = req.getHeader("API-Key");
            ApiKey key = ApiKeyService.get().loadKey(apiKeyString);

            if (key == null) {
                throw new InvalidApiKey("Invalid Api Key");
            }

            JSONObject keyInfo = new JSONObject();

            JSONObject userInfo = new JSONObject();
            userInfo.put("userid", key.getUser().getUserId());
            userInfo.put("displayName", key.getUser().getDisplayName(null));
            keyInfo.put("user", userInfo);

            keyInfo.put("valid", key.isValid());
            keyInfo.put("superkey", key.isSuperKey());

            JSONObject allowedModules = new JSONObject();
            for(Module module : key.getAllowedServices().keySet()) {
                JSONObject allowedServices = new JSONObject();

                for(JsonService service : key.getAllowedServices().get(module)) {
                    allowedServices.put(service.getName(), true);
                }

                allowedModules.put(module.getName(), allowedServices);
            }

            return keyInfo;
        }
    }
}
