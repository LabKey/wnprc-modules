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
package org.labkey.wnprc_ehr.table;

import org.apache.log4j.Logger;
import org.labkey.api.data.AbstractTableInfo;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.DataColumn;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.DbSchemaType;
import org.labkey.api.data.JdbcType;
import org.labkey.api.data.RenderContext;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.data.WrappedColumn;
import org.labkey.api.ehr.EHRService;
import org.labkey.api.exp.api.StorageProvisioner;
import org.labkey.api.ldk.table.AbstractTableCustomizer;
import org.labkey.api.query.DetailsURL;
import org.labkey.api.query.ExprColumn;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryForeignKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.UserSchema;
import org.labkey.api.study.Dataset;
import org.labkey.api.study.Study;
import org.labkey.api.study.StudyService;
import org.labkey.api.util.GUID;
import org.labkey.api.util.PageFlowUtil;
import org.labkey.api.util.StringExpressionFactory;
import org.labkey.api.view.ActionURL;
import org.labkey.dbutils.api.SimplerFilter;
import org.labkey.ehr.EHRSchema;

import java.io.IOException;
import java.io.Writer;
import java.util.Collections;


/**
 * User: bimber
 * Date: 12/7/12
 * Time: 2:22 PM
 */
public class WNPRC_EHRCustomizer extends AbstractTableCustomizer
{
    protected static final Logger _log = Logger.getLogger(WNPRC_EHRCustomizer.class);
    public WNPRC_EHRCustomizer()
    {

    }

    public void customize(TableInfo table)
    {
        if (table instanceof AbstractTableInfo)
        {
            customizeColumns((AbstractTableInfo)table);

            if (table.getName().equalsIgnoreCase("Animal") && table.getSchema().getName().equalsIgnoreCase("study"))
                customizeAnimalTable((AbstractTableInfo) table);
            else if (table.getName().equalsIgnoreCase("Birth") && table.getSchema().getName().equalsIgnoreCase("study"))
                customizeBirthTable((AbstractTableInfo) table);
            else if (table.getName().equalsIgnoreCase("protocol") && table.getSchema().getName().equalsIgnoreCase("ehr"))
                customizeProtocolTable((AbstractTableInfo)table);
            else if (table.getName().equalsIgnoreCase("breeding_encounters") && table.getSchema().getName().equalsIgnoreCase("study")) {
                customizeBreedingEncountersTable((AbstractTableInfo) table);
            } else if (table.getName().equalsIgnoreCase("pregnancies") && table.getSchema().getName().equalsIgnoreCase("study")) {
                customizePregnanciesTable((AbstractTableInfo) table);
            } else if (table.getName().equalsIgnoreCase("housing") && table.getSchema().getName().equalsIgnoreCase("study")) {
                customizeHousingTable((AbstractTableInfo) table);
            } else if (matches(table, "ehr", "project")) {
                customizeProjectTable((AbstractTableInfo) table);
            } else if (matches(table, "study", "feeding")) {
                customizeFeedingTable((AbstractTableInfo) table);
            } else if (matches(table, "study", "demographics")) {
                customizeDemographicsTable((AbstractTableInfo) table);
            } else if (matches(table, "ehr", "tasks")) {
                customizeTasksTable((AbstractTableInfo) table);
            }
        }
    }

    private void customizeColumns(AbstractTableInfo ti)
    {
        ColumnInfo project = ti.getColumn("project");
        if (project != null)
        {
            project.setFormat("00000000");
        }

        customizeRoomCol(ti, "room");
        customizeRoomCol(ti, "room1");
        customizeRoomCol(ti, "room2");
    }

    private void customizeRoomCol(AbstractTableInfo ti, String columnName)
    {
        ColumnInfo room = ti.getColumn(columnName);
        if (room != null)
        {
            if (!ti.getName().equalsIgnoreCase("rooms"))
            {
                // Configure the FK to show the raw value to improve performance, since the database can avoid
                // doing the join in many cases
                Container ehrContainer = EHRService.get().getEHRStudyContainer(ti.getUserSchema().getContainer());
                if (ehrContainer != null)
                {
                    UserSchema us = getUserSchema(ti, "ehr_lookups", ehrContainer);
                    if (us != null)
                    {
                        room.setFk(new QueryForeignKey(us, ehrContainer, "rooms", "room", "room", true));
                    }
                }
            }
        }
    }

