package org.labkey.wnprc_ehr.updates;

import org.apache.log4j.Logger;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleContext;
import org.reflections.Reflections;

import java.util.Objects;
import java.util.stream.Stream;

public class ModuleUpdate
{
    private static Logger LOG = Logger.getLogger(ModuleUpdate.class);

    public static void doAfterUpdate(ModuleContext ctx)
    {
        getApplicableUpdaters(ctx).forEach(x -> x.doAfterUpdate(ctx));
    }

    public static void doBeforeUpdate(ModuleContext ctx)
    {
        getApplicableUpdaters(ctx).forEach(x -> x.doBeforeUpdate(ctx));
    }

    public static void doVersionUpdate(ModuleContext ctx)
    {
        getApplicableUpdaters(ctx).forEach(x -> x.doVersionUpdate(ctx));
    }

    public static void onStartup(ModuleContext ctx, Module module)
    {
        getApplicableUpdaters(ctx).forEach(x -> x.onStartup(ctx, module));
    }

    private static Stream<? extends Updater> getApplicableUpdaters(ModuleContext ctx)
    {
        return new Reflections("org.labkey.wnprc_ehr.updates")
                .getSubTypesOf(Updater.class).stream()
                .map(c -> {
                    try
                    {
                        return c.getConstructor().newInstance();
                    }
                    catch (Exception e)
                    {
                        LOG.warn(String.format("unable to create module updater from class: class=%s", c.getCanonicalName()), e);
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .filter(x -> x.applies(ctx));
    }

    interface Updater
    {
        boolean applies(ModuleContext ctx);

        void doAfterUpdate(ModuleContext ctx);

        void doBeforeUpdate(ModuleContext ctx);

        void doVersionUpdate(ModuleContext ctx);

        void onStartup(ModuleContext ctx, Module module);
    }
}
