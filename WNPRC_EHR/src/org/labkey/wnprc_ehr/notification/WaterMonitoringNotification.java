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
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
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
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Map;

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
        return "Water Monitoring 2";
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

        //assignments
        doAssignmentChecks(c, u, msg);

        return msg.toString();
    }



    protected void doAssignmentChecks(final Container c, User u, final StringBuilder msg)
    {
        waterRemaining(c, u, msg);

    }

    protected void waterRemaining(final Container c, final User u, final StringBuilder msg)
    {
        Calendar cal = Calendar.getInstance();
        cal.setTime(new Date());               //then we find all records with problems in the calculated_status field
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("WaterRemaining"), 0, CompareType.GT);
        filter.addCondition(FieldKey.fromString("date"), cal.getTime(), CompareType.DATE_EQUAL);
                //new SimpleFilter(FieldKey.fromString("Id/Dataset/Demographics/calculated_status"), "Alive", CompareType.NEQ_OR_NULL);
        //filter.addCondition(FieldKey.fromString("isActive"), true, CompareType.EQUAL);
        TableSelector ts = new TableSelector(getStudySchema(c, u).getTable("remainingWater"),PageFlowUtil.set("waterRemaining","id"), filter, null);
        long count = ts.getRowCount();
        if (count > 0)
        {
            msg.append("<b>WARNING: There are " + count + " animals that have remaining water for today.</b><br>\n");
            msg.append("<p><a href='" + getExecuteQueryUrl(c, "study", "remainingWater", null) + "&query.date~dateeq=" + AbstractEHRNotification._dateFormat.format(cal.getTime()) +"'>Click here to view them</a><br>\n\n");
                    //"&query.isActive~eq=true&query.Id/Dataset/Demographics/calculated_status~neqornull=Alive'>Click here to view them</a><br>\n\n");
            msg.append("<hr>\n\n");
            final GUID localtaskId = new GUID();

            try{

                //TableInfo tasksTable = getEHRSchema(c, u).getTable("tasks");
                List<Map<String, Object>> tasks = new ArrayList<>();
                UserSchema us = QueryService.get().getUserSchema(u, c, "ehr");
                TableInfo tasksTable = us.getTable("tasks");
                //String maxtask = tasksTable.getFromSQL("SELECT MAX(taskid)+1 FROM ehr.tasks").toString();

                //).getColumn("taskid");
                Map<String, Object> task = new CaseInsensitiveHashMap<>();

                //task.put("rowid", 506360);
                task.put("taskid",localtaskId.toString());
                task.put("qcstate", 4);
                task.put("category", "Task");
                task.put("contaier", null);
                task.put("title", "Water from Notifiaction");
                task.put("formtype","water_given");
                tasks.add(task);
                //Map<String, Object> extraContext = getExtraContext();
                //extraContext.put("skipRequestInPastCheck", true); 
                BatchValidationException errors = new BatchValidationException();
                tasksTable.getUpdateService().insertRows(u, c, tasks, errors, null, null);
                if (errors.hasErrors())
                    throw errors;

            }
            catch (Exception e){
                //Unsure why these are getting swallowed and not logged?
                _log.error(e.getMessage(), e);
                //throw e;

            }
            ts.forEach(new Selector.ForEachBlock<ResultSet>(){

                           @Override
                           public void exec (ResultSet rs)
                           {
                               Calendar cal = Calendar.getInstance();
                               cal.setTime(new Date());

                               try{

                                   //TableInfo tasksTable = getEHRSchema(c, u).getTable("tasks");
                                   List<Map<String, Object>> tasks = new ArrayList<>();
                                   UserSchema us = QueryService.get().getUserSchema(u, c, "study");
                                   TableInfo waterTask = us.getTable("water_given");
                                   Map<String, Object> task = new CaseInsensitiveHashMap<>();

                                   //task.put("rowid", 506360);
                                   task.put("taskid",localtaskId.toString());
                                   task.put("qcstate", 10);
                                   task.put("amount", null);
                                   task.put("date", cal.getTime());
                                   task.put("Id", rs.getString("Id"));
                                   task.put("assignto", "laboratory" );
                                   //task.put("title", "Water from Notifiaction");
                                   //task.put("formtype","water_given");
                                   tasks.add(task);
                                   //Map<String, Object> extraContext = getExtraContext();
                                   //extraContext.put("skipRequestInPastCheck", true); 
                                   BatchValidationException errors = new BatchValidationException();
                                   waterTask.getUpdateService().insertRows(u, c, tasks, errors, null,null);
                                   if (errors.hasErrors())
                                       throw errors;

                               }
                               catch (Exception e){
                                   //Unsure why these are getting swallowed and not logged?
                                   _log.error(e.getMessage(), e);
                                   //throw e;

                               }

                           }
                       }

            );




        }
    }


    }

