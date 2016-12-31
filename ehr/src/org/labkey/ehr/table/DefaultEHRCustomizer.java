/*
 * Copyright (c) 2012-2016 LabKey Corporation
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
package org.labkey.ehr.table;

import org.apache.log4j.Logger;
import org.jetbrains.annotations.Nullable;
import org.json.JSONObject;
import org.labkey.api.collections.CaseInsensitiveHashSet;
import org.labkey.api.data.AbstractTableInfo;
import org.labkey.api.data.ButtonBarConfig;
import org.labkey.api.data.ButtonConfig;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.Container;
import org.labkey.api.data.DataColumn;
import org.labkey.api.data.DisplayColumn;
import org.labkey.api.data.DisplayColumnFactory;
import org.labkey.api.data.JdbcType;
import org.labkey.api.data.RenderContext;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.TableCustomizer;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.UserDefinedButtonConfig;
import org.labkey.api.data.WrappedColumn;
import org.labkey.api.ehr.EHRService;
import org.labkey.api.ehr.buttons.EHRShowEditUIButton;
import org.labkey.api.ehr.security.EHRDataAdminPermission;
import org.labkey.api.exp.api.StorageProvisioner;
import org.labkey.api.gwt.client.AuditBehaviorType;
import org.labkey.api.gwt.client.FacetingBehaviorType;
import org.labkey.api.ldk.LDKService;
import org.labkey.api.ldk.table.AbstractTableCustomizer;
import org.labkey.api.ldk.table.ButtonConfigFactory;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.query.AliasedColumn;
import org.labkey.api.query.DetailsURL;
import org.labkey.api.query.ExprColumn;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.LookupForeignKey;
import org.labkey.api.query.QueryDefinition;
import org.labkey.api.query.QueryException;
import org.labkey.api.query.QueryForeignKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.User;
import org.labkey.api.study.Dataset;
import org.labkey.api.study.DatasetTable;
import org.labkey.api.study.Study;
import org.labkey.api.study.StudyService;
import org.labkey.api.view.NavTree;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.ehr.EHRModule;
import org.labkey.ehr.EHRSchema;

import java.io.IOException;
import java.io.Writer;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * User: bimber
 * Date: 12/7/12
 * Time: 2:29 PM
 */
public class DefaultEHRCustomizer extends AbstractTableCustomizer
{
    public static final String ID_COL = "Id";
    public static final String PARTICIPANT_CONCEPT_URI = "http://cpas.labkey.com/Study#ParticipantId";

    private static final Logger _log = Logger.getLogger(DefaultEHRCustomizer.class);
    private boolean _addLinkDisablers = true;
    private static final String MORE_ACTIONS = "More Actions";

    public DefaultEHRCustomizer()
    {

    }

    public void customize(TableInfo table)
    {
        LDKService.get().getBuiltInColumnsCustomizer(false).customize(table);
        UserSchema us = table.getUserSchema();
        if (us != null)
        {
            Container c = us.getContainer();
            if (!c.getActiveModules().contains(ModuleLoader.getInstance().getModule(EHRModule.class)))
            {
                _log.error("Attempting to use DefaultEHRCustomizer on table (" + us.getName() + "." + table.getName() + ") even though the module is not enabled: " + c.getPath());
                return;
            }

            String df = EHRService.get().getDateFormat(c);
            if (df != null)
            {
                for (ColumnInfo col : table.getColumns())
                {
                    if (col.getJdbcType().getJavaClass().equals(Date.class) && col.getFormat() == null)
                        col.setFormat(df);
                }
            }
        }

        //NOTE: no datasets should be included below.  these should be customized in customizeDataset()
        if (table instanceof DatasetTable)
        {
            customizeDataset((DatasetTable)table);
        }
        else if (matches(table, "study", "StudyData"))
        {
            customizeStudyData((AbstractTableInfo)table);
        }
        else if (table instanceof AbstractTableInfo && table.getName().equalsIgnoreCase("Animal"))
        {
            customizeAnimalTable((AbstractTableInfo)table);
        }
        else if (matches(table, "ehr", "project"))
        {
            customizeProjectTable((AbstractTableInfo)table);
        }
        else if (matches(table, "ehr", "protocolExemptions"))
        {
            customizeProtocolExemptions((AbstractTableInfo) table);
        }
        else if (matches(table, "ehr", "protocol"))
        {
            customizeProtocolTable((AbstractTableInfo) table);
        }
        else if (matches(table, "ehr_lookups", "procedures"))
        {
            customizeProcedures((AbstractTableInfo) table);
        }
        else if (matches(table, "study", "demographicsAge"))
        {
            customizeDemographicsAgeTable((AbstractTableInfo) table);
        }
        else if (matches(table, "ehr_lookups", "rooms"))
        {
            customizeRooms((AbstractTableInfo) table);
        }
        else if (matches(table, "ehr", "animal_groups"))
        {
            customizeAnimalGroups((AbstractTableInfo) table);
        }
        else if (matches(table, "ehr_lookups", "snomed"))
        {
            customizeSNOMED((AbstractTableInfo) table);
        }
        else if (matches(table, "ehr", "snomed_tags"))
        {
            customizeSNOMEDTags((AbstractTableInfo) table);
        }
        else if (matches(table, "ehr", "tasks") || matches(table, "ehr", "my_tasks"))
        {
            customizeTasks((AbstractTableInfo) table);
        }
        else if (matches(table, "study", "drugsUnified"))
        {
            customizeDrugsUnified((AbstractTableInfo) table);
        }
        else if (table instanceof AbstractTableInfo)
        {
            doSharedCustomization((AbstractTableInfo) table);
        }

        //this should execute after any default EHR code
        if (us != null)
        {
            Container c = us.getContainer();

            List<TableCustomizer> customizers = EHRService.get().getCustomizers(c, table.getSchema().getName(), table.getName());
            for (TableCustomizer tc : customizers)
            {
                tc.customize(table);
            }
        }

        if (table instanceof AbstractTableInfo)
        {
            //this will force qcstate toward the end of the non-calculated columns
            ColumnInfo qc = table.getColumn("qcstate");
            if (qc != null)
            {
                AbstractTableInfo ati = (AbstractTableInfo)table;
                ati.removeColumn(qc);
                ati.addColumn(qc);
            }

            customizeButtonBar((AbstractTableInfo) table);
        }

        LDKService.get().getColumnsOrderCustomizer().customize(table);
    }

    private void doSharedCustomization(AbstractTableInfo ti)
    {
        LDKService.get().appendCalculatedDateColumns(ti, (ti.getColumn("date") == null ? null : "date"), (ti.getColumn("enddate") == null ? null : "enddate"));
        appendDuration(ti);

        if (_addLinkDisablers)
            setLinkDisablers(ti);

        if (ti.getColumn("dateOnly") != null)
        {
            appendCalculatedCols(ti, "date");
        }

        ColumnInfo objectId = ti.getColumn("objectid");
        if (objectId != null)
        {
            objectId.setHidden(true);
            objectId.setLabel("Key");
            objectId.setUserEditable(false);
        }

        ColumnInfo runId = ti.getColumn("runId");
        if (runId != null)
        {
            runId.setLabel("Run Id");
            if (runId.getFk() == null)
            {
                UserSchema study = getEHRStudyUserSchema(ti);
                if (study != null)
                    runId.setFk(new QueryForeignKey(study, null, "Clinpath Runs", "objectid", ID_COL));
            }

            runId.setFacetingBehaviorType(FacetingBehaviorType.ALWAYS_OFF);
            runId.setUserEditable(false);
        }

        ColumnInfo qcstate = ti.getColumn("qcstate");
        if (qcstate != null)
        {
            qcstate.setLabel("Status");
            if (qcstate.getFk() == null)
            {
                UserSchema study = getEHRStudyUserSchema(ti);
                if (study != null)
                    qcstate.setFk(new QueryForeignKey(study, null, "QCState", "rowid", "Label"));
            }
            //TODO: disabled due to issue with DataIterator
            //qcstate.setUserEditable(false);
        }

        ColumnInfo parentId = ti.getColumn("parentId");
        if (parentId != null)
        {
            parentId.setLabel("Encounter Id");
            if (parentId.getFk() == null)
            {
                UserSchema study = getEHRStudyUserSchema(ti);
                if (study != null)
                    parentId.setFk(new QueryForeignKey(study, null, "Clinical Encounters", "objectid", ID_COL));
            }
            parentId.setFacetingBehaviorType(FacetingBehaviorType.ALWAYS_OFF);
        }

        ColumnInfo formSort = ti.getColumn("formSort");
        if (formSort != null)
        {
            formSort.setHidden(true);
            formSort.setShownInInsertView(false);
            formSort.setShownInUpdateView(false);
            formSort.setLabel("Form Sort Order");
        }

        ColumnInfo caseId = ti.getColumn("caseId");
        if (caseId != null)
        {
            caseId.setHidden(true);
            caseId.setLabel("Case Id");
        }

        Container ehrContainer = EHRService.get().getEHRStudyContainer(ti.getUserSchema().getContainer());
        //if not set, default to current container
        if (ehrContainer == null)
            ehrContainer = ti.getUserSchema().getContainer();

        ColumnInfo taskId = ti.getColumn("taskId");
        if (taskId != null)
        {
            taskId.setLabel("Task Id");
            if (taskId.getFk() == null)
            {
                UserSchema schema = getUserSchema(ti, "ehr", ehrContainer);
                if (schema != null)
                    taskId.setFk(new QueryForeignKey(schema, ehrContainer, "tasks", "taskid", "rowid"));
            }
            taskId.setFacetingBehaviorType(FacetingBehaviorType.ALWAYS_OFF);
        }

        ColumnInfo requestId = ti.getColumn("requestId");
        if (requestId != null)
        {
            requestId.setLabel("Request Id");
            if (requestId.getFk() == null)
            {
                UserSchema schema = getUserSchema(ti, "ehr", ehrContainer);
                if (schema != null)
                    requestId.setFk(new QueryForeignKey(schema, ehrContainer, "requests", "requestid", "rowid"));
            }
            requestId.setFacetingBehaviorType(FacetingBehaviorType.ALWAYS_OFF);
        }

        customizeRoomCol(ti, "room");
        customizeRoomCol(ti, "room1");
        customizeRoomCol(ti, "room2");

        customizeCageCol(ti, "cage");
        customizeCageCol(ti, "cage1");
        customizeCageCol(ti, "cage2");

        ColumnInfo description = ti.getColumn("description");
        if (description != null)
        {
            description.setDisplayWidth("400");
            description.setFacetingBehaviorType(FacetingBehaviorType.ALWAYS_OFF);
        }

        ColumnInfo project = ti.getColumn("project");
        if (project != null && !ti.getName().equalsIgnoreCase("project"))
        {
            //this was disabled in order to restore better edit behavior (a combo)
            //project.setFacetingBehaviorType(FacetingBehaviorType.ALWAYS_OFF);
            UserSchema us = getUserSchema(ti, "ehr", ehrContainer);
            if (us != null)
                project.setFk(new QueryForeignKey(us, ehrContainer, "project", "project", "project"));
        }

        ColumnInfo code = ti.getColumn("code");
        if (code != null)
        {
            code.setFacetingBehaviorType(FacetingBehaviorType.ALWAYS_OFF);
        }

        for (ColumnInfo col : ti.getColumns())
        {
            if (PARTICIPANT_CONCEPT_URI.equals(col.getConceptURI()))
            {
                col.setFacetingBehaviorType(FacetingBehaviorType.ALWAYS_OFF);
                if (col.getFk() == null)
                {
                    UserSchema us = getEHRStudyUserSchema(ti);
                    if (us != null)
                    {
                        col.setFk(new QueryForeignKey(us, null, "Animal", "Id", "Id"));
                        col.setURL(DetailsURL.fromString("/ehr/participantView.view?participantId=${" + col.getName() + "}", us.getContainer()));
                    }
                }
            }
        }
    }

