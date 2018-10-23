package org.labkey.wnprc_ehr.notification;

import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.Sort;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.module.Module;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.security.User;

import javax.jws.soap.SOAPBinding;
import java.time.LocalTime;
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

        //LocalTime currentTime = LocalTime.now();
        LocalTime currentTime = LocalTime.of(8,15,0);
        LocalTime morningNotification = LocalTime.of(8,10,0);
        LocalTime noonNotification = LocalTime.of(12,10,0);
        LocalTime afternoonNotification = LocalTime.of(16,10,0);
        LocalTime nightNotification = LocalTime.of(22,10,0);

        msg.append("This email contains information regarding husbandry problems across the center.");
        String schedule = null;

        if (currentTime.isAfter(morningNotification) ){
            schedule = "am";
        }if (currentTime.isAfter(noonNotification)){
            schedule = "noon";
        }if (currentTime.isAfter(afternoonNotification)){
            schedule = "pm";
        }if (currentTime.isAfter(nightNotification)){
            schedule = "night";
        }
        foodDeprivesNotStarted(c, u, msg, schedule);

        return msg.toString();
    }

    private void foodDeprivesNotStarted (Container c, User u, StringBuilder msg, String schedule){
        TableInfo ti = QueryService.get().getUserSchema(u, c, "study").getTable("FoodDeprivesProblems");

        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("qcstate/label"), "Scheduled", CompareType.EQUAL);
        if (schedule != null){
            filter.addCondition(FieldKey.fromString("schedule"),schedule,CompareType.EQUAL);
        }

        Sort roomCage = new Sort(FieldKey.fromString("room"));
        //roomCage.insertSortColumn(FieldKey.fromString("room"), Sort.SortDirection.ASC);

        TableSelector ts = new TableSelector(ti, filter, roomCage);

        long count = ts.getRowCount();
        if (count > 0)
        {
            msg.append("<p><b>WARNING: There are "+ count + " food deprives that are scheduled for today but have not started</b><br>");
            if (schedule != null){
                msg.append("<a href='" + getExecuteQueryUrl(c, "study", "FoodDeprivesProblems", "Scheduled") + "&query.schedule~eq="+ schedule + "'>Click here to view this list</a></p>\n");

            }else {
                msg.append("<a href='" + getExecuteQueryUrl(c, "study", "FoodDeprivesProblems", "Scheduled") + "'>Click here to view this list</a></p>\n");

            }


        }

    }


}