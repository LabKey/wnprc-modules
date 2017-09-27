package org.labkey.wnprc_compliance.person;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.json.JSONObject;
import org.labkey.api.action.ApiAction;
import org.labkey.api.action.Marshal;
import org.labkey.api.action.Marshaller;
import org.labkey.api.action.SpringActionController;
import org.labkey.api.security.ActionNames;
import org.labkey.api.security.CSRF;
import org.labkey.api.security.RequiresPermission;
import org.labkey.webutils.WebUtilsController;
import org.labkey.webutils.api.action.LegacyJspPageAction;
import org.labkey.webutils.api.action.annotation.JspPath;
import org.labkey.webutils.api.action.annotation.PageTitle;
import org.labkey.wnprc_compliance.PersonService;
import org.labkey.wnprc_compliance.security.ComplianceAdminPermission;
import org.springframework.validation.BindException;

/**
 * Created by jon on 5/15/17.
 */
public class PersonController extends SpringActionController {
    private static final DefaultActionResolver _actionResolver = new DefaultActionResolver(PersonController.class);

    public static final String NAME = "wnprc_compliance-persons";

    public PersonController() {
        setActionResolver(this._actionResolver);
    }

    public abstract class PersonAPIAction<FORM> extends ApiAction<FORM> {
        public PersonService getService() {
            return new PersonService(getUser(), getContainer());
        }

        public String getParameter(String paramName) {
            return getViewContext().getRequest().getParameter(paramName);
        }

        public String getPersonId() {
            return getParameter("person_id");
        }

        @Override
        public Object execute(FORM form, BindException e) throws Exception {
            ObjectMapper mapper = new ObjectMapper();

            Object obj = this.execute(form);

            return new JSONObject(mapper.writeValueAsString(obj));
        }

        public abstract Object execute(FORM form);
    }

    public abstract class PersonPageAction extends LegacyJspPageAction {
        @Override
        public Class getBaseClass() {
            return PersonController.class;
        }
    }


    @ActionNames("personsList")
    @PageTitle("Persons List")
    @JspPath("view/list.jsp")
    @RequiresPermission(ComplianceAdminPermission.class)
    public class PersonListPage extends PersonPageAction {}

    @ActionNames("editPerson")
    @PageTitle("Persons List")
    @JspPath("view/person/editPerson.jsp")
    @RequiresPermission(ComplianceAdminPermission.class)
    public class EditPersonPage extends PersonPageAction {}


    @ActionNames("assignWiscCardToPerson")
    @CSRF
    @Marshal(Marshaller.Jackson)
    @RequiresPermission(ComplianceAdminPermission.class)
    public class AssignWiscCardToPersonAPI extends PersonAPIAction<WebUtilsController.NullForm> {
        @Override
        public Object execute(WebUtilsController.NullForm nullForm) {
            return null;
        }
    }

    @ActionNames("assignLabKeyAccountToPerson")
    @CSRF
    @Marshal(Marshaller.Jackson)
    @RequiresPermission(ComplianceAdminPermission.class)
    public class AssignLabKeyAccountToPersonAPI extends PersonAPIAction<WebUtilsController.NullForm> {
        @Override
        public Object execute(WebUtilsController.NullForm nullForm) {
            return null;
        }
    }

    @ActionNames("getPersonInfo")
    @CSRF
    @Marshal(Marshaller.Jackson)
    @RequiresPermission(ComplianceAdminPermission.class)
    public class PersonInfoAPI extends PersonAPIAction<WebUtilsController.NullForm> {
        @Override
        public Object execute(WebUtilsController.NullForm nullForm) {
            return null;
        }
    }
}
