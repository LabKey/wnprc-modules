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

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.labkey.api.collections.CaseInsensitiveHashMap;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.ConvertHelper;
import org.labkey.api.data.Selector;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.module.Module;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.User;
import org.labkey.api.util.GUID;
import org.labkey.api.util.PageFlowUtil;
import org.labkey.api.query.BatchValidationException;

import java.sql.ResultSet;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * User: bbimber
 * Date: 7/14/12
 * Time: 3:16 PM
 */
public class WaterMonitoringNotification extends AbstractEHRNotification
{
    public WaterMonitoringNotification(Module owner)
    {
        super(owner);
    }

    @Override
    public String getName()
    {
        return "Water Monitoring";
    }

    public String getCategory(){
        return "Husbandry";
    }

    private static final Logger _log = LogManager.getLogger(WaterMonitoringNotification.class);

    @Override
    public String getEmailSubject(Container c)
    {
        return "Daily Water Monitoring: " + AbstractEHRNotification._dateTimeFormat.format(new Date());
    }

    @Override
    public String getCronString() { return "0 0 13 * * ?"; }

    @Override
    public String getScheduleDescription()
    {
        return "every day at 1PM";
    }

    @Override
    public String getDescription()
    {
        return "The report is designed to identify potential problems with the colony, primarily related to weights, housing and assignments.";
    }

    @Override
    public String getMessageBodyHTML(final Container c, User u)
    {
        final StringBuilder msg = new StringBuilder();

        //Find today's date
        Date now = new Date();
        msg.append("This email contains a series of automatic alerts about the colony.  It was run on: " + AbstractEHRNotification._dateFormat.format(now) + " at " + AbstractEHRNotification._timeFormat.format(now) + ".<p>");



        return msg.toString();
    }
    protected void findAnimalsWithEnoughWater(final Container c, final User u, final StringBuilder msg)
    {
        Calendar cal = Calendar.getInstance();
        cal.setTime(new Date());

        TableInfo waterTotalByDateWithWeightReport = QueryService.get().getUserSchema(u,c,"study").getTable("waterTotalByDateWithWeight");


        SimpleFilter.OrClause orClause = new SimpleFilter.OrClause();
        orClause.addClause(new SimpleFilter(FieldKey.fromString("mlsPerKg"), 20, CompareType.LT).getClauses().get(0));
        orClause.addClause(new SimpleFilter(FieldKey.fromString("mlsPerKg"),null, CompareType.ISBLANK).getClauses().get(0));
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("date"), cal.getTime(), CompareType.DATE_EQUAL);
        filter.addClause(orClause);
        Set<FieldKey> colKeys = new HashSet<>();
        colKeys.add(FieldKey.fromString("Id"));
        colKeys.add(FieldKey.fromString("date"));
        colKeys.add(FieldKey.fromString("mlsPerKg"));
        colKeys.add(FieldKey.fromString("TotalWater"));
        colKeys.add(FieldKey.fromString("project"));
        colKeys.add(FieldKey.fromString("currentWaterCondition"));
        colKeys.add(FieldKey.fromString("Id/curLocation/location"));

        final Map<FieldKey, ColumnInfo> columns = QueryService.get().getColumns(waterTotalByDateWithWeightReport, colKeys);


