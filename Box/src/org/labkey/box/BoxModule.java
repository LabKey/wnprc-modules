package org.labkey.box;

import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.Container;
import org.labkey.api.module.SimpleModule;
import org.labkey.api.view.WebPartFactory;
import org.labkey.box.api.BoxService;
import org.labkey.box.service.BoxServiceImpl;

import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

public class BoxModule extends SimpleModule {
    @Override
    public boolean hasScripts() {
        return false;
    }

    @Override
    @NotNull
    protected Collection<WebPartFactory> createWebPartFactories() {
        return Collections.emptyList();
    }

    @Override
    protected void init() {
        BoxService.set(new BoxServiceImpl());
    }

    @Override
    @NotNull
    public Collection<String> getSummary(Container c) {
        return Collections.emptyList();
    }

    @Override
    @NotNull
    public Set<String> getSchemaNames() {
        return new HashSet<>();
    }
}