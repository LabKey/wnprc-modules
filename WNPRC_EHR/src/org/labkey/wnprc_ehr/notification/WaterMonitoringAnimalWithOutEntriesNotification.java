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

import org.labkey.api.collections.CaseInsensitiveHashMap;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.ConvertHelper;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.module.Module;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.security.User;
import org.labkey.api.util.PageFlowUtil;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Calendar;
import java.util.Date;
import java.util.Map;


public class WaterMonitoringAnimalWithOutEntriesNotification extends AbstractEHRNotification
{
    public WaterMonitoringAnimalWithOutEntriesNotification(Module owner)
    {
        super(owner);
    }

    public String getName()
    {
        return "Water Monitoring";
    }



    @Override
    public String getEmailSubject(Container c)
    {
        return "Daily Water Monitoring: " + AbstractEHRNotification._dateTimeFormat.format(new Date());
    }

    @Override
    public String getCronString() { return "0 0 13 * * ?"; }

    public String getCategory(){
        return "Husbandry";
    }

    @Override
    public String getScheduleDescription()
    {
        return "every day at 1PM";
    }

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
        msg.append("This email contains a series of automatic alerts about the water monitoring system.  It was run on: " + AbstractEHRNotification._dateFormat.format(now) + " at " + AbstractEHRNotification._timeFormat.format(now) + ".<p>");

        //Check animals with less than 20 mls per kilogram of water for today
        findAnimalsWithEnoughWater(c,u,msg);

        //Check animals that did not get any water for today
        findAnimalsWithWaterEntries(c,u,msg);


        return msg.toString();
    }

    protected void findAnimalsWithEnoughWater(final Container c, final User u, final StringBuilder msg)
    {
        Calendar cal = Calendar.getInstance();
        cal.setTime(new Date());


        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("mlsPerKg"), 20, CompareType.LT);
        filter.addCondition(FieldKey.fromString("date"), cal.getTime(), CompareType.DATE_EQUAL);

        TableSelector ts = new TableSelector(getStudySchema(c, u).getTable("waterPrePivot"),PageFlowUtil.set("animalId","date","mlsPerKg","TotalWater"), filter, null);
        long count = ts.getRowCount();
        if (count > 0)
        {
            msg.append("<b>WARNING: There are " + count + " animals that have remaining water for today.</b><br>\n");
            Map<String,Object>[] totalWaterForDay = ts.getMapArray();
            msg.append("<table border=1 style='border-collapse: collapse;'>");
            msg.append("<tr><td style='padding: 5px; text-align: center;'><strong>Id</strong></td>" +
                    "<td style='padding: 5px; text-align: center;'><strong>Date</strong></td>" +
                    "<td style='padding: 5px; text-align: center;'><strong>mlsPerKg</strong></td>" +
                    "<td style='padding: 5px; text-align: center;'><strong>Total Water Given</strong></td></tr>\n");

            for(Map<String,Object> mapItem : totalWaterForDay){
                LocalDateTime objectDateTime = ConvertHelper.convert(mapItem.get("date"),Date.class).toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

                msg.append("<tr><td style='padding: 5px;'>" + ConvertHelper.convert(mapItem.get("animalId"),String.class)
                        + "</td><td style='padding: 5px; text-align: center;'> " + objectDateTime.format(formatter)
                        + "</td><td style='padding: 5px; text-align: center;'> " + ConvertHelper.convert(mapItem.get("mlsPerKg"),String.class)
                        + "</td><td style='padding: 5px; text-align: center;'> " + ConvertHelper.convert(mapItem.get("TotalWater"),String.class) +"</td></tr>" );

            }
            msg.append("</table>");
            msg.append("<p><a href='" + getExecuteQueryUrl(c, "study", "waterPrePivot", null) + "&query.date~dateeq=" + AbstractEHRNotification._dateFormat.format(cal.getTime()) +"&query.mlsPerKg~lt=20'>Click here to view them</a><br>\n\n");
            msg.append("<hr>\n\n");

        }
    }

    protected  void findAnimalsWithWaterEntries(final Container c, final User u, final StringBuilder msg){

        LocalDate date = LocalDate.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        int datesInPast = 5;

        for (int i = 0; i<datesInPast; i++){

            Map<String, Object> parameters = new CaseInsensitiveHashMap<>();
            parameters.put("CheckDate", date);

            TableInfo ti = QueryService.get().getUserSchema(u, c, "study").getTable("waterScheduledAnimalWithOutEntries");
            TableSelector ts = new TableSelector(ti, PageFlowUtil.set("id"), null, null);
            ts.setNamedParameters(parameters);

            long total = ts.getRowCount();

            if (total == 0)
            {
                msg.append("All regulated animals have at least one entries");
            }
            else
            {
                msg.append("There are " + total + " animals in the system that have no records in water given dataset for " + date.getDayOfWeek().toString() +" ("+ date.format(formatter) + ").<br>");
                Map<String, Object>[] animalsWithOutEntries = ts.getMapArray();
                for (Map<String, Object> mapItem : animalsWithOutEntries)
                {
                    msg.append(ConvertHelper.convert(mapItem.get("id"), String.class) + "<br>");

                }
                msg.append("<br>");
            }
            date = date.minusDays(1);
        }


    }


}

