/*
 * Copyright (c) 2018-2026 Board of Regents of the University of Wisconsin System
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
import java.util.Date;

public class FoodNotStartedNoonNotification extends FoodNotStartedNotification
{
    public FoodNotStartedNoonNotification(Module owner){
        super (owner);
        setCronString("0 15 12 * * ?");
    }

    @Override
    public String getName(){return "Food Not Started Noon Notification";}

    @Override
    public String getEmailSubject(Container c){
        return "Noon Food Deprive Alerts for "+ _dateTimeFormat.format(new Date());
    }

    @Override
    public String getScheduleDescription(){
        return "Food Deprive Notification are send at 12:15";
    }

    @Override
    public void setCronString(String schedule){
        this.cronString = schedule;
    }

}