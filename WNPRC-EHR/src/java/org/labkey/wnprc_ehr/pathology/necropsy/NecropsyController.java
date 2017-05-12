package org.labkey.wnprc_ehr.pathology.necropsy;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.json.JSONObject;
import org.labkey.api.action.ApiAction;
import org.labkey.api.action.Marshal;
import org.labkey.api.action.Marshaller;
import org.labkey.api.action.SpringActionController;
import org.labkey.api.security.ActionNames;
import org.labkey.api.security.CSRF;
import org.labkey.api.security.RequiresPermission;
import org.labkey.dbutils.api.exception.MissingPermissionsException;
import org.labkey.webutils.api.action.LegacyJspPageAction;
import org.labkey.webutils.api.action.ReactPageAction;
import org.labkey.webutils.api.action.annotation.JspPath;
import org.labkey.webutils.api.action.annotation.PageTitle;
import org.labkey.wnprc_ehr.pathology.necropsy.messages.ScheduleNecropsyForm;
import org.labkey.wnprc_ehr.pathology.necropsy.security.permission.ScheduleNecropsyPermission;
import org.labkey.wnprc_ehr.pathology.necropsy.security.permission.ViewNecropsyPermission;
import org.labkey.wnprc_ehr.service.dataentry.NecropsyDataEntryService;
import org.springframework.validation.BindException;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * Created by jon on 4/4/17.
 */
public class NecropsyController extends SpringActionController {
    public static final String NAME = "wnprc_ehr-necropsy";

    private static final DefaultActionResolver _actionResolver = new DefaultActionResolver(NecropsyController.class);

    public NecropsyController()
    {
        setActionResolver(_actionResolver);
    }

    @ActionNames("scheduleNecropsy")
    @CSRF
    @Marshal(Marshaller.Jackson)
    @RequiresPermission(ScheduleNecropsyPermission.class)
    public class ScheduleNecropsy extends ApiAction<ScheduleNecropsyForm> {
        @Override
        public Object execute(ScheduleNecropsyForm form, BindException e) throws Exception {
            NecropsyDataEntryService necropsyService = new NecropsyDataEntryService(getUser(), getContainer());
            necropsyService.scheduleNecropsy(form.requestId, form.scheduledDate, form.getAssignedTo(), form.getPathologist(), form.getAssistant());
            return new JSONObject();
        }
    }

    public abstract class NecropsyPageAction extends LegacyJspPageAction {
        @Override
        public Class getBaseClass() {
            return NecropsyController.class;
        }
    }

    public abstract class NecropsyAPIAction<FORM> extends ApiAction<FORM> {
        public NecropsyDataEntryService getService() throws MissingPermissionsException {
            return new NecropsyDataEntryService(getUser(), getContainer());
        }

        public Object execute(FORM form, BindException e) throws Exception {
            ObjectMapper mapper = new ObjectMapper();

            Object obj = this.execute(form);

            return new JSONObject(mapper.writeValueAsString(obj));
        }

        public String getParameter(String name) {
            return getViewContext().getRequest().getParameter(name);
        }

        public String getNecropsyLsid() {
            return getParameter("necropsy-lsid");
        }

        public abstract Object execute(FORM form) throws MissingPermissionsException, ParseException;
    }

    @ActionNames("NecropsySchedule")
    @JspPath("view/NecropsySchedule.jsp")
    @PageTitle("Necropsy Schedule")
    @RequiresPermission(ViewNecropsyPermission.class)
    public class NecropsySchedulePage extends NecropsyPageAction {}

    @ActionNames("getScheduledNecropsies")
    @RequiresPermission(ViewNecropsyPermission.class)
    public class GetScheduledNecropsies extends NecropsyAPIAction<Object> {
        @Override
        public Object execute(Object form) throws MissingPermissionsException, ParseException {
            Date startDate = _parseDate(getParameter("start"));
            Date endDate = _parseDate(getParameter("end"));

            return getService().getScheduledNecropsies(startDate, endDate);
        }
    }

    @ActionNames("getNecropsyInfo")
    @RequiresPermission(ViewNecropsyPermission.class)
    public class GetNecropsyInfo extends NecropsyAPIAction<Object> {
        @Override
        public Object execute(Object form) throws MissingPermissionsException, ParseException {
            return getService().getNecropsyDetails(getNecropsyLsid());
        }
    }

    @ActionNames("getNecropsyRequests")
    @RequiresPermission(ViewNecropsyPermission.class)
    public class GetNecropsyRequests extends NecropsyAPIAction<Object> {
        @Override
        public Object execute(Object form) throws MissingPermissionsException, ParseException {
            return getService().getNecropsyRequests();
        }
    }

    @ActionNames("getNecropsyRequestDetails")
    @RequiresPermission(ViewNecropsyPermission.class)
    public class GetNecropsyRequestDetails extends NecropsyAPIAction<Object> {
        @Override
        public Object execute(Object form) throws MissingPermissionsException {
            return getService().getNecropsyRequestDetails(getNecropsyLsid());
        }
    }

    private static Date _parseDate(String date) throws ParseException {
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");
        return formatter.parse(date);
    }
}
