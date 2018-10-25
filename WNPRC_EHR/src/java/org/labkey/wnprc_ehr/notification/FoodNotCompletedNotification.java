package org.labkey.wnprc_ehr.notification;

import clover.retrotranslator.edu.emory.mathcs.backport.java.util.Arrays;
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
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

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

        //LocalTime currentTime = LocalTime.now();
        LocalTime currentTime = LocalTime.of(12,15,0);
        LocalTime morningNotification = LocalTime.of(7,40,0);
        LocalTime noonNotification = LocalTime.of(12,10,0);
        LocalTime afternoonNotification = LocalTime.of(15,40,0);
        LocalTime nightNotification = LocalTime.of(21,40,0);

        msg.append("This email contains information regarding husbandry problems across the center.");
        String schedule = null;


        foodDeprivesNotCompleted(c, u, msg, currentTime);

        if (sentNotification){
            return msg.toString();
        }else {
          return null;
        }
    }

    private void foodDeprivesNotCompleted (Container c, User u, StringBuilder msg, LocalTime currentTime){
        TableInfo ti = QueryService.get().getUserSchema(u, c, "study").getTable("FoodDeprivesProblems");

        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("qcstate/label"), "Started", CompareType.EQUAL);

        Sort roomCage = new Sort(FieldKey.fromString("room"));
        //roomCage.insertSortColumn(FieldKey.fromString("room"), Sort.SortDirection.ASC);

        TableSelector ts = new TableSelector(ti, PageFlowUtil.set("id","date","depriveStartTime"),filter, roomCage);

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
                //row.get("depriveStartTime");

            }



            msg.append("<p><b>WARNING: There are "+ overFoodDeprives + " food deprives that are scheduled for today but have not started</b><br>");
            /*if (schedule != null){
                msg.append("<a href='" + getExecuteQueryUrl(c, "study", "FoodDeprivesProblems", "Scheduled") + "&query.schedule~eq="+ schedule + "'>Click here to view this list</a></p>\n");

            }else {
                msg.append("<a href='" + getExecuteQueryUrl(c, "study", "FoodDeprivesProblems", "Scheduled") + "'>Click here to view this list</a></p>\n");

            }*/
        } else{
            setSentNotification(false);
        }

    }
    public static class foodDepriveInfo implements Comparable<foodDepriveInfo>
    {
        private Date _date;
        private String _id;
        private LocalDateTime _fdStartTime;

        public foodDepriveInfo(){}

        public foodDepriveInfo (Date date, String id, LocalDateTime fdStartTime ){
            _date = date;
            _id = id;
            _fdStartTime = fdStartTime;
        }

        @Override
        public int compareTo (@NotNull foodDepriveInfo currentTime){
            return getDateTime().compareTo(currentTime.getDateTime());
        }

        public LocalDateTime getDateTime(){return _fdStartTime;}

        public int timeSinceStarted (){
            LocalDateTime currentTime = LocalDateTime.now();
            return this.getDateTime().compareTo(currentTime);
        }

        public String getId(){return _id;}

    }


}