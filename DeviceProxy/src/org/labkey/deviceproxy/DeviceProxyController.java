package org.labkey.deviceproxy;

import org.json.JSONObject;
import org.labkey.api.action.MutatingApiAction;
import org.labkey.api.action.ReadOnlyApiAction;
import org.labkey.api.action.SimpleViewAction;
import org.labkey.api.action.SpringActionController;
import org.labkey.api.security.RequiresLogin;
import org.labkey.api.security.RequiresNoPermission;
import org.labkey.api.security.RequiresPermission;
import org.labkey.api.security.RequiresSiteAdmin;
import org.labkey.api.security.permissions.ReadPermission;
import org.labkey.api.view.JspView;
import org.labkey.api.view.NavTree;
import org.labkey.apikey.api.ApiKey;
import org.labkey.deviceproxy.service.DeviceProxyService;
import org.springframework.validation.BindException;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import java.io.BufferedReader;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

public class DeviceProxyController extends SpringActionController {
    private static final DefaultActionResolver _actionResolver = new DefaultActionResolver(DeviceProxyController.class);
    public static final String NAME = "deviceproxy";

    public DeviceProxyController()
    {
        setActionResolver(_actionResolver);
    }

    @RequiresPermission(ReadPermission.class)
    public class BeginAction extends SimpleViewAction {
        public ModelAndView getView(Object o, BindException errors) throws Exception {
            return new JspView("/org/labkey/deviceproxy/view/hello.jsp");
        }

        public NavTree appendNavTrail(NavTree root)
        {
            return root;
        }
    }

    public static class DeviceForm {
        private String publicKey;

        public void setPublicKey(String key) {
            this.publicKey = key;
        }

        public String getPublicKey() {
            return this.publicKey;
        }
    }

    public static class RequestLeaseForm extends DeviceForm {
        private String name;
        private String description;

        public void setName(String name) {
            this.name = name;
        }

        public String getName() {
            return this.name;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getDescription() {
            return this.description;
        }
    }

    private static String getBody(HttpServletRequest request) {
        StringBuffer jb = new StringBuffer();
        String line = null;
        try {
            BufferedReader reader = request.getReader();
            while ((line = reader.readLine()) != null)
                jb.append(line);
        } catch (Exception e) { /*report an error*/ }

        return jb.toString();
    }

    @RequiresNoPermission
    public class RequestLeaseAction extends MutatingApiAction<RequestLeaseForm>
    {
        @Override
        public Object execute(RequestLeaseForm form, BindException errors) throws Exception {
            DeviceProxyService.get().requestLease(
                    form.getPublicKey(),
                    form.getName(),
                    form.getDescription()
            );

            return new JSONObject();
        }
    }

    public static class LeaseForm extends DeviceForm {
        private Date startDate;

        public LocalDateTime getStartDate() {
            return LocalDateTime.ofInstant(startDate.toInstant(), ZoneId.systemDefault());
        }

        public void setStartDate(Date startDate) {
            this.startDate = startDate;
        }
    }

    @RequiresSiteAdmin
    public class ApproveLeaseAction extends MutatingApiAction<LeaseForm> {
        @Override
        public Object execute(LeaseForm form, BindException errors) throws Exception {
            DeviceProxyService.get().approveLease(form.getPublicKey(), getUser());

            return new JSONObject();
        }
    }

    @RequiresSiteAdmin
    public class RevokeLeaseAction extends MutatingApiAction<LeaseForm> {
        @Override
        public Object execute(LeaseForm form, BindException errors) throws Exception {
            DeviceProxyService.get().revokeLease(form.getPublicKey(), form.getStartDate(), getUser());
            return new JSONObject();
        }
    }

    public static class RequestApiKeyForm extends DeviceForm {
        private String cardnumber;
        private String pin;

        public void setCardnumber(String cardnumber) {
            this.cardnumber = cardnumber;
        }

        public String getCardnumber() {
            return this.cardnumber;
        }

        public void setPin(String pin) {
            this.pin = pin;
        }

        public String getPin() {
            return pin;
        }
    }

    @RequiresNoPermission
    public class RequestApiKeyAction extends ReadOnlyApiAction<RequestApiKeyForm> {
        @Override
        public Object execute(RequestApiKeyForm form, BindException errors) throws Exception {
            ApiKey key = DeviceProxyService.get().requestApiKey(form.getPublicKey(), form.getCardnumber(), form.getPin());

            JSONObject response = new JSONObject();
            response.put("key", key != null ? key.getKey() : null);

            return response;
        }
    }

    @RequiresLogin
    public class EnrollUserAction extends MutatingApiAction<RequestApiKeyForm> {
        @Override
        public Object execute(RequestApiKeyForm form, BindException errors) throws Exception {
            DeviceProxyService.get().enroll(getUser(), form.getCardnumber(), form.getPin());
            return new JSONObject();
        }
    }
}