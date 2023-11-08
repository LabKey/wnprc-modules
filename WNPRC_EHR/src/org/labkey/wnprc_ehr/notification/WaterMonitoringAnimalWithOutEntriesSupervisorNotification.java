package org.labkey.wnprc_ehr.notification;

import org.labkey.api.data.Container;
import org.labkey.api.module.Module;
import org.labkey.api.security.User;

import java.util.Date;

public class WaterMonitoringAnimalWithOutEntriesSupervisorNotification extends WaterMonitoringNotification
{
    public WaterMonitoringAnimalWithOutEntriesSupervisorNotification(Module owner)
    {
        super(owner);
    }
    public String getName(){return "Water Monitoring Alert for Supervisors";}

    @Override
    public String getEmailSubject(Container c)
    {
        return "Daily Water Monitoring for Supervisors: " + AbstractEHRNotification._dateTimeFormat.format(new Date());
    }

    @Override
    public String getCronString() { return "0 0 15,19 * * ?"; }

    @Override
    public String getScheduleDescription()
    {
        return "every day at 1500 and 1900";
    }

    public String getDescription()
    {
        return "The report is designed to report total amount of water animal had gotten and report if they have not gotten the required 20 mls per kilogram.";
    }

    @Override
    public String getMessageBodyHTML(final Container c, User u)
    {
        final StringBuilder msg = new StringBuilder();
        int numDays = 1;

        //Find today's date
        Date now = new Date();
        msg.append("This email contains a series of automatic alerts about the water monitoring system.  It was run on: " + AbstractEHRNotification._dateFormat.format(now) + " at " + AbstractEHRNotification._timeFormat.format(now) + ".<p>");

        //Check animals that did not get any water for today and the last five days.
        findAnimalsWithWaterEntries(c,u,msg,numDays);

        //Animals on water restricted protocols that are on Lixit
        animalOnLixit(c,u,msg);

        return msg.toString();
    }

}
