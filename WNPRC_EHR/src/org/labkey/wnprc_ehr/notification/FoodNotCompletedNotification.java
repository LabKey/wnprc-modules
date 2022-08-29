package org.labkey.wnprc_ehr.notification;

import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.module.Module;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.security.User;
import org.labkey.api.util.PageFlowUtil;
import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

import static java.lang.Math.toIntExact;

public class FoodNotCompletedNotification extends AbstractEHRNotification
{
    protected String cronString = "0 0 6-21 * * ?";


    public FoodNotCompletedNotification(Module owner){
        super (owner);
    }


    @Override
    public String getName(){return "Food Deprive Longer Than 22 Hours Notification.";}

    @Override
    public String getDescription(){
        return "This notification looks for food deprives that are going longer than 22 hours.";
    }

    @Override
    public String getEmailSubject(Container c){
        return "Husbandry Alerts for "+ _dateTimeFormat.format(new Date());
    }

    @Override
    public String getScheduleDescription(){
        return "Food Deprive Notification sent every hour between 6:00 and 18:00";
    }

    @Override
    public String getCronString(){ return this.cronString;}

    @Override
    public String getCategory(){
        return "Husbandry";
    }

    @Override
    public String getMessageBodyHTML (Container c, User u){
        StringBuilder msg = new StringBuilder();

        foodDeprivesNotCompleted(c, u, msg);

        if (msg.length() == 0)
        {
            return null;
        }
        return "This email contains information regarding husbandry problems across the center." + msg.toString();
    }

    private void foodDeprivesNotCompleted (Container c, User u, StringBuilder msg){
        TableInfo ti = QueryService.get().getUserSchema(u, c, "study").getTable("foodDeprivesStarted");

        Double maxHours = 22.0;

        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("hoursSinceStarted"),maxHours, CompareType.GTE);
        filter.addCondition(FieldKey.fromString("qcstate/label"),"Started",CompareType.EQUAL);

        TableSelector ts = new TableSelector(ti, PageFlowUtil.set("id","date","depriveStartTime","restoredTime"),filter, null);

        Set<foodDepriveInfo> startedFoodDeprives = new HashSet<>();
        startedFoodDeprives.addAll(Arrays.asList(ts.getArray(foodDepriveInfo.class)));
        if (startedFoodDeprives.size()>0){
        int overFoodDeprives = 0;
            for (foodDepriveInfo row : startedFoodDeprives){
                if (row.timeSinceStarted() >= 22)  {
                    overFoodDeprives++;
                }
            }
            if (overFoodDeprives >0)
            {
                msg.append("<p><b>WARNING: There are " + overFoodDeprives + " food deprives that have started and are more than 22 hours open</b><br>");
                if (overFoodDeprives > 0)
                {
                    msg.append("<a href='" + getExecuteQueryUrl(c, "study", "FoodDeprivesStarted", "Started") + "&query.hoursSinceStarted~gte=22'>Click here to view this list</a></p>\n");
                }
            }
        }
    }



    //Internal class to parse food dperive information. Helps to calculate difference between start time and restore time.
    public static class foodDepriveInfo implements Comparable<foodDepriveInfo>
    {
        private String _id;
        private Date _date;
        private Date _depriveStartTime;
        private Date _restoredTime;

        public foodDepriveInfo(){}

        @Override
        public int compareTo (@NotNull foodDepriveInfo currentTime){

            if (_restoredTime == null){
                return toIntExact(ChronoUnit.HOURS.between(getLocalDepriveStartTime(),currentTime.getLocalDepriveStartTime()));
            }else{
                return toIntExact(ChronoUnit.HOURS.between(getLocalDepriveStartTime(), getLocalRestoreTime()));
            }
        }


        public int timeSinceStarted (){
            foodDepriveInfo currentTime = new foodDepriveInfo();
            currentTime.setDeprivestarttime(new Date());
            return this.compareTo(currentTime);
        }

        public String getId(){return _id;}

        public void setId(String Id){_id=Id;}

        public Date getDate(){return _date;}

        public void setDate(Date date){_date = date;}

        public Date getDeprivestarttime(){return _depriveStartTime;}

        public void setDeprivestarttime(Date depriveStartTime){
            _depriveStartTime = depriveStartTime;
        }

        public LocalDateTime getLocalDepriveStartTime(){
            return convertToLocalDateTimeViaInstant(_depriveStartTime);
        }

        public Date getRestoredTime(){return _restoredTime;}

        public void setRestoredTime(Date restoredTime){
            if (restoredTime == null)
            {
                _restoredTime=new Date();
            }else{
                _restoredTime = restoredTime;
            }
        }
        public LocalDateTime getLocalRestoreTime(){
            return convertToLocalDateTimeViaInstant(_restoredTime);
        }
        public LocalDateTime convertToLocalDateTimeViaInstant(Date dateToConvert) {
            return dateToConvert.toInstant()
                    .atZone(ZoneId.systemDefault())
                    .toLocalDateTime();
        }
    }
}