        TableSelector ts = new TableSelector(waterTotalByDateWithWeightReport, columns.values(), filter, null);
        //TableSelector ts = new TableSelector(getStudySchema(c, u).getTable("waterTotalByDateWithWeight"),PageFlowUtil.set("Id","date","mlsPerKg","TotalWater","project","currentWaterCondition"), filter, null);
        long count = ts.getRowCount();
        if (count > 0)
        {

            Map<String,Object>[] totalWaterForDay = ts.getMapArray();

            //Organizing report by project
            Map<Integer, List<Map<String,Object>>> projectMap = new HashMap<>();
            int animalsWaterMeaning = 0;
            Map<Integer, List<Map<String,Object>>> lixitMap = new HashMap<>();
            int animalsInLixit = 0;
            for(Map<String,Object> mapItem : totalWaterForDay){
                int projectNum = ConvertHelper.convert(mapItem.get("project"),Integer.class);
                List<Map<String,Object>> waterTotalsFromDb;
                if (ConvertHelper.convert(mapItem.get("currentWaterCondition"),String.class).equals("regulated")){
                    if (!projectMap.containsKey(projectNum)){
                        waterTotalsFromDb = new ArrayList<>();
                        projectMap.put(projectNum,waterTotalsFromDb);
                    }else{
                        waterTotalsFromDb = projectMap.get(projectNum);
                    }
                    waterTotalsFromDb.add(mapItem);
                    animalsWaterMeaning++;
                }else{
                    if (!lixitMap.containsKey(projectNum)){
                        waterTotalsFromDb = new ArrayList<>();
                        lixitMap.put(projectNum,waterTotalsFromDb);
                    }else{
                        waterTotalsFromDb = lixitMap.get(projectNum);
                    }
                    waterTotalsFromDb.add(mapItem);
                    animalsInLixit++;

                }
            }

            msg.append("<b>WARNING: There are " + animalsWaterMeaning + " animals that have remaining water for today.</b><br>\n");

            msg.append("<table border=1 style='border-collapse: collapse;'>");
            msg.append("<tr><td style='padding: 5px; text-align: center;'><strong>Project</strong></td>" +
                    "<td style='padding: 5px; text-align: center;'><strong>Id</strong></td>" +
                    "<td style='padding: 5px; text-align: center;'><strong>Date</strong></td>" +
                    "<td style='padding: 5px; text-align: center;'><strong>Location</strong></td>" +
                    "<td style='padding: 5px; text-align: center;'><strong>mlsPerKg</strong></td>" +
                    "<td style='padding: 5px; text-align: center;'><strong>Total Water Given</strong></td></tr>\n");

            for (Map.Entry<Integer,List<Map<String,Object>>> entry : projectMap.entrySet()){
                List<Map<String,Object>> totalWaterByProject = entry.getValue();
                String mlsPerKg;
                String totalWater;
                for(Map<String,Object> mapItem : totalWaterByProject){
                    LocalDateTime objectDateTime = ConvertHelper.convert(mapItem.get("date"),Date.class).toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();
                    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

                    mlsPerKg = ConvertHelper.convert(mapItem.get("mlsPerKg"),String.class) == null ? " " : ConvertHelper.convert(mapItem.get("mlsPerKg"),String.class);
                    totalWater = ConvertHelper.convert(mapItem.get("TotalWater"),String.class) == null ? " " : ConvertHelper.convert(mapItem.get("TotalWater"),String.class);

                    msg.append("<tr><td style='padding: 5px;'>" + ConvertHelper.convert(mapItem.get("project"),Integer.class)
                            + "</td><td style='padding: 5px; text-align: center;'> " + ConvertHelper.convert(mapItem.get("Id"),String.class)
                            + "</td><td style='padding: 5px; text-align: center;'> " + objectDateTime.format(formatter)
                            + "</td><td style='padding: 5px; text-align: center;'> " + ConvertHelper.convert(mapItem.get("id_fs_curlocation_fs_location"),String.class)
                            + "</td><td style='padding: 5px; text-align: center;'> " + mlsPerKg
                            + "</td><td style='padding: 5px; text-align: center;'> " + totalWater
                            +"</td></tr>" );

                }
            }




            msg.append("</table>");
            msg.append("<p><a href='" + getExecuteQueryUrl(c, "study", "waterTotalByDateWithWeight", null) + "&query.date~dateeq=" + AbstractEHRNotification._dateFormat.format(cal.getTime()) +"&query.mlsPerKg~lt=20'>Click here to view them</a><br>\n\n");
            msg.append("<hr>\n\n");

            msg.append("<b>INFO: There are " + animalsInLixit + " animals that are in Lixit condition.</b><br>\n");
            msg.append("<table border=1 style='border-collapse: collapse;'>");
            msg.append("<tr><td style='padding: 5px; text-align: center;'><strong>Project</strong></td>" +
                    "<td style='padding: 5px; text-align: center;'><strong>Id</strong></td>" +
                    "<td style='padding: 5px; text-align: center;'><strong>Date</strong></td>" +
                    "<td style='padding: 5px; text-align: center;'><strong>Location</strong></td>" +
                    "<td style='padding: 5px; text-align: center;'><strong>Condition at Time</strong></td></tr>\n");

            for (Map.Entry<Integer,List<Map<String,Object>>> entry : lixitMap.entrySet()){
                List<Map<String,Object>> AnimalsInLixit = entry.getValue();
                String condition;

                for(Map<String,Object> mapItem : AnimalsInLixit){
                    LocalDateTime objectDateTime = ConvertHelper.convert(mapItem.get("date"),Date.class).toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();
                    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

                    condition = ConvertHelper.convert(mapItem.get("currentWaterCondition"),String.class) == null ? " " : ConvertHelper.convert(mapItem.get("currentWaterCondition"),String.class);

                    msg.append("<tr><td style='padding: 5px;'>" + ConvertHelper.convert(mapItem.get("project"),Integer.class)
                            + "</td><td style='padding: 5px; text-align: center;'> " + ConvertHelper.convert(mapItem.get("Id"),String.class)
                            + "</td><td style='padding: 5px; text-align: center;'> " + objectDateTime.format(formatter)
                            + "</td><td style='padding: 5px; text-align: center;'> " + ConvertHelper.convert(mapItem.get("id_fs_curlocation_fs_location"),String.class)
                            + "</td><td style='padding: 5px; text-align: center;'> " + condition
                            +"</td></tr>" );
                }
            }
            msg.append("</table>");
        }
    }

    protected  void findAnimalsWithWaterEntries(final Container c, final User u, final StringBuilder msg, final int numberOfDates){

        LocalDate date = LocalDate.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        int datesInPast = numberOfDates;

        for (int i = 0; i<datesInPast; i++){

            Map<String, Object> parameters = new CaseInsensitiveHashMap<>();
            parameters.put("CheckDate", date);

            TableInfo ti = QueryService.get().getUserSchema(u, c, "study").getTable("waterScheduledAnimalWithOutEntries");
            TableSelector ts = new TableSelector(ti,PageFlowUtil.set("Id","project","location"), null, null);
            //TableSelector ts = new TableSelector(ti, null, null);
            ts.setNamedParameters(parameters);

            long total = ts.getRowCount();

            if (total == 0)
            {
                msg.append("All regulated animals have at least one entries for "+ date.getDayOfWeek().toString() +" ("+ date.format(formatter) + ").<br>");
            }
            else
            {
                msg.append("There are " + total + " animals in the system that have no records in water given dataset for " + date.getDayOfWeek().toString() +" ("+ date.format(formatter) + ").<br>");
                msg.append("Project   - AnimalID   -  Location <br>");
                Map<String, Object>[] animalsWithOutEntries = ts.getMapArray();
                for (Map<String, Object> mapItem : animalsWithOutEntries)
                {
                    msg.append(ConvertHelper.convert(mapItem.get("project"), Integer.class) + "  "  + ConvertHelper.convert(mapItem.get("Id"), String.class) + "  "  + ConvertHelper.convert(mapItem.get("location"), String.class)+ "<br>");

                }
                msg.append("<br>");
            }
            date = date.minusDays(1);
        }


    }
    protected void findWaterOrdersNotCompleted(Container c,User u, StringBuilder msg, final LocalDateTime maxDate, boolean includeFuture){
        LocalDateTime currentTime = maxDate;
        LocalDateTime amThreshold = LocalDateTime.now().withHour(10).withMinute(30);

        //Setting interval to start the water schedule, the system generates the calendar thirty days before
        LocalDateTime roundedMax = maxDate;
        roundedMax = roundedMax.plusDays(-5).truncatedTo(ChronoUnit.DAYS);

        //final String intervalLength = "10";

        //Sending parameters to the query that generates the water schedule from water orders and water amounts
        Map<String, Object> parameters = new CaseInsensitiveHashMap<>();
        parameters.put("NumDays", 6);
        //static DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;
        String dateFormat = roundedMax.format(DateTimeFormatter.ISO_DATE_TIME);
        parameters.put("StartDate", roundedMax.toString());

        TableInfo ti = QueryService.get().getUserSchema(u,c,"study").getTable("waterScheduleCoalesced");
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("QCState/label"),"Scheduled",CompareType.EQUAL);

        if (includeFuture){
            LocalDateTime futureDate = maxDate;
            futureDate = futureDate.plusDays(1).truncatedTo(ChronoUnit.DAYS);

            filter.addCondition(FieldKey.fromString("dateOrdered"),futureDate, CompareType.LTE);
            filter.addCondition(FieldKey.fromString("dateOrdered"),currentTime, CompareType.GT);

        }else{
            filter.addCondition(FieldKey.fromString("dateOrdered"),currentTime, CompareType.LTE);
        }

        filter.addCondition(FieldKey.fromString("dateOrdered"), roundedMax,CompareType.DATE_GTE);
        // filter.addCondition(FieldKey.fromString("assignedTo"), "animalcare");
        filter.addCondition(FieldKey.fromString("actionRequired"),true,CompareType.EQUAL);

        Set<FieldKey> columns = new HashSet<>();
        columns.add(FieldKey.fromString("Id"));
        columns.add(FieldKey.fromString("dateOrdered"));
        columns.add(FieldKey.fromString("volume"));
        columns.add(FieldKey.fromString("frequencyMeaning"));
        columns.add(FieldKey.fromString("displaytimeofday"));
        columns.add(FieldKey.fromString("assignedTo"));



        final Map<FieldKey, ColumnInfo> colMap = QueryService.get().getColumns(ti, columns);


        TableSelector ts = new TableSelector(ti,colMap.values(), filter,null);
        ts.setNamedParameters(parameters);
        long total = ts.getRowCount();

        String timeofday = "AM";
        if (currentTime.isAfter(amThreshold)){
            timeofday = "PM";
        }

        if (total == 0 && !includeFuture){
            msg.append("All " + timeofday + " water orders are completed");
        }else if(total > 0){
            if(includeFuture && timeofday.equals("PM")){
                msg.append("<p><b>There are "+total+ " water orders that are scheduled for today and have not been completed</b><br>");
            }else{
                msg.append("<p><b>WARNING: There are "+total+ " water orders that have not been completed</b><br>");
            }

            Map<String,Object>[] waterOrdersScheduled = ts.getMapArray();
            List <Map<String,Object>> animalCareWaters = new ArrayList<>();
            List<Map<String,Object>> researchStaffWaters = new ArrayList<>();
            List<Map<String,Object>> spiWaters = new ArrayList<>();


            if(waterOrdersScheduled.length >0){
                for(Map<String,Object> waterSchedule : waterOrdersScheduled){
                    String assignedTo = ConvertHelper.convert(waterSchedule.get("assignedTo"),String.class);
                    if (assignedTo.equals("animalcare")){
                        animalCareWaters.add(waterSchedule);
                    }else if (assignedTo.equals("researchstaff")){
                        researchStaffWaters.add(waterSchedule);
                    }else if (assignedTo.equals("spi")){
                        spiWaters.add(waterSchedule);
                    }
                }
                StringBuilder htmlTable;
                if (!animalCareWaters.isEmpty())
                {
                    htmlTable = createTable(animalCareWaters, "Animal Care");
                    msg.append(htmlTable);
                }
                if (!researchStaffWaters.isEmpty())
                {
                    htmlTable = createTable(researchStaffWaters, "Research Staff");
                    msg.append(htmlTable);
                }
                if (!spiWaters.isEmpty())
                {
                    htmlTable = createTable(spiWaters, "SPI");
                    msg.append(htmlTable);
                }


            }
            msg.append("<br><a href='" + getExecuteQueryUrl(c,"study","waterScheduleCoalesced","Scheduled")+"&query.param.StartDate="+roundedMax+"&query.param.NumDays=" + 1 +
                    "&query.dateOrdered~lte="+currentTime+ "&query.dateOrdered~dategte="+roundedMax+"'>Click here to view schedule waters</a></p>");
        }



    }
    private StringBuilder createTable (List<Map<String,Object>> listOfDBObjects, String assignedTo){
        StringBuilder returnTable = new StringBuilder();
        returnTable.append("<br><strong>"+ assignedTo +"</strong>");
        returnTable.append("<table border=1 style='border-collapse: collapse;'>");
        returnTable.append("<tr><td style='padding: 5px; text-align: center;'><strong>Id</strong></td>" +
                "<td style='padding: 5px; text-align: center;'><strong>Date Ordered</strong></td>" +
                "<td style='padding: 5px; text-align: center;'><strong>Volume</strong></td>" +
                "<td style='padding: 5px; text-align: center;'><strong>Time of Day</strong></td>" +
                "<td style='padding: 5px; text-align: center;'><strong>Frequency</strong></td>" +
                "<td style='padding: 5px; text-align: center;'><strong>Assigned To</strong></td></tr>\n");
        for (Map<String,Object> dbObject : listOfDBObjects){
            LocalDateTime objectDateTime = ConvertHelper.convert(dbObject.get("dateOrdered"),Date.class).toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

            returnTable.append("<tr><td style='padding: 5px;'>" + ConvertHelper.convert(dbObject.get("Id"),String.class)
                    + "</td><td style='padding: 5px; text-align: center;'> " + objectDateTime.format(formatter)
                    + "</td><td style='padding: 5px; text-align: center;'> " + ConvertHelper.convert(dbObject.get("volume"),String.class)
                    + "</td><td style='padding: 5px; text-align: center;'> " + ConvertHelper.convert(dbObject.get("displaytimeofday"),String.class)
                    + "</td><td style='padding: 5px; text-align: center;'> " + ConvertHelper.convert(dbObject.get("frequencyMeaning"),String.class)
                    + "</td><td style='padding: 5px; text-align: center;'> " + ConvertHelper.convert(dbObject.get("assignedTo"),String.class) +"</td></tr>" );
        }
        returnTable.append("</table>");

        return returnTable;

    }


}