    private void customizeTasksTable(AbstractTableInfo ti)
    {
//        DetailsURL detailsURL = DetailsURL.fromString("/ehr/dataEntryFormDetails.view?formType=${formtype}&taskid=${taskid}");
//        ti.setDetailsURL(detailsURL);
//
//        if (rowIdCol != null)
//        {
//            rowIdCol.setURL(detailsURL);
//        }
        UserSchema us = ti.getUserSchema();

        ColumnInfo rowIdCol = ti.getColumn("rowid");
        if (rowIdCol != null && us != null)
        {
            rowIdCol.setDisplayColumnFactory(colInfo -> new DataColumn(colInfo)
            {
                @Override
                public void renderGridCellContents(RenderContext ctx, Writer out) throws IOException
                {
                    Integer rowId = (Integer) ctx.get(new FieldKey(getBoundColumn().getFieldKey().getParent(), "rowid"));
                    String taskId = (String) ctx.get(new FieldKey(getBoundColumn().getFieldKey().getParent(), "taskid"));
                    String formType = (String) ctx.get(new FieldKey(getBoundColumn().getFieldKey().getParent(), "formtype"));

                    if (isExt4Form("form", formType))
                    {
                        ActionURL url = new ActionURL("ehr", "dataEntryFormDetails.view", us.getContainer());
                        if ("Research Ultrasounds".equalsIgnoreCase(formType)) {
                            formType = "Research Ultrasounds Task";
                        }
                        url.addParameter("formtype", formType);
                        url.addParameter("taskid", taskId);
                        StringBuilder urlString = new StringBuilder();
                        urlString.append("<a href=\"" + PageFlowUtil.filter(url) + "\">");
                        urlString.append(PageFlowUtil.filter(rowId));
                        urlString.append("</a>");

                        out.write(urlString.toString());
                    } else {
                        super.renderGridCellContents(ctx, out);
                    }
                }

                @Override
                public Object getDisplayValue(RenderContext ctx)
                {
                    return ctx.get(new FieldKey(getBoundColumn().getFieldKey().getParent(), "rowid"));
                }
            });

            ColumnInfo updateTitleCol = ti.getColumn("updateTitle");
            if (updateTitleCol != null && us != null)
            {
                updateTitleCol.setDisplayColumnFactory(colInfo -> new DataColumn(colInfo)
                {
                    @Override
                    public void renderGridCellContents(RenderContext ctx, Writer out) throws IOException
                    {
                        String updateTitle = (String) ctx.get(new FieldKey(getBoundColumn().getFieldKey().getParent(), "updateTitle"));
                        String taskId = (String) ctx.get(new FieldKey(getBoundColumn().getFieldKey().getParent(), "taskid"));
                        String formType = (String) ctx.get(new FieldKey(getBoundColumn().getFieldKey().getParent(), "formtype"));

                        if (isExt4Form("form", formType))
                        {
                            ActionURL url = new ActionURL("ehr", "dataEntryForm.view", us.getContainer());
                            if ("Research Ultrasounds".equalsIgnoreCase(formType))
                            {
                                formType = "Research Ultrasounds Review";
                            }
                            url.addParameter("formType", formType);
                            url.addParameter("taskid", taskId);
                            StringBuilder urlString = new StringBuilder();
                            urlString.append("<a href=\"" + PageFlowUtil.filter(url) + "\">");
                            urlString.append(PageFlowUtil.filter(updateTitle));
                            urlString.append("</a>");

                            out.write(urlString.toString());
                        }
                        else
                        {
                            super.renderGridCellContents(ctx, out);
                        }
                    }

                    @Override
                    public Object getDisplayValue(RenderContext ctx)
                    {
                        return ctx.get(new FieldKey(getBoundColumn().getFieldKey().getParent(), "rowid"));
                    }
                });
            }
        }
    }

    private void customizeProjectTable(AbstractTableInfo ti)
    {
        String investigatorName = "investigatorName";
        SQLFragment sql = new SQLFragment("COALESCE((SELECT " +
                "(CASE WHEN lastName IS NOT NULL AND firstName IS NOT NULL " +
                            "THEN (lastName ||', '|| firstName) " +
                        "WHEN lastName IS NOT NULL AND firstName IS NULL " +
                            "THEN lastName " +
                        "ELSE " +
                            "firstName " +
                        "END) AS investigatorWithName " +
                "from ehr.investigators where rowid = " + ExprColumn.STR_TABLE_ALIAS + ".investigatorId), " + ExprColumn.STR_TABLE_ALIAS + ".inves)");
        ExprColumn newCol = new ExprColumn(ti, investigatorName, sql, JdbcType.VARCHAR);
        newCol.setLabel("Investigator");
        newCol.setDescription("This column shows the name of the investigator on the project. It first checks if there is an investigatorId, and if not defaults to the old inves column.");
        ti.addColumn(newCol);
    }

