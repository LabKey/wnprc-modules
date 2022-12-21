package org.labkey.wnprc_virology;

import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.ehr.EHRService;
import org.labkey.api.ldk.notification.Notification;
import org.labkey.api.ldk.notification.NotificationService;
import org.labkey.api.module.FolderTypeManager;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleContext;
import org.labkey.api.module.SpringModule;
import org.labkey.api.query.DefaultSchema;
import org.labkey.api.query.QuerySchema;
import org.labkey.api.view.WebPartFactory;
import org.labkey.api.view.template.ClientDependency;

import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Set;

public class WNPRC_VirologyModule extends SpringModule
{
    public static final String NAME = "WNPRC_Virology";

    public static final String VIROLOGY_EHR_VL_SAMPLE_QUEUE_PATH_PROP = "virologyEHRVLSampleQueueFolderPath";
    public static final String RSEHR_QC_STATUS_STRING_PROP = "RSEHRQCStatus";
    public static final String RSEHR_PORTAL_URL_PROP = "RSEHRPortalPath";
    public static final String RSEHR_PARENT_FOLDER_STRING_PROP = "RSEHRViralLoadDataFolder";
    public static final String RSEHR_JOB_INTERVAL_PROP = "RSEHRJobInterval"; // in minutes
    public static final String ZIKA_PORTAL_QC_STATUS_STRING_PROP = "ZikaPortalQCStatus";
    public static final String ZIKA_PORTAL_URL_PROP = "ZikaPortalPath";
    //TODO: assemble notify list from ETL from RSEHR
    public static final String USE_RSEHR_FOLDER_PERMS_FOR_EMAIL = "virologyRSHEREmailMethod";

    @Override
    public String getName()
    {
        return NAME;
    }

    @Override
    public Double getSchemaVersion()
    {
        return 21.111;
    }

    @Override
    public boolean hasScripts()
    {
        return true;
    }

    @Override
    @NotNull
    protected Collection<WebPartFactory> createWebPartFactories()
    {
        return Collections.emptyList();
    }

    @Override
    protected void init()
    {
        addController(WNPRC_VirologyController.NAME, WNPRC_VirologyController.class);
    }

    @Override
    public void startupAfterSpringConfig(ModuleContext moduleContext)
    {
        // add a container listener so we'll know when our container is deleted:
        ContainerManager.addContainerListener(new WNPRC_VirologyContainerListener(this));
        DefaultSchema.registerProvider(WNPRC_VirologySchema.NAME, new DefaultSchema.SchemaProvider(this)
        {
            @Override
            public QuerySchema createSchema(final DefaultSchema schema, Module module)
            {
                return new WNPRC_VirologySchema(schema.getUser(), schema.getContainer());
            }
        });

        EHRService.get().registerClientDependency(ClientDependency.supplierFromPath("wnprc_virology/datasetButtons.js"), this);
        ViralLoadRSEHRRunner.schedule();;
        FolderTypeManager.get().registerFolderType(this, new WNPRC_VirologyFolderType(this));
    }

    @Override
    @NotNull
    public Collection<String> getSummary(Container c)
    {
        return Collections.emptyList();
    }

    @Override
    @NotNull
    public Set<String> getSchemaNames()
    {
        return Collections.singleton(WNPRC_VirologySchema.NAME);
    }

}
