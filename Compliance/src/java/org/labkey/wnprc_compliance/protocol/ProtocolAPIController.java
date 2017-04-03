package org.labkey.wnprc_compliance.protocol;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.http.HttpRequest;
import org.json.JSONObject;
import org.labkey.api.action.ApiAction;
import org.labkey.api.action.Marshal;
import org.labkey.api.action.Marshaller;
import org.labkey.api.action.SpringActionController;
import org.labkey.api.security.ActionNames;
import org.labkey.api.security.CSRF;
import org.labkey.api.security.RequiresPermission;
import org.labkey.webutils.WebUtilsController;
import org.labkey.wnprc_compliance.protocol.messages.BasicInfoForm;
import org.labkey.wnprc_compliance.protocol.messages.HazardsForm;
import org.labkey.wnprc_compliance.protocol.messages.NewProtocolForm;
import org.labkey.wnprc_compliance.protocol.messages.NewProtocolResponse;
import org.labkey.wnprc_compliance.security.ComplianceAdminPermission;
import org.springframework.validation.BindException;

import javax.servlet.http.HttpServletRequest;

/**
 * Created by Jon on 3/23/2017.
 */
public class ProtocolAPIController extends SpringActionController {
    private static final SpringActionController.DefaultActionResolver _actionResolver = new SpringActionController.DefaultActionResolver(ProtocolAPIController.class);
    public static final String NAME = "wnprc_compliance-protocol-api";

    public ProtocolAPIController() {
        setActionResolver(_actionResolver);
    }

    public abstract class ProtocolAPIAction<FORM> extends ApiAction<FORM> {
        public ProtocolService getService() {
            return new ProtocolService(getUser(), getContainer());
        }

        public String getRevisionId() {
            return getViewContext().getRequest().getParameter(URLQueryParameters.REVISION_ID.getQueryKey());
        }

        @Override
        public Object execute(FORM form, BindException e) throws Exception {
            ObjectMapper mapper = new ObjectMapper();

            Object obj = this.execute(form);

            return new JSONObject(mapper.writeValueAsString(obj));
        }

        public abstract Object execute(FORM form);
    }

    @ActionNames("newProtocol")
    @CSRF
    @Marshal(Marshaller.Jackson)
    @RequiresPermission(ComplianceAdminPermission.class)
    public class NewProtocol extends ProtocolAPIAction<NewProtocolForm> {
        @Override
        public NewProtocolResponse execute(NewProtocolForm form) {
            return getService().newProtocol(form);
        }
    }

    @ActionNames("saveBasicInfo")
    @CSRF
    @Marshal(Marshaller.Jackson)
    @RequiresPermission(ComplianceAdminPermission.class)
    public class SaveBasicInfo extends ProtocolAPIAction<BasicInfoForm> {
        @Override
        public Object execute(BasicInfoForm basicInfoForm) {
            getService().saveBasicInfo(basicInfoForm);
            return basicInfoForm;
        }
    }

    @ActionNames("getBasicInfo")
    @Marshal(Marshaller.Jackson)
    @RequiresPermission(ComplianceAdminPermission.class)
    public class GetBasicInfo extends ProtocolAPIAction<BasicInfoForm> {
        @Override
        public Object execute(BasicInfoForm form) {
            return getService().getBasicInfo(getRevisionId());
        }
    }

    @ActionNames("getHazards")
    @Marshal(Marshaller.Jackson)
    @RequiresPermission(ComplianceAdminPermission.class)
    public class GetProtocolHazards extends ProtocolAPIAction<WebUtilsController.NullForm> {
        @Override
        public Object execute(WebUtilsController.NullForm form) {
            return getService().getHazardsInfo(getRevisionId());
        }
    }

    @ActionNames("saveHazards")
    @CSRF
    @Marshal(Marshaller.Jackson)
    @RequiresPermission(ComplianceAdminPermission.class)
    public class SaveProtocolHazards extends ProtocolAPIAction<HazardsForm> {
        @Override
        public Object execute(HazardsForm form) {
            return getService().saveHazardsInfo(getRevisionId(), form);
        }
    }

    @ActionNames("addSpeciesToProtocol")
    @CSRF
    @RequiresPermission(ComplianceAdminPermission.class)
    public class AddSpeciesToProtocol extends ProtocolAPIAction<WebUtilsController.NullForm> {
        @Override
        public Object execute(WebUtilsController.NullForm form) {
            return null;
        }
    }
}