    private void customizeFeedingTable(AbstractTableInfo ti)
    {
        // this number is representative of 12/17 ratio
        Double d = new Double(.705882);
        Double conv = d;
        Double invconv = 1/d;
        String chowConversion = "chowConversion";
        Container ehrContainer = EHRService.get().getEHRStudyContainer(ti.getUserSchema().getContainer());
        GUID ehrEntityId = ehrContainer.getEntityId();
        ehrEntityId.toString();
        SQLFragment sql = new SQLFragment("(SELECT " +
               " (CASE WHEN type = (SELECT Rowid from ehr_lookups.lookups where set_name = 'feeding_types' and value = 'log' and container ='"+ ehrEntityId.toString() + "')" +
                    "THEN (ROUND(amount*"+ conv.toString() + ") || ' flower')" +
                "WHEN type = (SELECT Rowid from ehr_lookups.lookups where set_name = 'feeding_types' and value = 'log (gluten-free)' and container ='"+ ehrEntityId.toString() + "')" +
                    "THEN (ROUND(amount*"+ conv.toString() + ") || ' flower')" +
                "WHEN type = (SELECT Rowid from ehr_lookups.lookups where set_name = 'feeding_types' and value = 'flower' and container ='" + ehrEntityId.toString() + "')" +
                    "THEN (ROUND(amount*" + invconv.toString() + ") || ' log')" +
                "ELSE " +
                    " 'bad data'" +
                "END) as ChowConversion)");
        ExprColumn newCol = new ExprColumn(ti, chowConversion, sql, JdbcType.VARCHAR);
        newCol.setLabel("Chow Conversion");
        newCol.setDescription("This column shows the calculated conversion amount between log and flower chows. The current conversion is 12g log <=> 17g flower.");
        ti.addColumn(newCol);

        String chowLookup = "chowLookup";
        SQLFragment sql2 = new SQLFragment("(SELECT " +
                " (CASE WHEN type = (SELECT Rowid from ehr_lookups.lookups where set_name = 'feeding_types' and value = 'log' and container ='"+ ehrEntityId.toString() + "')" +
                "THEN (CAST (amount as text) || ' log')" +
                "WHEN type = (SELECT Rowid from ehr_lookups.lookups where set_name = 'feeding_types' and value = 'log (gluten-free)' and container ='"+ ehrEntityId.toString() + "')" +
                "THEN (CAST (amount as text) || ' log (gluten-free)')" +
                "WHEN type = (SELECT Rowid from ehr_lookups.lookups where set_name = 'feeding_types' and value = 'flower' and container ='"+ ehrEntityId.toString() + "')" +
                "THEN (CAST (amount as text) || ' flower')" +
                "ELSE " +
                " 'bad data'" +
                "END) as ChowLookup)");
        ExprColumn newCol2 = new ExprColumn(ti, chowLookup, sql2, JdbcType.VARCHAR);
        newCol2.setLabel("Chow Lookup");
        ti.addColumn(newCol2);

    }

    private void customizeBirthTable(AbstractTableInfo ti)
    {
        ColumnInfo cond = ti.getColumn("cond");
        if (cond != null)
        {
            cond.setLabel("Housing Condition");
            UserSchema us = getUserSchema(ti, "ehr_lookups");
            if (us != null)
            {
                cond.setFk(new QueryForeignKey(us, null, "housing_condition_codes", "value", "title"));
            }
        }

    }

