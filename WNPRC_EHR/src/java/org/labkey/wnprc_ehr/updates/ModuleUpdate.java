package org.labkey.wnprc_ehr.updates;

import org.apache.log4j.Logger;
import org.jetbrains.annotations.NotNull;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleContext;
import org.reflections.Reflections;

import java.lang.reflect.Modifier;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Utility class for executing non-schema-related updates to the WNPRC module
 */
public class ModuleUpdate
{
    /**
     * Logger for logging the logs
     */
    private static final Logger LOG = Logger.getLogger(ModuleUpdate.class);

    /**
     * Cached set of {@link Updater} instances reflected from the package
     */
    private static Set<Updater> updaters;

    /**
     * Executes the after update step of each applicable updater in the package
     *
     * @param ctx Module update context from LabKey
     */
    public static void doAfterUpdate(ModuleContext ctx)
    {
        getApplicableUpdaters(ctx).forEach(x -> x.doAfterUpdate(ctx));
    }

    /**
     * Executes the before update step of each applicable updater in the package
     *
     * @param ctx Module update context from LabKey
     */
    public static void doBeforeUpdate(ModuleContext ctx)
    {
        getApplicableUpdaters(ctx).forEach(x -> x.doBeforeUpdate(ctx));
    }

    /**
     * Executes the version update step of each applicable updater in the package
     *
     * @param ctx Module update context from LabKey
     */
    public static void doVersionUpdate(ModuleContext ctx)
    {
        getApplicableUpdaters(ctx).forEach(x -> x.doVersionUpdate(ctx));
    }

    /**
     * Executes any deferred update action that needs to wait until the module has started
     *
     * @param ctx Module update context from LabKey
     */
    public static void onStartup(ModuleContext ctx, Module module)
    {
        getApplicableUpdaters(ctx).forEach(x -> x.onStartup(ctx, module));
    }

    /**
     * Uses reflection to retrieve the set of all the updaters currently in the module classpath (thread-safe).
     *
     * @return Set of instances of all updater implementations in the classpath
     */
    private static Set<? extends Updater> getAllUpdaters()
    {
        if (updaters == null)
        {
            synchronized (ModuleUpdate.class)
            {
                // double null check for thread safety. one thread might create the object while
                // another is in the lock wait
                if (updaters == null)
                {
                    LOG.debug("caching list of available Updater implementations");
                    updaters = new Reflections(ModuleUpdate.class.getPackage().getName())
                            .getSubTypesOf(Updater.class).stream()
                            .filter(c -> !Modifier.isAbstract(c.getModifiers()))
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
                            .sorted()
                            .collect(Collectors.toSet());
                    LOG.debug(String.format("found %d Updater implementations for the cache", updaters.size()));
                }
            }
        }
        return updaters;
    }

    /**
     * Returns a stream of all applicable updaters from the current Java module based on the passed context
     *
     * @param ctx Module update context from LabKey
     * @return Stream of {@link Updater} objects to execute
     */
    private static Stream<? extends Updater> getApplicableUpdaters(ModuleContext ctx)
    {
        return getAllUpdaters().stream().filter(x -> x.applies(ctx));
    }

    /**
     * Utility interface for applying individual, non-schema-related module updates
     */
    interface Updater extends Comparable<Updater>
    {
        /**
         * Indicates whether a particular update applies given the passed context
         *
         * @param ctx Module context from LabKey
         * @return True if this updater should be executed, false otherwise
         */
        boolean applies(ModuleContext ctx);

        /**
         * Executes the after update step of this update
         *
         * @param ctx Module context from LabKey
         */
        void doAfterUpdate(ModuleContext ctx);

        /**
         * Executes the before update step of this update
         *
         * @param ctx Module context from LabKey
         */
        void doBeforeUpdate(ModuleContext ctx);

        /**
         * Executes the version update step of this update
         *
         * @param ctx Module context from LabKey
         */
        void doVersionUpdate(ModuleContext ctx);

        /**
         * Returns the "target" version to which this updater is intended to update.
         *
         * @return Target version number (e.g., 15.15)
         */
        double getTargetVersion();

        /**
         * Executes any deferred actions that need to be done after startup
         *
         * @param ctx Module context from LabKey
         */
        void onStartup(ModuleContext ctx, Module module);
    }

    /**
     * Base implementation of the {@link Updater} interface that defines the sort order based on the
     * target version and defaults the check for applying the module to a comparison of the target
     * version and the module context's original version.
     */
    static abstract class ComparableUpdater implements Updater
    {
        @Override
        public boolean applies(ModuleContext ctx)
        {
            return ctx.getOriginalVersion() < this.getTargetVersion();
        }

        @Override
        public int compareTo(@NotNull ModuleUpdate.Updater o)
        {
            return Double.compare(this.getTargetVersion(), o.getTargetVersion());
        }
    }
}
