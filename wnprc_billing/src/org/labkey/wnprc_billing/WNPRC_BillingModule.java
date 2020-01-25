/*
 * Copyright (c) 2017 LabKey Corporation
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

package org.labkey.wnprc_billing;

import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.ehr.EHRService;
import org.labkey.api.ehr.dataentry.DefaultDataEntryFormFactory;
import org.labkey.api.ehr_billing.notification.BillingNotificationService;
import org.labkey.api.ehr_billing.pipeline.InvoicedItemsProcessingService;
import org.labkey.api.ldk.ExtendedSimpleModule;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleContext;
import org.labkey.api.pipeline.PipelineService;
import org.labkey.api.query.DefaultSchema;
import org.labkey.api.query.QuerySchema;
import org.labkey.api.services.ServiceRegistry;
import org.labkey.api.view.WebPartFactory;
import org.labkey.wnprc_billing.dataentry.ChargesFormType;
import org.labkey.wnprc_billing.dataentry.NonAnimalChargesFormType;
import org.labkey.wnprc_billing.notification.WNPRCBillingNotificationProvider;
import org.labkey.wnprc_billing.pipeline.BillingPipelineProvider;
import org.labkey.wnprc_billing.pipeline.InvoicedItemsProcessingServiceImpl;
import org.labkey.wnprc_billing.query.WNPRC_BillingUserSchema;
import org.labkey.wnprc_billing.table.WNPRC_BillingCustomizer;

import java.util.Collection;
import java.util.Collections;
import java.util.Set;

public class WNPRC_BillingModule extends ExtendedSimpleModule
{
    public static final String NAME = "WNPRC_Billing";

    //module properties
    public static final String CreditToAccount = "CreditToAccount";
    public static final String BillingAddress = "BillingAddress";
    public static final String BillingContactEmail = "BillingContactEmail";
    public static final String JetCsvSetting = "JETCSVSetting";

    @Override
    public String getName()
    {
        return NAME;
    }

    @Override
    public double getVersion()
    {
        return 18.32;
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
        addController(WNPRC_BillingController.NAME, WNPRC_BillingController.class);
        ServiceRegistry.get().registerService(InvoicedItemsProcessingService.class, new InvoicedItemsProcessingServiceImpl());
        BillingNotificationService.get().registerBillingNotificationProvider(WNPRCBillingNotificationProvider.get());
    }

    @Override
    protected void doStartupAfterSpringConfig(ModuleContext moduleContext)    {

        EHRService.get().registerTableCustomizer(this, WNPRC_BillingCustomizer.class);
        EHRService.get().registerFormType(new DefaultDataEntryFormFactory(ChargesFormType.class, this));
        EHRService.get().registerFormType(new DefaultDataEntryFormFactory(NonAnimalChargesFormType.class, this));

        // add a container listener so we'll know when our container is deleted:
        ContainerManager.addContainerListener(new WNPRC_BillingContainerListener());

        PipelineService.get().registerPipelineProvider(new BillingPipelineProvider(this));
    }

    @Override
    protected void registerSchemas()
    {
        DefaultSchema.registerProvider(WNPRC_BillingSchema.NAME, new DefaultSchema.SchemaProvider(this)
        {
            public QuerySchema createSchema(final DefaultSchema schema, Module module)
            {
                return new WNPRC_BillingUserSchema(WNPRC_BillingSchema.NAME, null, schema.getUser(), schema.getContainer(), WNPRC_BillingSchema.getInstance().getSchema());
            }
        });
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
        return Collections.singleton(WNPRC_BillingSchema.NAME);
    }
}