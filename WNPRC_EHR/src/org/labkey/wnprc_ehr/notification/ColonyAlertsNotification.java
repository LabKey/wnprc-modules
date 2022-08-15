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

import org.apache.commons.lang3.StringUtils;
import org.jetbrains.annotations.Nullable;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.DbScope;
import org.labkey.api.data.Results;
import org.labkey.api.data.ResultsImpl;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.Sort;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.ehr.EHRService;
import org.labkey.api.module.Module;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.security.User;
import org.labkey.api.settings.AppProps;
import org.labkey.api.util.PageFlowUtil;

import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;

/**
 * User: bbimber
 * Date: 7/14/12
 * Time: 3:16 PM
 */
public class ColonyAlertsNotification extends AbstractEHRNotification
{
    public ColonyAlertsNotification(Module owner)
    {
        super(owner);
    }

    @Override
    public String getName()
    {
        return "Colony Alerts";
    }

    @Override
    public String getEmailSubject(Container c)
    {
        return "Daily Colony Alerts: " + AbstractEHRNotification._dateTimeFormat.format(new Date());
    }

    @Override
    public String getCronString()
    {
        return "0 0 6 * * ?";
    }

    @Override
    public String getScheduleDescription()
    {
        return "every day at 6AM";
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
        assignmentsWithoutReleaseCondition(c, u, msg);
        //getU42Assignments(c, u, msg);
        //doDuplicateResourceCheck(c, u, msg);
        //doCandidateChecks(c, u, msg);

        //housing
        // roomsWithMixedViralStatus(c, u, msg);
        livingAnimalsWithoutHousing(c, u, msg);
        livingAnimalsBornDead(c, u, msg);

        //clinical
        //deadAnimalsWithActiveCases(c, u, msg);
        //deadAnimalsWithActiveFlags(c, u, msg);
        //deadAnimalsWithActiveNotes(c, u, msg);
        //deadAnimalsWithActiveGroups(c, u, msg);
        deadAnimalsWithActiveTreatments(c, u, msg);
        deadAnimalsWithActiveProblems(c, u, msg);

        //blood draws
        bloodDrawsOnDeadAnimals(c, u, msg);
        bloodDrawsOverLimit(c, u, msg, 3);

        //misc
        demographicsWithoutGender(c, u, msg);

        incompleteBirthRecords(c, u, msg);
        birthRecordsWithoutDemographics(c, u, msg);
        deathRecordsWithoutDemographics(c, u, msg);
        infantsNotAssignedToDamGroup(c, u, msg);

        //notes
        notesEndingToday(c, u, msg, null, null);

        duplicateGroupMembership(c, u, msg);
        duplicateFlags(c, u, msg);
        suspiciousMedications(c, u, msg);

        return msg.toString();
    }

    protected void doAssignmentChecks(final Container c, User u, final StringBuilder msg)
    {
        deadAnimalsWithActiveAssignments(c, u, msg);
        assignmentsWithoutValidProtocol(c, u, msg);
        //assignmentsWithEndedProject(c, u, msg);
        projectsWithExpiredProtocol(c, u, msg);
        //duplicateAssignments(c, u, msg);
        protocolsWithFutureApproveDates(c, u, msg);
        // protocolsOverLimit(c, u, msg);
        assignmentsProjectedToday(c, u, msg);
        assignmentsProjectedTomorrow(c, u, msg);
        protocolsWithAnimalsExpiringSoon(c, u, msg);
    }