    private void customizeRoomCol(AbstractTableInfo ti, String name)
    {
        ColumnInfo room = ti.getColumn(name);
        if (room != null)
        {
            ensureSortColumn(ti, name, room);

            if (!ti.getName().equalsIgnoreCase("rooms"))
            {
                Container ehrContainer = EHRService.get().getEHRStudyContainer(ti.getUserSchema().getContainer());
                if (ehrContainer != null)
                {
                    UserSchema us = getUserSchema(ti, "ehr_lookups", ehrContainer);
                    if (us != null){
                        room.setFk(new QueryForeignKey(us, ehrContainer, "rooms", "room", "room"));
                    }
                }

                if (room.getLabel().equals("room"))
                    room.setLabel("Room");

                //room.setFacetingBehaviorType(FacetingBehaviorType.ALWAYS_OFF);
            }
        }
    }

    /** Add a dummy column so that we always have it present. Other TableCustomizers might swap it out later for a fancier version */
    private void ensureSortColumn(AbstractTableInfo ti, String name, ColumnInfo baseColumn)
    {
        String sortName = name + "_sortValue";
        if (ti.getColumn(sortName) == null)
        {
            AliasedColumn sortCol = new AliasedColumn(ti, sortName, baseColumn);
            sortCol.setHidden(true);
            sortCol.setCalculated(true);
            sortCol.setUserEditable(false);
            sortCol.setNullable(true);
            sortCol.setPropertyURI(sortCol.getPropertyURI() + "_sortValue");
            sortCol.setRequired(false);
            sortCol.setShownInDetailsView(false);
            sortCol.setShownInInsertView(false);
            sortCol.setShownInUpdateView(false);
            sortCol.setLabel(baseColumn.getLabel() + " - Sort Field");
            ti.addColumn(sortCol);
        }
    }

    private void customizeCageCol(AbstractTableInfo ti, String name)
    {
        ColumnInfo cage = ti.getColumn(name);
        if (cage != null)
        {
            ensureSortColumn(ti, name, cage);

            cage.setDisplayWidth("40");
            cage.setFacetingBehaviorType(FacetingBehaviorType.ALWAYS_OFF);
        }
    }

    private void setConceptURI(ColumnInfo ci, String conceptURI)
    {
        if (ci.isLocked())
        {
            return;
        }

        ci.setConceptURI(conceptURI);
        if (ci instanceof AliasedColumn)
        {
            if (((AliasedColumn)ci).getColumn() != null)
            {
                setConceptURI(((AliasedColumn)ci).getColumn(), conceptURI);
            }
        }
    }

    private void customizeDataset(DatasetTable ds)
    {
        AbstractTableInfo ti = (AbstractTableInfo)ds;
        hideStudyColumns(ti);

        ColumnInfo idColumn = ti.getColumn("Id");
        if (idColumn != null && !idColumn.isLocked())
        {
            setConceptURI(idColumn, PARTICIPANT_CONCEPT_URI);
        }

        //NOTE: this is LabKey's magic 3-part join column.  It doesnt do anythng useful for our data and ends up being confusing when users see it.
        ColumnInfo datasets = ti.getColumn(FieldKey.fromString("Datasets"));
        if (datasets != null)
        {
            ti.removeColumn(datasets);
        }

        ColumnInfo dataset = ti.getColumn(FieldKey.fromString("Dataset"));
        if (dataset != null)
        {
            dataset.setHidden(true);
        }

        doSharedCustomization(ti);

        //then customization specific to a given dataset
        if (matches(ti, "study", "Drug Administration") || matches(ti, "study", "Treatment Orders"))
        {
            addUnitColumns(ti);

            if (matches(ti, "study", "Treatment Orders"))
            {
                addIsActiveColWithTime(ti);
            }
        }
        else if (matches(ti, "study", "Clinical Encounters") || matches(ti, "study", "Encounters"))
        {
            customizeEncountersTable(ti);
        }
        else if (matches(ti, "study", "histology"))
        {
            customizeHistology(ti);
        }
        else if (matches(ti, "study", "grossFindings") || matches(ti, "study", "Gross Findings"))
        {
            customizeGrossFindings(ti);
        }
        else if (matches(ti, "study", "animal_group_members"))
        {
            customizeAnimalGroupMembers(ti);
        }
        else if (matches(ti, "study", "pathologyDiagnoses") || matches(ti, "study", "Pathology Diagnoses"))
        {
            customizeDiagnoses(ti);
        }
        else if (matches(ti, "study", "housing"))
        {
            addIsActiveColWithTime(ti);
        }
        else if (matches(ti, "study", "blood") || matches(ti, "study", "Blood Draws"))
        {
            customizeBloodTable(ti);
        }
        else if (matches(ti, "study", "assignment"))
        {
            addIsActiveCol(ti);
        }
        else if (matches(ti, "study", "animalAccounts"))
        {
            addIsActiveCol(ti);
        }
        else if (matches(ti, "study", "notes"))
        {
            addIsActiveCol(ti);
        }
        else if (matches(ti, "study", "problem") || matches(ti, "study", "problem list"))
        {
            addIsActiveCol(ti);
        }
        else if (matches(ti, "study", "flags") || matches(ti, "study", "Animal Record Flags"))
        {
            addIsActiveCol(ti, false);
        }
        else if (matches(ti, "study", "diet"))
        {
            addIsActiveCol(ti);
        }
        else if (matches(ti, "study", "parentage"))
        {
            addIsActiveCol(ti, false);
        }
        else if (matches(ti, "study", "demographics"))
        {
            customizeDemographics(ti);
        }
        else if (matches(ti, "study", "birth"))
        {
            addIsNumericId(ti);
        }
        else if (matches(ti, "study", "arrival"))
        {
            addIsNumericId(ti);
        }

        appendHistoryCol(ti);
    }

    private void addIsActiveCol(AbstractTableInfo ti)
    {
        addIsActiveCol(ti, true);
    }

    private void addIsActiveCol(AbstractTableInfo ti, boolean allowSameDay)
    {
        addIsActiveCol(ti, allowSameDay, false);
    }

    private void addIsActiveCol(AbstractTableInfo ti, boolean allowSameDay, boolean allowDateOfDeath)
    {
        if (ti.getColumn("date") == null || ti.getColumn("enddate") == null)
        {
            return;
        }

        String name = "isActive";
        if (ti.getColumn(name) == null)
        {
            SQLFragment sql = new SQLFragment("(CASE " +
                    // when the start is in the future, using whole-day increments, it is not active
                    " WHEN (CAST(" + ExprColumn.STR_TABLE_ALIAS + ".date as DATE) > {fn curdate()}) THEN " + ti.getSqlDialect().getBooleanFALSE() +
                    // when enddate is null, it is active
                    " WHEN (" + ExprColumn.STR_TABLE_ALIAS + ".enddate IS NULL) THEN " + ti.getSqlDialect().getBooleanTRUE() +
                    // if allowSameDay=true, then consider records that start/stop on today's date to be active
                    (allowSameDay ? " WHEN (" + ExprColumn.STR_TABLE_ALIAS + ".enddate IS NOT NULL AND CAST(" + ExprColumn.STR_TABLE_ALIAS + ".enddate AS DATE) = {fn curdate()} AND CAST(" + ExprColumn.STR_TABLE_ALIAS + ".date as DATE) = {fn curdate()}) THEN " + ti.getSqlDialect().getBooleanTRUE() : "") +
                    // if enddate is in the future (whole-day increments), then it is active
                    " WHEN (CAST(" + ExprColumn.STR_TABLE_ALIAS + ".enddate AS DATE) > {fn curdate()}) THEN " + ti.getSqlDialect().getBooleanTRUE() +
                    //(allowDateOfDeath ? " WHEN " + ExprColumn.STR_TABLE_ALIAS : "") +
                    " ELSE " + ti.getSqlDialect().getBooleanFALSE() +
                    " END)");

            ExprColumn col = new ExprColumn(ti, name, sql, JdbcType.BOOLEAN, ti.getColumn("date"), ti.getColumn("enddate"));
            col.setLabel("Is Active?");
            ti.addColumn(col);
        }
    }

