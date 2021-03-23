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