    protected void livingAnimalsWithoutHousing(final Container c, User u, final StringBuilder msg)
    {
        //we find living animals without an active housing record
        Sort sort = new Sort(getStudy(c).getSubjectColumnName());
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("calculated_status"), "Alive");
        filter.addCondition(FieldKey.fromString("Id/curLocation/room/room"), null, CompareType.ISBLANK);
        TableSelector ts = new TableSelector(getStudySchema(c, u).getTable("Demographics"), filter, sort);
        long count = ts.getRowCount();
        if (count > 0)
        {
            msg.append("<b>WARNING: There are " + count + " living animals without an active housing record:</b><br>\n");

            ts.forEach(rs -> msg.append(rs.getString(getStudy(c).getSubjectColumnName()) + "<br>\n"));

            msg.append("<p><a href='" + getExecuteQueryUrl(c, "study", "Demographics", null) + "&query.Id/curLocation/room/room~isblank&query.Id/Dataset/Demographics/calculated_status~eq=Alive'>Click here to view them</a><br>\n\n");
            msg.append("<hr>\n\n");
        }
    }

    protected void livingAnimalsBornDead(final Container c, User u, final StringBuilder msg)
    {
        Sort sort = new Sort(getStudy(c).getSubjectColumnName());
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("calculated_status"), "Alive");
        filter.addCondition(FieldKey.fromString("Id/birth/cond/value"), "Born Dead;Terminated At Birth", CompareType.IN);
        TableSelector ts = new TableSelector(getStudySchema(c, u).getTable("Demographics"), filter, sort);
        long count = ts.getRowCount();
        if (count > 0)
        {
            msg.append("<b>WARNING: There are " + count + " animals listed as living, but have a birth type of 'Born Dead' or 'Terminated At Birth':</b><br>\n");

            ts.forEach(rs -> msg.append(rs.getString(getStudy(c).getSubjectColumnName()) + "<br>\n"));

            msg.append("<p><a href='" + getExecuteQueryUrl(c, "study", "Demographics", null) + "&" + filter.toQueryString("query") + "'>Click here to view them</a><br>\n\n");
            msg.append("<hr>\n\n");
        }
    }

    protected void deadAnimalsWithActiveAssignments(final Container c, User u, final StringBuilder msg)
    {
        //then we find all records with problems in the calculated_status field
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("Id/Dataset/Demographics/calculated_status"), "Alive", CompareType.NEQ_OR_NULL);
        filter.addCondition(FieldKey.fromString("isActive"), true, CompareType.EQUAL);
        TableSelector ts = new TableSelector(getStudySchema(c, u).getTable("Assignment"), filter, null);
        long count = ts.getRowCount();
        if (count > 0)
        {
            msg.append("<b>WARNING: There are " + count + " active assignments for animals not currently at the center.</b><br>\n");
            msg.append("<p><a href='" + getExecuteQueryUrl(c, "study", "Assignment", null) + "&query.isActive~eq=true&query.Id/Dataset/Demographics/calculated_status~neqornull=Alive'>Click here to view them</a><br>\n\n");
            msg.append("<hr>\n\n");
        }
    }

    protected void infantsNotAssignedToDamGroup(final Container c, User u, final StringBuilder msg)
    {
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("matchesDamGroup"), false, CompareType.EQUAL);
        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.DATE, -14);
        filter.addCondition(FieldKey.fromString("birth"), cal.getTime(), CompareType.DATE_GTE);

        TableSelector ts = new TableSelector(getStudySchema(c, u).getTable("animalGroupInfantsNotAssigned"), filter, null);
        long count = ts.getRowCount();
        if (count > 0)
        {
            msg.append("<b>WARNING: There are " + count + " infants born within the last 14 days that are not assigned to the same group as their dam on the date of birth.</b><br>\n");
            msg.append("<p><a href='" + getExecuteQueryUrl(c, "study", "animalGroupInfantsNotAssigned", null) + "&query.matchesDamGroup~eq=false&query.birth~dategte=-14d'>Click here to view them</a><br>\n\n");
            msg.append("<hr>\n\n");
        }
    }

    /**
     * find any active assignment where the project lacks a valid protocol
     */
    protected void assignmentsWithoutValidProtocol(final Container c, User u, final StringBuilder msg)
    {
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("isActive"), true, CompareType.EQUAL);
        filter.addCondition(FieldKey.fromString("project/protocol"), null, CompareType.ISBLANK);
        TableSelector ts = new TableSelector(getStudySchema(c, u).getTable("Assignment"), filter, null);
        long count = ts.getRowCount();
        if (count > 0)
        {
            msg.append("<b>WARNING: There are " + count + " active assignments to a project without a valid protocol.</b><br>\n");
            msg.append("<p><a href='" + getExecuteQueryUrl(c, "study", "Assignment", null) + "&query.isActive~eq=true&query.project/protocol~isblank'>Click here to view them</a><br>\n\n");
            msg.append("<hr>\n\n");
        }
    }

    /**
     * find any active assignment where the project lacks a valid protocol
     */
    protected void projectsWithExpiredProtocol(final Container c, User u, final StringBuilder msg)
    {
        TableInfo ti = getEHRSchema(c, u).getTable("project");
        if (!ti.getSqlDialect().isSqlServer())
        {
            return;
        }

        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("enddateCoalesced"), "+0d", CompareType.DATE_GTE);
        filter.addCondition(FieldKey.fromString("protocol/renewalDate"), new Date(), CompareType.DATE_LTE);
        TableSelector ts = new TableSelector(ti, filter, null);
        long count = ts.getRowCount();
        if (count > 0)
        {
            msg.append("<b>WARNING: There are " + count + " active projects associated with an expired IACUC protocol.</b><br>\n");
            msg.append("<p><a href='" + getExecuteQueryUrl(c, "ehr", "project", null, filter) + "'>Click here to view them</a><br>\n\n");
            msg.append("<hr>\n\n");
        }
    }

    protected void protocolsWithFutureApproveDates(final Container c, User u, final StringBuilder msg)
    {
        Calendar cal = Calendar.getInstance();
        cal.setTime(new Date());
        cal.add(Calendar.DATE, 7);
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("approve"), cal.getTime(), CompareType.DATE_GTE);
        TableSelector ts = new TableSelector(getEHRSchema(c, u).getTable("protocol"), filter, null);
        long count = ts.getRowCount();
        if (count > 0)
        {
            msg.append("<b>WARNING: There are " + count + " IACUC protocols with approve dates listed more than 7 days in the future.</b><br>");
            msg.append("<p><a href='" + getExecuteQueryUrl(c, "ehr", "protocol", null) + "&query.approve~dategte=%2B7d'>Click here to view them</a>\n");
            msg.append("<hr>\n\n");
        }
    }

    protected void assignmentsProjectedTomorrow(final Container c, User u, final StringBuilder msg)
    {
        Calendar cal = Calendar.getInstance();
        cal.setTime(new Date());
        cal.add(Calendar.DATE, 1);

        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("isActive"), true, CompareType.EQUAL);
        filter.addCondition(FieldKey.fromString("projectedRelease"), cal.getTime(), CompareType.DATE_EQUAL);
        TableSelector ts = new TableSelector(getStudySchema(c, u).getTable("Assignment"), filter, null);
        long count = ts.getRowCount();
        if (count > 0)
        {
            msg.append("<b>ALERT: There are " + count + " assignments with a projected release date for tomorrow.</b><br>\n");
            msg.append("<p><a href='" + getExecuteQueryUrl(c, "study", "Assignment", null) + "&query.projectedRelease~dateeq=" + AbstractEHRNotification._dateFormat.format(cal.getTime()) + "'>Click here to view them</a><br>\n\n");
            msg.append("<hr>\n\n");
        }
    }

    /**
     * we find assignments with projected releases today
     */
    protected void assignmentsProjectedToday(final Container c, User u, final StringBuilder msg)
    {
        Date date = new Date();
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("projectedRelease"), date, CompareType.DATE_LTE);
        TableSelector ts = new TableSelector(getStudySchema(c, u).getTable("Assignment"), filter, null);
        long count = ts.getRowCount();
        if (count > 0)
        {
            msg.append("<b>ALERT: There are " + count + " assignments with a projected release date for today or earlier that have not already been ended.</b><br>\n");
            msg.append("<p><a href='" + getExecuteQueryUrl(c, "study", "Assignment", null) + "&query.projectedRelease~datelte=" + AbstractEHRNotification._dateFormat.format(date) + "'>Click here to view them</a><br>\n\n");
            msg.append("<hr>\n\n");
        }
    }

    /**
     * protocols with active animals that expire in next 30 days
     */
    protected void protocolsWithAnimalsExpiringSoon(final Container c, User u, final StringBuilder msg)
    {
        if (!DbScope.getLabKeyScope().getSqlDialect().isSqlServer())
        {
            return;
        }

        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("daysUntilRenewal"), 30, CompareType.LTE);
        filter.addCondition(FieldKey.fromString("activeAnimals/totalActiveAnimals"), 0, CompareType.GT);

        TableInfo ti = getEHRSchema(c, u).getTable("protocol");

        List<FieldKey> colKeys = new ArrayList<>();
        colKeys.add(FieldKey.fromString("displayName"));
        colKeys.add(FieldKey.fromString("daysUntilrenewal"));
        colKeys.add(FieldKey.fromString("activeAnimals/totalActiveAnimals"));
        final Map<FieldKey, ColumnInfo> columns = QueryService.get().getColumns(ti, colKeys);

        TableSelector ts = new TableSelector(ti, columns.values(), filter, null);
        long count = ts.getRowCount();
        if (count > 0)
        {
            msg.append("<b>WARNING: There are " + count + " protocols with active assignments set to expire within the next 30 days.</b><br>\n");
            msg.append("<p><a href='" + getExecuteQueryUrl(c, "ehr", "protocol", null) + "&query.daysUntilRenewal~lte=30&query.activeAnimals/totalActiveAnimals~gt=0'>Click here to view them</a><br>\n\n");
            msg.append("<hr>\n\n");
        }
    }

    /**
     * we find death records without a corresponding demographics record
     */
    protected void deathRecordsWithoutDemographics(final Container c, User u, final StringBuilder msg)
    {
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("Id/Dataset/Demographics/Id"), null, CompareType.ISBLANK);
        filter.addCondition(FieldKey.fromString("notAtCenter"), true, CompareType.NEQ_OR_NULL);
        TableSelector ts = new TableSelector(getStudySchema(c, u).getTable("Deaths"), filter, new Sort(getStudy(c).getSubjectColumnName()));
        long count = ts.getRowCount();
        if (count > 0)
        {
            msg.append("<b>WARNING: There are " + count + " death records without a corresponding demographics record.</b><br>\n");
            msg.append("<p><a href='" + getExecuteQueryUrl(c, "study", "Deaths", null) + "&query.Id/Dataset/Demographics/Id~isblank&query.notAtCenter~neqornull=true'>Click here to view them</a><br>\n\n");
            msg.append("<hr>\n\n");
        }
    }

    /**
     * we find birth records without a corresponding demographics record
     */
    protected void birthRecordsWithoutDemographics(final Container c, User u, final StringBuilder msg)
    {
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("Id/Dataset/Demographics/Id"), null, CompareType.ISBLANK);
        TableSelector ts = new TableSelector(getStudySchema(c, u).getTable("Birth"), Collections.singleton(getStudy(c).getSubjectColumnName()), filter, new Sort(getStudy(c).getSubjectColumnName()));
        long count = ts.getRowCount();
        if (count > 0)
        {
            msg.append("<b>WARNING: There are " + count + " birth records without a corresponding demographics record.</b><br>\n");
            msg.append("<p><a href='" + getExecuteQueryUrl(c, "study", "Birth", null) + "&query.Id/Dataset/Demographics/Id~isblank'>Click here to view them</a><br>\n\n");
            msg.append("<hr>\n\n");
        }
    }

    protected void incompleteBirthRecords(final Container c, User u, final StringBuilder msg)
    {
        SimpleFilter filter = new SimpleFilter(new SimpleFilter.OrClause(
                //new CompareType.CompareClause(FieldKey.fromString("species"), CompareType.ISBLANK, null),
                new CompareType.CompareClause(FieldKey.fromString("Id/demographics/gender"), CompareType.ISBLANK, null),
                new CompareType.CompareClause(FieldKey.fromString("Id/demographics/species"), CompareType.ISBLANK, null),
                new CompareType.CompareClause(FieldKey.fromString("Id/demographics/geographic_origin"), CompareType.ISBLANK, null)
        ));
        filter.addCondition(FieldKey.fromString("date"), "-30d", CompareType.DATE_GTE);

        TableInfo ti = getStudySchema(c, u).getTable("Birth");
        Set<FieldKey> keys = new HashSet<>();
        keys.add(FieldKey.fromString("Id"));
        keys.add(FieldKey.fromString("Id/demographics/gender/meaning"));
        keys.add(FieldKey.fromString("Id/demographics/species"));
        keys.add(FieldKey.fromString("Id/demographics/calculated_status"));
        keys.add(FieldKey.fromString("Id/demographics/geographic_origin"));

        final Map<FieldKey, ColumnInfo> cols = QueryService.get().getColumns(ti, keys);
        TableSelector ts = new TableSelector(ti, cols.values(), filter, new Sort(getStudy(c).getSubjectColumnName()));
        long count = ts.getRowCount();
        if (count > 0)
        {
            msg.append("<b>WARNING: There are " + count + " birth records within the past 30 days lacking information:</b><br><br>\n");
            msg.append("<table border=1 style='border-collapse: collapse;'>");
            msg.append("<tr><td>Id</td><td>Status</td><td>Gender</td><td>Species</td><td>Geographic Origin</td></tr>");
            ts.forEach(object -> {
                Results rs = new ResultsImpl(object, cols);
                String url = getExecuteQueryUrl(c, "study", "demographics", null);
                url = url.replaceAll("executeQuery.view", "updateQuery.view");
                url = url.replaceAll("/query/", "/ehr/");

                msg.append("<tr>");
                msg.append("<td><a href=\"" + url + "&query.Id~eq=" + rs.getString("Id") + "\">" + rs.getString("Id") + "</a></td>");
                msg.append("<td>" + (rs.getString(FieldKey.fromString("Id/demographics/calculated_status")) == null ? "Unknown" : rs.getString(FieldKey.fromString("Id/demographics/calculated_status"))) + "</td>");
                msg.append("<td>" + (rs.getString(FieldKey.fromString("Id/demographics/gender/meaning")) == null ? "MISSING" : rs.getString(FieldKey.fromString("Id/demographics/gender/meaning"))) + "</td>");
                msg.append("<td>" + (rs.getString(FieldKey.fromString("Id/demographics/species")) == null ? "MISSING" : rs.getString(FieldKey.fromString("Id/demographics/species"))) + "</td>");
                msg.append("<td>" + (rs.getString(FieldKey.fromString("Id/demographics/geographic_origin")) == null ? "MISSING" : rs.getString(FieldKey.fromString("Id/demographics/geographic_origin"))) + "</td>");
                msg.append("</tr>");
            });
            msg.append("</table>");
            msg.append("<hr>\n\n");
        }
    }

    /**
     * we find demographics records in the past 90 days missing a gender
     */
    protected void demographicsWithoutGender(final Container c, User u, final StringBuilder msg)
    {
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("gender/meaning"), PageFlowUtil.set("", "Unknown"), CompareType.IN);
        filter.addCondition(FieldKey.fromString("calculated_status"), "Alive", CompareType.EQUAL);
        filter.addCondition(FieldKey.fromString("Id/age/ageInDays"), 30, CompareType.GTE);

        TableSelector ts = new TableSelector(getStudySchema(c, u).getTable("Demographics"), filter, new Sort(getStudy(c).getSubjectColumnName()));
        if (ts.getRowCount() > 0)
        {
            msg.append("<b>WARNING: The following animals are listed as Alive and are over 30 days old, but do not have a known gender:</b><br>\n");
            ts.forEach(rs -> {
                msg.append(rs.getString(getStudy(c).getSubjectColumnName()));
                if (rs.getDate("birth") == null)
                    msg.append(" (" + AbstractEHRNotification._dateFormat.format(rs.getDate("birth")) + ")");

                msg.append("<br>\n");
            });
            msg.append("<p><a href='" + getExecuteQueryUrl(c, "study", "Demographics", null) + "&query.gender/meaning~in=;Unknown&query.calculated_status~eq=Alive&query.Id/age/ageInDays~gte=30'>Click here to view these animals</a></p>\n");
            msg.append("<hr>\n");
        }
    }

    /**
     * we find open ended problems where the animal is not alive
     */
    protected void deadAnimalsWithActiveProblems(final Container c, User u, final StringBuilder msg)
    {
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("Id/Dataset/Demographics/calculated_status"), "Alive", CompareType.NEQ_OR_NULL);
        filter.addCondition(FieldKey.fromString("isActive"), true, CompareType.EQUAL);
        TableSelector ts = new TableSelector(getStudySchema(c, u).getTable("Problem List"), filter, new Sort(getStudy(c).getSubjectColumnName()));
        long count = ts.getRowCount();
        if (count > 0)
        {
            msg.append("<b>WARNING: There are " + count + " unresolved problems for animals not currently at the center.</b><br>\n");
            msg.append("<p><a href='" + getExecuteQueryUrl(c, "study", "Problem List", null) + "&query.isActive~eq=true&query.Id/Dataset/Demographics/calculated_status~neqornull=Alive'>Click here to view them</a><br>\n\n");
            msg.append("<hr>\n\n");
        }
    }

    /**
     * we find open ended treatments where the animal is not alive
     */
    protected void deadAnimalsWithActiveTreatments(final Container c, User u, final StringBuilder msg)
    {
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("Id/Dataset/Demographics/calculated_status"), "Alive", CompareType.NEQ_OR_NULL);
        filter.addCondition(FieldKey.fromString("isActive"), true, CompareType.EQUAL);
        TableSelector ts = new TableSelector(getStudySchema(c, u).getTable("Treatment Orders"), filter, new Sort(getStudy(c).getSubjectColumnName()));
        long count = ts.getRowCount();
        if (count > 0)
        {
            msg.append("<b>WARNING: There are " + count + " active treatments for animals not currently at the center.</b><br>\n");
            msg.append("<p><a href='" + getExecuteQueryUrl(c, "study", "Treatment Orders", null) + "&query.isActive~eq=true&query.Id/Dataset/Demographics/calculated_status~neqornull=Alive'>Click here to view them</a><br>\n\n");
            msg.append("<hr>\n\n");
        }
    }

    protected void surgeryCasesRecentlyClosed(final Container c, User u, final StringBuilder msg)
    {
        Calendar cal = Calendar.getInstance();
        cal.setTime(new Date());
        cal.add(Calendar.DATE, -2);

        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("enddate"), cal.getTime(), CompareType.DATE_GTE);
        filter.addCondition(FieldKey.fromString("category"), "Surgery");
        filter.addCondition(FieldKey.fromString("Id/demographics/calculated_status"), "Alive");

        Sort sort = new Sort("Id/curLocation/room");
        sort.appendSortColumn(FieldKey.fromString("Id/curLocation/cage"), Sort.SortDirection.ASC, false);

        Set<FieldKey> fks = new HashSet<>();
        fks.add(FieldKey.fromString("Id"));
        fks.add(FieldKey.fromString("Id/curLocation/room"));
        fks.add(FieldKey.fromString("Id/curLocation/cage"));
        fks.add(FieldKey.fromString("cagematesAtOpen/roomAtOpen"));
        fks.add(FieldKey.fromString("cagematesAtOpen/cageAtOpen"));
        fks.add(FieldKey.fromString("cagematesAtOpen/cagematesAtOpen"));
        fks.add(FieldKey.fromString("cagematesAtOpen/cagemateCurrentLocations"));
        fks.add(FieldKey.fromString("Id/activeAnimalGroups/groups"));

        TableInfo ti = getStudySchema(c, u).getTable("cases");
        final Map<FieldKey, ColumnInfo> columns = QueryService.get().getColumns(ti, fks);

        TableSelector ts = new TableSelector(ti, columns.values(), filter, sort);
        if (ts.exists())
        {
            msg.append("The following surgery cases were closed in the past 48H:<br>");
            msg.append("<table border=1 style='border-collapse: collapse;'><tr><td>Id</td><td>Current Location</td><td>Location At Case Open</td><td>Cagemates At Open</td><td>Cagemate Current Location(s)</td><td>Active Groups</td></tr>");
            ts.forEach(object -> {
                Results rs = new ResultsImpl(object, columns);

                String currentLocation = rs.getString(FieldKey.fromString("Id/curLocation/room"));
                if (rs.getString(FieldKey.fromString("Id/curLocation/cage")) != null)
                {
                    currentLocation += " " + rs.getString(FieldKey.fromString("Id/curLocation/cage"));
                }

                String previousLocation = rs.getString(FieldKey.fromString("cagematesAtOpen/roomAtOpen"));
                if (rs.getString(FieldKey.fromString("cagematesAtOpen/cageAtOpen")) != null)
                {
                    previousLocation += " " + rs.getString(FieldKey.fromString("cagematesAtOpen/cageAtOpen"));
                }

                msg.append("<tr><td>").append(rs.getString(FieldKey.fromString("Id"))).append("</td>");
                msg.append("<td>").append(prepareStringForCell(currentLocation)).append("</td>");
                msg.append("<td>").append(prepareStringForCell(previousLocation)).append("</td>");

                msg.append("<td>").append(prepareStringForCell(rs.getString(FieldKey.fromString("cagematesAtOpen/cagematesAtOpen")))).append("</td>");
                msg.append("<td>").append(prepareStringForCell(rs.getString(FieldKey.fromString("cagematesAtOpen/cagemateCurrentLocations")))).append("</td>");
                msg.append("<td>").append(prepareStringForCell(rs.getString(FieldKey.fromString("Id/activeAnimalGroups/groups")))).append("</td>");
                msg.append("</tr>");
            });

            msg.append("</table><br>");
        }
    }

    private String prepareStringForCell(String input)
    {
        if (StringUtils.trimToNull(input) == null)
        {
            return "";
        }

        input = input.replaceAll("\n", "<br>");

        return input;
    }

    protected void transfersYesterday(final Container c, User u, final StringBuilder msg)
    {
        msg.append("<b>Transfers yesterday:</b><br><br>");

        Calendar cal = Calendar.getInstance();
        cal.setTime(new Date());
        cal.add(Calendar.DATE, -1);

        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("date"), cal.getTime(), CompareType.DATE_EQUAL);
        Sort sort = new Sort("room");
        sort.appendSortColumn(FieldKey.fromString("cage"), Sort.SortDirection.ASC, false);

        TableSelector ts = new TableSelector(getStudySchema(c, u).getTable("Housing"), PageFlowUtil.set("Id", "room", "cage"), filter, sort);
        Map<String, Object>[] rows = ts.getMapArray();
        if (rows.length > 0)
        {
            final Map<String, Integer> roomMap = new TreeMap<>();
            for (Map<String, Object> row : rows)
            {
                String room = (String) row.get("room");
                Integer count = roomMap.get(room);
                if (count == null)
                    count = 0;

                count++;

                roomMap.put(room, count);
            }

            String formatted = _dateFormat.format(cal.getTime());
            msg.append("The following transfers took place on " + formatted + ".  <a href='" + (getExecuteQueryUrl(c, "study", "Housing", null) + "&query.date~dateeq=" + formatted) + "'>click here to view them</a><br>");
            msg.append("<table border=1 style='border-collapse: collapse;'><tr><td>Room</td><td>Total</td></tr>");
            for (String room : roomMap.keySet())
            {
                msg.append("<tr><td>").append(room).append("</td><td>").append("<a href='" + (getExecuteQueryUrl(c, "study", "Housing", null) + "&query.date~dateeq=-1d&query.room~eq=" + room) + "'>" + roomMap.get(room) + "</a>").append("</td></tr>");
            }
            msg.append("</table><br>");
        }
        else
        {
            msg.append("No transfers took place yesterday");
        }
        msg.append("<hr>\n\n");
    }

    /**
     * we find any blood draws over the allowable limit
     */
    protected void bloodDrawsOverLimit(final Container c, User u, final StringBuilder msg, int daysInPast)
    {
        Calendar cal = Calendar.getInstance();
        cal.setTime(new Date());
        cal.add(Calendar.DATE, (-1 * daysInPast));

        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("Id/DataSet/Demographics/calculated_status"), "Alive");
        filter.addCondition(FieldKey.fromString("qcstate/label"), EHRService.QCSTATES.RequestDenied.getLabel(), CompareType.NEQ_OR_NULL);

        filter.addCondition(FieldKey.fromString("date"), cal.getTime(), CompareType.DATE_GTE);
        filter.addCondition(FieldKey.fromString("BloodRemaining/availableBlood"), 0, CompareType.LT);

        TableInfo ti = getStudySchema(c, u).getTable("Blood Draws");
        Set<FieldKey> colKeys = new HashSet<>();
        colKeys.add(FieldKey.fromString("BloodRemaining/availableBlood"));
        colKeys.add(FieldKey.fromString("date"));
        colKeys.add(FieldKey.fromString("Id"));
        final Map<FieldKey, ColumnInfo> columns = QueryService.get().getColumns(ti, colKeys);

        TableSelector ts = new TableSelector(ti, columns.values(), filter, null);
        long count = ts.getRowCount();
        final Set<String> lines = new HashSet<>();
        if (count > 0)
        {
            msg.append("<b>WARNING: There are " + count + " blood draws within the past " + daysInPast + " day(s) exceeding the allowable volume.  Note: this warning may include draws scheduled in the future, but have not actually been performed.  Click the IDs below to see more information:</b><br><br>");
            ts.forEach(object -> {
                Results rs = new ResultsImpl(object, columns);

                StringBuilder text = new StringBuilder();
                text.append(rs.getString(getStudy(c).getSubjectColumnName()));
                Double amount = -1.0 * rs.getDouble(FieldKey.fromString("BloodRemaining/availableBlood"));
                text.append(": ").append(DecimalFormat.getNumberInstance().format(amount)).append(" mL overdrawn on ").append(_dateFormat.format(rs.getDate(FieldKey.fromString("date"))));

                //String url = getParticipantURL(c, rs.getString(getStudy(c).getSubjectColumnName()));
                String url = getExecuteQueryUrl(c, "study", "Blood Draws", "With Blood Volume") + "&query.Id~eq=" + rs.getString(getStudy(c).getSubjectColumnName());
                lines.add("<a href='" + url + "'>" + text.toString() + "</a><br>\n");
            });

            //simple way to enforce uniqueness
            for (String line : lines)
            {
                msg.append(line);
            }

            msg.append("<hr>\n");
        }
    }

    /**
     * we find any current or future blood draws where the animal is not alive
     */
    protected void bloodDrawsOnDeadAnimals(Container c, User u, final StringBuilder msg)
    {
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("Id/DataSet/Demographics/calculated_status"), "Alive", CompareType.NEQ_OR_NULL);
        filter.addCondition(FieldKey.fromString("qcstate/label"), EHRService.QCSTATES.RequestDenied.getLabel(), CompareType.NEQ_OR_NULL);
        filter.addCondition(FieldKey.fromString("date"), new Date(), CompareType.DATE_GTE);
        filter.addCondition(FieldKey.fromString("taskid"), null, CompareType.ISBLANK);
        TableSelector ts = new TableSelector(getStudySchema(c, u).getTable("blood"), filter, null);
        long count = ts.getRowCount();
        if (count > 0)
        {
            msg.append("<b>WARNING: There are " + count + " current or scheduled blood draws for animals not currently at the center.</b><br>");
            msg.append("<p><a href='" + getExecuteQueryUrl(c, "study", "blood", null) + "&query.date~dategte=" + _dateFormat.format(new Date()) + "&query.Id/DataSet/Demographics/calculated_status~neqornull=Alive'>Click here to view them</a><br>\n");
            msg.append("<hr>\n");
        }
    }

    /**
     * Displays any animals with duplicate flags, where duplicates are enforced
     */
    protected void duplicateFlags(Container c, User u, final StringBuilder msg)
    {
        TableInfo ti = getStudySchema(c, u).getTable("flagDuplicates");
        TableSelector ts = new TableSelector(ti);
        long count = ts.getRowCount();
        if (count > 0)
        {
            msg.append("<b>WARNING: There are " + count + " animals with duplicate active flags from the same category.</b><br>");
            msg.append("<p><a href='" + getExecuteQueryUrl(c, "study", "flagDuplicates", null) + "'>Click here to view them</a><br>\n");
            msg.append("<hr>\n");
        }
    }

    /**
     * Displays any animals double-assigned to animal groups
     */
    protected void duplicateGroupMembership(Container c, User u, final StringBuilder msg)
    {
        TableInfo ti = getStudySchema(c, u).getTable("animalGroupMemberDuplicates");
        TableSelector ts = new TableSelector(ti, Collections.singleton("Id"), null, null);
        long count = ts.getRowCount();
        if (count > 0)
        {
            msg.append("<b>WARNING: There are " + count + " animals actively assigned to multiple animal groups.</b><br>");
            msg.append("<p><a href='" + getExecuteQueryUrl(c, "study", "animalGroupMemberDuplicates", null) + "'>Click here to view them</a><br>\n");
            msg.append("<hr>\n");
        }
    }

    /**
     * Displays any suspicious drug entries in the last 4 days
     */
    protected void suspiciousMedications(Container c, User u, final StringBuilder msg)
    {
        Calendar cal = Calendar.getInstance();
        cal.setTime(new Date());
        cal.add(Calendar.DATE, -4);

        int minValue = 2;
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("created"), cal.getTime(), CompareType.DATE_GTE);
        filter.addCondition(FieldKey.fromString("qcstate/PublicData"), true);
        filter.addCondition(FieldKey.fromString("code/meaning"), "ketamine;telazol", CompareType.CONTAINS_ONE_OF);
        filter.addCondition(FieldKey.fromString("amount"), minValue, CompareType.LT);
        filter.addCondition(FieldKey.fromString("amount_units"), "mg", CompareType.CONTAINS);

        TableInfo ti = getStudySchema(c, u).getTable("Drug Administration");

        TableSelector ts = new TableSelector(ti, PageFlowUtil.set(ti.getColumn("Id"), ti.getColumn("date"), ti.getColumn("amount"), ti.getColumn("amount_units")), filter, null);
        long count = ts.getRowCount();
        if (count > 0)
        {
            msg.append("<b>WARNING: There are " + count + " drug entries since " + _dateFormat.format(cal.getTime()) + " for ketamine or telazol using mgs listing an amount less than " + minValue + "</b><br>");
            msg.append("<p><a href='" + getExecuteQueryUrl(c, "study", "Drug Administration", null) + "&query.created~dategte=" + _dateFormat.format(cal.getTime()) + "&query.code/meaning~containsoneof=ketamine;telazol&query.amount_units~contains=mg&query.qcstate/PublicData~eq=true&query.amount~lt=" + minValue + "'>Click here to view them</a><br>\n");
            msg.append("<hr>\n");
        }


        int maxValue = 300;
        SimpleFilter filter2 = new SimpleFilter(FieldKey.fromString("created"), cal.getTime(), CompareType.DATE_GTE);
        filter2.addCondition(FieldKey.fromString("qcstate/PublicData"), true);
        filter.addCondition(FieldKey.fromString("code/meaning"), "ketamine;telazol", CompareType.CONTAINS_ONE_OF);
        filter2.addCondition(FieldKey.fromString("amount"), maxValue, CompareType.GT);
        filter2.addCondition(FieldKey.fromString("amount_units"), "mg", CompareType.CONTAINS);

        TableSelector ts2 = new TableSelector(ti, PageFlowUtil.set(ti.getColumn("Id"), ti.getColumn("date"), ti.getColumn("amount"), ti.getColumn("amount_units")), filter2, null);
        long count2 = ts2.getRowCount();
        if (count2 > 0)
        {
            msg.append("<b>WARNING: There are " + count2 + " drug entries since " + _dateFormat.format(cal.getTime()) + " for ketamine or telazol using mgs listing an amount greater than " + maxValue + "</b><br>");
            msg.append("<p><a href='" + getExecuteQueryUrl(c, "study", "Drug Administration", null) + "&query.created~dategte=" + _dateFormat.format(cal.getTime()) + "&query.code/meaning~containsoneof=ketamine;telazol&query.amount_units~contains=mg&query.qcstate/PublicData~eq=true&query.amount~gt=" + maxValue + "'>Click here to view them</a><br>\n");
            msg.append("<hr>\n");
        }
    }

    protected String getParticipantURL(Container c, String id)
    {
        return AppProps.getInstance().getBaseServerUrl() + AppProps.getInstance().getContextPath() + "/ehr" + c.getPath() + "/participantView.view?participantId=" + id;
    }

    protected void assignmentsWithoutReleaseCondition(final Container c, User u, final StringBuilder msg)
    {
        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.DATE, -60);

        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("enddate"), null, CompareType.NONBLANK);
        filter.addCondition(FieldKey.fromString("enddate"), cal.getTime(), CompareType.DATE_GTE);
        // filter.addCondition(FieldKey.fromString("releaseCondition"), null, CompareType.ISBLANK);
        TableSelector ts = new TableSelector(getStudySchema(c, u).getTable("assignment"), filter, null);
        long count = ts.getRowCount();
        if (count > 0)
        {
            msg.append("<b>WARNING: There are " + count + " assignment records ended since " + _dateFormat.format(cal.getTime()) + " that lack a release condition.</b><br>\n");
            msg.append("<p><a href='" + getExecuteQueryUrl(c, "study", "assignment", null, filter) + "'>Click here to view them</a><br>\n\n");
            msg.append("<hr>\n\n");
        }
    }

    protected void notesEndingToday(final Container c, User u, final StringBuilder msg, @Nullable List<String> includedCategories, @Nullable List<String> excludedCategories)
    {
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("enddate"), new Date(), CompareType.DATE_EQUAL);
        if (includedCategories != null)
        {
            filter.addCondition(FieldKey.fromString("category"), includedCategories, CompareType.IN);
        }

        if (excludedCategories != null)
        {
            filter.addCondition(FieldKey.fromString("category"), excludedCategories, CompareType.NOT_IN);
        }

        TableSelector ts = new TableSelector(getStudySchema(c, u).getTable("notes"), filter, null);
        long count = ts.getRowCount();
        if (count > 0)
        {
            msg.append("<b>There are " + count + " notes ending today.</b><br>\n");
            msg.append("<p><a href='" + getExecuteQueryUrl(c, "study", "notes", null, filter) + "'>Click here to view them</a><br>\n\n");
            msg.append("<hr>\n\n");
        }

        SimpleFilter filter2 = new SimpleFilter(FieldKey.fromString("actiondate"), new Date(), CompareType.DATE_EQUAL);
        if (includedCategories != null)
        {
            filter2.addCondition(FieldKey.fromString("category"), includedCategories, CompareType.IN);
        }

        if (excludedCategories != null)
        {
            filter2.addCondition(FieldKey.fromString("category"), excludedCategories, CompareType.NOT_IN);
        }

        TableSelector ts2 = new TableSelector(getStudySchema(c, u).getTable("notes"), filter2, null);
        long count2 = ts2.getRowCount();
        if (count2 > 0)
        {
            msg.append("<b>There are " + count2 + " notes with an action date of today.</b><br>\n");
            msg.append("<p><a href='" + getExecuteQueryUrl(c, "study", "notes", null, filter2) + "'>Click here to view them</a><br>\n\n");
            msg.append("<hr>\n\n");
        }
    }
}
