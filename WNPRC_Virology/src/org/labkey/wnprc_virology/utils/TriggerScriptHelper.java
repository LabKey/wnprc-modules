package org.labkey.wnprc_virology.utils;

import org.apache.logging.log4j.Logger;
import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.Results;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryHelper;
import org.labkey.api.security.User;
import org.labkey.api.security.UserManager;
import org.labkey.api.util.logging.LogHelper;
import org.labkey.wnprc_virology.notification.ViralLoadQueueNotification;

import java.sql.SQLException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
        Module ehr = ModuleLoader.getInstance().getModule("EHR");
        Container viralLoadContainer = ContainerManager.getForPath("/WNPRC/WNPRC_Units/Research_Services/Virology_Services/viral_load_sample_tracker/");
        String recordStatus = getVLStatus(_user, viralLoadContainer, (Integer) emailProps.get("status"));
        if ("08-complete-email-Zika_portal".equals(recordStatus)){
            //_log.info("Using java helper to send email for viral load queue record: "+key);
            ViralLoadQueueNotification notification = new ViralLoadQueueNotification(ehr, keys, _user, viralLoadContainer, emailProps);
            Container ehrContainer =  ContainerManager.getForPath("/WNPRC/EHR");
            notification.sendManually(ehrContainer);
        }
    }
}