    private void customizeAnimalTable(AbstractTableInfo ds)
    {
        if (ds.getColumn("MHCtyping") != null)
            return;

        UserSchema us = getStudyUserSchema(ds);
        if (us == null){
            return;
        }

        if (ds.getColumn("demographicsMHC") == null)
        {
            ColumnInfo col = getWrappedIdCol(us, ds, "MHCtyping", "demographicsMHC");
            col.setLabel("MHC SSP Typing");
            col.setDescription("Summarizes MHC SSP typing results for the common alleles");
            ds.addColumn(col);

            ColumnInfo col2 = getWrappedIdCol(us, ds, "ViralLoad", "demographicsVL");
            col2.setLabel("Viral Loads");
            col2.setDescription("This field calculates the most recent viral load for this animal");
            ds.addColumn(col2);

            ColumnInfo col3 = getWrappedIdCol(us, ds, "ViralStatus", "demographicsViralStatus");
            col3.setLabel("Viral Status");
            col3.setDescription("This calculates the viral status of the animal based on tracking project assignments");
            ds.addColumn(col3);

            ColumnInfo col18 = getWrappedIdCol(us, ds, "Virology", "demographicsVirology");
            col18.setLabel("Virology");
            col18.setDescription("This calculates the distinct pathogens listed as positive for this animal from the virology table");
            ds.addColumn(col18);

            ColumnInfo col4 = getWrappedIdCol(us, ds, "IrregularObs", "demographicsObs");
            col4.setLabel("Irregular Obs");
            col4.setDescription("Shows any irregular observations from each animal today or yesterday.");
            ds.addColumn(col4);

            ColumnInfo col7 = getWrappedIdCol(us, ds, "activeAssignments", "demographicsAssignments");
            col7.setLabel("Assignments - Active");
            col7.setDescription("Contains summaries of the assignments for each animal, including the project numbers, availability codes and a count");
            ds.addColumn(col7);

            ColumnInfo col6 = getWrappedIdCol(us, ds, "totalAssignments", "demographicsAssignmentHistory");
            col6.setLabel("Assignments - Total");
            col6.setDescription("Contains summaries of the total assignments this animal has ever had, including the project numbers and a count");
            ds.addColumn(col6);

            ColumnInfo col5 = getWrappedIdCol(us, ds, "assignmentSummary", "demographicsAssignmentSummary");
            col5.setLabel("Assignments - Detailed");
            col5.setDescription("Contains more detailed summaries of the active assignments for each animal, including a breakdown between research, breeding, training, etc.");
            ds.addColumn(col5);

            ColumnInfo col10 = getWrappedIdCol(us, ds, "DaysAlone", "demographicsDaysAlone");
            col10.setLabel("Days Alone");
            col10.setDescription("Calculates the total number of days each animal has been single housed, if applicable.");
            ds.addColumn(col10);

            ColumnInfo bloodCol = getWrappedIdCol(us, ds, "AvailBlood", "demographicsBloodSummary");
            bloodCol.setLabel("Blood Remaining");
            bloodCol.setDescription("Calculates the total blood draw and remaining, which is determine by weight and blood drawn in the past 30 days.");
            ds.addColumn(bloodCol);

            ColumnInfo col17 = getWrappedIdCol(us, ds, "MostRecentTB", "demographicsMostRecentTBDate");
            col17.setLabel("TB Tests");
            col17.setDescription("Calculates the most recent TB date for this animal, time since TB and the last eye TB tested");
            ds.addColumn(col17);

            ColumnInfo col16 = getWrappedIdCol(us, ds, "Surgery", "demographicsSurgery");
            col16.setLabel("Surgical History");
            col16.setDescription("Calculates whether this animal has ever had any surgery or a surgery flagged as major");
            ds.addColumn(col16);

            ColumnInfo col19 = getWrappedIdCol(us, ds, "CurrentBehavior", "CurrentBehaviorNotes");
            col19.setLabel("Behavior - Current");
            col19.setDescription("This calculates the current behavior(s) for the animal, based on the behavior abstract table");
            ds.addColumn(col19);

            ColumnInfo col20 = getWrappedIdCol(us, ds, "PrimateId", "demographicsPrimateId");
            col20.setLabel("PrimateId");
            col20.setDescription("Unique PrimateID column to be shared across all datasets");
            ds.addColumn(col20);
        }

        if (ds.getColumn("totalOffspring") == null)
        {
            ColumnInfo col15 = getWrappedIdCol(us, ds, "totalOffspring", "demographicsTotalOffspring");
            col15.setLabel("Number of Offspring");
            col15.setDescription("Shows the total offspring of each animal");
            ds.addColumn(col15);
        }
    }

