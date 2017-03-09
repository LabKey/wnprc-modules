package org.labkey.webutils;

import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.jsp.JspLoader;
import org.labkey.api.module.DefaultModule;
import org.labkey.api.module.ModuleContext;
import org.labkey.api.view.WebPartFactory;
import org.labkey.webutils.api.WebUtilsService;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collection;
import java.util.Collections;
import java.util.Set;

public class WebUtilsModule extends DefaultModule {
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
    protected void init() {
        addController(WebUtilsController.NAME, WebUtilsController.class);

        Path path = Paths.get("/LabKey/sources/lkpm/");
        if (Files.exists(path) && Files.isDirectory(path)) {
            JspLoader.registerAdditionalLibForJSPCompilation("/usr/local/tomcat/lib");
            JspLoader.registerAdditionalLibForJSPCompilation("/usr/local/labkey/labkeyWebapp/WEB-INF/lib");

            File modulesDir = new File("/usr/local/labkey/modules");
            if (modulesDir.exists() && modulesDir.isDirectory()) {
                for (File file : modulesDir.listFiles()) {
                    if (file.isDirectory()) {
                        File libDir = new File(Paths.get(file.getAbsolutePath(), "lib").toString());
                        if (libDir.exists() && libDir.isDirectory()) {
                            JspLoader.registerAdditionalLibForJSPCompilation(libDir.getAbsolutePath());
                        }
                    }
                }
            }
        }
    }

    @Override
    public void doStartup(ModuleContext moduleContext) {

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
        return Collections.singleton(WebUtilsSchema.NAME);
    }
}