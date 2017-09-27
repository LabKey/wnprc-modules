/*
 * Copyright (c) 2012-2015 LabKey Corporation
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

import au.com.bytecode.opencsv.CSVWriter;
import org.apache.commons.lang3.StringUtils;
import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.Selector;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.pipeline.AbstractTaskFactory;
import org.labkey.api.pipeline.AbstractTaskFactorySettings;
import org.labkey.api.pipeline.PipelineJob;
import org.labkey.api.pipeline.PipelineJobException;
import org.labkey.api.pipeline.RecordedAction;
import org.labkey.api.pipeline.RecordedActionSet;
import org.labkey.api.pipeline.file.FileAnalysisJobSupport;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.UserSchema;
import org.labkey.api.util.FileType;
import org.labkey.api.util.PageFlowUtil;
import org.springframework.jdbc.BadSqlGrammarException;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * User: bbimber
 * Date: 8/6/12
 * Time: 12:57 PM
 */
public class GeneticCalculationsInitTask extends PipelineJob.Task<GeneticCalculationsInitTask.Factory>
{
    protected GeneticCalculationsInitTask(Factory factory, PipelineJob job)
    {
        super(factory, job);
    }

    public static class Factory extends AbstractTaskFactory<AbstractTaskFactorySettings, GeneticCalculationsInitTask.Factory>
    {
        public Factory()
        {
            super(GeneticCalculationsInitTask.class);
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
            GeneticCalculationsInitTask task = new GeneticCalculationsInitTask(this, job);
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
        PipelineJob job = getJob();
        FileAnalysisJobSupport support = (FileAnalysisJobSupport) job;

        //we expect to keep reusing the same job, so we truncate the logfile
        try
        {
            File log = job.getLogFile();
            log.delete();
            log.createNewFile();
        }
        catch (IOException e)
        {
            throw new PipelineJobException(e);
        }

        RecordedAction action = new RecordedAction();

        job.getLogger().info("Creating TSV with pedigree data");

        try
        {
            UserSchema us = QueryService.get().getUserSchema(job.getUser(), job.getContainer(), "study");
            if (us == null)
            {
                throw new IllegalStateException("Could not find schema 'study'");
            }
            TableInfo pedTable = us.getTable("pedigree");
            if (pedTable == null)
            {
                throw new IllegalStateException("Could not find query 'pedigree' in study schema");
            }
            TableSelector ts = new TableSelector(pedTable, PageFlowUtil.set("Id", "Dam", "Sire", "Gender", "Species"));

            File outputFile = new File(support.getAnalysisDirectory(), GeneticCalculationsImportTask.PEDIGREE_FILE);

            try (CSVWriter writer = new CSVWriter(new OutputStreamWriter(new FileOutputStream(outputFile)), '\t', CSVWriter.DEFAULT_QUOTE_CHARACTER))
            {
                long count = ts.getRowCount();
                if (count > 0)
                {
                    ts.forEach(new Selector.ForEachBlock<ResultSet>()
                    {
                        @Override
                        public void exec(ResultSet rs) throws SQLException
                        {
                            String[] row = new String[]{rs.getString("Id"), rs.getString("Dam"), rs.getString("Sire"), rs.getString("Gender"), rs.getString("Species")};
                            for (int i=0;i<row.length;i++)
                            {
                                //R wont accept empty strings in the input, so we need to replace them with NA
                                if (StringUtils.isEmpty(row[i]))
                                    row[i] = "NA";
                            }
                            writer.writeNext(row);
                        }
                    });
                }
                else
                {
                    outputFile.delete();
                    throw new PipelineJobException("No rows present in pedigree table");
                }
            }
            catch (BadSqlGrammarException e)
            {
                throw new PipelineJobException("Unable to query pedigree table", e);
            }

            action.addOutput(outputFile, "Pedigree TSV", false, true);
        }
        catch (IOException e)
        {
            throw new RuntimeException(e);
        }

        return new RecordedActionSet(Collections.singleton(action));
    }
}
