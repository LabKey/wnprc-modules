/*
 * Copyright (c) 2016-2026 Board of Regents of the University of Wisconsin System
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
package org.labkey.dbutils;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.Container;
import org.labkey.api.ldk.ExtendedSimpleModule;
import org.labkey.api.module.ModuleContext;
import org.labkey.api.settings.AppProps;
import org.labkey.api.util.JobRunner;
import org.labkey.api.view.WebPartFactory;
import org.labkey.dbutils.file.FileToucher;

import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

public class dbutilsModule extends ExtendedSimpleModule {
    private static Logger _log = LogManager.getLogger(dbutilsModule.class);

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
}