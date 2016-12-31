/*
 * Copyright (c) 2009-2016 LabKey Corporation
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

package org.labkey.ehr;

import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.json.JSONObject;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.UpgradeCode;
import org.labkey.api.ehr.EHRDemographicsService;
import org.labkey.api.ehr.EHRService;
import org.labkey.api.ehr.buttons.EHRShowEditUIButton;
import org.labkey.api.ehr.buttons.MarkCompletedButton;
import org.labkey.api.ehr.demographics.ActiveAssignmentsDemographicsProvider;
import org.labkey.api.ehr.demographics.ActiveProblemsDemographicsProvider;
import org.labkey.api.ehr.demographics.ActiveTreatmentsDemographicsProvider;
import org.labkey.api.ehr.demographics.ArrivalDemographicsProvider;
import org.labkey.api.ehr.demographics.BirthDemographicsProvider;
import org.labkey.api.ehr.demographics.DeathsDemographicsProvider;
import org.labkey.api.ehr.demographics.DepartureDemographicsProvider;
import org.labkey.api.ehr.demographics.HousingDemographicsProvider;
import org.labkey.api.ehr.demographics.MostRecentWeightDemographicsProvider;
import org.labkey.api.ehr.demographics.WeightsDemographicsProvider;
import org.labkey.api.ehr.security.EHRDataAdminPermission;
import org.labkey.api.ehr.security.EHRSnomedEditPermission;
import org.labkey.api.ldk.ExtendedSimpleModule;
import org.labkey.api.ldk.LDKService;
import org.labkey.api.ldk.buttons.ShowEditUIButton;
import org.labkey.api.ldk.notification.NotificationService;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleContext;
import org.labkey.api.query.DefaultSchema;
import org.labkey.api.query.DetailsURL;
import org.labkey.api.query.QuerySchema;
import org.labkey.api.security.User;
import org.labkey.api.security.roles.RoleManager;
import org.labkey.api.util.ContextListener;
import org.labkey.api.util.JobRunner;
import org.labkey.api.util.StartupListener;
import org.labkey.api.view.ViewContext;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.ehr.buttons.CageBulkEditButton;
import org.labkey.ehr.buttons.CompareWeightsButton;
import org.labkey.ehr.buttons.LocationEditButton;
import org.labkey.ehr.buttons.ProcedureEditButton;
import org.labkey.ehr.buttons.ProjectEditButton;
import org.labkey.ehr.buttons.ProtocolEditButton;
import org.labkey.ehr.buttons.TaskAssignButton;
import org.labkey.ehr.dataentry.DataEntryManager;
import org.labkey.ehr.dataentry.RecordDeleteRunner;
import org.labkey.ehr.demographics.BasicDemographicsProvider;
import org.labkey.ehr.demographics.EHRDemographicsServiceImpl;
import org.labkey.ehr.history.AntibioticSensitivityLabworkType;
import org.labkey.ehr.history.ChemistryLabworkType;
import org.labkey.ehr.history.HematologyLabworkType;
import org.labkey.ehr.history.MicrobiologyLabworkType;
import org.labkey.ehr.history.MiscTestsLabworkType;
import org.labkey.ehr.history.ParasitologyLabworkType;
import org.labkey.ehr.history.SerologyLabworkType;
import org.labkey.ehr.history.iStatLabworkType;
import org.labkey.ehr.notification.DataEntrySummary;
import org.labkey.ehr.notification.DeathNotification;
import org.labkey.ehr.pipeline.GeneticCalculationsJob;
import org.labkey.ehr.query.EHRLookupsUserSchema;
import org.labkey.ehr.query.EHRUserSchema;
import org.labkey.ehr.query.buttons.ExcelImportButton;
import org.labkey.ehr.query.buttons.JumpToHistoryButton;
import org.labkey.ehr.query.buttons.ReturnDistinctButton;
import org.labkey.ehr.query.buttons.ShowAuditHistoryButton;
import org.labkey.ehr.security.EHRBasicSubmitterRole;
import org.labkey.ehr.security.EHRBehaviorEntryRole;
import org.labkey.ehr.security.EHRClinicalEntryRole;
import org.labkey.ehr.security.EHRDataAdminRole;
import org.labkey.ehr.security.EHRDataEntryRole;
import org.labkey.ehr.security.EHRFullSubmitterRole;
import org.labkey.ehr.security.EHRFullUpdaterRole;
import org.labkey.ehr.security.EHRHousingTransferRole;
import org.labkey.ehr.security.EHRLabworkEntryRole;
import org.labkey.ehr.security.EHRLocationManagementRole;
import org.labkey.ehr.security.EHRPathologyEntryRole;
import org.labkey.ehr.security.EHRProcedureManagementRole;
import org.labkey.ehr.security.EHRProtocolManagementRole;
import org.labkey.ehr.security.EHRRequestAdminRole;
import org.labkey.ehr.security.EHRRequestorRole;
import org.labkey.ehr.security.EHRSnomedEditorRole;
import org.labkey.ehr.security.EHRSurgeryEntryRole;
import org.labkey.ehr.security.EHRTemplateCreatorRole;
import org.labkey.ehr.security.EHRVeternarianRole;

import javax.servlet.ServletContext;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;

public class EHRModule extends ExtendedSimpleModule
{
    public static final String NAME = "EHR";
    public static final String CONTROLLER_NAME = "ehr";

    public String getName()
    {
        return NAME;
    }

    public double getVersion()
    {
        return 16.30;
    }

    public boolean hasScripts()
    {
        return true;
    }

    protected void init()
    {
        addController(CONTROLLER_NAME, EHRController.class);
        EHRProperties.register();

        EHRServiceImpl impl = new EHRServiceImpl();
        EHRService.setInstance(impl);
        EHRDemographicsService.setInstance(new EHRDemographicsServiceImpl());

        // NOTE: deliberately register these prior to doStartupAfterSpringConfig(), so other modules
        // can override them
        EHRService.get().registerDemographicsProvider(new BasicDemographicsProvider(this));
        EHRService.get().registerDemographicsProvider(new DepartureDemographicsProvider(this));
        EHRService.get().registerDemographicsProvider(new ActiveAssignmentsDemographicsProvider(this));
        EHRService.get().registerDemographicsProvider(new ActiveProblemsDemographicsProvider(this));
        EHRService.get().registerDemographicsProvider(new ActiveTreatmentsDemographicsProvider(this));
        EHRService.get().registerDemographicsProvider(new ArrivalDemographicsProvider(this));
        EHRService.get().registerDemographicsProvider(new BirthDemographicsProvider(this));
        EHRService.get().registerDemographicsProvider(new DeathsDemographicsProvider(this));
        EHRService.get().registerDemographicsProvider(new HousingDemographicsProvider(this));

        EHRService.get().registerDemographicsProvider(new MostRecentWeightDemographicsProvider(this));
        EHRService.get().registerDemographicsProvider(new WeightsDemographicsProvider(this));

        RoleManager.registerRole(new EHRDataAdminRole());
        RoleManager.registerRole(new EHRRequestorRole());
        RoleManager.registerRole(new EHRBasicSubmitterRole());
        RoleManager.registerRole(new EHRFullSubmitterRole());
        RoleManager.registerRole(new EHRFullUpdaterRole());
        RoleManager.registerRole(new EHRRequestAdminRole());
        RoleManager.registerRole(new EHRTemplateCreatorRole());

        RoleManager.registerRole(new EHRVeternarianRole());
        RoleManager.registerRole(new EHRDataEntryRole());
        RoleManager.registerRole(new EHRClinicalEntryRole());
        RoleManager.registerRole(new EHRSurgeryEntryRole());
        RoleManager.registerRole(new EHRLabworkEntryRole());
        RoleManager.registerRole(new EHRPathologyEntryRole());
        RoleManager.registerRole(new EHRProtocolManagementRole());
        RoleManager.registerRole(new EHRBehaviorEntryRole());
        RoleManager.registerRole(new EHRProcedureManagementRole());
        RoleManager.registerRole(new EHRLocationManagementRole());
        RoleManager.registerRole(new EHRHousingTransferRole());
        RoleManager.registerRole(new EHRSnomedEditorRole());

        EHRService.get().registerLabworkType(new AntibioticSensitivityLabworkType(this));
        EHRService.get().registerLabworkType(new ChemistryLabworkType(this));
        EHRService.get().registerLabworkType(new HematologyLabworkType(this));

        EHRService.get().registerLabworkType(new iStatLabworkType(this));
        EHRService.get().registerLabworkType(new MicrobiologyLabworkType(this));
        EHRService.get().registerLabworkType(new MiscTestsLabworkType(this));
        EHRService.get().registerLabworkType(new ParasitologyLabworkType(this));

        EHRService.get().registerLabworkType(new SerologyLabworkType(this));
    }

    @Nullable
    @Override
    public UpgradeCode getUpgradeCode()
    {
        return new EHRUpgradeCode();
    }

    @Override
    protected void doStartupAfterSpringConfig(ModuleContext moduleContext)
    {
        EHRService.get().registerReportLink(EHRService.REPORT_LINK_TYPE.project, "View All Projects With Active Assignments", this, DetailsURL.fromString("/query/executeQuery.view?schemaName=ehr&query.queryName=Project&query.activeAssignments/activeAssignments~gt=0"), "Quick Links");
        EHRService.get().registerReportLink(EHRService.REPORT_LINK_TYPE.protocol, "View Total Animals Assigned to Each Protocol, By Species", this, DetailsURL.fromString("/query/executeQuery.view?schemaName=ehr&query.queryName=protocolTotalAnimalsBySpecies"), "Quick Links");
        EHRService.get().registerReportLink(EHRService.REPORT_LINK_TYPE.assignment, "Find Assignments Overlapping A Date Range", this, DetailsURL.fromString("/query/executeQuery.view?schemaName=study&query.queryName=assignmentOverlapsById"), "Quick Links");

        //attempt to schedule genetic calculations.  will abort if not enabled
        GeneticCalculationsJob.schedule();
        RecordDeleteRunner.schedule();

        ContextListener.addStartupListener(new StartupListener()
        {
            @Override
            public String getName()
            {
                return "EHRDemographicsService onStartup";
            }

            @Override
            public void moduleStartupComplete(ServletContext servletContext)
            {
                JobRunner.getDefault().execute(() -> {
                    //note: this was moved to run after startup to ensure all modules have registered
                    DataEntryManager.get().primeAllCaches();

                    EHRDemographicsServiceImpl.get().onStartup();
                }, 10000);
            }
        });

        //buttons
        EHRService.get().registerMoreActionsButton(new JumpToHistoryButton(this), "study", LDKService.ALL_TABLES);
        EHRService.get().registerMoreActionsButton(new ReturnDistinctButton(this), "study", LDKService.ALL_TABLES);
        EHRService.get().registerMoreActionsButton(new ShowAuditHistoryButton(this), "study", LDKService.ALL_TABLES);
        EHRService.get().registerMoreActionsButton(new ShowAuditHistoryButton(this), "study", LDKService.ALL_TABLES);

        EHRService.get().registerMoreActionsButton(new CompareWeightsButton(this), "study", "weight");
        EHRService.get().registerMoreActionsButton(new TaskAssignButton(this), "ehr", "my_tasks");
        EHRService.get().registerMoreActionsButton(new TaskAssignButton(this), "ehr", "tasks");
        EHRService.get().registerMoreActionsButton(new MarkCompletedButton(this, "study", "treatment_order", "Set End Date"), "study", "treatment_order");
        EHRService.get().registerMoreActionsButton(new MarkCompletedButton(this, "study", "problem", "End Problem(s)", true), "study", "problem");
        EHRService.get().registerMoreActionsButton(new MarkCompletedButton(this, "study", "feeding"), "study", "feeding");
        EHRService.get().registerMoreActionsButton(new MarkCompletedButton(this, "study", "parentage", "End Selected Calls", true), "study", "parentage");
        EHRService.get().registerMoreActionsButton(new ExcelImportButton(this, "study", "parentage", "Import Data"), "study", "parentage");

        EHRService.get().registerMoreActionsButton(new ProtocolEditButton(this, "ehr", "protocol"), "ehr", "protocol");
        EHRService.get().registerMoreActionsButton(new ProtocolEditButton(this, "ehr", "protocol_counts"), "ehr", "protocol_counts");
        EHRService.get().registerMoreActionsButton(new ProtocolEditButton(this, "ehr", "protocolexemptions"), "ehr", "protocolexemptions");
        EHRService.get().registerMoreActionsButton(new ProtocolEditButton(this, "ehr", "protocolprocedures"), "ehr", "protocolprocedures");
        EHRService.get().registerMoreActionsButton(new ProjectEditButton(this, "ehr", "project"), "ehr", "project");
        EHRService.get().registerMoreActionsButton(new LocationEditButton(this, "ehr_lookups", "rooms"), "ehr_lookups", "rooms");
        EHRService.get().registerMoreActionsButton(new LocationEditButton(this, "ehr_lookups", "rooms"), "ehr_lookups", "roomUtilization");
        EHRService.get().registerMoreActionsButton(new LocationEditButton(this, "ehr_lookups", "cage"), "ehr_lookups", "cage");
        EHRService.get().registerMoreActionsButton(new CageBulkEditButton(this), "ehr_lookups", "cage");
        EHRService.get().registerMoreActionsButton(new EHRShowEditUIButton(this, "ehr_lookups", "drug_defaults", EHRSnomedEditPermission.class), "ehr_lookups", "drug_defaults");
        EHRService.get().registerMoreActionsButton(new EHRShowEditUIButton(this, "ehr_lookups", "drug_defaults", EHRSnomedEditPermission.class), "ehr_lookups", "snomed_subset_codes");

        EHRService.get().registerMoreActionsButton(new ProcedureEditButton(this, EHRSchema.EHR_LOOKUPS, "procedures"), EHRSchema.EHR_LOOKUPS, "procedures");
        EHRService.get().registerMoreActionsButton(new ProcedureEditButton(this, EHRSchema.EHR_LOOKUPS, "procedure_default_flags"), EHRSchema.EHR_LOOKUPS, "procedure_default_flags");
        EHRService.get().registerMoreActionsButton(new ProcedureEditButton(this, EHRSchema.EHR_LOOKUPS, "procedure_default_treatments"), EHRSchema.EHR_LOOKUPS, "procedure_default_treatments");
        EHRService.get().registerMoreActionsButton(new ProcedureEditButton(this, EHRSchema.EHR_LOOKUPS, "procedure_default_charges"), EHRSchema.EHR_LOOKUPS, "procedure_default_charges");
        EHRService.get().registerMoreActionsButton(new ProcedureEditButton(this, EHRSchema.EHR_LOOKUPS, "procedure_default_codes"), EHRSchema.EHR_LOOKUPS, "procedure_default_codes");
        EHRService.get().registerMoreActionsButton(new ProcedureEditButton(this, EHRSchema.EHR_LOOKUPS, "procedure_default_comments"), EHRSchema.EHR_LOOKUPS, "procedure_default_comments");

        EHRService.get().registerMoreActionsButton(new ShowEditUIButton(this, EHRSchema.EHR_SCHEMANAME, EHRSchema.TABLE_ANIMAL_GROUPS, EHRDataAdminPermission.class), EHRSchema.EHR_SCHEMANAME, EHRSchema.TABLE_ANIMAL_GROUPS);
        EHRService.get().registerMoreActionsButton(new ShowEditUIButton(this, EHRSchema.EHR_LOOKUPS, EHRSchema.TABLE_FLAG_VALUES, EHRDataAdminPermission.class), EHRSchema.EHR_LOOKUPS, EHRSchema.TABLE_FLAG_VALUES);

        LDKService.get().registerSiteSummaryNotification(new DataEntrySummary());
        NotificationService.get().registerNotification(new DeathNotification());

        LDKService.get().registerContainerScopedTable(EHRSchema.EHR_LOOKUPS, EHRSchema.TABLE_SNOMED, "code");
        LDKService.get().registerContainerScopedTable(EHRSchema.EHR_SCHEMANAME, EHRSchema.TABLE_PROJECT, "project");
        //this is not a true PK, but we want to enforce uniqueness
        LDKService.get().registerContainerScopedTable(EHRSchema.EHR_SCHEMANAME, EHRSchema.TABLE_PROJECT, "name");
        LDKService.get().registerContainerScopedTable(EHRSchema.EHR_SCHEMANAME, EHRSchema.TABLE_PROTOCOL, "protocol");
    }

    @Override
    public void registerSchemas()
    {
        for (final String schemaName : getSchemaNames())
        {
            final DbSchema dbschema = DbSchema.get(schemaName);
            DefaultSchema.registerProvider(schemaName, new DefaultSchema.SchemaProvider(this)
            {
                public QuerySchema createSchema(final DefaultSchema schema, Module module)
                {
                    if (schemaName.equalsIgnoreCase(EHRSchema.EHR_LOOKUPS))
                        return new EHRLookupsUserSchema(schema.getUser(), schema.getContainer(), dbschema);
                    else if (schemaName.equalsIgnoreCase(EHRSchema.EHR_SCHEMANAME))
                        return new EHRUserSchema(schema.getUser(), schema.getContainer(), dbschema);
                    else
                        return null;
                }
            });
        }
    }

    @Override
    @NotNull
    public Collection<String> getSchemaNames()
    {
        return Arrays.asList(EHRSchema.EHR_SCHEMANAME, EHRSchema.EHR_LOOKUPS);
    }

    @NotNull
    @Override
    public JSONObject getPageContextJson(ViewContext context)
    {
        Map<String, Object> ret = new HashMap<>();
        Container c = context.getContainer();
        Map<String, String> map = getDefaultPageContextJson(c);
        ret.putAll(map);

        if (map.containsKey(EHRManager.EHRStudyContainerPropName) && map.get(EHRManager.EHRStudyContainerPropName) != null)
        {
            User u = context.getUser();

            //normalize line endings
            String newPath = map.get(EHRManager.EHRStudyContainerPropName);
            newPath = "/" + newPath.replaceAll("^/|/$", "");
            ret.put(EHRManager.EHRStudyContainerPropName, newPath);

            Container ehrContainer = ContainerManager.getForPath(map.get(EHRManager.EHRStudyContainerPropName));
            if(ehrContainer != null)
            {
                ret.put("EHRStudyContainerInfo", ehrContainer.toJSON(u));

                Set<String> moduleNames = new TreeSet<>();
                Set<Module> activeModules = ehrContainer.getActiveModules();
                for (Module m : EHRService.get().getRegisteredModules())
                {
                    if (activeModules.contains(m))
                        moduleNames.add(m.getName());
                }
                ret.put("EHRModules", new JSONObject(moduleNames));
            }

            //merge client context for registered modules, if they are enabled in current folder
            for (Module m : EHRService.get().getRegisteredModules())
            {
                if (c.getActiveModules().contains(m))
                {
                    JSONObject json = m.getPageContextJson(context);
                    for (String prop : json.keySet())
                    {
                        ret.put(prop, json.get(prop));
                    }
                }
            }
        }

        return new JSONObject(ret);
    }

    @Override
    public @NotNull LinkedHashSet<ClientDependency> getClientDependencies(Container c)
    {
        // allow other modules to register with EHR service, and include them when the module is turned on
        LinkedHashSet<ClientDependency> ret = new LinkedHashSet<>();
        ret.addAll(super.getClientDependencies(c));
        ret.addAll(EHRService.get().getRegisteredClientDependencies(c));

        return ret;
    }
}
