package org.labkey.wnprc_virology;

import org.labkey.api.action.ApiResponse;
import org.labkey.api.action.ApiSimpleResponse;
import org.labkey.api.action.Marshal;
import org.labkey.api.action.Marshaller;
import org.labkey.api.action.MutatingApiAction;
import org.labkey.api.action.ReadOnlyApiAction;
import org.labkey.api.action.SimpleViewAction;
import org.labkey.api.action.SpringActionController;
import org.labkey.api.pipeline.PipeRoot;
import org.labkey.api.pipeline.PipelineService;
import org.labkey.api.security.RequiresPermission;
import org.labkey.api.security.permissions.AdminOperationsPermission;
import org.labkey.api.security.permissions.ReadPermission;
import org.labkey.api.security.permissions.UpdatePermission;
import org.labkey.api.view.JspView;
import org.labkey.api.view.NavTree;
import org.springframework.validation.BindException;
import org.springframework.web.servlet.ModelAndView;

import java.util.HashMap;
import java.util.Map;

public class WNPRC_VirologyController extends SpringActionController
{
    private static final DefaultActionResolver _actionResolver = new DefaultActionResolver(WNPRC_VirologyController.class);
    public static final String NAME = "wnprc_virology";

    public WNPRC_VirologyController()
    {
        setActionResolver(_actionResolver);
    }

    @RequiresPermission(ReadPermission.class)
    public class BeginAction extends SimpleViewAction
    {
        public ModelAndView getView(Object o, BindException errors) throws Exception
        {
            return new JspView("/org/labkey/wnprc_virology/view/hello.jsp");
        }

        @Override
        public void addNavTrail(NavTree root)
        {
        }
    }

    public static class VirologyModuleSettingsForm
    {

        private String _rsehrQCStatus;
        private String _virologyEHRVLSampleQueueFolderPath;
        private String _virologyRSEHRJobInterval;
        private String _virologyRSEHRParentFolderPath;
        private String _zikaPortalQCStatus;
        private String _zikaPortalURL;

        public String getZikaPortalURL()
        {
            return _zikaPortalURL;
        }

        public void setZikaPortalURL(String zikaPortalUrl)
        {
            _zikaPortalURL = zikaPortalUrl;
        }

        public String getZikaPortalQCStatus()
        {
            return _zikaPortalQCStatus;
        }

        public void setZikaPortalQCStatus(String zikaPortalQCStatus)
        {
            _zikaPortalQCStatus = zikaPortalQCStatus;
        }

        public String getVirologyEHRVLSampleQueueFolderPath()
        {
            return _virologyEHRVLSampleQueueFolderPath;
        }

        public void setVirologyEHRVLSampleQueueFolderPath(String virologyEHRVLSampleQueueFolderPath)
        {
            _virologyEHRVLSampleQueueFolderPath = virologyEHRVLSampleQueueFolderPath;
        }

        public String getVirologyRSEHRJobInterval()
        {
            return _virologyRSEHRJobInterval;
        }

        public void setVirologyRSEHRJobInterval(String virologyRSEHRJobInterval)
        {
            _virologyRSEHRJobInterval = virologyRSEHRJobInterval;
        }

        public String getVirologyRSEHRParentFolderPath()
        {
            return _virologyRSEHRParentFolderPath;
        }

        public void setVirologyRSEHRParentFolderPath(String virologyRSEHRParentFolderPath)
        {
            _virologyRSEHRParentFolderPath = virologyRSEHRParentFolderPath;
        }

        public String getRsehrQCStatus()
        {
            return _rsehrQCStatus;
        }

        public void setRsehrQCStatus(String rsehrQCStatus)
        {
            _rsehrQCStatus = rsehrQCStatus;;
        }

    }

    @RequiresPermission(AdminOperationsPermission.class)
    public class GetVirologyModuleSettingsAction extends ReadOnlyApiAction<Object>
    {
        public ApiResponse execute(Object form, BindException errors)
        {
            Map<String, Object> result = new HashMap<>();

            VirologyModuleSettings settings = new VirologyModuleSettings();
            Map<String, Object> props = settings.getSettingsMap();
            result.putAll(props);

            return new ApiSimpleResponse(result);
        }
    }

    @Marshal(Marshaller.Jackson)
    @RequiresPermission(AdminOperationsPermission.class)
    public class SetVirologyModuleSettingsAction extends MutatingApiAction<VirologyModuleSettingsForm>
    {
        public ApiResponse execute(VirologyModuleSettingsForm form, BindException errors)
        {
            Map<String, String> props = new HashMap<>();

            if (form.getRsehrQCStatus() != null)
                props.put(VirologyModuleSettings.RSEHR_QC_STATUS_STRING_PROP, form.getRsehrQCStatus());
            if (form.getVirologyRSEHRParentFolderPath() != null)
                props.put(VirologyModuleSettings.VIROLOGY_RSEHR_PARENT_FOLDER_STRING_PROP, form.getVirologyRSEHRParentFolderPath());
            if (form.getVirologyEHRVLSampleQueueFolderPath() != null)
                props.put(VirologyModuleSettings.VIROLOGY_EHR_VL_SAMPLE_QUEUE_PATH_PROP, form.getVirologyEHRVLSampleQueueFolderPath());
            if (form.getVirologyRSEHRJobInterval() != null)
                props.put(VirologyModuleSettings.VIROLOGY_RSEHR_JOB_INTERVAL_PROP, form.getVirologyRSEHRJobInterval());
            if (form.getZikaPortalQCStatus() != null)
                props.put(VirologyModuleSettings.ZIKA_PORTAL_QC_STATUS_STRING_PROP, form.getZikaPortalQCStatus());
            if (form.getZikaPortalURL() != null)
                props.put(VirologyModuleSettings.ZIKA_PORTAL_URL_PROP, form.getZikaPortalURL());

            VirologyModuleSettings.setVirologyModuleSettings(props);

            return new ApiSimpleResponse("success", true);
        }
    }
}
