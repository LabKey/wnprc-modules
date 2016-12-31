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
package org.labkey.ehr.pipeline;

import org.apache.commons.lang3.StringUtils;
import org.jetbrains.annotations.NotNull;
import org.labkey.api.collections.CaseInsensitiveHashMap;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.DbScope;
import org.labkey.api.data.RuntimeSQLException;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.SqlExecutor;
import org.labkey.api.data.SqlSelector;
import org.labkey.api.data.Table;
import org.labkey.api.data.TableInfo;
import org.labkey.api.exp.api.ExperimentService;
import org.labkey.api.exp.api.StorageProvisioner;
import org.labkey.api.exp.property.Domain;
import org.labkey.api.pipeline.AbstractTaskFactory;
import org.labkey.api.pipeline.AbstractTaskFactorySettings;
import org.labkey.api.pipeline.PipelineJob;
import org.labkey.api.pipeline.PipelineJobException;
import org.labkey.api.pipeline.RecordedAction;
import org.labkey.api.pipeline.RecordedActionSet;
import org.labkey.api.pipeline.file.FileAnalysisJobSupport;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.DuplicateKeyException;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.QueryUpdateServiceException;
import org.labkey.api.query.UserSchema;
import org.labkey.api.query.ValidationException;
import org.labkey.api.study.StudyService;
import org.labkey.api.util.FileType;
import org.labkey.ehr.EHRSchema;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.io.LineNumberReader;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * User: bbimber
 * Date: 8/6/12
 * Time: 12:57 PM
 */
public class GeneticCalculationsImportTask extends PipelineJob.Task<GeneticCalculationsImportTask.Factory>
{
    public static final String PEDIGREE_FILE = "pedigree.txt";
    public static final String KINSHIP_FILE = "kinship.txt";
    public static final String INBREEDING_FILE = "inbreeding.txt";

    protected GeneticCalculationsImportTask(Factory factory, PipelineJob job)
    {
        super(factory, job);
    }  
            
    public static class Factory extends AbstractTaskFactory<AbstractTaskFactorySettings, GeneticCalculationsImportTask.Factory>
    {
        public Factory()
        {
            super(GeneticCalculationsImportTask.class);
            setJoin(true);
        }
        
        public List<FileType> getInputTypes()
        {
            return Collections.singletonList(new FileType(".r"));
        }

        public String getStatusName()
        {
            return PipelineJob.TaskStatus.running.toString();
        }

        public List<String> getProtocolActionNames()
        {
            return Arrays.asList("Calculating Genetics Values");
        }

        public PipelineJob.Task createTask(PipelineJob job)
        {
            GeneticCalculationsImportTask task = new GeneticCalculationsImportTask(this, job);
            setJoin(false);

            return task;
        }

        public boolean isJobComplete(PipelineJob job)
        {
            return false;
        }
    }

    @NotNull
    public RecordedActionSet run() throws PipelineJobException
    {
        List<RecordedAction> actions = new ArrayList<>();

        String paramVal = getJob().getParameters().get("allowRunningDuringDay");
        int hourOfDay = Calendar.getInstance().get(Calendar.HOUR_OF_DAY);
        if (!"true".equals(paramVal) && hourOfDay >= 7 && hourOfDay <= 19)
        {
            throw new PipelineJobException("The genetics import task should only run outside of business hours.  Either wait for the next scheduled job or retry this task before 7AM or after 6PM.  You can also run this manually from the EHR admin page.");
        }
        else
        {
            processInbreeding();
            processKinship();
        }

        return new RecordedActionSet(actions);
    }