    private void customizeDemographicsTable(AbstractTableInfo table)
    {
        UserSchema us = getStudyUserSchema(table);
        if (us == null){
            return;
        }

        if (table.getColumn("Feeding") == null)
        {
            ColumnInfo col = getWrappedIdCol(us, table, "Feeding", "demographicsMostRecentFeeding");
            col.setLabel("Feeding");
            col.setDescription("Shows most recent feeding type and chow conversion.");
            table.addColumn(col);
        }

        if (table.getColumn("mostRecentAlopeciaScore") == null)
        {
            String mostRecentAlopeciaScore = "mostRecentAlopeciaScore";
            TableInfo alopecia = getRealTableForDataset(table, "alopecia");

            String theQuery  = "( " +
                    "(SELECT " +
                        "a.score as score " +
                    "FROM studydataset." +alopecia.getName() + " a " +
                    "WHERE a.score is not null and a.participantid=" + ExprColumn.STR_TABLE_ALIAS + ".participantid  ORDER by a.date DESC LIMIT 1)  " +
                    ")";

            SQLFragment sql = new SQLFragment(theQuery);

            ExprColumn newCol = new ExprColumn(table, mostRecentAlopeciaScore, sql, JdbcType.VARCHAR);
            newCol.setLabel("Alopecia Score");
            newCol.setDescription("Calculates the most recent alopecia score for each animal");
            newCol.setURL(StringExpressionFactory.create("query-executeQuery.view?schemaName=ehr_lookups&query.queryName=alopecia_scores"));
            table.addColumn(newCol);
        }

        if (table.getColumn("mostRecentBodyConditionScore") == null)
        {
            String mostRecentBodyConditionScore = "mostRecentBodyConditionScore";
            TableInfo bcs = getRealTableForDataset(table, "bcs");

            String theQuery  = "( " +
                    "(SELECT " +
                    "a.score as score " +
                    "FROM studydataset." +bcs.getName() + " a " +
                    "WHERE a.score is not null and a.participantid=" + ExprColumn.STR_TABLE_ALIAS + ".participantid  ORDER by a.date DESC LIMIT 1)  " +
                    ")";

            SQLFragment sql = new SQLFragment(theQuery);

            ExprColumn newCol = new ExprColumn(table, mostRecentBodyConditionScore, sql, JdbcType.VARCHAR);
            newCol.setURL(StringExpressionFactory.create("query-executeQuery.view?schemaName=ehr_lookups&query.queryName=body_condition_scores"));
            newCol.setLabel("Most Recent BCS");
            newCol.setDescription("Returns the participant's most recent body condition score");
            table.addColumn(newCol);
        }
        if (table.getColumn("necropsyAbstractNotes") == null)
        {
            ColumnInfo col = getWrappedIdCol(us, table, "necropsyAbstractNotes", "demographicsNecropsyAbstractNotes");
            col.setLabel("Necropsy Abstract Notes");
            col.setDescription("Returns the participant's necropsy abstract remarks and projects");
            table.addColumn(col);
        }
        if (table.getColumn("origin") == null)
        {
            String origin = "origin";
            TableInfo birth = getRealTableForDataset(table, "birth");
            TableInfo arrival = getRealTableForDataset(table, "arrival");

            // Here we want a union of the birth and arrival tables to get the origin of the animal
            String arrivalAndBirthUnion = "( " +
                    "SELECT " +
                        "a.source as source, " +
                        "a.date as date," +
                        "a.participantid as participantid " +
                    "FROM studydataset." +arrival.getName() + " a " +

                    "WHERE a.source is not null and a.participantid=" + ExprColumn.STR_TABLE_ALIAS + ".participantid " +

                    "UNION ALL " +

                    "SELECT " +
                        "b.origin as source," +
                        "b.date as date," +
                        "b.participantid as participantid " +
                    "FROM studydataset." + birth.getName() + " b " +

                    "WHERE b.origin is not null and b.participantid=" + ExprColumn.STR_TABLE_ALIAS + ".participantid " +
                    ")";

            String theQuery = "(" +
                    "SELECT source FROM " + arrivalAndBirthUnion + " w ORDER BY w.date DESC LIMIT 1" +
                    ")";


            SQLFragment sql = new SQLFragment(theQuery);

            ExprColumn newCol = new ExprColumn(table, origin, sql, JdbcType.VARCHAR);
            //String url = "query-detailsQueryRow.view?schemaName=ehr_lookups&query.queryName=source&code=${origin}";

            //newCol.setURL(StringExpressionFactory.createURL(url));
            newCol.setLabel("Source/Vendor");
            newCol.setDescription("Returns the animal's original source from an arrival or birth record.");
            UserSchema ehrLookupsSchema = getUserSchema(table, "ehr_lookups");
            newCol.setFk(new QueryForeignKey(ehrLookupsSchema, null, "source", "code", "meaning"));
            newCol.setURL(StringExpressionFactory.create("query-detailsQueryRow.view?schemaName=ehr_lookups&query.queryName=source&code=${origin}"));
            table.addColumn(newCol);
        }
        // Here we want a custom query since the getWrappedIdCol model did not work for us for the following requirements:
        // 1. Show the geographic origin if the query is able to calculate it.
        // 2. Show blank (and not the broken lookup with the id inside of <angle brackets>) if we don't have the info.
        // 3. Have the text be a link when we have a value to show.
        if (table.getColumn("geographic_origin") == null)
        {
            String geographicOrigin = "geographic_origin";

            TableInfo birth = getRealTableForDataset(table, "birth");
            TableInfo arrival = getRealTableForDataset(table, "arrival");

            // Here we want a union of the birth and arrival tables to get the geographic origin of the animal
            String arrivalAndBirthUnion = "( " +
                    "SELECT " +
                        "a.geographic_origin as origin, " +
                        "a.date as date," +
                        "a.participantid as participantid " +
                    "FROM studydataset." +arrival.getName() + " a " +

                    "WHERE a.geographic_origin is not null and a.participantid=" + ExprColumn.STR_TABLE_ALIAS + ".participantid " +

                    "UNION ALL " +

                    "SELECT " +
                        "b.origin as origin," +
                        "b.date as date," +
                        "b.participantid as participantid " +
                    "FROM studydataset." + birth.getName() + " b " +

                    "WHERE b.origin is not null and b.participantid=" + ExprColumn.STR_TABLE_ALIAS + ".participantid " +
                    ")";

            String theQuery = "(" +
                    "SELECT " +
                        "CASE WHEN origin = 'cen'" +
                        "THEN 'domestic' " +
                        "ELSE origin " +
                        "END AS geographic_origin " +
                    "FROM " + arrivalAndBirthUnion + " w ORDER BY w.date ASC LIMIT 1" +
                    ")";


            SQLFragment sql = new SQLFragment(theQuery);

            ExprColumn newCol = new ExprColumn(table, geographicOrigin, sql, JdbcType.VARCHAR);
            String url = "query-detailsQueryRow.view?schemaName=ehr_lookups&query.queryName=geographic_origins&meaning=${geographic_origin}";
            newCol.setURL(StringExpressionFactory.createURL(url));
            newCol.setLabel("Geographic Origin");
            newCol.setDescription("This column is the geographic origin");
            table.addColumn(newCol);
        }
        if (table.getColumn("ancestry") == null)
        {
            String ancestry = "ancestry";
            TableInfo birth = getRealTableForDataset(table, "birth");
            TableInfo arrival = getRealTableForDataset(table, "arrival");

            // Here we want a union of the birth and arrival tables to get the ancestry of the animal
            String arrivalAndBirthUnion = "( " +
                    "SELECT " +
                        "a.ancestry as ancestry, " +
                        "a.date as date," +
                        "a.participantid as participantid " +
                    "FROM studydataset." + arrival.getName() + " a " +

                    "WHERE a.ancestry is not null and a.participantid=" + ExprColumn.STR_TABLE_ALIAS + ".participantid " +

                    "UNION ALL " +

                    "SELECT " +
                        "b.ancestry as ancestry," +
                        "b.date as date," +
                        "b.participantid as participantid " +
                    "FROM studydataset." + birth.getName() + " b " +

                    "WHERE b.ancestry is not null and b.participantid=" + ExprColumn.STR_TABLE_ALIAS + ".participantid " +
                    ")";

            String theQuery = "(" +
                    "SELECT ancestry FROM " + arrivalAndBirthUnion + " w ORDER BY w.date ASC LIMIT 1" +
                    ")";


            SQLFragment sql = new SQLFragment(theQuery);

            ExprColumn newCol = new ExprColumn(table, ancestry, sql, JdbcType.VARCHAR);
            newCol.setLabel("Ancestry");
            newCol.setDescription("Returns the animal's ancestry.");
            UserSchema ehrLookupsSchema = getUserSchema(table, "ehr_lookups");
            newCol.setFk(new QueryForeignKey(ehrLookupsSchema, null, "ancestry", "rowid", "value"));
            newCol.setURL(StringExpressionFactory.create("query-detailsQueryRow.view?schemaName=ehr_lookups&query.queryName=source&code=${ancestry}"));
            table.addColumn(newCol);
        }
        if (table.getColumn("birth") == null)
        {
            String birthColumn = "birth";
            TableInfo birth = getRealTableForDataset(table, "birth");
            TableInfo arrival = getRealTableForDataset(table, "arrival");

            // Here we want a union of the birth and arrival tables to get the ancestry of the animal
            String arrivalAndBirthUnion = "( " +
                    "SELECT " +
                        "a.birth as birth, " +
                        "a.participantid as participantid, " +
                        "a.modified as modified " +
                    "FROM studydataset." + arrival.getName() + " a " +

                    "WHERE a.birth is not null and a.participantid=" + ExprColumn.STR_TABLE_ALIAS + ".participantid " +

                    "UNION ALL " +

                    "SELECT " +
                        "b.date as birth," +
                        "b.participantid as participantid, " +
                        "b.modified as modified " +
                    "FROM studydataset." + birth.getName() + " b " +

                    "WHERE b.date is not null and b.participantid=" + ExprColumn.STR_TABLE_ALIAS + ".participantid " +
                    ")";

            String theQuery = "(" +
                    "SELECT birth FROM " + arrivalAndBirthUnion + " w ORDER BY w.modified DESC LIMIT 1" +
                    ")";


            SQLFragment sql = new SQLFragment(theQuery);

            ExprColumn newCol = new ExprColumn(table, birthColumn, sql, JdbcType.DATE);
            newCol.setLabel("Birth");
            newCol.setDescription("Returns the animal's birth date.");
            //newCol.setURL(StringExpressionFactory.create("query-executeQuery.view?schemaName=study&query.queryName=Birth&query.Id~eq={id}"));
            table.addColumn(newCol);
        }
    }

