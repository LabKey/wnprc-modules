package org.labkey.wnprc_ehr.notification;

import org.labkey.api.data.Container;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.security.User;
import org.labkey.wnprc_ehr.WNPRC_EHRModule;

import java.util.Date;


public class VvcNotification extends AbstractEHRNotification
{
    public String requestId;

    public VvcNotification(Module owner)
    {
        super(owner);
    }

    public VvcNotification(Module owner, String requestid)
    {
        super(owner);
        requestId = requestid;
    }

    @Override
    public String getCategory()
    {
        return ModuleLoader.getInstance().getModule(WNPRC_EHRModule.class).getName();
    }

    @Override
    public String getName()
    {
        return "VVC Notification";
    }

    @Override
    public String getScheduleDescription()
    {
        return "As soon as VVC is submitted";
    }

    @Override
    public String getDescription()
    {
        return "This notification gets send every time there is a new VVC request";
    }

    @Override
    public String getEmailSubject(Container c)
    {
        return "New VVC Request Submitted on " + _dateTimeFormat.format(new Date());
    }

    @Override
    public String getMessageBodyHTML(Container c, User u)
    {

        final StringBuilder msg = new StringBuilder();
        Date now = new Date();
        msg.append("There was a new VVC request submitted.  It was submitted on: " + AbstractEHRNotification._dateFormat.format(now) + " at " + AbstractEHRNotification._timeFormat.format(now) + ".<p>");
        msg.append("RequestId: " + requestId);

        return msg.toString();
    }

}
