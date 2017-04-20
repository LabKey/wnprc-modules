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
import org.labkey.wnprc_compliance.lookups.SpeciesClass;
import org.labkey.wnprc_compliance.protocol.messages.*;
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

        public String getParameter(String paramName) {
            return getViewContext().getRequest().getParameter(paramName);
        }

        public String getRevisionId() {
            return getParameter(URLQueryParameters.REVISION_ID.getQueryKey());
        }

        @Override
        public Object execute(FORM form, BindException e) throws Exception {
            ObjectMapper mapper = new ObjectMapper();

            Object obj = this.execute(form);

            return new JSONObject(mapper.writeValueAsString(obj));
        }

        public abstract Object execute(FORM form) throws ProtocolRevision.ProtocolDoesNotExistException, ProtocolRevision.ProtocolDoesNotAllowSpecies;
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
        public Object execute(BasicInfoForm basicInfoForm) throws ProtocolRevision.ProtocolDoesNotExistException {
            getService().getProtocolRevision(getRevisionId()).saveBasicInfo(basicInfoForm);
            return basicInfoForm;
        }
    }


    @ActionNames("getAllRevisions")
    @Marshal(Marshaller.Jackson)
    @RequiresPermission(ComplianceAdminPermission.class)
    public class GetAllRevisions extends ProtocolAPIAction<WebUtilsController.NullForm> {
        @Override
        public Object execute(WebUtilsController.NullForm form) throws ProtocolRevision.ProtocolDoesNotExistException {
            return getService().getProtocolRevision(getRevisionId()).getRevisions();
        }
    }


    @ActionNames("getBasicInfo")
    @Marshal(Marshaller.Jackson)
    @RequiresPermission(ComplianceAdminPermission.class)
    public class GetBasicInfo extends ProtocolAPIAction<BasicInfoForm> {
        @Override
        public Object execute(BasicInfoForm form) throws ProtocolRevision.ProtocolDoesNotExistException {
            return getService().getProtocolRevision(getRevisionId()).getBasicInfo();
        }
    }

    @ActionNames("getHazards")
    @Marshal(Marshaller.Jackson)
    @RequiresPermission(ComplianceAdminPermission.class)
    public class GetProtocolHazards extends ProtocolAPIAction<WebUtilsController.NullForm> {
        @Override
        public Object execute(WebUtilsController.NullForm form) throws ProtocolRevision.ProtocolDoesNotExistException {
            return getService().getProtocolRevision(getRevisionId()).getHazardsInfo();
        }
    }

    @ActionNames("saveHazards")
    @CSRF
    @Marshal(Marshaller.Jackson)
    @RequiresPermission(ComplianceAdminPermission.class)
    public class SaveProtocolHazards extends ProtocolAPIAction<HazardsForm> {
        @Override
        public Object execute(HazardsForm form) throws ProtocolRevision.ProtocolDoesNotExistException {
            return getService().getProtocolRevision(getRevisionId()).saveHazardsInfo(form);
        }
    }

    @ActionNames("addSpeciesToProtocol")
    @CSRF
    @Marshal(Marshaller.Jackson)
    @RequiresPermission(ComplianceAdminPermission.class)
    public class AddSpeciesToProtocol extends ProtocolAPIAction<WebUtilsController.NullForm> {
        @Override
        public Object execute(WebUtilsController.NullForm form) throws ProtocolRevision.ProtocolDoesNotExistException, ProtocolRevision.ProtocolDoesNotAllowSpecies {
            String speciesName = getParameter("species");
            SpeciesClass species = SpeciesClass.valueOf(speciesName);

            ProtocolRevision protocolRevision = getService().getProtocolRevision(getRevisionId());
            protocolRevision.addAllowedSpecies(species);

            SpeciesForm speciesForm = new SpeciesForm();
            //TODO:
            speciesForm.maxNumberOfAnimals = 0;
            speciesForm.speciesClass = species;

            return speciesForm;
        }
    }

    @ActionNames("deleteSpeciesFromProtocol")
    @CSRF
    @RequiresPermission(ComplianceAdminPermission.class)
    public class DeleteSpeciesFromProtocol extends ProtocolAPIAction<WebUtilsController.NullForm> {
        @Override
        public Object execute(WebUtilsController.NullForm form) throws ProtocolRevision.ProtocolDoesNotExistException {
            String speciesName = getParameter("species");
            SpeciesClass species = SpeciesClass.valueOf(speciesName);

            ProtocolRevision protocolRevision = getService().getProtocolRevision(getRevisionId());
            protocolRevision.deleteSpeciesFromProtocol(species);
            return new JSONObject();
        }
    }


    @ActionNames("setMaxNoAnimalsForSpecies")
    @CSRF
    @RequiresPermission(ComplianceAdminPermission.class)
    public class SetMaxNoAnimalsForSpecies extends ProtocolAPIAction<WebUtilsController.NullForm> {
        @Override
        public Object execute(WebUtilsController.NullForm form) throws ProtocolRevision.ProtocolDoesNotExistException, ProtocolRevision.ProtocolDoesNotAllowSpecies {
            String speciesName = getParameter("species");

            ProtocolRevision revision = getService().getProtocolRevision(getRevisionId());
            ProtocolRevision.SpeciesInfo info = revision.getSpeciesInfo(SpeciesClass.valueOf(speciesName));
            info.setMaxNumberOfAnimals(Integer.valueOf(getParameter("max")));

            return null;
        }
    }

    @ActionNames("getAllowedSpecies")
    @RequiresPermission(ComplianceAdminPermission.class)
    public class GetAllowedSpecies extends ProtocolAPIAction<WebUtilsController.NullForm> {
        @Override
        public Object execute(WebUtilsController.NullForm form) throws ProtocolRevision.ProtocolDoesNotExistException, ProtocolRevision.ProtocolDoesNotAllowSpecies {
            ProtocolRevision revision = getService().getProtocolRevision(getRevisionId());
            return revision.getAllowedSpecies();
        }
    }
}