    private TableInfo getRealTableForDataset(AbstractTableInfo ti, String name)
    {
        Container ehrContainer = EHRService.get().getEHRStudyContainer(ti.getUserSchema().getContainer());
        if (ehrContainer == null)
            return null;

        Dataset ds;
        Study s = StudyService.get().getStudy(ehrContainer);
        if (s == null)
            return null;

        ds = s.getDatasetByName(name);
        if (ds == null)
        {
            // NOTE: this seems to happen during study import on TeamCity.  It does not seem to happen during normal operation
            _log.info("A dataset was requested that does not exist: " + name + " in container: " + ehrContainer.getPath());
            StringBuilder sb = new StringBuilder();
            for (Dataset d : s.getDatasets())
            {
                sb.append(d.getName() + ", ");
            }
            _log.info("datasets present: " + sb.toString());

            return null;
        }
        else
        {
            return StorageProvisioner.createTableInfo(ds.getDomain());
        }
    }

    private void customizeProtocolTable(AbstractTableInfo table)
    {
        ColumnInfo protocolCol = table.getColumn("protocol");
        if (protocolCol != null && table.getColumn("pdf") == null)
        {
            ColumnInfo col = table.addColumn(new WrappedColumn(protocolCol, "pdf"));
            col.setLabel("PDF");
            col.setURL(StringExpressionFactory.create("/query/WNPRC/WNPRC_Units/Animal_Services/Compliance_Training/Private/Protocol_PDFs/executeQuery.view?schemaName=lists&query.queryName=ProtocolPDFs&query.protocol~eq=${pdf}", true));
        }

        if (table.getColumn("totalProjects") == null)
        {
            UserSchema us = getUserSchema(table, "ehr");
            if (us != null)
            {
                ColumnInfo col2 = table.addColumn(new WrappedColumn(protocolCol, "totalProjects"));
                col2.setLabel("Total Projects");
                col2.setUserEditable(false);
                col2.setIsUnselectable(true);
                col2.setFk(new QueryForeignKey(us, null, "protocolTotalProjects", "protocol", "protocol"));
            }
        }
                //TODO: Make this work with an Ext UI that  does not over write the values
               /* ColumnInfo contactsColumn = table.getColumn("contacts");
                contactsColumn.setDisplayColumnFactory(new DisplayColumnFactory()
                {
                    @Override
                    public DisplayColumn createRenderer(ColumnInfo colInfo)
                    {
                        return new ContactsColumn(colInfo);
                    }
                });*/
        if (table.getColumn("expirationDate") == null)
        {
            UserSchema us = getUserSchema(table, "ehr");
            if (us != null)
            {
                ColumnInfo col2 = table.addColumn(new WrappedColumn(protocolCol, "expirationDate"));
                col2.setLabel("Expiration Date");
                col2.setUserEditable(false);
                col2.setIsUnselectable(true);
                col2.setFk(new QueryForeignKey(us, null, "protocolExpirationDate", "protocol", "protocol"));
            }
        }

        if (table.getColumn("countsBySpecies") == null)
        {
            UserSchema us = getUserSchema(table, "ehr");
            if (us != null)
            {
                ColumnInfo col2 = table.addColumn(new WrappedColumn(protocolCol, "countsBySpecies"));
                col2.setLabel("Max Animals Per Species");
                col2.setUserEditable(false);
                col2.setIsUnselectable(true);
                col2.setFk(new QueryForeignKey(us, null, "protocolCountsBySpecies", "protocol", "protocol"));
            }
        }


    }

