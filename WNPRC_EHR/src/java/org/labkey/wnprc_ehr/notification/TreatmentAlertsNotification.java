/*
 * Copyright (c) 2012-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.labkey.wnprc_ehr.notification;

import org.apache.commons.lang3.time.DateUtils;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.ConvertHelper;
import org.labkey.api.data.Results;
import org.labkey.api.data.ResultsImpl;
import org.labkey.api.data.RuntimeSQLException;
import org.labkey.api.data.Selector;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.Sort;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.module.Module;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.security.User;
import org.labkey.api.util.PageFlowUtil;
import org.labkey.wnprc_ehr.WNPRC_EHREmail;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Calendar;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.Map;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.TreeMap;

/**
 * User: dnicolalde
 * Date: 11/11/15
 * Time: 8:29 PM
 */
public class TreatmentAlertsNotification extends AbstractEHRNotification
{
    public TreatmentAlertsNotification(Module owner)
    {
        super(owner);
    }

    public String getName()
    {
        return "WNPRC Treatment Alerts";
    }

    public String getDescription()
    {
        return "This runs every day at 10AM, 1PM, 3PM, and 5PM if there are treatments scheduled that have not yet been marked complete";
    }

    @Override
    public String getEmailSubject(Container c)
    {
        return "Daily Treatment Alerts: " + _dateTimeFormat.format(new Date());
    }

    @Override
    public String getCronString()
    {
        return "0 0 10,13,15,17 * * ?";
    }

    public String getScheduleDescription()
    {
        return "daily at 10AM, 1PM, 3PM, 5PM";
    }

    @Override
    public String getMessageBodyHTML(Container c, User u)
    {
        StringBuilder msg = new StringBuilder();

        //Find today's date
        final Date now = new Date();
        msg.append("This email contains any treatments not marked as completed.  It was run on: " + _dateFormat.format(now) + " at " + _timeFormat.format(now) + ".<p>");

        findTreatmentsWithoutProject(c, u, msg);
        findRoomswithObs(c,u,msg,new Date());
        processTreatments(c, u, msg, new Date());
        noProjectAssignment(c, u, msg, new Date());
        processTreatment(c, u, msg, new Date(), "AM");
        processTreatment(c,u,msg,new Date(),"Noon");
        processTreatment(c,u,msg,new Date(),"PM");
        processTreatment(c,u,msg,new Date(),"Any Time");
        processTreatment(c, u, msg, new Date(), "Night");
        treatmentDiffer(c, u, msg);
        treatmentNotLiveAnimals(c, u, msg);
        problemListNotLive(c,u,msg);




        return msg.toString();
    }

    private void findTreatmentsWithoutProject(Container c, User u, StringBuilder msg)
    {
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("Id/DataSet/Demographics/calculated_status"), "Alive");
        filter.addCondition(FieldKey.fromString("projectStatus"), null, CompareType.NONBLANK);
        filter.addCondition(FieldKey.fromString("date"), new Date(), CompareType.DATE_EQUAL);

