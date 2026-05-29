/*
 * Copyright (c) 2023-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
    @Override
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

    @Override
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

        //Animals on water restricted protocols that are on Lixit
        animalOnLixit(c,u,msg);

        //Check animals that did not get any water for today and the last five days.
        findAnimalsWithWaterEntries(c,u,msg,numDays);

        return msg.toString();
    }

}