    private void customizeBreedingEncountersTable(AbstractTableInfo ti)
    {
        customizeSireIdColumn(ti);
    }

    private void customizePregnanciesTable(AbstractTableInfo ti) {
        customizeSireIdColumn(ti);
    }

    private void customizeHousingTable(AbstractTableInfo ti) {
        customizeReasonForMoveColumn(ti);
    }

    private void customizeSireIdColumn(AbstractTableInfo ti) {
        ColumnInfo sireid = ti.getColumn("sireid");
        if (sireid != null)
        {
            UserSchema us = getUserSchema(ti, "study");
            if (us != null)
            {
                sireid.setDisplayColumnFactory(colInfo -> new DataColumn(colInfo){

                    @Override
                    public void renderGridCellContents(RenderContext ctx, Writer out) throws IOException
                    {
                        ActionURL url = new ActionURL("ehr", "participantView.view", us.getContainer());
                        String joinedIds = (String)ctx.get(new FieldKey(getBoundColumn().getFieldKey().getParent(), "sireid"));
                        if (joinedIds != null)
                        {
                            String[] ids = joinedIds.split(",");
                            String urlString = "";
                            for (int i = 0; i < ids.length; i++)
                            {
                                String id = ids[i];
                                url.replaceParameter("participantId", id);
                                urlString += "<a href=\"" + PageFlowUtil.filter(url) + "\">";
                                urlString += PageFlowUtil.filter(id);
                                urlString += "</a>";
                                if (i + 1 < ids.length)
                                {
                                    urlString += ", ";
                                }
                            }
                            out.write(urlString);
                        }
                    }

                    @Override
                    public Object getDisplayValue(RenderContext ctx)
                    {
                        return ctx.get(new FieldKey(getBoundColumn().getFieldKey().getParent(), "sireid"));
                    }
                });
            }
        }
    }

