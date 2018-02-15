package org.labkey.wnprc_ehr.notification;

import org.labkey.api.data.Container;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.module.Module;
import org.labkey.api.query.FieldKey;
import org.labkey.api.security.User;

import java.util.Date;

public class HusbandryNotification extends AbstractEHRNotification
{
    public HusbandryNotification(Module owner){super (owner);}

    @Override
    public String getName(){return "Husbandry Notification";}

    @Override
    public String getDescription(){
        return "This notification gets sent every time there is a new VVC request";
    }

    @Override
    public String getEmailSubject(Container c){
        return "New Husbandry Request Submitted on "+ _dateTimeFormat.format(new Date());
    }

    @Override
    public String getScheduleDescription(){
        return "As soon as food deprive is submitted";
    }

    @Override
    public String getCategory(){
        return " ";
    }

    @Override
    public String getMessageBodyHTML(Container c, User u){

        return " ";
    }

    public void getRecipients (Container c, User u, String requestId){
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("requestId"),requestId);

        TableInfo ti = getStudySchema(c,u).getTable("requests");
        TableSelector ts = new TableSelector(ti, filter, null);
        long total = ts.getRowCount();
        if (total>0){
            //System.out.print();
        }

    }

}