package org.labkey.dbutils;

import org.apache.log4j.Logger;
import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.Container;
import org.labkey.api.ldk.ExtendedSimpleModule;
import org.labkey.api.module.ModuleContext;
import org.labkey.api.settings.AppProps;
import org.labkey.api.util.JobRunner;
import org.labkey.api.view.WebPartFactory;
import org.labkey.dbutils.file.FileToucher;
import sun.reflect.generics.reflectiveObjects.NotImplementedException;

import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

public class dbutilsModule extends ExtendedSimpleModule {
    private static Logger _log = Logger.getLogger(dbutilsModule.class);

    @Override
    public boolean hasScripts() { return true; }

    @Override
    @NotNull
    protected Collection<WebPartFactory> createWebPartFactories() {
        return Collections.emptyList();
    }

    @Override
    protected void init() {
        addController(dbutilsController.NAME, dbutilsController.class);
    }

    @Override
    public void doStartupAfterSpringConfig(ModuleContext moduleContext) {
        if (AppProps.getInstance().isDevMode()) {
            _log.info("Starting File Toucher");
            JobRunner.getDefault().execute(new FileToucher());
        }
    }

    @Override
    @NotNull
    public Set<String> getSchemaNames() {
        Set<String> schemaNames = new HashSet<>();
        schemaNames.add("dbutils");
        return schemaNames;
    }

    public Container getPrivateContainer() {
        throw new NotImplementedException();
    }

    public Container getPrivateFilesContainer() {
        throw new NotImplementedException();
    }
}