package org.labkey.wnprc_virology.utils;

import org.apache.logging.log4j.Logger;
import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.Results;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.module.FolderTypeManager;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryHelper;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.User;
import org.labkey.api.security.UserManager;
import org.labkey.api.util.TestContext;
import org.labkey.api.util.logging.LogHelper;
import org.labkey.wnprc_virology.WNPRC_VirologyModule;
import org.labkey.wnprc_virology.notification.ViralLoadQueueNotification;

import java.sql.SQLException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.labkey.wnprc_virology.ViralLoadRSEHRRunner.virologyModule;

public class TriggerScriptHelper
{
    @NotNull
    private final Container _container;

    @NotNull
    private final User _user;
    protected final static SimpleDateFormat _dateTimeFormat = new SimpleDateFormat("yyyy-MM-dd kk:mm");

    /**
     *  Options that can be set in modules using EHR trigger scripts to opt in/out of or alter the behavior
     *  of certain validations and business logic.
     *  */
    @NotNull
    private static final Map<String, String> _centerCustomProps = new HashMap<>();
    private static final String _folderType = "WNPRC_Virology";
    private static final String _sourceDataTableName = "viral_load_data_filtered";

    private static final Logger _log = LogHelper.getLogger(TriggerScriptHelper.class, "Server-side validation of WNPRC_Virology data insert/update/deletes");

    private TriggerScriptHelper(int userId, String containerId)
    {
        User user = UserManager.getUser(userId);
        if (user == null)
            throw new RuntimeException("User does not exist: " + userId);
        _user = user;

        Container container = ContainerManager.getForId(containerId);
        if (container == null)
            throw new RuntimeException("Container does not exist: " + containerId);
        _container = container;
    }

    @NotNull
    private User getUser()
    {
        return _user;
    }

    @NotNull
    private Container getContainer()
    {
        return _container;
    }


    public static TriggerScriptHelper create(int userId, String containerId)
    {
        //_log.info("Creating trigger script helper for: " +  userId + ", " + containerId);
        TriggerScriptHelper helper = new TriggerScriptHelper(userId, containerId);

        return helper;
    }

    public String getVLStatus(User user, Container container, Integer status) throws SQLException
    {

        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("Key"), status);
        QueryHelper viralLoadQuery = new QueryHelper(container, user, "lists", "status");

        // Define columns to get
        List<FieldKey> columns = new ArrayList<>();
        columns.add(FieldKey.fromString("Key"));
        columns.add(FieldKey.fromString("Status"));

        // Execute the query
        String thestatus = null;
        try ( Results rs = viralLoadQuery.select(columns, filter) )
        {
            if (rs.next()){
                thestatus = rs.getString(FieldKey.fromString("Status"));
            }
        }
        return thestatus;
    }

    public void sendViralLoadQueueNotification(String[] keys, Map<String,Object> emailProps) throws SQLException
    {
        if (emailProps.get("status") == null)
            return;

        //cannot mutate the Map, make a copy
        Map<String, Object> emailPropsCopy = new HashMap(emailProps);
        Module ehr = ModuleLoader.getInstance().getModule("EHR");
        Module WNPRCVirology = ModuleLoader.getInstance().getModule(WNPRC_VirologyModule.NAME);
        if (WNPRCVirology.getModuleProperties().get(WNPRC_VirologyModule.VIROLOGY_EHR_VL_SAMPLE_QUEUE_PATH_PROP).getEffectiveValue(ContainerManager.getRoot()) == null){
            _log.info("WNPRC_Virology / TriggerScriptHelper: " + WNPRC_VirologyModule.VIROLOGY_EHR_VL_SAMPLE_QUEUE_PATH_PROP + " module prop is not set, not sending email notification.");
            return;
        }
        Container viralLoadContainer = ContainerManager.getForPath(WNPRCVirology.getModuleProperties().get(WNPRC_VirologyModule.VIROLOGY_EHR_VL_SAMPLE_QUEUE_PATH_PROP).getEffectiveValue(ContainerManager.getRoot()));

        String recordStatus = getVLStatus(_user, viralLoadContainer, (Integer) emailPropsCopy.get("status"));

        String WNPRCVirologyRSEHRQCStatusVal = WNPRCVirology.getModuleProperties().get(WNPRC_VirologyModule.RSEHR_QC_STATUS_STRING_PROP).getEffectiveValue(viralLoadContainer);
        if (WNPRCVirologyRSEHRQCStatusVal != null)
        {
            if (WNPRCVirologyRSEHRQCStatusVal.equals(recordStatus))
            {
                //_log.info("Using java helper to send email for viral load queue record: "+key);

                String WNPRCVirologyRSEHRPortalUrlVal = WNPRCVirology.getModuleProperties().get(WNPRC_VirologyModule.RSEHR_PORTAL_URL_PROP).getEffectiveValue(viralLoadContainer);
                if (WNPRCVirologyRSEHRPortalUrlVal != null)
                {
                    ViralLoadQueueNotification notification = new ViralLoadQueueNotification(ehr, keys, _user, viralLoadContainer, emailPropsCopy, true);
                    //TODO add ability to query special table with info from RSEHR on who to notify
                    //ViralLoadQueueNotification notification = new ViralLoadQueueNotification(ehr, keys, _user, viralLoadContainer, emailPropsCopy, _settings.getRSEHREmailMode());
                    notification.sendManually(viralLoadContainer);
                }
                else
                {
                    _log.info("WNPRC_Virology / TriggerScriptHelper: " + WNPRC_VirologyModule.RSEHR_PORTAL_URL_PROP + " module prop is not set, not sending email notification.");
                }
            }

        } else
        {
            _log.info("WNPRC_Virology / TriggerScriptHelper: " + WNPRC_VirologyModule.RSEHR_QC_STATUS_STRING_PROP + " module prop is not set, not sending email notification.");
        }
    }

}
