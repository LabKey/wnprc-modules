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
        return "This notification gets send everytime there is a new VVC request";
    }
    public String getEmailSubject(){
        return "New Husbandry Request Submitted on "+ _dateTimeFormat.format(new Date());
    }

    public String getScheduleDescription(){
        return "As soon as food deprive is submitted";
    }

    public String getCategory(){
        return " ";
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

}