package org.labkey.wnprc_virology.pipeline;

import org.labkey.api.data.Container;
import org.labkey.api.files.FileUrls;
import org.labkey.api.pipeline.PipeRoot;
import org.labkey.api.pipeline.PipelineJob;
import org.labkey.api.pipeline.PipelineJobService;
import org.labkey.api.pipeline.TaskId;
import org.labkey.api.pipeline.TaskPipeline;
import org.labkey.api.security.User;
import org.labkey.api.util.FileUtil;
import org.labkey.api.util.PageFlowUtil;
import org.labkey.api.view.ActionURL;
import org.labkey.api.view.ViewBackgroundInfo;

import java.io.File;

public class WNPRC_VirologyPopulateFoldersTableJob extends PipelineJob
{
    // For serialization
    protected WNPRC_VirologyPopulateFoldersTableJob() {}

    public WNPRC_VirologyPopulateFoldersTableJob(Container c, User user, ActionURL url, PipeRoot pipeRoot)
    {
        super(null, new ViewBackgroundInfo(c, user, url), pipeRoot);

        setLogFile(new File( FileUtil.makeFileNameWithTimestamp("virologypipeline", "log")));
    }


    @Override
    public String getDescription()
    {
        return "Populates wnprc_virology.folder_paths_with_readers table";
    }

    @Override
    public ActionURL getStatusHref()
    {
        return PageFlowUtil.urlProvider(FileUrls.class).urlBegin(getContainer());
    }

    @Override
    public TaskPipeline getTaskPipeline()
    {
        return PipelineJobService.get().getTaskPipeline(new TaskId(WNPRC_VirologyPopulateFoldersTableJob.class));
    }

}