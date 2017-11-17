package org.labkey.wnprc_billing.pipeline;

import org.labkey.api.module.Module;
import org.labkey.api.pipeline.PipeRoot;
import org.labkey.api.pipeline.PipelineDirectory;
import org.labkey.api.pipeline.PipelineProvider;
import org.labkey.api.view.ViewContext;

public class BillingPipelineProvider extends PipelineProvider
{
    public static final String NAME = "WNPRC Billing Pipeline";

    public BillingPipelineProvider(Module owningModule)
    {
        super(NAME, owningModule);
    }

    @Override
    public void updateFileProperties(ViewContext context, PipeRoot pr, PipelineDirectory directory, boolean includeAll)
    {

    }
}