    //note: intended specially for treatment orders, but also used for housing.  note slightly unusual behavior around start date
    private void addIsActiveColWithTime(AbstractTableInfo ti)
    {
        if (ti.getColumn("date") == null || ti.getColumn("enddate") == null)
        {
            return;
        }

        String name = "isActive";
        if (ti.getColumn(name) == null)
        {
            SQLFragment sql = new SQLFragment("(CASE " +
                // any record with a future start date (whole-day increments) is inactive.
                // this does mean any record starting today could potentially be active, even if in the future.  this was done to support PM treatments.
                " WHEN (cast(" + ExprColumn.STR_TABLE_ALIAS + ".date as date) > {fn curdate()}) THEN " + ti.getSqlDialect().getBooleanFALSE() +
                // any record with a null or future enddate (considering time) is active
                " WHEN (" + ExprColumn.STR_TABLE_ALIAS + ".enddate IS NULL) THEN " + ti.getSqlDialect().getBooleanTRUE() +
                " WHEN (" + ExprColumn.STR_TABLE_ALIAS + ".enddate >= {fn now()}) THEN " + ti.getSqlDialect().getBooleanTRUE() +
                " ELSE " + ti.getSqlDialect().getBooleanFALSE() +
                " END)");

            ExprColumn col = new ExprColumn(ti, name, sql, JdbcType.BOOLEAN, ti.getColumn("date"), ti.getColumn("enddate"));
            col.setLabel("Is Active?");
            ti.addColumn(col);
        }

        String expired = "isExpired";
        if (ti.getColumn(expired) == null)
        {
            SQLFragment sql = new SQLFragment("(CASE " +
                    // any record with a null or future enddate (considering time) is active
                    " WHEN (" + ExprColumn.STR_TABLE_ALIAS + ".enddate IS NULL) THEN " + ti.getSqlDialect().getBooleanFALSE() +
                    " WHEN (" + ExprColumn.STR_TABLE_ALIAS + ".enddate < {fn now()}) THEN " + ti.getSqlDialect().getBooleanTRUE() +
                    " ELSE " + ti.getSqlDialect().getBooleanFALSE() +
                    " END)");

            ExprColumn col = new ExprColumn(ti, expired, sql, JdbcType.BOOLEAN, ti.getColumn("enddate"));
            col.setLabel("Is Expired?");
            ti.addColumn(col);
        }
    }

    public void appendCalculatedCols(AbstractTableInfo ti, String dateFieldName)
    {
        if (ti.getName().equalsIgnoreCase("demographics"))
            return;

        if (ti.getColumn(dateFieldName) == null || ti.getColumn(ID_COL) == null)
            return;

        UserSchema us = getEHRStudyUserSchema(ti);
        if (us != null){

            //needs date/time
            appendHousingAtTimeCol(us, ti, dateFieldName);

            //date only
            appendAgeAtTimeCol(us, ti, dateFieldName);

            appendSurvivorshipCol(us, ti);
            appendTimeSinceCol(us, ti);
        }
    }

    private void customizeStudyData(AbstractTableInfo ti)
    {
        hideStudyColumns(ti);
        customizeButtonBar(ti);
    }

    private void customizeEncountersTable(final AbstractTableInfo ti)
    {
        appendEncountersCol(ti, "participants", "Participants", "encounter_participants_summary");
        appendEncountersCol(ti, "summaries", "Summaries", "encounter_summaries_summary");
        appendEncountersCol(ti, "flags", "Flags", "encounter_flags_summary");

        appendSNOMEDCol(ti);
    }

    private void customizeGrossFindings(final AbstractTableInfo ti)
    {
        appendSNOMEDCol(ti);
    }

    private void customizeHistology(final AbstractTableInfo ti)
    {
        appendSNOMEDCol(ti);
    }

    private void customizeDiagnoses(final AbstractTableInfo ti)
    {
        appendSNOMEDCol(ti);
    }

    private void customizeDemographics(AbstractTableInfo ti)
    {
        String lastDayAtCenter = "lastDayAtCenter";
        if (ti.getColumn(lastDayAtCenter) == null)
        {
            if (ti.getColumn("death") == null || ti.getColumn("Id") == null)
            {
                _log.warn("Unable to find either Id or death columns on demographics table");
            }
            else
            {
                TableInfo departure = getRealTableForDataset(ti, "Departure");
                if (departure != null)
                {
                    SQLFragment sql = new SQLFragment("COALESCE(" + ExprColumn.STR_TABLE_ALIAS + ".death, (SELECT max(d.date) as expr FROM studydataset." + departure.getName() + " d WHERE d.participantid = " + ExprColumn.STR_TABLE_ALIAS + ".participantid AND "+ ExprColumn.STR_TABLE_ALIAS + ".calculated_status != 'Alive' ))");
                    ExprColumn newCol = new ExprColumn(ti, lastDayAtCenter, sql, JdbcType.TIMESTAMP, ti.getColumn("death"), ti.getColumn("Id"));
                    newCol.setLabel("Last Day At Center");
                    newCol.setDescription("This column calculates the last known date this animal was present at the center.  It preferentially uses death, but will use the most recent departure date if death is not known.  It is used when calculating age.");
                    ti.addColumn(newCol);
                }
            }
        }

        addIsNumericId(ti);
    }

    private void addIsNumericId(AbstractTableInfo ti)
    {
        String name = "isNumericId";
        if (ti.getColumn(name) == null)
        {
            SQLFragment sql = null;

            if (ti.getSqlDialect().isSqlServer())
            {
                sql = new SQLFragment("CASE WHEN (" + ExprColumn.STR_TABLE_ALIAS + ".participantid NOT LIKE '%[^0-9]%') THEN " + ti.getSqlDialect().getBooleanTRUE() + " ELSE " + ti.getSqlDialect().getBooleanFALSE() + " END");
            }
            else if (ti.getSqlDialect().isPostgreSQL())
            {
                sql = new SQLFragment("CASE WHEN ( " + ExprColumn.STR_TABLE_ALIAS + ".participantid ~ '^([0-9]+)$' ) THEN " + ti.getSqlDialect().getBooleanTRUE() + " ELSE " + ti.getSqlDialect().getBooleanFALSE() + " END");
            }
            else
            {
                _log.error("Only postgres and sqlserver are supported");
            }

            if (sql != null)
            {
                ExprColumn newCol = new ExprColumn(ti, name, sql, JdbcType.BOOLEAN, ti.getColumn("Id"));
                newCol.setLabel("Is Numeric Id?");
                ti.addColumn(newCol);
            }
        }
    }

