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
import java.time.LocalTime;
import java.util.Date;


public class FoodNotStartedNotification extends AbstractEHRNotification
{
    protected String cronString = "0 45 7,15,21 * * ?";


    public FoodNotStartedNotification(Module owner){
        super (owner);
    }


    public String getName(){return "Food Deprive Not Started Notification";}

    public String getDescription(){
        return "This notification looks for food deprives that have not start after the time frame for each schedule.";
    }

    @Override
    public String getEmailSubject(Container c){
        return "Husbandry Alerts for "+ _dateTimeFormat.format(new Date());
    }

    public String getScheduleDescription(){
        return "Husbandry notification are send at 7:45, 15:45 and 21:45";
    }

    @Override
    public String getCronString(){ return this.cronString;}

    public void setCronString(String schedule){
        this.cronString = schedule;
    }

    public String getCategory(){
        return "Husbandry";
    }

    @Override
    public String getMessageBodyHTML (Container c, User u){
        StringBuilder msg = new StringBuilder();

        LocalTime currentTime = LocalTime.now();
        LocalTime morningNotification = LocalTime.of(7,40,0);
        LocalTime noonNotification = LocalTime.of(12,10,0);
        LocalTime afternoonNotification = LocalTime.of(15,40,0);
        LocalTime nightNotification = LocalTime.of(21,40,0);

        String schedule = null;

        //The notification should be commulative overt the day, therefore we include all previous time slots.
        if (currentTime.isAfter(morningNotification) ){
            schedule = "am";
        }if (currentTime.isAfter(noonNotification)){
            schedule = "am;noon";
        }if (currentTime.isAfter(afternoonNotification)){
            schedule = "am;noon;pm";
        }if (currentTime.isAfter(nightNotification)){
            schedule = "am;noon;pm;night";
        }
        foodDeprivesNotStarted(c, u, msg, schedule);

        if (msg.length() ==0){
            return null;
        }
        return "This email contains information regarding husbandry problems across the center." + msg.toString();

    }

    private void foodDeprivesNotStarted (Container c, User u, StringBuilder msg, String schedule){
        TableInfo ti = QueryService.get().getUserSchema(u, c, "study").getTable("FoodDeprivesProblems");

        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("qcstate/label"), "Scheduled", CompareType.EQUAL);
        if (schedule != null){
            filter.addCondition(FieldKey.fromString("schedule"),schedule,CompareType.IN);
        }

        Sort roomCage = new Sort(FieldKey.fromString("room"));
        //roomCage.insertSortColumn(FieldKey.fromString("room"), Sort.SortDirection.ASC);

        TableSelector ts = new TableSelector(ti, filter, roomCage);

        long count = ts.getRowCount();
        if (count > 0)
        {
            msg.append("<p><b>WARNING: There are "+ count + " food deprives that are scheduled for today but have not started</b><br>");
            if (schedule != null){
                msg.append("<a href='" + getExecuteQueryUrl(c, "study", "FoodDeprivesProblems", "Scheduled") + "&query.schedule~in="+ schedule + "&query.sort=-schedule/title'>Click here to view this list</a></p>\n");
            }else {
                msg.append("<a href='" + getExecuteQueryUrl(c, "study", "FoodDeprivesProblems", "Scheduled") + "'>Click here to view this list</a></p>\n");
            }
        }

    }


}