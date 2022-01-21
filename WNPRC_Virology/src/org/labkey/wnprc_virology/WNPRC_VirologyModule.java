package org.labkey.wnprc_virology;

import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.ldk.notification.Notification;
import org.labkey.api.ldk.notification.NotificationService;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleContext;
import org.labkey.api.module.SpringModule;
import org.labkey.api.query.DefaultSchema;
import org.labkey.api.query.QuerySchema;
import org.labkey.api.security.roles.RoleManager;
import org.labkey.api.view.WebPartFactory;
import org.labkey.wnprc_virology.notification.ViralLoadQueueNotification;
import org.labkey.wnprc_virology.security.roles.WNPRCViralLoadReaderRole;

import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Set;

public class WNPRC_VirologyModule extends SpringModule
{
    public static final String NAME = "WNPRC_Virology";

    @Override
    public String getName()
    {
        return NAME;
    }

    @Override
    public Double getSchemaVersion()
    {
        return 21.700;
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
        registerRoles();
        registerNotifications();
    }

    @Override
    public void startupAfterSpringConfig(ModuleContext moduleContext)
    {
        // add a container listener so we'll know when our container is deleted:
        ContainerManager.addContainerListener(new WNPRC_VirologyContainerListener());

        DefaultSchema.registerProvider(WNPRC_VirologySchema.NAME, new DefaultSchema.SchemaProvider(this)
        {
            @Override
            public QuerySchema createSchema(final DefaultSchema schema, Module module)
            {
                return new WNPRC_VirologySchema(schema.getUser(), schema.getContainer());
            }
        });

        ViralLoadRSEHRRunner.schedule();;
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

    public void registerRoles() {
        RoleManager.registerRole(new WNPRCViralLoadReaderRole());
    }

    public void registerNotifications() {
        List<Notification> notifications = Arrays.asList(
                new ViralLoadQueueNotification(this)
        );

        for (Notification notification : notifications)
        {
            NotificationService.get().registerNotification(notification);
        }
    }

}