        TableInfo ti = getStudySchema(c, u).getTable("treatmentSchedule");
        TableSelector ts = new TableSelector(ti, filter, new Sort("room"));
        long total = ts.getRowCount();
        if (total > 0)
        {
           msg.append("<b>WARNING: There are " + total + " scheduled treatments where the animal is not assigned to the project.</b><br>");
           msg.append("<p><a href='" + getExecuteQueryUrl(c, "study", "treatmentSchedule", null) + "&query.projectStatus~isnonblank&query.Id/DataSet/Demographics/calculated_status~eq=Alive&query.date~dateeq=$datestr'>Click here to view them</a><br>\n");
           msg.append("<hr>\n");
       }
    }

    private void processTreatments(Container c, User u, final StringBuilder msg, final Date maxDate)
    {
        Date curDate = new Date();
        Date roundedMax = new Date();
        roundedMax.setTime(maxDate.getTime());
        //roundedMax.setTime(maxDate.getTime() -  1* 24 * 60 * 60 * 1000);
        roundedMax = DateUtils.truncate(roundedMax, Calendar.DATE);

        TableInfo ti = QueryService.get().getUserSchema(u, c, "study").getTable("treatmentSchedule");

        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("date"), roundedMax, CompareType.DATE_EQUAL);
        filter.addCondition(FieldKey.fromString("date"), maxDate, CompareType.LTE);
        filter.addCondition(FieldKey.fromString("Id/DataSet/Demographics/calculated_status"), "Alive");

        Set<FieldKey> columns = new HashSet<>();
        columns.add(FieldKey.fromString("Id"));
        columns.add(FieldKey.fromString("CurrentArea"));
        columns.add(FieldKey.fromString("CurrentRoom"));
        columns.add(FieldKey.fromString("CurrentCage"));
        columns.add(FieldKey.fromString("TimeOfDay"));

        //columns.add(FieldKey.fromString("Id/curLocation/area"));
        //columns.add(FieldKey.fromString("Id/curLocation/room"));
        //columns.add(FieldKey.fromString("Id/curLoation/cage"));
        columns.add(FieldKey.fromString("projectStatus"));
        columns.add(FieldKey.fromString("treatmentStatus"));
        columns.add(FieldKey.fromString("treatmentStatus/Label"));
        columns.add(FieldKey.fromString("code"));
        columns.add(FieldKey.fromString("code/meaning"));

        Map<String, Object> params = new HashMap<>();
        params.put("StartDate", roundedMax);
        params.put("NumDays", 1);

        final Map<FieldKey, ColumnInfo> colMap = QueryService.get().getColumns(ti, columns);
        //TableSelector ts = new TableSelector(ti, colMap.values(), filter, new Sort("Id/curLocation/area,Id/curLocation/room"));
        TableSelector ts = new TableSelector(ti, colMap.values(), filter, new Sort("CurrentArea,CurrentRoom"));
        ts.setNamedParameters(params);

        String url = getExecuteQueryUrl(c, "study", "treatmentSchedule", null) + "&" + filter.toQueryString("query") + getParameterUrlString(params);
        long total = ts.getRowCount();
        if (total == 0)
        {
            msg.append("There are no treatments scheduled on " + _dateFormat.format(maxDate) + " on or before " + _timeFormat.format(maxDate) + ". Treatments could be added after this email was sent, so please <a href='" + url + "'>click here to check online</a> closer to the time.<hr>\n");
        }
        else
        {
            final String completed = "completed";
            final String incomplete = "incomplete";
            final Map<String, Integer> totals = new HashMap<>();
            totals.put(completed, 0);
            totals.put(incomplete, 0);

            final Map<String, Integer> totalByArea = new TreeMap<>();
            final Map<String, Integer> totalByTime = new TreeMap<>();

            ts.forEach(new Selector.ForEachBlock<ResultSet>()
            {
                @Override
                public void exec(ResultSet object) throws SQLException
                {
                    Results rs = new ResultsImpl(object, colMap);
                    if ("Completed".equals(rs.getString(FieldKey.fromString("treatmentStatus/Label"))))
                    {
                        totals.put(completed, totals.get(completed) + 1);
                    }
                    else
                    {
                        totals.put(incomplete, totals.get(incomplete) + 1);

                        String area = rs.getString(FieldKey.fromString("CurrentArea"));
                        Integer areaVal = totalByArea.containsKey(area) ? totalByArea.get(area) : 0;
                        areaVal++;

                        totalByArea.put(area, areaVal);

                        String timeofday = rs.getString(FieldKey.fromString("TimeOfDay"));
                        Integer timeVal = totalByTime.containsKey(timeofday) ? totalByTime.get(timeofday) : 0;
                        timeVal++;

                        totalByTime.put(timeofday, timeVal);
                    }
                }
            });

            msg.append("<b>All Treatments Summary:</b><p>");
            msg.append("There are " + (totals.get(completed) + totals.get(incomplete)) + " scheduled treatments on or before " + _timeFormat.format(maxDate) + ".  <a href='" + url + "'>Click here to view them</a>.  Of these, " + totals.get(completed) + " have been marked completed.</p>\n");

            if (totals.get(incomplete) == 0)
            {
                msg.append("All treatments scheduled prior to " + _timeFormat.format(maxDate) + " have been marked complete as of " + _dateTimeFormat.format(curDate) + ".<p>\n");
            }
            else
            {
                msg.append("There are " + totals.get(incomplete) + " treatments that have not been marked complete:<p>\n");
                msg.append("<table border=1 style='border-collapse: collapse;'>");
                msg.append("<tr><td><b>AREA</b></td><td><b>Number</b></td></tr>\n");

                for (String area : totalByArea.keySet())
                {
                    msg.append("<tr><td><b>" + area + ":</b></td><td><a href='" + url + "&query.Id/curLocation/area~eq=" + area + "'>" + totalByArea.get(area) + "</a></td></tr>\n");
                }

                msg.append("</table><p>\n");

                msg.append("Incomplete Treatments by time of day:<p>\n");
                msg.append("<table border=1 style='border-collapse: collapse;'>");
                msg.append("<tr><td><b>Time of Day</b></td><td><b>Number</b></td></tr>\n");

                for (String timeofday : totalByTime.keySet())
                {
                    msg.append("<tr><td><b><a href='#"+timeofday+"'>" + timeofday + ":</a></b></td><td><a href='" + url + "&query.timeOfDay~eq=" + timeofday + "'>" + totalByTime.get(timeofday) + "</a></td></tr>\n");
                }

                msg.append("</table><p>\n");
            }
            msg.append("<hr>\n");
        }
    }
    private void findRoomswithObs(Container c, User u, final StringBuilder msg, final Date maxDate){

        Date roundedMax = new Date();
        roundedMax.setTime(maxDate.getTime());
        roundedMax = DateUtils.truncate(roundedMax, Calendar.DATE);

        TableInfo ti = QueryService.get().getUserSchema(u, c, "ehr").getTable("RoomsWithoutObsToday");

        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("hasObs"), 'N', CompareType.EQUAL);
        //filter.addCondition(FieldKey.fromString("date"), maxDate, CompareType.LTE);
        //filter.addCondition(FieldKey.fromString("Id/DataSet/Demographics/calculated_status"), "Alive");

        TableSelector ts = new TableSelector(ti, PageFlowUtil.set("area", "room", "hasObs"), filter, null);

        String url = getExecuteQueryUrl(c, "ehr", "RoomsWithoutObsToday", null);
        long total = ts.getRowCount();
        if (total == 0){

            msg.append("There are no treatments scheduled on " + _dateFormat.format(maxDate) + " on or before " + _timeFormat.format(maxDate) + ". Treatments could be added after this email was sent, so please <a href='" + url + "'>click here to check online</a> closer to the time.<hr>\n");

        }
        else
        {
            msg.append("The following rooms do not have any obs for today as of "+ _timeFormat.format(maxDate)+"<br>\n");
            ts.forEach(new Selector.ForEachBlock<ResultSet>()
            {
                @Override
                public void exec(ResultSet rs) throws SQLException
                {

                    msg.append(rs.getString("room") + "<br>");

                }

            });
            msg.append("<hr>\n");
        }



    }
    private void noProjectAssignment (Container c, User u, final StringBuilder msg, final Date maxDate){

        Date curDate = new Date();
        Date roundedMax = new Date();
        roundedMax.setTime(maxDate.getTime());
        roundedMax = DateUtils.truncate(roundedMax, Calendar.DATE);

        TableInfo ti = QueryService.get().getUserSchema(u, c, "study").getTable("treatmentSchedule");

        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("date"), roundedMax, CompareType.DATE_EQUAL);
        filter.addCondition(FieldKey.fromString("date"), maxDate, CompareType.LTE);
        filter.addCondition(FieldKey.fromString("Id/DataSet/Demographics/calculated_status"), "Alive");
        filter.addCondition(FieldKey.fromString("projectStatus"),null,CompareType.NONBLANK);

        TableSelector ts = new TableSelector(ti,PageFlowUtil.set("id","frequency","meaning"),filter, null);
        long total = ts.getRowCount();

        if (total==0){
            msg.append("All scheduled treatments have projects associated with them<br><hr>\n");
        }
        else {
            msg.append("There are "+total+" schedule treatments without a project associated with them.<p>");
            msg.append("<table border=1 style='border-collapse: collapse;'>");
            msg.append("<tr><td><b>Id</b></td><td><b>Short Name</b></td><td><b>Frequency</b></td></tr>\n");

            ts.forEach(new Selector.ForEachBlock<ResultSet>()
            {
                @Override
                public void exec(ResultSet rs) throws SQLException
                {
                    msg.append("<tr><td>" + rs.getString("id") + "</td><td> " + rs.getString("meaning") + "</td><td>" + rs.getString("frequency") + "</td></tr>");
                }
            });
            msg.append("</table><p>\n");
        }


    }
    private void processTreatment(Container c, User u, final StringBuilder msg, final Date maxDate, String timeofDay ){

        Date curDate = new Date();
        Date roundedMax = new Date();
        int hourofDay=  Integer.parseInt(_hourFormat.format(curDate).toString());
        int hourofReport;
        switch(timeofDay){
            case "AM": hourofReport = 10;
                break;
            case "Noon": hourofReport = 12;
                break;
            case "PM": hourofReport = 14;
                break;
            case "Any Time": hourofReport = 14;
                break;
            case "Night": hourofReport = 17;
                break;
            default : hourofReport = 14;
                break;
        }

        if (hourofDay<hourofReport){
            msg.append("<b><a name ='"+timeofDay+"'></a>Treatments " +timeofDay+":</b><p>");
            msg.append("It is too early in the day to send warnings about incomplete treatments for "+ timeofDay+ " treatments.\n");
            msg.append("<hr>\n");
            return;
        }

        //roundedMax.setTime(maxDate.getTime() - 1 * 24 * 60 * 60 * 1000);
        roundedMax.setTime(maxDate.getTime());
        roundedMax = DateUtils.truncate(roundedMax, Calendar.DATE);
        Set<FieldKey> fieldKeys = PageFlowUtil.set(
                FieldKey.fromParts("Id"),
                FieldKey.fromParts("CurrentArea"),
                FieldKey.fromParts("CurrentRoom"),
                FieldKey.fromParts("CurrentCage"),
                FieldKey.fromParts("projectStatus"),
                FieldKey.fromParts("treatmentStatus"),
                FieldKey.fromParts("treatmentStatus", "Label"),
                FieldKey.fromParts("meaning"),
                FieldKey.fromParts("code"),
                FieldKey.fromParts("route"),
                FieldKey.fromParts("remark"));





        TableInfo ti = QueryService.get().getUserSchema(u, c, "study").getTable("treatmentSchedule");

        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("date"), roundedMax, CompareType.DATE_EQUAL);
        filter.addCondition(FieldKey.fromString("timeOfDay"), timeofDay, CompareType.EQUAL);
        filter.addCondition(FieldKey.fromString("Id/DataSet/Demographics/calculated_status"), "Alive");
        Collection<ColumnInfo> cols = QueryService.get().getColumns(ti, fieldKeys).values();

        TableSelector ts = new TableSelector(ti, cols, filter, null);

        Map<String, Object> params = new HashMap<>();
        params.put("StartDate", roundedMax);
        params.put("NumDays", 1);

        String url = getExecuteQueryUrl(c, "study", "treatmentSchedule", null) + "&" + filter.toQueryString("query") + getParameterUrlString(params);
        long total = ts.getRowCount();

        if(total ==0){
            msg.append("There are no scheduled "+ timeofDay +" treatments as of "+ _timeFormat.format(curDate)+". Treatments could be added after this email was sent, so please check online closer to the time.<hr>");
        }
        else{
            String completed = "completed";
            final String incomplete = "incomplete";

            final Map<String, Integer> totals = new HashMap<>();
            totals.put(completed, 0);
            totals.put(incomplete, 0);

            final Map<String, Integer> totalByArea = new TreeMap<>();

            Results r = ts.getResults();

            try{

                while (r.next())
                {
                    String status = r.getString(FieldKey.fromParts("treatmentStatus", "Label")); //getString returns null and Java cannot interpret that to a valid string
                    if ("Completed".equals(status))
                    {
                        totals.put(completed, totals.get(completed) + 1);
                    }
                    else
                    {
                        totals.put(incomplete, totals.get(incomplete) + 1);
                        String area = r.getString(FieldKey.fromParts("CurrentArea"));
                        Integer areaVal = totalByArea.containsKey(area) ? totalByArea.get(area) : 0;
                        areaVal++;
                        totalByArea.put(area, areaVal);

                    }
                }
            }catch (SQLException e){

                throw new RuntimeSQLException(e);
            }
            finally{
                try{
                r.close();

                }catch (SQLException e){

                    throw new RuntimeSQLException(e);
                }
            }

            msg.append("<b><a name ='"+timeofDay+"'></a>Treatments " +timeofDay+":</b><p>");
            msg.append("There are " + (totals.get(completed) + totals.get(incomplete)) + " scheduled treatments on or before " + _timeFormat.format(maxDate) + ".  <a href='" + url + "'>Click here to view them</a>.  Of these, " + totals.get(completed) + " have been marked completed.</p>\n");

            if (totals.get(incomplete) == 0)
            {
                msg.append("All treatments scheduled prior to " + _timeFormat.format(maxDate) + " have been marked complete as of " + _timeFormat.format(curDate) + ".<p>\n");
            }
            else
            {
                msg.append("There are " + totals.get(incomplete) + " treatments that have not been marked complete:<p>\n");
                msg.append("<table border=1 style='border-collapse: collapse;'>");
                msg.append("<tr><td><b>AREA</b></td><td><b>Number</b></td></tr>\n");

                for (String area : totalByArea.keySet())
                {
                    msg.append("<tr><td><b>" + area + ":</b></td><td><a href='" + url + "&query.Id/curLocation/area~eq=" + area + "'>" + totalByArea.get(area) + "</a></td></tr>\n");
                }

                msg.append("</table><p>\n");
            }
            msg.append("<hr>\n");

        }
    }
    public void treatmentDiffer(Container c, User u, final StringBuilder msg){

        Date roundedMax = new Date();
        Calendar currentDay = Calendar.getInstance();
        roundedMax.setTime(currentDay.getTimeInMillis());

        //TODO: Added another method that can accept different days
        /*Calendar currentDay = Calendar.getInstance();
        currentDay.setTime(roundedMax);
        currentDay.add(Calendar.DATE, -1);
        roundedMax.setTime(currentDay.getTimeInMillis());*/

        TableInfo ti = QueryService.get().getUserSchema(u, c, "study").getTable("TreatmentsThatDiffer");

        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("date"), roundedMax, CompareType.DATE_EQUAL);

        TableSelector ts = new TableSelector(ti,filter, new Sort("+CurrentArea,+CurrentRoom"));

        long total = ts.getRowCount();

        if (total ==0){
            msg.append("All entered treatments given match what was ordered. <hr>");
        }
        else {
            msg.append("<b>Treatments that differ from what was ordered by Area</b> <p />");
            Map<String,Object>[] resultsDifferTreatment = ts.getMapArray();
            List<ArrayList> Area = new ArrayList<>();

            HashMap<String,HashMap> areaHash = new HashMap<>();


            if (resultsDifferTreatment.length>0)
            {
                for (Map<String,Object> treatmentMap : resultsDifferTreatment){

                    String loopArea = ConvertHelper.convert(treatmentMap.get("CurrentArea"),String.class);
                    String loopRoom = ConvertHelper.convert(treatmentMap.get("CurrentRoom"),String.class);

                    HashMap <String,LinkedList> roomHash ;
                    if (!areaHash.containsKey(loopArea)){
                        roomHash = new HashMap<String,LinkedList>();
                        areaHash.put(loopArea,roomHash);
                    }

                    roomHash = areaHash.get(loopArea);
                    LinkedList<Map> differTreatments;

                    if (!roomHash.containsKey(loopRoom)){
                        differTreatments = new LinkedList<Map>();
                        roomHash.put(loopRoom, differTreatments);
                    }

                    differTreatments=roomHash.get(loopRoom);
                    differTreatments.add(treatmentMap);
                    roomHash.put(loopRoom, differTreatments);
                }

                WNPRC_EHREmail<HashMap<String,HashMap>> email = new WNPRC_EHREmail<>("/org/labkey/wnprc_ehr/emailViews/email.jsp");
                String emailContents = new String ();
                try{
                    emailContents = email.renderEmail(areaHash);

                }catch (Exception e){
                    System.err.print("invalid areaHash sent to renderEmail");
                }

                msg.append(emailContents+ "<hr>");
            }
        }
    }


    public void treatmentNotLiveAnimals(Container c, User u, final StringBuilder msg ){

        TableInfo ti = QueryService.get().getUserSchema(u, c, "study").getTable("treatment_order");
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("Id/DataSet/Demographics/calculated_status"), "Alive",CompareType.NEQ_OR_NULL);
        filter.addCondition(FieldKey.fromString("enddate"),' ', CompareType.ISBLANK);

        TableSelector ts = new TableSelector(ti,filter, null);

        long total = ts.getRowCount();
        if (total > 0)
        {
            msg.append("<b>WARNING: There are " + total + " active treatments for animals not currently at WNPRC.</b><br>");
            msg.append("<p><a href='" + getExecuteQueryUrl(c, "study", "treatment_order", null) + "&query.enddate~isnonblank&query.Id/DataSet/Demographics/calculated_status~neqornull=Alive'>Click here to view them</a><br>\n");
            msg.append("<hr>\n");
        }


    }

    public void problemListNotLive (Container c, User u, final StringBuilder msg ){

        TableInfo ti = QueryService.get().getUserSchema(u, c, "study").getTable("problem");
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("Id/DataSet/Demographics/calculated_status"), "Alive",CompareType.NEQ_OR_NULL);
        filter.addCondition(FieldKey.fromString("enddate"),' ', CompareType.ISBLANK);

        TableSelector ts = new TableSelector(ti,filter, null);

        long total = ts.getRowCount();
        if (total > 0)
        {
            msg.append("<b>WARNING: There are " + total + " unresolved problems for animals not currently at WNPRC.</b><br>");
            msg.append("<p><a href='" + getExecuteQueryUrl(c, "study", "problem", null) + "&query.enddate~isnonblank&query.Id/DataSet/Demographics/calculated_status~neqornull=Alive'>Click here to view them</a><br>\n");
            msg.append("<hr>\n");
        }

    }
}