    private void processKinship() throws PipelineJobException
    {
        PipelineJob job = getJob();
        FileAnalysisJobSupport support = (FileAnalysisJobSupport) job;

        File output = new File(support.getAnalysisDirectory(), KINSHIP_FILE);
        if (!output.exists())
            throw new PipelineJobException("Unable to find file: " + output.getPath());

        DbSchema ehrSchema = EHRSchema.getInstance().getSchema();
        TableInfo kinshipTable = ehrSchema.getTable("kinship");

        getJob().getLogger().info("Inspecting file length: " + output.getPath());

        try
        {
            try (DbScope.Transaction transaction = ExperimentService.get().ensureTransaction();
                 LineNumberReader lnr = new LineNumberReader(new BufferedReader(new FileReader(output))))
            {
                while (lnr.readLine() != null)
                {
                    if (lnr.getLineNumber() > 3)
                        break;
                }
                int lineNumber = lnr.getLineNumber();
                lnr.close();

                if (lineNumber < 3)
                    throw new PipelineJobException("Too few lines found in output.  Line count was: " + lineNumber);

                //delete all previous records
                getJob().getLogger().info("Deleting existing rows");
                Table.delete(kinshipTable, new SimpleFilter(FieldKey.fromString("container"), getJob().getContainerId(), CompareType.EQUAL));

                //NOTE: this process creates and deletes a ton of rows each day.  the rowId can balloon very quickly, so we reset it here
                SqlSelector ss = new SqlSelector(kinshipTable.getSchema(), new SQLFragment("SELECT max(rowid) as expt FROM " + kinshipTable.getSelectName()));
                List<Long> ret = ss.getArrayList(Long.class);
                Integer maxVal;
                if (ret.isEmpty())
                {
                    maxVal = 0;
                }
                else
                {
                    maxVal = ret.get(0) == null ? 0 : ret.get(0).intValue();
                }

                SqlExecutor ex = new SqlExecutor(kinshipTable.getSchema());
                if (kinshipTable.getSqlDialect().isSqlServer())
                {
                    ex.execute(new SQLFragment("DBCC CHECKIDENT ('" + kinshipTable.getSelectName() + "', RESEED, " + maxVal + ")"));
                }
                else if (kinshipTable.getSqlDialect().isPostgreSQL())
                {
                    //find sequence name.  this was autocreated by the serial
                    String seqName = "kinship_rowid_seq";
                    SqlSelector series = new SqlSelector(kinshipTable.getSchema(), new SQLFragment("SELECT relname FROM pg_class WHERE relkind='S' AND relname = ?", seqName));
                    if (!series.exists())
                    {
                        throw new PipelineJobException("Unable to find sequence with name: " + seqName);
                    }
                    else
                    {
                        maxVal++;
                        ex.execute(new SQLFragment("SELECT setval(?, ?)", "ehr." + seqName, maxVal));
                    }
                }
                else
                {
                    throw new PipelineJobException("Unknown SQL Dialect: " + kinshipTable.getSqlDialect().getProductName());
                }
                transaction.commit();
            }

            try (DbScope.Transaction transaction = ExperimentService.get().ensureTransaction();
                 BufferedReader reader = new BufferedReader(new FileReader(output)))
            {
                getJob().getLogger().info("Inserting rows");
                String line = null;
                int lineNum = 0;
                while ((line = reader.readLine()) != null)
                {
                    String[] fields = line.split("\t");
                    if (fields.length < 3)
                        continue;
                    if ("coefficient".equalsIgnoreCase(fields[2]))
                        continue; //skip header

                    if (fields[0].equalsIgnoreCase(fields[1]))
                        continue; //dont import self-kinship

                    Map row = new HashMap<String, Object>();
                    assert fields[0].length() < 80 : "Field Id value too long: [" + fields[0] + ']';
                    assert fields[1].length() < 80 : "Field Id2 value too long: [" + fields[1] + "]";

                    row.put("Id", fields[0]);
                    row.put("Id2", fields[1]);
                    try
                    {
                        row.put("coefficient", Double.parseDouble(fields[2]));
                    }
                    catch (NumberFormatException e)
                    {
                        throw new PipelineJobException("Invalid kinship coefficient on line " + (lineNum + 1) + " for IDs " + fields[0] + " and " + fields[1] + ": " + fields[2], e);
                    }

                    row.put("container", job.getContainer().getId());
                    row.put("created", new Date());
                    row.put("createdby", job.getUser().getUserId());
                    Table.insert(job.getUser(), kinshipTable, row);
                    lineNum++;

                    if (lineNum % 100000 == 0)
                    {
                        getJob().getLogger().info("processed " + lineNum + " rows");
                    }
                }

                job.getLogger().info("Inserted " + lineNum + " rows into ehr.kinship");
                transaction.commit();
            }
        }
        catch (RuntimeSQLException | IOException e)
        {
            throw new PipelineJobException(e);
        }
    }

