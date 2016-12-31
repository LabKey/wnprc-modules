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

import org.apache.log4j.Logger;
import org.labkey.api.data.Container;
import org.labkey.api.pipeline.PipeRoot;
import org.labkey.api.pipeline.PipelineJobException;
import org.labkey.api.pipeline.PipelineJobService;
import org.labkey.api.pipeline.PipelineService;
import org.labkey.api.pipeline.PipelineValidationException;
import org.labkey.api.pipeline.TaskId;
import org.labkey.api.pipeline.TaskPipeline;
import org.labkey.api.pipeline.file.AbstractFileAnalysisJob;
import org.labkey.api.pipeline.file.AbstractFileAnalysisProtocol;
import org.labkey.api.pipeline.file.AbstractFileAnalysisProtocolFactory;
import org.labkey.api.pipeline.file.AbstractFileAnalysisProvider;
import org.labkey.api.pipeline.file.FileAnalysisTaskPipeline;
import org.labkey.api.security.User;
import org.labkey.api.util.ConfigurationException;
import org.labkey.api.util.DateUtil;
import org.labkey.api.view.ActionURL;
import org.labkey.api.view.ViewBackgroundInfo;
import org.labkey.ehr.EHRManager;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.Collections;
import java.util.Date;

/**
 * User: bbimber
 * Date: 8/26/12
 * Time: 4:32 PM
 */
public class GeneticCalculationsRunnable
{
    private final String KINSHIP_PIPELINE_NAME = "kinshipPipeline";
    private final Logger _log = Logger.getLogger(GeneticCalculationsRunnable.class);

    public boolean run(Container c, boolean allowRunningDuringDay) throws PipelineJobException
    {
        User u = EHRManager.get().getEHRUser(c);
        if (u == null)
        {
            _log.error("Unable to recalculate EHR genetics values, because EHR user is null");
            return false;
        }

        startCalculation(u, c, allowRunningDuringDay);
        return true;
    }

    private void startCalculation(User u, Container c, boolean allowRunningDuringDay) throws PipelineJobException
    {
        try
        {
            String taskIdString =  FileAnalysisTaskPipeline.class.getName() + ":" + KINSHIP_PIPELINE_NAME;
            TaskId taskId = new TaskId(taskIdString);
            TaskPipeline taskPipeline = PipelineJobService.get().getTaskPipeline(taskId);
            if (taskPipeline == null)
                throw new PipelineJobException("Unable to find kinship pipeline: " + taskId);

            AbstractFileAnalysisProvider provider = (AbstractFileAnalysisProvider) PipelineService.get().getPipelineProvider("File Analysis");
            AbstractFileAnalysisProtocolFactory factory = provider.getProtocolFactory(taskPipeline);
            ViewBackgroundInfo bg = new ViewBackgroundInfo(c, u, new ActionURL());
            PipeRoot root = PipelineService.get().getPipelineRootSetting(c);
            String protocolName = "EHR Kinship Calculation";
            String xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
                "<bioml>\n" +
                    (allowRunningDuringDay ? "\t<note label=\"allowRunningDuringDay\" type=\"input\">true</note>" : "") +
                "</bioml>";

            AbstractFileAnalysisProtocol protocol = factory.createProtocolInstance(protocolName, "", xml);
            if (protocol == null)
            {
                return;
            }

            File fileParameters = protocol.getParametersFile(root.getRootPath(), root);
            if (!fileParameters.exists())
            {
                fileParameters.getParentFile().mkdirs();
                fileParameters.createNewFile();
            }
            protocol.saveInstance(fileParameters, c);

            File defaultXml = new File(root.getRootPath(), ".labkey/protocols/kinship/default.xml");
            if (defaultXml.exists())
            {
                defaultXml.delete();
            }

            defaultXml.getParentFile().mkdirs();
            defaultXml.createNewFile();
            try (FileWriter w = new FileWriter(defaultXml))
            {
                w.write(xml);
            }

            File inputFile = new File(root.getRootPath(), "kinship.txt");
            if (!inputFile.exists())
                inputFile.createNewFile();

            AbstractFileAnalysisJob job = protocol.createPipelineJob(bg, root, Collections.singletonList(inputFile), fileParameters);
            PipelineService.get().queueJob(job);
            job.setLogFile(new File(job.getLogFile().getParent() + "/kinship_" + DateUtil.formatDateTime(new Date(), "yyyy-MM-dd_HH-mm-ss") + ".txt.log"));
        }
        catch (ClassNotFoundException e)
        {
            throw new ConfigurationException("The EHR kinship pipeline has not been configured on this server", e);
        }
        catch (IOException e)
        {
            throw new PipelineJobException(e);
        }
        catch (PipelineValidationException e)
        {
            throw new PipelineJobException(e);
        }
    }
}
