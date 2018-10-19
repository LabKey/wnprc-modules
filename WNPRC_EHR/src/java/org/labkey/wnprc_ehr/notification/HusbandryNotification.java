package org.labkey.wnprc_ehr.notification;

import org.labkey.api.data.Container;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.module.Module;
import org.labkey.api.query.FieldKey;
import org.labkey.api.security.User;

import java.util.Date;
import java.util.List;

public class HusbandryNotification extends AbstractEHRNotification
{
    public HusbandryNotification(Module owner){super (owner);}

    public String getName(){return "Husbandry Notification";}

    public String getDescription(){
        return "This notification gets send several times a day";
    }

    @Override
    public String getEmailSubject(Container c){
        return "Husbandry Alerts for "+ _dateTimeFormat.format(new Date());
    }

    public String getScheduleDescription(){
        return "Husbandry notification are send at 9:00, 13:00, 17:00 and 22:00";
    }

    @Override
    public String getCronString(){ return "0 0 9,13,17,22 * * ?";}

    public String getCategory(){
        return "Husbandry";
    }

    public String getMessage(Container c, User u){

        return " ";
    }

    public void getReciepients (Container c, User u, String requestId){
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("requestId"),requestId);

        TableInfo ti = getStudySchema(c,u).getTable("requests");
        TableSelector ts = new TableSelector(ti, filter, null);
        long total = ts.getRowCount();
        if (total>0){
            //System.out.print();
        }

    }
    @Override
    public String getMessageBodyHTML (Container c, User u){
        StringBuilder msg = new StringBuilder();

        Date today = new Date();
        msg.append("This email contains information regarding husbandry problems across the center.");

        return msg.toString();
    }


}