package org.labkey.wnprc_compliance.protocol;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.json.JSONObject;
import org.labkey.api.action.ApiAction;
import org.labkey.api.action.Marshal;
import org.labkey.api.action.Marshaller;
import org.labkey.api.action.SpringActionController;
import org.labkey.api.security.ActionNames;
import org.labkey.api.security.CSRF;
import org.labkey.api.security.RequiresPermission;
import org.labkey.wnprc_compliance.protocol.messages.BasicInfoForm;
import org.labkey.wnprc_compliance.protocol.messages.NewProtocolForm;
import org.labkey.wnprc_compliance.security.ComplianceAdminPermission;
import org.springframework.validation.BindException;

/**
 * Created by Jon on 3/23/2017.
 */
public class ProtocolAPIController extends SpringActionController {
    private static final SpringActionController.DefaultActionResolver _actionResolver = new SpringActionController.DefaultActionResolver(ProtocolAPIController.class);
    public static final String NAME = "wnprc_compliance-protocol-api";

    public ProtocolAPIController() {
        setActionResolver(_actionResolver);
    }

    @ActionNames("newProtocol")
    @CSRF
    @Marshal(Marshaller.Jackson)
    @RequiresPermission(ComplianceAdminPermission.class)
    public class NewProtocol extends ApiAction<NewProtocolForm> {
        @Override
        public Object execute(NewProtocolForm newProtocolForm, BindException e) throws Exception {
            ObjectMapper mapper = new ObjectMapper();
            ProtocolService service = new ProtocolService(getUser(), getContainer());

            return new JSONObject(mapper.writeValueAsString(service.newProtocol(newProtocolForm)));
        }
    }

    @ActionNames("saveBasicInfo")
    @CSRF
    @Marshal(Marshaller.Jackson)
    @RequiresPermission(ComplianceAdminPermission.class)
    public class SaveBasicInfo extends ApiAction<BasicInfoForm> {
        @Override
        public Object execute(BasicInfoForm basicInfoForm, BindException e) throws Exception {
            ProtocolService service = new ProtocolService(getUser(), getContainer());
            service.saveBasicInfo(basicInfoForm);
            return new JSONObject();
        }
    }
}
