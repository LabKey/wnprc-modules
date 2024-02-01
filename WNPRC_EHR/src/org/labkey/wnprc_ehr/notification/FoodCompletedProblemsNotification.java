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

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

import static java.lang.Math.toIntExact;

public class FoodCompletedProblemsNotification extends AbstractEHRNotification
{
    protected String cronString = "0 0 8 * * ?";


    public FoodCompletedProblemsNotification(Module owner){
        super (owner);
    }


    @Override
    public String getName(){return "Food Deprive Completed with problems";}

    @Override
    public String getDescription(){
        return "This notification looks for food deprives that have been completed but ran more than 24 hours.";
    }

    @Override
    public String getEmailSubject(Container c){
        return "Husbandry Alerts for "+ _dateTimeFormat.format(new Date());
    }

    @Override
    public String getScheduleDescription(){
        return "Food Deprive Notification sent once a day at 8:00 AM";
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

        LocalDateTime currentTime = LocalDateTime.now();

        foodDepriveCompleteProblems(c, u, msg, currentTime);

        if (msg.length() == 0)
        {
            return null;
        }
        return "This email contains information regarding husbandry problems across the center." + msg.toString();
    }


    //Send notification for food deprives that had problems in the last 2 days. Problem reported are food deprives longer than 24 hours.
    public void foodDepriveCompleteProblems(Container c, User u, StringBuilder msg, LocalDateTime currentTime){
        TableInfo ti = QueryService.get().getUserSchema(u, c, "study").getTable("foodDeprivesStarted");
        LocalDateTime reportPeriod = currentTime.minusDays(2);

        Date dateFilter = java.sql.Timestamp.valueOf(reportPeriod);
        Double maxHours = 24.0;

        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("date"), dateFilter, CompareType.GTE);
        filter.addCondition(FieldKey.fromString("qcstate/label"), "Completed", CompareType.EQUAL);
        filter.addCondition(FieldKey.fromString("hoursSinceStarted"),maxHours, CompareType.GTE);

        TableSelector ts = new TableSelector(ti, PageFlowUtil.set("id","date","depriveStartTime","restoredTime"), filter, null);


        Set<foodDepriveInfo> CompletedFoodDeprives = new HashSet<>();
        CompletedFoodDeprives.addAll(Arrays.asList(ts.getArray(foodDepriveInfo.class)));
        if (CompletedFoodDeprives.size()>0){
            int overFoodDeprives = 0;
            for (foodDepriveInfo row : CompletedFoodDeprives){
                if (row.timeSinceStarted() >= 24)  {
                    overFoodDeprives++;
                }
            }
            if (overFoodDeprives > 0){
                msg.append("<p><b>INFO: There are "+ overFoodDeprives + " food deprives in the last two days that were completed and ran for more than 24 hours.</b><br>");
                if (overFoodDeprives > 0 ){
                    msg.append("<a href='" + getExecuteQueryUrl(c, "study", "FoodDeprivesStarted", "CompletedErrors") + "'>Click here to view this list</a></p>\n");
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