    private void customizeReasonForMoveColumn(AbstractTableInfo ti) {
        ColumnInfo reason = ti.getColumn("reason");
        if (reason != null)
        {
            UserSchema us = getUserSchema(ti, "study");
            if (us != null)
            {
                reason.setDisplayColumnFactory(colInfo -> new DataColumn(colInfo){

                    @Override
                    public void renderGridCellContents(RenderContext ctx, Writer out) throws IOException
                    {
                        ActionURL url = new ActionURL("query", "recordDetails.view", us.getContainer());
                        String joinedReasons = (String)ctx.get(new FieldKey(getBoundColumn().getFieldKey().getParent(), "reason"));
                        if (joinedReasons != null)
                        {
                            String[] reasons = joinedReasons.split(",");
                            url.addParameter("schemaName", "ehr_lookups");
                            url.addParameter("query.queryName", "housing_reason");
                            url.addParameter("keyField", "value");

                            StringBuilder urlString = new StringBuilder();
                            for (int i = 0; i < reasons.length; i++)
                            {
                                String reasonForMoveValue = reasons[i];
                                SimplerFilter filter = new SimplerFilter("set_name", CompareType.EQUAL, "housing_reason").addCondition("value", CompareType.EQUAL, reasonForMoveValue);
                                DbSchema schema = DbSchema.get("ehr_lookups", DbSchemaType.Module);
                                TableInfo ti = schema.getTable("lookups");
                                TableSelector ts = new TableSelector(ti, filter, null);
                                String reasonForMoveTitle;
                                if (ts.getMap() != null && ts.getMap().get("title") != null)
                                {
                                    reasonForMoveTitle = (String) ts.getMap().get("title");
                                    url.replaceParameter("key", reasonForMoveValue);
                                    urlString.append("<a href=\"").append(PageFlowUtil.filter(url)).append("\">");
                                    urlString.append(PageFlowUtil.filter(reasonForMoveTitle));
                                    urlString.append("</a>");
                                }
                                else
                                {
                                    urlString.append(PageFlowUtil.filter("<" + reasonForMoveValue + ">"));
                                }
                                if (i + 1 < reasons.length)
                                {
                                    urlString.append(", ");
                                }
                            }
                            out.write(urlString.toString());
                        }
                    }

                    @Override
                    public Object getDisplayValue(RenderContext ctx)
                    {
                        return ctx.get(new FieldKey(getBoundColumn().getFieldKey().getParent(), "reason"));
                    }
                });
            }
        }
    }

    private ColumnInfo getWrappedIdCol(UserSchema us, AbstractTableInfo ds, String name, String queryName)
    {
        String ID_COL = "Id";
        WrappedColumn col = new WrappedColumn(ds.getColumn(ID_COL), name);
        col.setReadOnly(true);
        col.setIsUnselectable(true);
        col.setUserEditable(false);
        col.setFk(new QueryForeignKey(us, null, queryName, ID_COL, ID_COL));

        return col;
    }

    private UserSchema getStudyUserSchema(AbstractTableInfo ds)
    {
        return getUserSchema(ds, "study");
    }

    public UserSchema getUserSchema(AbstractTableInfo ds, String name)
    {
        UserSchema us = ds.getUserSchema();
        if (us != null)
        {
            if (name.equalsIgnoreCase(us.getName()))
                return us;

            return QueryService.get().getUserSchema(us.getUser(), us.getContainer(), name);
        }

        return null;
    }

    //TODO: Look how to use another UI to allow for better support for virtual columns
   /* public static  class ContactsColumn extends DataColumn
    {
        public ContactsColumn(ColumnInfo colInfo)
        {
            super(colInfo);
        }

        @Override
        public Object getValue(RenderContext ctx)
        {
            Object value =  super.getValue(ctx);
            StringBuffer readableContacts = new StringBuffer();
            if(value != null)
            {
                //TODO:parse the value into integers to display users
                String contacts = value.toString();

                if (contacts.contains(","))
                {

                    List<String> contactList = new ArrayList<>(Arrays.asList(contacts.split(",")));
                    Iterator<String> contactsIterator = contactList.iterator();
                    while (contactsIterator.hasNext())
                    {
                        User singleContact = UserManager.getUser(Integer.parseInt(contactsIterator.next()));
                        readableContacts.append(singleContact.getDisplayName(singleContact));
                        readableContacts.append(" ");
                        System.out.println("readable contact "+readableContacts);
                    }
                    return readableContacts;
                }

                if (NumberUtils.isNumber(contacts)){
                    User singleContact = UserManager.getUser(Integer.parseInt(contacts));
                    readableContacts.append(singleContact.getDisplayName(singleContact));
                    return readableContacts;

                }

            }
            return readableContacts;

        }

        @Override
        public Object getDisplayValue(RenderContext ctx)
        {
            return getValue(ctx);
        }


        @Override
        public String getFormattedValue(RenderContext ctx)
        {
            return h(getValue(ctx));
        }
    }*/

   private boolean isExt4Form(String schemaName, String queryName)
   {
       boolean isExt4Form = false;

       SimplerFilter filter = new SimplerFilter("schemaname", CompareType.EQUAL, schemaName).addCondition("queryname", CompareType.EQUAL, queryName);
       TableInfo ti = DbSchema.get("ehr", DbSchemaType.Module).getTable(EHRSchema.TABLE_FORM_FRAMEWORK_TYPES);
       TableSelector ts = new TableSelector(ti, filter, null);
       String framework;
       if (ts.getMap() != null && ts.getMap().get("framework") != null)
       {
           framework = (String) ts.getMap().get("framework");
           if ("extjs4".equalsIgnoreCase(framework)) {
               isExt4Form = true;
           }
       }

       return isExt4Form;
   }
}
