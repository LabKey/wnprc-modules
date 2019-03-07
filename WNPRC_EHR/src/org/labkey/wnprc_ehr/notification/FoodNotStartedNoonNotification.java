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

    public String getName(){return "Food Not Started Noon Notification";}

    @Override
    public String getEmailSubject(Container c){
        return "Noon Food Deprive Alerts for "+ _dateTimeFormat.format(new Date());
    }

    public String getScheduleDescription(){
        return "Food Deprive Notification are send at 12:15";
    }

    public void setCronString(String schedule){
        this.cronString = schedule;
    }

}