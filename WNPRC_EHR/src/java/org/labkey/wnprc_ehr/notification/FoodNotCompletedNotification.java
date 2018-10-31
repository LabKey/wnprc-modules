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
import org.labkey.api.security.UserPrincipal;
import org.labkey.api.util.PageFlowUtil;
import sun.util.resources.cldr.fr.CalendarData_fr_DJ;

import javax.jws.soap.SOAPBinding;
import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static java.lang.Math.toIntExact;

public class FoodNotCompletedNotification extends AbstractEHRNotification
{
    protected String cronString = "0 0/60 6-18 * * ?";


    public FoodNotCompletedNotification(Module owner){
        super (owner);
    }


    public String getName(){return "Food Deprive Longer Than 22 Hours Notification";}

    public String getDescription(){
        return "This notification looks for food deprives that are going longer than 22 hours.";
    }

    @Override
    public String getEmailSubject(Container c){
        return "Husbandry Alerts for "+ _dateTimeFormat.format(new Date());
    }

    public String getScheduleDescription(){
        return "Food Deprive Notification sent every hour between 6:00 and 18:00";
    }

    @Override
    public String getCronString(){ return this.cronString;}

    public String getCategory(){
        return "Husbandry";
    }

    @Override
    public String getMessageBodyHTML (Container c, User u){
        StringBuilder msg = new StringBuilder();

        LocalDateTime currentTime = LocalDateTime.now();
        //LocalDateTime currentTime = LocalTime.of(12,15,0);
        LocalTime morningNotification = LocalTime.of(7,40,0);
        LocalTime noonNotification = LocalTime.of(12,10,0);
        LocalTime afternoonNotification = LocalTime.of(15,40,0);
        LocalTime nightNotification = LocalTime.of(21,40,0);

        msg.append("This email contains information regarding husbandry problems across the center.");
        String schedule = null;


        foodDeprivesNotCompleted(c, u, msg);
        foodDepriveCompleteProblems(c, u, msg, currentTime);

        if (sentNotification){
            return msg.toString();
        }else {
          return null;
        }
    }

    private void foodDeprivesNotCompleted (Container c, User u, StringBuilder msg){
        TableInfo ti = QueryService.get().getUserSchema(u, c, "study").getTable("foodDeprivesStarted");

        Double maxHours = 22.0;

        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("hoursSinceStarted"),maxHours, CompareType.GTE);
        filter.addCondition(FieldKey.fromString("qcstate/label"),"Started",CompareType.EQUAL);

        //Sort roomCage = new Sort(FieldKey.fromString("room"));
        //roomCage.insertSortColumn(FieldKey.fromString("room"), Sort.SortDirection.ASC);

        TableSelector ts = new TableSelector(ti, PageFlowUtil.set("id","date","depriveStartTime","restoredTime"),filter, null);

        long count = ts.getRowCount();
        if (count > 0)
        {
            Set<foodDepriveInfo> startedFoodDeprives = new HashSet<>();
            startedFoodDeprives.addAll(Arrays.asList(ts.getArray(foodDepriveInfo.class)));
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


        } else{
            setSentNotification(false);
        }

    }

    public void foodDepriveCompleteProblems(Container c, User u, StringBuilder msg, LocalDateTime currentTime){
        TableInfo ti = QueryService.get().getUserSchema(u, c, "study").getTable("foodDeprivesStarted");
        LocalDateTime reportPeriod = currentTime.minusDays(2);

        Date dateFilter = java.sql.Timestamp.valueOf(reportPeriod);
        Double maxHours = 24.0;

        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("date"), dateFilter, CompareType.GTE);
        filter.addCondition(FieldKey.fromString("qcstate/label"), "Completed", CompareType.EQUAL);
        filter.addCondition(FieldKey.fromString("hoursSinceStarted"),maxHours, CompareType.GTE);

        TableSelector ts = new TableSelector(ti, PageFlowUtil.set("id","date","depriveStartTime","restoredTime"), filter, null);

        long count = ts.getRowCount();

        if (count > 0){
            Set<foodDepriveInfo> CompletedFoodDeprives = new HashSet<>();
            CompletedFoodDeprives.addAll(Arrays.asList(ts.getArray(foodDepriveInfo.class)));
            int overFoodDeprives = 0;
            for (foodDepriveInfo row : CompletedFoodDeprives){
                if (row.timeSinceStarted() >= 24)  {
                    overFoodDeprives++;
                }
            }
            if (overFoodDeprives > 0){
                setSentNotification(true);

                msg.append("<p><b>WARNING: There are "+ overFoodDeprives + " food deprives in the last two days that were completed and ran for more than 24 hours.</b><br>");
                if (overFoodDeprives > 0 ){
                    msg.append("<a href='" + getExecuteQueryUrl(c, "study", "FoodDeprivesStarted", "CompletedErrors") + "'>Click here to view this list</a></p>\n");
                }
            }
        }
    }

    public static class foodDepriveInfo implements Comparable<foodDepriveInfo>
    {
        private String _id;
        private Date _date;
        private LocalDateTime _depriveStartTime;
        private LocalDateTime _restoredTime;

        public foodDepriveInfo(){}

        @Override
        public int compareTo (@NotNull foodDepriveInfo currentTime){
            if (_restoredTime == null){
                return toIntExact(ChronoUnit.HOURS.between(getDepriveStartTime(),currentTime.getDepriveStartTime()));
            }else{
                return toIntExact(ChronoUnit.HOURS.between(getDepriveStartTime(), getRestoredTime()));
            }
        }


        public int timeSinceStarted (){
            foodDepriveInfo currentTime = new foodDepriveInfo();
            Date today = new Date();
            currentTime.setDepriveStartTime(today);
            return this.compareTo(currentTime);
        }

        public String getId(){return _id;}

        public void setId(String Id){_id=Id;}

        public Date getDate(){return _date;}

        public void setDate(Date date){_date = date;}

        public LocalDateTime getDepriveStartTime(){return _depriveStartTime;}

        //TODO: fix class to set depriveStartTime and restoredTime, at the moment it does not add values to these arguments.
        public void setDepriveStartTime(Date depriveStartTime){
            _depriveStartTime= convertToLocalDateTimeViaInstant(depriveStartTime);
        }

        public LocalDateTime getRestoredTime(){return _restoredTime;}

        public void setRestoredTime(Date restoredTime){
            if (restoredTime == null)
            {
                _restoredTime=convertToLocalDateTimeViaInstant(new Date());
            }else{
                _restoredTime = convertToLocalDateTimeViaInstant(restoredTime);
            }
        }
        public LocalDateTime convertToLocalDateTimeViaInstant(Date dateToConvert) {
            return dateToConvert.toInstant()
                    .atZone(ZoneId.systemDefault())
                    .toLocalDateTime();
        }



    }


}