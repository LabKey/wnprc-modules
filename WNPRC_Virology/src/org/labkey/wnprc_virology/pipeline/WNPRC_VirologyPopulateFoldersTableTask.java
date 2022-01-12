/*
 * Copyright (c) 2008-2018 LabKey Corporation
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
package org.labkey.wnprc_virology.pipeline;

import org.apache.commons.lang3.StringUtils;
import org.jetbrains.annotations.NotNull;
import org.labkey.api.pipeline.AbstractTaskFactory;
import org.labkey.api.pipeline.AbstractTaskFactorySettings;
import org.labkey.api.pipeline.PipelineJob;
import org.labkey.api.pipeline.PipelineJobException;
import org.labkey.api.pipeline.RecordedAction;
import org.labkey.api.pipeline.RecordedActionSet;
import org.labkey.api.util.FileType;
import org.labkey.api.util.FileUtil;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * <code>FastaCheckTask</code>
 */
public class WNPRC_VirologyPopulateFoldersTableTask extends PipelineJob.Task<WNPRC_VirologyPopulateFoldersTableTask.Factory>
{
    private static final String ACTION_NAME = "Check FASTA";

    public static final String DECOY_DATABASE_PARAM_NAME = "pipeline, decoy database";

    private static List<String> DECOY_FILE_SUFFIXES = new ArrayList<>(Arrays.asList("-reverse", "-decoy", "-rev"));

    public WNPRC_VirologyPopulateFoldersTableTask(Factory factory, PipelineJob job)
    {
        super(factory, job);
    }

    public static class Factory extends AbstractTaskFactory<AbstractTaskFactorySettings, Factory>
    {
        private boolean _requireDecoyDatabase;

        public Factory()
        {
            super(WNPRC_VirologyPopulateFoldersTableTask.class);

            setJoin(true);  // Do this once per file-set.
        }

        @Override
        public PipelineJob.Task createTask(PipelineJob job)
        {
            return new WNPRC_VirologyPopulateFoldersTableTask(this, job);
        }

        @Override
        public List<FileType> getInputTypes()
        {
            // CONSIDER: Not really the input type, but the input type for the search.
            //           Should it be null or FASTA?
            return null;
            //return Collections.singletonList(AbstractMS2SearchProtocol.FT_MZXML);
        }


        @Override
        public String getStatusName()
        {
            return "CHECK FASTA";
        }

        @Override
        public List<String> getProtocolActionNames()
        {
            return Collections.singletonList(ACTION_NAME);
        }

        @Override
        public boolean isJobComplete(PipelineJob job)
        {
            // No way of knowing.
            return false;
        }

        @Override
        public String getGroupParameterName()
        {
            return "fasta check";
        }
    }


    @Override
    @NotNull
    public RecordedActionSet run() throws PipelineJobException
    {
        try
        {
            getJob().header("Check FASTA validity");

        }
        // IllegalArgumentException is sometimes thrown by the checker.
        catch (IllegalArgumentException e)
        {
            throw new PipelineJobException("Failed to check FASTA file(s)", e);
        }
        return null;

    }

}