    private TableInfo getRealTableForDataset(AbstractTableInfo ti, String label)
    {
        Container ehrContainer = EHRService.get().getEHRStudyContainer(ti.getUserSchema().getContainer());
        if (ehrContainer == null)
            return null;

        Dataset ds;
        Study s = StudyService.get().getStudy(ehrContainer);
        if (s == null)
            return null;

        ds = s.getDatasetByLabel(label);
        if (ds == null)
        {
            // NOTE: this seems to happen during study import on TeamCity.  It does not seem to happen during normal operation
            _log.info("A dataset was requested that does not exist: " + label + " in container: " + ehrContainer.getPath());
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

    private void appendSNOMEDCol(AbstractTableInfo ti)
    {
        String name = "codes";
        ColumnInfo existing = ti.getColumn(name);
        if (existing == null && ti.getColumn("objectid") != null && ti.getUserSchema() != null)
        {
            //display version of the column
            String chr = ti.getSqlDialect().isPostgreSQL() ? "chr" : "char";
            SQLFragment groupConcatSQL = ti.getSqlDialect().getGroupConcat(new SQLFragment(ti.getSqlDialect().concatenate("CAST(t.sort as varchar(10))", "': '", "s.meaning", "' ('", "t.code", "')'")), true, true, chr + "(10)");
            SQLFragment sql = new SQLFragment("(SELECT ");
            sql.append(groupConcatSQL);
            sql.append(
                " FROM ehr.snomed_tags t JOIN ehr_lookups.snomed s ON (s.code = t.code) " +
                " WHERE t.recordid = " + ExprColumn.STR_TABLE_ALIAS + ".objectid AND " + ExprColumn.STR_TABLE_ALIAS + ".participantid = t.id AND t.container = '" + ti.getUserSchema().getContainer().getId() + "' " +
                " GROUP BY t.recordid " +
                " )");

            ExprColumn newCol = new ExprColumn(ti, name, sql, JdbcType.VARCHAR, ti.getColumn("objectid"));
            newCol.setLabel("SNOMED Codes");
            newCol.setFacetingBehaviorType(FacetingBehaviorType.ALWAYS_OFF);
            newCol.setDisplayColumnFactory(new DisplayColumnFactory()
            {
                @Override
                public DisplayColumn createRenderer(ColumnInfo colInfo)
                {
                    return new SNOMEDCodesDisplayColumn(colInfo);
                }
            });
            newCol.setDisplayWidth("250");
            ti.addColumn(newCol);


            //programmatic version
            String name2 = "codesRaw";
            SQLFragment sql2 = new SQLFragment("(SELECT " + ti.getSqlDialect().getGroupConcat(new SQLFragment(ti.getSqlDialect().concatenate("CAST(t.sort as varchar(10))", "'<>'", "t.code")), true, true, "';'").getSqlCharSequence() +
                    "FROM ehr.snomed_tags t " +
                    " WHERE t.recordid = " + ExprColumn.STR_TABLE_ALIAS + ".objectid AND " + ExprColumn.STR_TABLE_ALIAS + ".participantid = t.id AND t.container = '" + ti.getUserSchema().getContainer().getId() + "' " +
                    " GROUP BY t.recordid " +
                    " )");

            ExprColumn newCol2 = new ExprColumn(ti, name2, sql2, JdbcType.VARCHAR, ti.getColumn("objectid"));
            newCol2.setLabel("SNOMED Codes");
            newCol2.setHidden(true);
            newCol2.setFacetingBehaviorType(FacetingBehaviorType.ALWAYS_OFF);
            newCol2.setDisplayWidth("250");
            ti.addColumn(newCol2);
        }
    }

    private void appendEncountersCol(AbstractTableInfo ti, String name, String label, final String targetTableName)
    {
        appendEncountersCol(ti, name, label, targetTableName, "parentid");
    }

    private void appendEncountersCol(AbstractTableInfo ti, String name, String label, final String targetTableName, String targetColName)
    {
        ColumnInfo existing = ti.getColumn(name);
        if (existing == null && ti.getColumn("objectid") != null)
        {
            final UserSchema us = getUserSchema(ti, EHRSchema.EHR_SCHEMANAME);

            ColumnInfo ci = new WrappedColumn(ti.getColumn("objectid"), name);
            LookupForeignKey fk = new LookupForeignKey(targetColName)
            {
                @Override
                public TableInfo getLookupTableInfo()
                {
                    return us.getTable(targetTableName);
                }
            };
            fk.addJoin(FieldKey.fromString(ID_COL), ID_COL, false);

            ci.setFk(fk);
            ci.setUserEditable(false);
            ci.setIsUnselectable(true);
            ci.setDisplayWidth("400");
            ci.setLabel(label);
            ti.addColumn(ci);
        }
    }

    private void appendHistoryCol(AbstractTableInfo ti)
    {
        if (ti.getColumn("history") != null)
            return;

        ColumnInfo ci = new WrappedColumn(ti.getColumn(ID_COL), "history");
        ci.setDisplayColumnFactory(new DisplayColumnFactory()
        {
            @Override
            public DisplayColumn createRenderer(final ColumnInfo colInfo)
            {
                return new DataColumn(colInfo)
                {

                    public void renderGridCellContents(RenderContext ctx, Writer out) throws IOException
                    {
                        Object objectid = ctx.get("objectid");
                        Date date = (Date) ctx.get("date");
                        Object id = ctx.get(ID_COL);

                        out.write("<span style=\"white-space:nowrap\"><a href=\"javascript:void(0);\" onclick=\"EHR.window.ClinicalHistoryWindow.showClinicalHistory('" + objectid + "', '" + id + "', '" + date + "', this);\">[Show Hx]</a></span>");
                    }

                    @Override
                    public void addQueryFieldKeys(Set<FieldKey> keys)
                    {
                        super.addQueryFieldKeys(keys);
                        keys.add(FieldKey.fromString("date"));
                        keys.add(FieldKey.fromString("objectid"));
                    }

                    public boolean isSortable()
                    {
                        return false;
                    }

                    public boolean isFilterable()
                    {
                        return false;
                    }

                    public boolean isEditable()
                    {
                        return false;
                    }
                };
            }
        });
        ci.setIsUnselectable(false);
        ci.setLabel("History");

        ti.addColumn(ci);
    }

    private void setLinkDisablers(AbstractTableInfo ti)
    {
        ti.setInsertURL(AbstractTableInfo.LINK_DISABLER);
        ti.setUpdateURL(AbstractTableInfo.LINK_DISABLER);
        ti.setDeleteURL(AbstractTableInfo.LINK_DISABLER);
        ti.setImportURL(AbstractTableInfo.LINK_DISABLER);
    }

    private void addUnitColumns(AbstractTableInfo ds)
    {
        addUnitsConcatCol(ds, "amount", "amount_units", "Amount");
        addUnitsConcatCol(ds, "volume", "vol_units", "Volume");
        addUnitsConcatCol(ds, "concentration", "conc_units", "Concentration");

        addAmountAndVolCol(ds);
    }

    private void addUnitsConcatCol(AbstractTableInfo ds, String colName, String unitColName, String label)
    {
        ColumnInfo col = ds.getColumn(colName);
        ColumnInfo unitCol = ds.getColumn(unitColName);

        if (col != null && unitCol != null)
        {
            String name = col.getName() + "WithUnits";
            if (ds.getColumn(name) == null)
            {
                SQLFragment sql = new SQLFragment("CASE " +
                        " WHEN " + ExprColumn.STR_TABLE_ALIAS + "." + unitCol.getSelectName() + " IS NULL THEN CAST(" + ExprColumn.STR_TABLE_ALIAS + "." + col.getSelectName() + " AS VARCHAR)" +
                        " ELSE " + ds.getSqlDialect().concatenate("CAST(" + ExprColumn.STR_TABLE_ALIAS + "." + col.getSelectName() + " AS VARCHAR)", "' '", ExprColumn.STR_TABLE_ALIAS + "." + unitCol.getSelectName()) +
                        " END"
                );
                ExprColumn newCol = new ExprColumn(ds, name, sql, JdbcType.VARCHAR, col, unitCol);
                newCol.setLabel(label);
                newCol.setHidden(true);
                newCol.setFacetingBehaviorType(FacetingBehaviorType.ALWAYS_OFF);
                ds.addColumn(newCol);
            }
        }
    }

    private void addAmountAndVolCol(AbstractTableInfo ds)
    {
        ColumnInfo amountCol = ds.getColumn("amount");
        ColumnInfo amountUnitCol = ds.getColumn("amount_units");
        ColumnInfo volumeCol = ds.getColumn("volume");
        ColumnInfo volumeUnitCol = ds.getColumn("vol_units");
        String name = "amountAndVolume";

        if (amountCol != null && amountUnitCol != null && volumeCol != null && volumeUnitCol != null && ds.getColumn(name) == null)
        {
            SQLFragment sql = new SQLFragment("CASE " +
                    //when both are null, return null
                    " WHEN (" + ExprColumn.STR_TABLE_ALIAS + "." + volumeCol.getSelectName() + " IS NULL AND " + ExprColumn.STR_TABLE_ALIAS + "." + amountCol.getSelectName() + " IS NULL) THEN NULL" +

                    //when volume is null, show amount only.  behave differently depending on whether units are null
                    " WHEN (" + ExprColumn.STR_TABLE_ALIAS + "." + volumeCol.getSelectName() + " IS NULL AND " + ExprColumn.STR_TABLE_ALIAS + "." + amountUnitCol.getSelectName() + " IS NULL) THEN CAST(" + ExprColumn.STR_TABLE_ALIAS + "." + amountCol.getSelectName() + " AS VARCHAR)" +
                    " WHEN (" + ExprColumn.STR_TABLE_ALIAS + "." + volumeCol.getSelectName() + " IS NULL AND " + ExprColumn.STR_TABLE_ALIAS + "." + amountUnitCol.getSelectName() + " IS NOT NULL) THEN " + ds.getSqlDialect().concatenate("CAST(" + ExprColumn.STR_TABLE_ALIAS + "." + amountCol.getSelectName() + " AS VARCHAR)", "' '", ExprColumn.STR_TABLE_ALIAS + "." + amountUnitCol.getSelectName()) +

                    //if volume is not null and amount is null
                    " WHEN (" + ExprColumn.STR_TABLE_ALIAS + "." + amountCol.getSelectName() + " IS NULL AND " + ExprColumn.STR_TABLE_ALIAS + "." + volumeUnitCol.getSelectName() + " IS NULL) THEN CAST(" + ExprColumn.STR_TABLE_ALIAS + "." + volumeCol.getSelectName() + " AS VARCHAR)" +
                    " WHEN (" + ExprColumn.STR_TABLE_ALIAS + "." + amountCol.getSelectName() + " IS NULL AND " + ExprColumn.STR_TABLE_ALIAS + "." + volumeUnitCol.getSelectName() + " IS NOT NULL) THEN " + ds.getSqlDialect().concatenate("CAST(" + ExprColumn.STR_TABLE_ALIAS + "." + volumeCol.getSelectName() + " AS VARCHAR)", "' '", ExprColumn.STR_TABLE_ALIAS + "." + volumeUnitCol.getSelectName()) +

                    //otherwise show both
                    " WHEN (" + ExprColumn.STR_TABLE_ALIAS + "." + amountCol.getSelectName() + " IS NOT NULL AND " + ExprColumn.STR_TABLE_ALIAS + "." + volumeUnitCol.getSelectName() + " IS NOT NULL) THEN " +
                        ds.getSqlDialect().concatenate("CAST(" + ExprColumn.STR_TABLE_ALIAS + "." + volumeCol.getSelectName() + " AS VARCHAR)", "' '", "COALESCE(" + ExprColumn.STR_TABLE_ALIAS + "." + volumeUnitCol.getSelectName() + ", '')", "' / '", "CAST(" + ExprColumn.STR_TABLE_ALIAS + "." + amountCol.getSelectName() + " AS VARCHAR)", "' '", "COALESCE(" + ExprColumn.STR_TABLE_ALIAS + "." + amountUnitCol.getSelectName() + ", '')") +
                    " END"
            );

            ExprColumn newCol = new ExprColumn(ds, name, sql, JdbcType.VARCHAR, amountCol, amountUnitCol, volumeCol, volumeUnitCol);
            newCol.setLabel("Amount And Volume");
            newCol.setHidden(true);
            newCol.setFacetingBehaviorType(FacetingBehaviorType.ALWAYS_OFF);
            ds.addColumn(newCol);
        }
    }

    private void customizeButtonBar(AbstractTableInfo ti)
    {
        ButtonBarConfig cfg = ti.getButtonBarConfig();
        if (cfg == null)
        {
            cfg = new ButtonBarConfig(new JSONObject());
            cfg.setIncludeStandardButtons(true);
        }

        cfg.setAlwaysShowRecordSelectors(true);
        cfg.setOnRenderScript("EHR.DatasetButtons.moreActionsHandler");
        setScriptIncludes(cfg);
        configureTbarBtns(ti, cfg);
        configureMoreActionsBtn(ti, cfg);

        ti.setButtonBarConfig(cfg);
    }

    private void configureTbarBtns(AbstractTableInfo ti, ButtonBarConfig cfg)
    {
        List<ButtonConfigFactory> buttons = EHRService.get().getTbarButtons(ti);
        List<ButtonConfig> existingBtns = cfg.getItems();
        if (existingBtns == null)
            existingBtns = new ArrayList<>();

        //NOTE: guard against double-adding buttons
        Set<String> existingBtnNames = new HashSet<>();
        for (ButtonConfig b : existingBtns)
        {
            if (b instanceof UserDefinedButtonConfig)
            {
                existingBtnNames.add(((UserDefinedButtonConfig)b).getText());
            }
        }

        for (ButtonConfigFactory fact : buttons)
        {
            UserDefinedButtonConfig newButton = fact.createBtn(ti);
            if (existingBtnNames.contains(newButton.getText()))
            {
                continue;
            }
            existingBtnNames.add(newButton.getText());

            existingBtns.add(newButton);
            for (ClientDependency cd : fact.getClientDependencies(ti.getUserSchema().getContainer(), ti.getUserSchema().getUser()))
            {
                addScriptInclude(cfg, cd.getScriptString());
            }
        }

        cfg.setItems(existingBtns);
    }

    private void configureMoreActionsBtn(AbstractTableInfo ti, ButtonBarConfig cfg)
    {
        List<ButtonConfigFactory> buttons = new ArrayList<>(EHRService.get().getMoreActionsButtons(ti));
        if (ti instanceof DatasetTable)
        {
            EHRShowEditUIButton btn = new EHRShowEditUIButton(ModuleLoader.getInstance().getModule(EHRModule.class), ti.getPublicSchemaName(), ti.getName(), EHRDataAdminPermission.class);
            if (btn.isAvailable(ti))
                buttons.add(btn);
        }

        List<ButtonConfig> existingBtns = cfg.getItems();
        UserDefinedButtonConfig moreActionsBtn = null;
        if (existingBtns != null)
        {
            for (ButtonConfig btn : existingBtns)
            {
                if (btn instanceof UserDefinedButtonConfig)
                {
                    UserDefinedButtonConfig ub = (UserDefinedButtonConfig)btn;
                    if (MORE_ACTIONS.equals(ub.getText()))
                    {
                        moreActionsBtn = ub;
                        break;
                    }
                }
            }
        }

        if (moreActionsBtn == null)
        {
            //abort if there are no custom buttons
            if (buttons == null || buttons.size() == 0)
                return;

            moreActionsBtn = new UserDefinedButtonConfig();
            moreActionsBtn.setText(MORE_ACTIONS);
            moreActionsBtn.setInsertPosition(-1);

            List<NavTree> menuItems = new ArrayList<NavTree>();
            if (moreActionsBtn.getMenuItems() != null)
                menuItems.addAll(moreActionsBtn.getMenuItems());

            //create map of existing item names
            Map<String, NavTree> btnNameMap = new HashMap<String, NavTree>();
            for (NavTree item : menuItems)
            {
                btnNameMap.put(item.getText(), item);
            }

            for (ButtonConfigFactory fact : buttons)
            {
                NavTree newButton = fact.create(ti);
                if (!btnNameMap.containsKey(newButton.getText()))
                {
                    btnNameMap.put(newButton.getText(), newButton);
                    menuItems.add(newButton);

                    for (ClientDependency cd : fact.getClientDependencies(ti.getUserSchema().getContainer(), ti.getUserSchema().getUser()))
                    {
                        addScriptInclude(cfg, cd.getScriptString());
                    }
                }
            }

            moreActionsBtn.setMenuItems(menuItems);

            existingBtns.add(moreActionsBtn);
            cfg.setItems(existingBtns);
        }
    }

    private void addScriptInclude(ButtonBarConfig cfg, String script)
    {
        Set<String> scripts = new LinkedHashSet<String>();
        String[] existing = cfg.getScriptIncludes();
        if (existing != null)
        {
            for (String s : existing)
            {
                scripts.add(s);
            }
        }

        scripts.add(script);
        cfg.setScriptIncludes(scripts.toArray(new String[scripts.size()]));
    }

    private void setScriptIncludes(ButtonBarConfig cfg)
    {
        if (cfg != null)
        {
            Set<String> scripts = new HashSet<>();
            String[] existing = cfg.getScriptIncludes();
            if (existing != null)
            {
                for (String s : existing)
                {
                    scripts.add(s);
                }
            }

            scripts.add("ehr.context");
            cfg.setScriptIncludes(scripts.toArray(new String[scripts.size()]));
        }
    }

    private void customizeAnimalTable(AbstractTableInfo ds)
    {
        hideStudyColumns(ds);
        
        UserSchema us = getEHRStudyUserSchema(ds);
        if (us == null){            
            return;
        }

        if (ds.getColumn("age") != null)
        {
            _log.warn("Table already has an age column.  Customize might have been called twice?  " + ds.getName());
            return;
        }

        ColumnInfo col = getWrappedIdCol(us, ds, "age", "demographicsAge");
        col.setLabel("Age");
        col.setDescription("This calculates the age of the animal in year, months or days.  It shows the current age for living animals or age at time of death.");
        ds.addColumn(col);

        ColumnInfo col3 = getWrappedIdCol(us, ds, "AgeClass", "demographicsAgeClass");
        col3.setLabel("Age Class");
        col3.setDescription("Calculates the age class of the animal, which is used to calculate reference ranges");
        ds.addColumn(col3);

        ColumnInfo col2 = getWrappedIdCol(us, ds, "MostRecentArrival", "demographicsArrival");
        col2.setLabel("Arrival Date");
        col2.setDescription("Calculates the most recent arrival per animal, if applicable, and most recent arrival at the center.");
        ds.addColumn(col2);

        ColumnInfo col9 = getWrappedIdCol(us, ds, "numRoommates", "demographicsCurrentRoommates");
        col9.setLabel("Cagemates");
        col9.setDescription("Calculates the total number of roommates per animal and total animals per cage");
        ds.addColumn(col9);

        ColumnInfo col12 = getWrappedIdCol(us, ds, "MostRecentDeparture", "demographicsMostRecentDeparture");
        col12.setLabel("Departure Date");
        col12.setDescription("Calculates the most recent departure date for each animal");
        ds.addColumn(col12);

        ColumnInfo col11 = getWrappedIdCol(us, ds, "Demographics", "demographics");
        col11.setLabel("Demographics");
        col11.setDescription("Contains basic demographic information on the animals, including gender, dam, sire, etc.  This is similar to what was formerly called abstract.");
        ds.addColumn(col11);

        ColumnInfo col15 = getWrappedIdCol(us, ds, "death", "deaths");
        col15.setLabel("Death Information");
        col15.setDescription("Contains information about the death of this animal, if applicable.");
        ds.addColumn(col15);

        ColumnInfo col16 = getWrappedIdCol(us, ds, "birth", "birth");
        col16.setLabel("Birth Information");
        col16.setDescription("Contains information about the birth of this animal.");
        ds.addColumn(col16);

        ColumnInfo col13 = getWrappedIdCol(us, ds, "curLocation", "demographicsCurLocation");
        col13.setLabel("Housing - Current");
        col13.setDescription("The calculates the current housing location for each living animal.");
        ds.addColumn(col13);

        ColumnInfo col14 = getWrappedIdCol(us, ds, "lastHousing", "demographicsLastHousing");
        col14.setLabel("Housing - Final Location");
        col14.setDescription("This calculates the final housing location for the animal.  This is distinct from active housing, because it will return a location for dead animals");
        ds.addColumn(col14);

        ColumnInfo col19 = getWrappedIdCol(us, ds, "weightChange", "demographicsWeightChange");
        col19.setLabel("Weight Change");
        col19.setDescription("This calculates the percent change over the past 30, 90 or 180 days relative to the most recent weight");
        ds.addColumn(col19);

        ColumnInfo col20 = getWrappedIdCol(us, ds, "MostRecentWeight", "demographicsMostRecentWeight");
        col20.setLabel("Weight - Current");
        col20.setDescription("This calculates the most recent weight for the animal, based on the weight table");
        ds.addColumn(col20);

        ColumnInfo col8 = getWrappedIdCol(us, ds, "CageClass", "demographicsCageClass");
        col8.setLabel("Required Case Size");
        col8.setDescription("Calculates the cage size necessary for this animal, based on weight using The Guide requirements");
        ds.addColumn(col8);

        ColumnInfo id = ds.getColumn(ID_COL);
        if (id != null)
        {
            id.setURL(DetailsURL.fromString("/ehr/participantView.view?participantId=${Id}"));
        }
        ds.setDetailsURL(DetailsURL.fromString("/ehr/participantView.view?participantId=${Id}"));
    }

    private ColumnInfo getWrappedIdCol(UserSchema us, AbstractTableInfo ds, String name, String queryName)
    {
        WrappedColumn col = new WrappedColumn(ds.getColumn(ID_COL), name);
        col.setReadOnly(true);
        col.setIsUnselectable(true);
        col.setUserEditable(false);        
        col.setFk(new QueryForeignKey(us, null, queryName, ID_COL, ID_COL));

        return col;
    }

    private void customizeBloodTable(AbstractTableInfo ti)
    {
        String countsAgainstVolume = "countsAgainstVolume";
        if (ti.getColumn(countsAgainstVolume) == null)
        {
            SQLFragment sql = new SQLFragment("CASE " +
                " WHEN EXISTS (SELECT md.draftdata FROM study.qcstate q LEFT JOIN ehr.qcStateMetadata md ON (q.label = md.qcstatelabel) WHERE q.container = ? AND q.rowid = " + ExprColumn.STR_TABLE_ALIAS + ".qcstate AND (md.draftdata = " + ti.getSqlDialect().getBooleanTRUE() + " OR q.publicdata = " + ti.getSqlDialect().getBooleanTRUE() + ")) THEN " + ti.getSqlDialect().getBooleanTRUE() +
                " ELSE " + ti.getSqlDialect().getBooleanFALSE() +
                " END", ti.getUserSchema().getContainer().getId());
            ExprColumn col = new ExprColumn(ti, countsAgainstVolume, sql, JdbcType.BOOLEAN, ti.getColumn("qcstate"));
            col.setLabel("Counts Against Volume?");
            col.setDescription("This column shows whether the draw is being counted against the available blood volume.  Future request that have not yet been approved will not count against the allowable volume.");
            col.setFacetingBehaviorType(FacetingBehaviorType.ALWAYS_OFF);
            ti.addColumn(col);
        }
    }

    private void customizeSNOMED(AbstractTableInfo table)
    {
        _addLinkDisablers = false;
        doSharedCustomization(table);

        String codeAndMeaning = "codeAndMeaning";
        if (table.getColumn(codeAndMeaning) == null)
        {
            String chr = table.getSqlDialect().isPostgreSQL() ? "chr" : "char";
            SQLFragment sql = new SQLFragment(table.getSqlDialect().concatenate(ExprColumn.STR_TABLE_ALIAS + ".code", chr + "(9)", ExprColumn.STR_TABLE_ALIAS + ".meaning"));
            ExprColumn col = new ExprColumn(table, codeAndMeaning, sql, JdbcType.VARCHAR, table.getColumn("code"), table.getColumn("meaning"));
            col.setLabel("Code and Meaning");
            col.setFacetingBehaviorType(FacetingBehaviorType.ALWAYS_OFF);
            table.addColumn(col);
        }

        table.setUpdateURL(DetailsURL.fromString("/ehr/snomedManagement.view?code=${code}&doEdit=1"));
        table.setDetailsURL(DetailsURL.fromString("/ehr/snomedManagement.view?code=${code}"));
    }

    private void customizeSNOMEDTags(AbstractTableInfo table)
    {
        doSharedCustomization(table);

        String codeAndMeaning = "codeWithSort";
        if (table.getColumn(codeAndMeaning) == null)
        {
            SQLFragment sql = new SQLFragment("(" + table.getSqlDialect().concatenate("CAST(" + ExprColumn.STR_TABLE_ALIAS + ".sort as varchar(10))", "': '", ExprColumn.STR_TABLE_ALIAS + ".code") + ")");
            ExprColumn col = new ExprColumn(table, codeAndMeaning, sql, JdbcType.VARCHAR, table.getColumn("code"), table.getColumn("sort"));
            col.setLabel("Code(s)");
            table.addColumn(col);
        }

        table.setAuditBehavior(AuditBehaviorType.NONE);
    }

    private void customizeDrugsUnified(AbstractTableInfo ti)
    {
        doSharedCustomization(ti);
        addUnitColumns(ti);
        addIsActiveColWithTime(ti);
    }

    private void customizeTasks(AbstractTableInfo ti)
    {
        doSharedCustomization(ti);
        customizeButtonBar(ti);
        ti.getColumn("rowid").setShownInInsertView(true);
        ti.getColumn("rowid").setUserEditable(false);
    }

    private void customizeAnimalGroupMembers(AbstractTableInfo table)
    {
        addIsActiveCol(table);
    }

    private void customizeAnimalGroups(AbstractTableInfo table)
    {
        doSharedCustomization(table);

        String name = "totalAnimals";
        if (table.getColumn(name) == null)
        {
            TableInfo realTable = getRealTableForDataset(table, "Animal Group Members");
            if (realTable != null)
            {
                SQLFragment sql = new SQLFragment("(select count(distinct g.participantid) as total from studydataset." + realTable.getName() + " g where g.groupId = " + ExprColumn.STR_TABLE_ALIAS + ".rowid AND (g.date <= {fn now()} AND (g.enddate IS NULL or CAST(g.enddate as date) > {fn curdate()})))");
                ExprColumn totalCol = new ExprColumn(table, name, sql, JdbcType.INTEGER, table.getColumn("rowid"));
                totalCol.setLabel("Total Animals");
                totalCol.setURL(DetailsURL.fromString("/query/executeQuery.view?schemaName=study&query.queryName=animal_group_members&query.groupId~eq=${rowid}&query.isActive~eq=true"));
                table.addColumn(totalCol);
            }
        }

        LDKService.get().applyNaturalSort(table, "name");
    }

    private void customizeDemographicsAgeTable(AbstractTableInfo table)
    {
        String name = "yearAndDays";
        if (table.getColumn(name) == null)
        {
            WrappedColumn wrap = new WrappedColumn(table.getColumn("ageInYears"), name);
            wrap.setDisplayColumnFactory(new DisplayColumnFactory()
            {
                @Override
                public DisplayColumn createRenderer(ColumnInfo colInfo)
                {
                    return new AgeDisplayColumn(colInfo);
                }
            });
            wrap.setLabel("Age (Years and Days)");

            table.addColumn(wrap);
        }

        String nameMonth = "monthsAndDays";
        if (table.getColumn(nameMonth) == null)
        {
            WrappedColumn wrap = new WrappedColumn(table.getColumn("ageInYears"), nameMonth);
            wrap.setDisplayColumnFactory(new DisplayColumnFactory()
            {
                @Override
                public DisplayColumn createRenderer(ColumnInfo colInfo)
                {
                    return new AgeMonthsDisplayColumn(colInfo);
                }
            });
            wrap.setLabel("Age (Months and Days)");

            table.addColumn(wrap);
        }

    }

    private void customizeProcedures(AbstractTableInfo table)
    {
        doSharedCustomization(table);

        String name = "shortName";
        if (table.getColumn(name) == null)
        {
            SQLFragment sql = new SQLFragment("COALESCE(" + ExprColumn.STR_TABLE_ALIAS + ".genericName, " + ExprColumn.STR_TABLE_ALIAS + ".name)");
            ExprColumn displayCol = new ExprColumn(table, name, sql, JdbcType.VARCHAR, table.getColumn("genericName"), table.getColumn("name"));
            displayCol.setLabel("Short Name");
            table.addColumn(displayCol);
        }
    }

    private void customizeProtocolTable(AbstractTableInfo table)
    {
        doSharedCustomization(table);
        table.setDetailsURL(DetailsURL.fromString("/ehr/protocolDetails.view?protocol=${protocol}"));

        if (table.getColumn("activeAnimals") == null)
        {
            UserSchema us = getUserSchema(table, "ehr");
            if (us != null)
            {
                ColumnInfo protocolCol = table.getColumn("protocol");
                ColumnInfo col = table.addColumn(new WrappedColumn(protocolCol, "activeAnimals"));
                col.setLabel("Animals Actively Assigned");
                col.setUserEditable(false);
                col.setIsUnselectable(true);
                col.setFk(new QueryForeignKey(us, null, "protocolActiveAnimals", "protocol", "protocol"));
            }
        }

        String name = "displayName";
        if (table.getColumn(name) == null)
        {
            SQLFragment sql = new SQLFragment("COALESCE(" + ExprColumn.STR_TABLE_ALIAS + ".external_id, " + ExprColumn.STR_TABLE_ALIAS + ".protocol)");
            ExprColumn displayCol = new ExprColumn(table, name, sql, JdbcType.VARCHAR, table.getColumn("external_id"), table.getColumn("protocol"));
            displayCol.setLabel("Display Name");
            displayCol.setURL(DetailsURL.fromString("/ehr/protocolDetails.view?protocol=${protocol}"));
            table.addColumn(displayCol);

            table.setTitleColumn(name);
        }
    }

    private void customizeProtocolExemptions(AbstractTableInfo ti)
    {
        doSharedCustomization(ti);

        String name = "coalescedProtocol";
        if (ti.getColumn(name) == null)
        {
            SQLFragment sql = new SQLFragment("COALESCE(" + ExprColumn.STR_TABLE_ALIAS + ".protocol, (SELECT p.protocol FROM ehr.project p WHERE p.project = " + ExprColumn.STR_TABLE_ALIAS + ".project))");
            ColumnInfo col = new ExprColumn(ti, name, sql, JdbcType.VARCHAR, ti.getColumn("protocol"), ti.getColumn("project"));
            col.setLabel("Coalesced Protocol");
            col.setHidden(true);
            ti.addColumn(col);
        }
    }

    private void customizeProjectTable(AbstractTableInfo table)
    {
        doSharedCustomization(table);
        table.setDetailsURL(DetailsURL.fromString("/ehr/projectDetails.view?project=${project}"));
        table.setTitleColumn("project");

        UserSchema us = getUserSchema(table, "ehr");
        if (us != null)
        {
            ColumnInfo projectCol = table.getColumn("project");
            if (table.getColumn("activeAssignments") == null)
            {
                ColumnInfo col = table.addColumn(new WrappedColumn(projectCol, "activeAssignments"));
                col.setLabel("Animals Actively Assigned");
                col.setUserEditable(false);
                col.setIsUnselectable(true);
                col.setFk(new QueryForeignKey(us, null, "projectTotalActivelyAssigned", "project", "project"));
            }

            if (table.getColumn("activelyAssignedBySpecies") == null)
            {
                ColumnInfo col2 = table.addColumn(new WrappedColumn(projectCol, "activelyAssignedBySpecies"));
                col2.setLabel("Animals Actively Assigned, By Species");
                col2.setUserEditable(false);
                col2.setIsUnselectable(true);
                col2.setFk(new QueryForeignKey(us, null, "projectTotalActivelyAssignedBySpecies", "project", "project"));
            }

            String name = "displayName";
            if (table.getColumn(name) == null)
            {
                SQLFragment sql = new SQLFragment("COALESCE(" + ExprColumn.STR_TABLE_ALIAS + ".name, CAST(" + ExprColumn.STR_TABLE_ALIAS + ".project AS varchar))");
                ExprColumn displayCol = new ExprColumn(table, name, sql, JdbcType.VARCHAR, table.getColumn("name"), table.getColumn("project"));
                displayCol.setLabel("Display Name");
                table.addColumn(displayCol);

                table.setTitleColumn(name);
            }
        }

        String name = "displayName";
        if (table.getColumn(name) == null)
        {
            SQLFragment sql = new SQLFragment("COALESCE(" + ExprColumn.STR_TABLE_ALIAS + ".name, " + "CAST(" + ExprColumn.STR_TABLE_ALIAS + ".project AS varchar))");
            ExprColumn displayCol = new ExprColumn(table, name, sql, JdbcType.VARCHAR, table.getColumn("name"), table.getColumn("project"));
            displayCol.setLabel("Display Name");
            table.addColumn(displayCol);

            table.setTitleColumn(name);
        }
    }

    private boolean hasTable(AbstractTableInfo ti, @Nullable Container targetContainer, String schemaName, String queryName)
    {
        if (targetContainer == null)
            targetContainer = ti.getUserSchema().getContainer();

        UserSchema us = getUserSchema(ti, schemaName, targetContainer);
        if (us == null)
            return false;

        CaseInsensitiveHashSet names = new CaseInsensitiveHashSet(us.getTableNames());
        return names.contains(queryName);
    }

    //note: these columns should both be date/time
    private void appendHousingAtTimeCol(UserSchema ehrSchema, AbstractTableInfo ds, final String dateColName)
    {
        if (!hasTable(ds, ehrSchema.getContainer(), "study", "housing"))
            return;

        String name = "housingAtTime";
        if (ds.getColumn(name) != null)
            return;

        final ColumnInfo pkCol = getPkCol(ds);
        if (pkCol == null)
            return;

        ColumnInfo dateCol = ds.getColumn(dateColName);
        if (dateCol == null)
            return;

        WrappedColumn col = new WrappedColumn(pkCol, name);
        col.setLabel("Housing At Time");
        col.setReadOnly(true);
        col.setIsUnselectable(true);
        col.setUserEditable(false);

        if (!hasAnimalLookup(ds))
            return;

        final String targetSchemaName = ds.getUserSchema().getName();
        final Container targetSchemaContainer = ds.getUserSchema().getContainer();
        final User u = ds.getUserSchema().getUser();
        final String schemaName = ds.getPublicSchemaName();
        final String queryName = ds.getName();
        final String ehrPath = ehrSchema.getContainer().getPath();

        col.setFk(new LookupForeignKey(){
            public TableInfo getLookupTableInfo()
            {
                String name = queryName + "_housingAtTime";
                UserSchema targetSchema = QueryService.get().getUserSchema(u, targetSchemaContainer, targetSchemaName);
                QueryDefinition qd = QueryService.get().createQueryDef(u, targetSchemaContainer, targetSchema, name);
                qd.setSql("SELECT\n" +
                    "sd." + pkCol.getSelectName() + ",\n" +
                    "cast((\n" +
                    "  SELECT group_concat(DISTINCT h.room, chr(10)) as room FROM \"" + ehrPath + "\".study.Housing h\n" +
                    "  WHERE sd.id = h.id AND h.date <= sd." + dateColName + " AND (sd." + dateColName + " < h.enddateTimeCoalesced" + " OR d.death = h.enddateTimeCoalesced" + ")\n" +
                    "  AND h.qcstate.publicdata = true\n" +
                    ") as varchar) as RoomAtTime,\n" +
                    "cast((\n" +
                    "  SELECT group_concat(DISTINCT h.cage, chr(10)) as cage FROM \"" + ehrPath + "\".study.Housing h\n" +
                    "  WHERE sd.id = h.id AND h.date <= sd." + dateColName + " AND (sd." + dateColName + " < h.enddateTimeCoalesced" + " OR d.death = h.enddateTimeCoalesced" + ")\n" +
                    "  AND h.qcstate.publicdata = true\n" +
                    ") as varchar) as CageAtTime,\n" +
                    "FROM \"" + schemaName + "\".\"" + queryName + "\" sd " +
                    "LEFT JOIN \"" + ehrPath + "\".study.demographics d ON (d.id = sd.id)\n");
                qd.setIsTemporary(true);

                List<QueryException> errors = new ArrayList<>();
                TableInfo ti = qd.getTable(errors, true);
                if (errors.size() > 0 || ti == null)
                {
                    _log.warn("Error creating housing at time lookup table for: " + schemaName + "." + queryName + " in container: " + targetSchema.getContainer().getPath());
                    for (QueryException e : errors)
                    {
                        _log.error("Lookup table QueryException: " + e.getMessage(), e);
                    }
                }
                if (ti == null)
                {
                    return null;
                }

                if (ti != null)
                {
                    ColumnInfo roomAtTime = ti.getColumn("RoomAtTime");
                    if (ti instanceof AbstractTableInfo)
                        roomAtTime.setFk(new QueryForeignKey(getUserSchema((AbstractTableInfo) ti, "ehr_lookups"), null, "rooms", "room", "room"));
                    else
                        _log.error("Table is not AbstractTableInfo: " + ti.getPublicName());

                    ti.getColumn(pkCol.getName()).setHidden(true);
                    ti.getColumn(pkCol.getName()).setKeyField(true);
                }
                else
                {
                    _log.warn("Error creating housing at time lookup table for: " + schemaName + "." + queryName + " in container: " + targetSchema.getContainer().getPath() + ". table was null");
                }

                return ti;
            }
        });

        ds.addColumn(col);
    }

    private void customizeRooms(AbstractTableInfo ti)
    {
        doSharedCustomization(ti);

        UserSchema us = getUserSchema(ti, "ehr_lookups");
        ColumnInfo roomCol = ti.getColumn("room");

        ColumnInfo utilization = ti.getColumn("utilization");
        if (utilization == null)
        {
            WrappedColumn col = new WrappedColumn(roomCol, "utilization");
            col.setReadOnly(true);
            col.setIsUnselectable(true);
            col.setUserEditable(false);
            col.setFk(new QueryForeignKey(us, null, "roomUtilization", "room", "room"));
            ti.addColumn(col);
        }
    }

    private ColumnInfo getPkCol(TableInfo ti)
    {
        List<ColumnInfo> pks = ti.getPkColumns();
        return (pks.size() != 1) ? null : pks.get(0);
    }

    private boolean hasAnimalLookup(AbstractTableInfo ti)
    {
        ColumnInfo idCol = ti.getColumn("Id");
        if (idCol == null || idCol.getFk() == null || !idCol.getFk().getLookupTableName().equalsIgnoreCase("animal"))
            return false;

        return true;
    }

    private void appendSurvivorshipCol(UserSchema ehrSchema, AbstractTableInfo ds)
    {
        String name = "survivorship";
        if (ds.getColumn(name) != null)
            return;

        final ColumnInfo pkCol = getPkCol(ds);
        if (pkCol == null)
            return;

        if (!hasAnimalLookup(ds))
            return;

        ColumnInfo dateCol = ds.getColumn("date");
        if (dateCol == null)
            return;

        final ColumnInfo idCol = ds.getColumn("Id");
        if (idCol == null)
            return;

        final String dateColName = dateCol.getSelectName();
        final String targetSchemaName = ds.getUserSchema().getName();
        final Container targetSchemaContainer = ds.getUserSchema().getContainer();
        final User u = ds.getUserSchema().getUser();
        final String schemaName = ds.getPublicSchemaName();
        final String queryName = ds.getName();
        final String ehrPath = ehrSchema.getContainer().getPath();

        WrappedColumn col = new WrappedColumn(pkCol, name);
        col.setLabel("Survivorship");
        col.setReadOnly(true);
        col.setIsUnselectable(true);
        col.setUserEditable(false);
        col.setFk(new LookupForeignKey(){
            public TableInfo getLookupTableInfo()
            {
                String name = queryName + "_survivorship";
                UserSchema targetSchema = QueryService.get().getUserSchema(u, targetSchemaContainer, targetSchemaName);
                QueryDefinition qd = QueryService.get().createQueryDef(u, targetSchemaContainer, targetSchema, name);
                qd.setSql("SELECT\n" +
                    "c." + pkCol.getSelectName() + ",\n" +
                    "CASE\n" +
                    "WHEN c." + dateColName + " is null\n" +
                    "  THEN null\n" +
                    "ELSE\n" +
                    "  age(CAST(c.date as DATE), coalesce(d.lastDayAtCenter, curdate()))\n" +
                    "END as survivorshipInYears,\n" +
                    "CASE\n" +
                    "WHEN c." + dateColName + " is null\n" +
                    "  THEN null\n" +
                    "ELSE\n" +
                    "  timestampdiff('SQL_TSI_DAY', CAST(c.date as DATE), coalesce(d.lastDayAtCenter, curdate()))\n" +
                    "END as survivorshipInDays,\n" +
                    "\n" +
                    "FROM \"" + schemaName + "\".\"" + queryName + "\" c " +
                    "LEFT JOIN \"" + ehrPath + "\".study.demographics d ON (d.Id = c." + idCol.getSelectName() + ")");
                qd.setIsTemporary(true);

                List<QueryException> errors = new ArrayList<>();
                TableInfo ti = qd.getTable(errors, true);
                if (errors.size() > 0)
                {
                    _log.warn("Error creating survivorship lookup table for: " + schemaName + "." + queryName + " in container: " + targetSchema.getContainer().getPath());
                    for (QueryException e : errors)
                    {
                        _log.warn(e.getMessage(), e);
                    }
                }

                if (ti == null)
                {
                    _log.warn("Error creating survivorship lookup table for: " + schemaName + "." + queryName + " in container: " + targetSchema.getContainer().getPath() + ", see server log for more details.  Table was null");
                }
                else
                {
                    ti.getColumn(pkCol.getName()).setHidden(true);
                    ti.getColumn(pkCol.getName()).setKeyField(true);
                }

                return ti;
            }
        });

        ds.addColumn(col);
    }

    private void appendTimeSinceCol(UserSchema us, AbstractTableInfo ti)
    {
        String name = "daysElapsed";
        if (ti.getColumn(name) == null)
        {
            ColumnInfo date = ti.getColumn("date");
            String type = ti.getSqlDialect().isPostgreSQL() ? "timestamp" : "date";
            SQLFragment sql = new SQLFragment("(CASE WHEN " + ExprColumn.STR_TABLE_ALIAS + "." + date.getSelectName() + " <= {fn now()} THEN (" + ti.getSqlDialect().getDateDiff(Calendar.DATE, "cast({fn curdate()} as " + type + ")", "CAST(" + ExprColumn.STR_TABLE_ALIAS + "." + date.getSelectName() + " AS DATE)") + " + 1) ELSE 0 END)");
            ExprColumn col = new ExprColumn(ti, name, sql, JdbcType.INTEGER, date);
            col.setCalculated(true);
            col.setUserEditable(false);
            col.setHidden(true);
            col.setLabel("Days Elapsed");
            col.setDescription("This column will show the total number of days that have elapsed since the date of this record");
            ti.addColumn(col);
        }
    }

    private void appendAgeAtTimeCol(UserSchema ehrSchema, AbstractTableInfo ds, final String dateColName)
    {
        String name = "ageAtTime";
        if (ds.getColumn(name) != null)
            return;

        final ColumnInfo pkCol = getPkCol(ds);
        if (pkCol == null)
            return;

        final ColumnInfo idCol = ds.getColumn("Id");
        if (idCol == null)
            return;

        if (ds.getColumn(dateColName) == null)
            return;

        if (!hasTable(ds, ehrSchema.getContainer(), "study", "demographics"))
            return;

        if (!hasAnimalLookup(ds))
            return;

        final String targetSchemaName = ds.getUserSchema().getName();
        final Container targetSchemaContainer = ds.getUserSchema().getContainer();
        final User u = ds.getUserSchema().getUser();
        final String schemaName = ds.getPublicSchemaName();
        final String queryName = ds.getName();
        final String ehrPath = ehrSchema.getContainer().getPath();

        WrappedColumn col = new WrappedColumn(pkCol, name);
        col.setLabel("Age At The Time");
        col.setReadOnly(true);
        col.setIsUnselectable(true);
        col.setUserEditable(false);
        col.setFk(new LookupForeignKey(){
            public TableInfo getLookupTableInfo()
            {
                String name = queryName + "_ageAtTime";
                UserSchema targetSchema = QueryService.get().getUserSchema(u, targetSchemaContainer, targetSchemaName);
                QueryDefinition qd = QueryService.get().createQueryDef(u, targetSchemaContainer, targetSchema, name);
                //NOTE: do not need to account for QCstate b/c study.demographics only allows 1 row per subject
                qd.setSql("SELECT\n" +
                    "c." + pkCol.getSelectName() + ",\n" +
                    "\n" +
                    "CAST(\n" +
                    "CASE\n" +
                    "WHEN d.birth is null or c." + dateColName + " is null\n" +
                    "  THEN null\n" +
                    "WHEN (d.lastDayAtCenter IS NOT NULL AND d.lastDayAtCenter < c." + dateColName + ") THEN\n" +
                    " ROUND(CONVERT(age_in_months(d.birth, d.lastDayAtCenter), DOUBLE) / 12, 1)\n" +
                    "ELSE\n" +
                    "  ROUND(CONVERT(age_in_months(d.birth, CAST(c." + dateColName + " as DATE)), DOUBLE) / 12, 1)\n" +
                    "END AS float) as AgeAtTime,\n" +
                    "\n" +
                    "CAST(\n" +
                    "CASE\n" +
                    "WHEN d.birth is null or c." + dateColName + " is null\n" +
                    "  THEN null\n" +
                    "WHEN (d.lastDayAtCenter IS NOT NULL AND d.lastDayAtCenter < c." + dateColName + ") THEN\n" +
                    " floor(age(d.birth, d.lastDayAtCenter))\n" +
                    "ELSE\n" +
                    "  floor(age(d.birth, CAST(c." + dateColName + " as DATE)))\n" +
                    "END AS float) as AgeAtTimeYearsRounded,\n" +
                    "\n" +
                    "CAST(\n" +
                    "CASE\n" +
                    "WHEN d.birth is null or c." + dateColName + " is null\n" +
                    "  THEN null\n" +
                    "WHEN (d.lastDayAtCenter IS NOT NULL AND d.lastDayAtCenter < c." + dateColName + ") THEN\n" +
                    "  CONVERT(age_in_months(d.birth, d.lastDayAtCenter), INTEGER)\n" +
                    "ELSE\n" +
                    "  CONVERT(age_in_months(d.birth, CAST(c." + dateColName + " AS DATE)), INTEGER)\n" +
                    "END AS float) as AgeAtTimeMonths,\n" +
                        //NOTE: written as subselect so we ensure a single row returned in case data in ehr_lookups.ageclass has rows that allow dupes
                        "(SELECT ac.ageclass FROM ehr_lookups.ageclass ac\n" +
                        "  WHERE " +
                        "  (CONVERT(age_in_months(d.birth, COALESCE(d.lastDayAtCenter, now())), DOUBLE) / 12) >= ac.\"min\" AND\n" +
                        "  ((CONVERT(age_in_months(d.birth, COALESCE(d.lastDayAtCenter, now())), DOUBLE) / 12) < ac.\"max\" OR ac.\"max\" is null) AND\n" +
                        "  d.species = ac.species AND\n" +
                        "  (d.gender = ac.gender OR ac.gender IS NULL)\n" +
                        ") AS AgeClassAtTime \n" +
                    "FROM \"" + schemaName + "\".\"" + queryName + "\" c " +
                    "LEFT JOIN \"" + ehrPath + "\".study.demographics d ON (d.Id = c." + idCol.getSelectName() + ")"
                );
                qd.setIsTemporary(true);

                List<QueryException> errors = new ArrayList<>();
                TableInfo ti = qd.getTable(errors, true);
                if (errors.size() > 0)
                {
                    _log.warn("Error creating age at time lookup table for: " + schemaName + "." + queryName + " in container: " + targetSchema.getContainer().getPath());
                    for (QueryException e : errors)
                    {
                        _log.warn(e.getMessage(), e);
                    }
                }

                if (ti != null)
                {
                    ti.getColumn(pkCol.getName()).setHidden(true);
                    ti.getColumn(pkCol.getName()).setKeyField(true);
                }
                else
                {
                    // This has been failing on TeamCity due to missing columns in study.demographics, so we recreate and log those columns here
                    TableInfo demographics = targetSchema.getTable("demographics");
                    if (demographics != null)
                    {
                        _log.warn("Demographics table columns: ");
                        _log.warn(targetSchema.getTable("demographics").getColumnNameSet());
                    }
                }

                return ti;
            }
        });

        ds.addColumn(col);
    }

    public UserSchema getEHRStudyUserSchema(AbstractTableInfo ti)
    {
        Container ehrContainer = EHRService.get().getEHRStudyContainer(ti.getUserSchema().getContainer());
        if (ehrContainer == null)
            return getUserSchema(ti, "study");
        
        return getUserSchema(ti, "study", ehrContainer);
    }

    private void hideStudyColumns(AbstractTableInfo ds)
    {
        for (String name : new String[]{"EnrollmentSiteId", "CurrentSiteId", "InitialCohort", "Cohort", "StartDate"})
        {
            ColumnInfo col = ds.getColumn(name);
            if (col != null)
            {
                col.setHidden(true);
                col.setShownInInsertView(false);
                col.setShownInUpdateView(false);
                col.setShownInDetailsView(false);
            }
        }
    }

    private void appendDuration(AbstractTableInfo ti)
    {
        ColumnInfo date = ti.getColumn("date");
        ColumnInfo enddate = ti.getColumn("enddate");
        if (date != null && enddate != null && ti.getColumn("duration") == null)
        {
            String type = ti.getSqlDialect().isPostgreSQL() ? "timestamp" : "date";
            SQLFragment sql = new SQLFragment("(" + ti.getSqlDialect().getDateDiff(Calendar.DATE, "(cast(COALESCE(CAST(" + ExprColumn.STR_TABLE_ALIAS + "." + enddate.getSelectName() + " as date), {fn curdate()}) as " + type + ")", "CAST(" + ExprColumn.STR_TABLE_ALIAS + "." + date.getSelectName() + " AS date)") + "))");
            ExprColumn col = new ExprColumn(ti, "duration", sql, JdbcType.INTEGER);
            col.setCalculated(true);
            col.setUserEditable(false);
            col.setHidden(true);
            col.setLabel("Duration (Days)");
            col.setDescription("This column will show the total number of days between the date and enddate of this record.  If enddate is blank, the current date will be used.");
            ti.addColumn(col);
        }

    }

    public boolean isAddLinkDisablers()
    {
        return _addLinkDisablers;
    }

    public void setAddLinkDisablers(boolean addLinkDisablers)
    {
        _addLinkDisablers = addLinkDisablers;
    }
}