    private TableInfo getRealTable(TableInfo ti)
    {
        Domain domain = ti.getDomain();
        if (domain != null)
        {
            return StorageProvisioner.createTableInfo(domain);
        }

        return null;
    }

    private void processInbreeding() throws PipelineJobException
    {
        PipelineJob job = getJob();
        FileAnalysisJobSupport support = (FileAnalysisJobSupport) job;

        File output = new File(support.getAnalysisDirectory(), INBREEDING_FILE);
        if (!output.exists())
            throw new PipelineJobException("Unable to find file: " + output.getPath());

        UserSchema us = QueryService.get().getUserSchema(job.getUser(), job.getContainer(), "study");
        TableInfo ti = us.getTable("Inbreeding Coefficients");
        if (ti == null)
        {
            getJob().getLogger().warn("Unable to find table study.inbreeding coefficients");
            return;
        }

        QueryUpdateService qus = ti.getUpdateService();
        qus.setBulkLoad(true);

        LineNumberReader lnr = null;
        BufferedReader reader = null;

        try
        {
            try (DbScope.Transaction transaction = ExperimentService.get().ensureTransaction())
            {
                getJob().getLogger().info("Inspecting file length: " + output.getPath());
                lnr = new LineNumberReader(new BufferedReader(new FileReader(output)));
                while (lnr.readLine() != null)
                {
                    if (lnr.getLineNumber() > 3)
                        break;
                }
                int lineNumber = lnr.getLineNumber();
                lnr.close();

                if (lineNumber < 3)
                    throw new PipelineJobException("Too few lines found in inbreeding output.  Line count was: " + lineNumber);

                //delete all previous records
                getJob().getLogger().info("Deleting existing rows");
                TableInfo realTable = getRealTable(ti);
                if (realTable == null)
                {
                    throw new PipelineJobException("Unable to find real table for Inbreeding dataset");
                }

                //delete using table, since it is extremely slow otherwise
                Table.delete(realTable, new SimpleFilter(FieldKey.fromString("participantId"), null, CompareType.NONBLANK));
                transaction.commit();
            }

            reader = new BufferedReader(new FileReader(output));

            String line;
            int lineNum = 0;
            List<Map<String, Object>> rows = new ArrayList<>();
            Date date = new Date();

            getJob().getLogger().info("Reading file");
            while ((line = reader.readLine()) != null){
                String[] fields = line.split("\t");
                if (fields.length < 2)
                    continue;
                if ("coefficient".equalsIgnoreCase(fields[1]))
                    continue; //skip header

                Map row = new CaseInsensitiveHashMap<Object>();
                String subjectId = StringUtils.trimToNull(fields[0]);
                if (subjectId == null)
                {
                    getJob().getLogger().error("Missing subjectId on row " + lineNum);
                    continue;
                }

                //row.put("Id", subjectId);
                row.put("participantid", subjectId);
                row.put("date", date);
                row.put("coefficient", Double.parseDouble(fields[1]));

                rows.add(row);
                lineNum++;
            }

            getJob().getLogger().info("Inserting rows");
            BatchValidationException errors = new BatchValidationException();

            Map<Enum, Object> options = new HashMap<>();
            options.put(QueryUpdateService.ConfigParameters.Logger, getJob().getLogger());

            try (DbScope.Transaction transaction = ExperimentService.get().ensureTransaction())
            {
                qus.insertRows(getJob().getUser(), getJob().getContainer(), rows, errors, options, new HashMap<String, Object>());

                if (errors.hasErrors())
                    throw errors;

                transaction.commit();
            }
            job.getLogger().info("Inserted " + lineNum + " rows into inbreeding coefficients table");

        }
        catch (DuplicateKeyException | SQLException | IOException | QueryUpdateServiceException e)
        {
            throw new PipelineJobException(e);
        }
        catch (BatchValidationException e)
        {
            getJob().getLogger().info("error inserting rows");
            for (ValidationException ve : e.getRowErrors())
            {
                getJob().getLogger().info(ve.getMessage());
            }

            throw new PipelineJobException(e);
        }
        finally
        {
            if (lnr != null)
                try{lnr.close();}catch (Exception ignored){}

            if (reader != null)
                try{reader.close();}catch (Exception ignored){}
        }
    }
}
