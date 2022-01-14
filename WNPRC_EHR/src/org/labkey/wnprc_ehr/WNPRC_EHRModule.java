/*
 * Copyright (c) 2012-2014 LabKey Corporation
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
package org.labkey.wnprc_ehr;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.junit.Assert;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.ehr.EHRService;
import org.labkey.api.ehr.buttons.ChangeQCStateButton;
import org.labkey.api.ehr.buttons.CreateTaskFromIdsButton;
import org.labkey.api.ehr.buttons.CreateTaskFromRecordsButton;
import org.labkey.api.ehr.buttons.MarkCompletedButton;
import org.labkey.api.ehr.dataentry.DataEntryForm;
import org.labkey.api.ehr.dataentry.DefaultDataEntryFormFactory;
import org.labkey.api.ehr.security.EHRStartedAdminPermission;
import org.labkey.api.ehr.security.EHRStartedDeletePermission;
import org.labkey.api.ehr.security.EHRStartedInsertPermission;
import org.labkey.api.ehr.security.EHRStartedUpdatePermission;
import org.labkey.api.ehr.history.DefaultClinicalRemarksDataSource;
import org.labkey.api.ehr.history.iStatLabworkType;
import org.labkey.api.ldk.ExtendedSimpleModule;
import org.labkey.api.ldk.notification.Notification;
import org.labkey.api.ldk.notification.NotificationService;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleContext;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.query.DefaultSchema;
import org.labkey.api.query.DetailsURL;
import org.labkey.api.query.QuerySchema;
import org.labkey.api.resource.Resource;
import org.labkey.api.security.permissions.AdminOperationsPermission;
import org.labkey.api.security.roles.RoleManager;
import org.labkey.api.settings.AdminConsole;
import org.labkey.api.view.WebPartFactory;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.AzureAuthentication.AzureAccessTokenRefreshSettings;
import org.labkey.wnprc_ehr.AzureAuthentication.AzureAccessTokenRefreshRunnable;
import org.labkey.wnprc_ehr.bc.BCReportRunner;
import org.labkey.wnprc_ehr.buttons.ChangeBloodQCButton;
import org.labkey.wnprc_ehr.buttons.CreateTaskButton;
import org.labkey.wnprc_ehr.buttons.DuplicateTaskButton;
import org.labkey.wnprc_ehr.buttons.MarkReviewedButton;
import org.labkey.wnprc_ehr.buttons.WNPRCAddRecordsButton;
import org.labkey.wnprc_ehr.buttons.WNPRCGoToTaskButton;
import org.labkey.wnprc_ehr.dataentry.ProtocolDataEntry.ProtocolForm;
import org.labkey.wnprc_ehr.dataentry.forms.Arrival.ArrivalFormType;
import org.labkey.wnprc_ehr.dataentry.forms.Assignment.AssignmentForm;
import org.labkey.wnprc_ehr.dataentry.forms.BehaviorAbstract.BehaviorAbstractForm;
import org.labkey.wnprc_ehr.dataentry.forms.NecropsyAbstract.NecropsyAbstractForm;
import org.labkey.wnprc_ehr.dataentry.forms.Biopsy.BiopsyForm;
import org.labkey.wnprc_ehr.dataentry.forms.Birth.BirthFormType;
import org.labkey.wnprc_ehr.dataentry.forms.BloodDrawRequest.BloodDrawRequestForm;
import org.labkey.wnprc_ehr.dataentry.forms.BloodDraws.BloodDrawsForm;
import org.labkey.wnprc_ehr.dataentry.forms.Breeding;
import org.labkey.wnprc_ehr.dataentry.forms.Clinpath.ClinpathForm;
import org.labkey.wnprc_ehr.dataentry.forms.ClinpathRequest.ClinpathRequestForm;
import org.labkey.wnprc_ehr.dataentry.forms.Death.DeathForm;
import org.labkey.wnprc_ehr.dataentry.forms.FoodDeprives.FoodDepriveCompleteForm;
import org.labkey.wnprc_ehr.dataentry.forms.FoodDeprives.FoodDeprivesStartForm;
import org.labkey.wnprc_ehr.dataentry.forms.FoodDeprivesRequest.FoodDeprivesRequestForm;
import org.labkey.wnprc_ehr.dataentry.forms.Housing.HousingForm;
import org.labkey.wnprc_ehr.dataentry.forms.HousingRequest.HousingRequestForm;
import org.labkey.wnprc_ehr.dataentry.forms.InRooms.InRoomsForm;
import org.labkey.wnprc_ehr.dataentry.forms.IrregularObservations.IrregularObservationsFormType;
import org.labkey.wnprc_ehr.dataentry.forms.MPR.MPRForm;
import org.labkey.wnprc_ehr.dataentry.forms.Necropsy.NecropsyForm;
import org.labkey.wnprc_ehr.dataentry.forms.Necropsy.NecropsyRequestForm;
import org.labkey.wnprc_ehr.dataentry.forms.PhysicalExamNWM.PhysicalExamNWMForm;
import org.labkey.wnprc_ehr.dataentry.forms.PhysicalExamOWM.PhysicalExamOWMForm;
import org.labkey.wnprc_ehr.dataentry.forms.ProblemList.ProblemListForm;
import org.labkey.wnprc_ehr.dataentry.forms.ProcedureRequest.ProcedureRequestForm;
import org.labkey.wnprc_ehr.dataentry.forms.ResearchUltrasounds.ResearchUltrasoundsForm;
import org.labkey.wnprc_ehr.dataentry.forms.ResearchUltrasounds.ResearchUltrasoundsReviewForm;
import org.labkey.wnprc_ehr.dataentry.forms.ResearchUltrasounds.ResearchUltrasoundsTaskForm;
import org.labkey.wnprc_ehr.dataentry.forms.Surgery.SurgeryForm;
import org.labkey.wnprc_ehr.dataentry.forms.SurgeryProcedureRequest.MultipleSurgeryProcedureRequestForm;
import org.labkey.wnprc_ehr.dataentry.forms.SurgeryProcedureRequest.SurgeryProcedureRequestForm;
import org.labkey.wnprc_ehr.dataentry.forms.TBTests.TBTestsForm;
import org.labkey.wnprc_ehr.dataentry.forms.TreatmentOrders.TreatmentOrdersForm;
import org.labkey.wnprc_ehr.dataentry.forms.Treatments.TreatmentsForm;
import org.labkey.wnprc_ehr.dataentry.forms.VVC.VVCForm;
import org.labkey.wnprc_ehr.dataentry.forms.VVC.VVCRequestForm;
import org.labkey.wnprc_ehr.dataentry.forms.WaterMonitoring.EnterMultipleWater;
import org.labkey.wnprc_ehr.dataentry.forms.WaterMonitoring.EnterSingleDayWater;
import org.labkey.wnprc_ehr.dataentry.forms.WaterMonitoring.EnterWater;
import org.labkey.wnprc_ehr.dataentry.forms.WaterMonitoring.EnterWaterOrder;
import org.labkey.wnprc_ehr.dataentry.forms.Weight.WeightForm;
import org.labkey.wnprc_ehr.demographics.MedicalFieldDemographicsProvider;
import org.labkey.wnprc_ehr.demographics.MostRecentObsDemographicsProvider;
import org.labkey.wnprc_ehr.history.DefaultAlopeciaDataSource;
import org.labkey.wnprc_ehr.history.DefaultBodyConditionDataSource;
import org.labkey.wnprc_ehr.history.DefaultTBDataSource;
import org.labkey.wnprc_ehr.history.WNPRCUrinalysisLabworkType;
import org.labkey.wnprc_ehr.notification.AnimalRequestNotificationUpdate;
import org.labkey.wnprc_ehr.notification.BehaviorNotification;
import org.labkey.wnprc_ehr.notification.ColonyAlertsNotification;
import org.labkey.wnprc_ehr.notification.DeathNotification;
import org.labkey.wnprc_ehr.notification.FoodCompletedProblemsNotification;
import org.labkey.wnprc_ehr.notification.FoodNotCompletedNotification;
import org.labkey.wnprc_ehr.notification.FoodNotStartedNoonNotification;
import org.labkey.wnprc_ehr.notification.FoodNotStartedNotification;
import org.labkey.wnprc_ehr.notification.IrregularObsBehaviorNotification;
import org.labkey.wnprc_ehr.notification.ProjectRequestNotification;
import org.labkey.wnprc_ehr.notification.TreatmentAlertsNotification;
import org.labkey.wnprc_ehr.notification.ViralLoadQueueNotification;
import org.labkey.wnprc_ehr.notification.VvcNotification;
import org.labkey.wnprc_ehr.notification.WaterMonitoringAnimalWithOutEntriesNotification;
import org.labkey.wnprc_ehr.notification.AnimalRequestNotification;
import org.labkey.wnprc_ehr.notification.WaterOrdersAlertNotification;
import org.labkey.wnprc_ehr.pages.husbandry.WaterCalendarWebPartFactory;
import org.labkey.wnprc_ehr.schemas.WNPRC_Schema;
import org.labkey.wnprc_ehr.security.permissions.BehaviorAssignmentsPermission;
import org.labkey.wnprc_ehr.security.roles.BehaviorServiceWorker;
import org.labkey.wnprc_ehr.security.roles.WNPRCAnimalRequestsRole;
import org.labkey.wnprc_ehr.security.roles.WNPRCEHRFullSubmitterRole;
import org.labkey.wnprc_ehr.security.roles.WNPRCEHRRequestorSchedulerRole;
import org.labkey.wnprc_ehr.security.roles.WNPRCFullSubmitterWithReviewerRole;
import org.labkey.wnprc_ehr.table.WNPRC_EHRCustomizer;
import org.labkey.wnprc_ehr.updates.ModuleUpdate;
import org.reflections.Reflections;

import java.io.File;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Set;
import java.util.function.Supplier;
import java.util.stream.Collectors;

/**
 * User: bbimber
 * Date: 5/16/12
 * Time: 1:52 PM
 */
public class WNPRC_EHRModule extends ExtendedSimpleModule
{
    public static final String NAME = "WNPRC_EHR";
    public static final String CONTROLLER_NAME = "wnprc_ehr";
    public static final String TEST_CONTROLLER_NAME = "wnprc_test";
    public static final String WNPRC_Category_Name = NAME;
    public static final WebPartFactory waterCalendarWebPart = new WaterCalendarWebPartFactory();

    /**
     * Logger for logging the logs
     */
    private static final Logger LOG = LogManager.getLogger(WNPRC_EHRModule.class);

    /**
     * Flag (from the JVM) to indicate we should force the module to re-run all updates
     * regardless of the actual module version
     */
    private boolean forceUpdate = Boolean.getBoolean("labkey.module.forceupdate");

    /**
     * Flag indicating we should load the study metadata on module startup
     */
    private boolean loadOnStart = false;

    public String getName()
    {
        return NAME;
    }

    @Override
    public @Nullable Double getSchemaVersion() {
        return forceUpdate ? Double.POSITIVE_INFINITY : 21.005;
    }

    @Override
    public boolean hasScripts() {
        return true;
    }

    @Override
    protected void init() {
        addController(CONTROLLER_NAME, WNPRC_EHRController.class);
        addController(TEST_CONTROLLER_NAME, WNPRC_EHRTestController.class);

        registerRoles();
        registerPermissions();
    }

        @NotNull
        protected Collection<WebPartFactory> createWebPartFactories()
        {
            return new ArrayList<>(Arrays.asList(waterCalendarWebPart));
        }

        @Override
        protected void doStartupAfterSpringConfig(ModuleContext moduleContext)
        {
        ModuleUpdate.onStartup(moduleContext, this);

        EHRService.get().registerModule(this);
        EHRService.get().registerTableCustomizer(this, WNPRC_EHRCustomizer.class);
        Resource r = getModuleResource("/scripts/wnprc_ehr/wnprc_triggers.js");
        assert r != null;
        EHRService.get().registerTriggerScript(this, r);
        EHRService.get().registerClientDependency(ClientDependency.supplierFromPath("ehr/ehr_ext3_api"), this);
        EHRService.get().registerClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/wnprcCoreUtils.js"), this);
        EHRService.get().registerClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/wnprcOverRides.js"), this);
        EHRService.get().registerClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/wnprcReports.js"), this);
        EHRService.get().registerClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/wnprcHusbandryReports.js"), this);
        EHRService.get().registerClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/datasetButtons.js"), this);
        EHRService.get().registerClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/animalPortal.js"), this);
        EHRService.get().registerClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/animalWaterCalendar.js"), this);
        EHRService.get().registerClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/reports/PregnancyReport.js"), this);
        EHRService.get().registerClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/reports/ResearchUltrasoundsReport.js"), this);
        EHRService.get().registerClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/Inroom.js"), this);

        EHRService.get().registerReportLink(EHRService.REPORT_LINK_TYPE.housing, "List Single-housed Animals", this, DetailsURL.fromString("/query/executeQuery.view?schemaName=study&query.queryName=Demographics&query.viewName=Single%20Housed"), "Commonly Used Queries");
        EHRService.get().registerReportLink(EHRService.REPORT_LINK_TYPE.housing, "View Roommate History for Animals", this, DetailsURL.fromString("/ehr/animalHistory.view#inputType:singleSubject&activeReport:roommateHistory"), "Commonly Used Queries");
        EHRService.get().registerReportLink(EHRService.REPORT_LINK_TYPE.housing, "Find Animals Housed In A Given Room/Cage At A Specific Time", this, DetailsURL.fromString("/ehr/housingOverlaps.view?groupById=1"), "Commonly Used Queries");

        EHRService.get().registerReportLink(EHRService.REPORT_LINK_TYPE.animalSearch, "All Living Center Animals", this, DetailsURL.fromString("/query/executeQuery.view?schemaName=study&query.queryName=Demographics&query.viewName=Alive%2C at Center"), "Browse Animals");
        EHRService.get().registerReportLink(EHRService.REPORT_LINK_TYPE.animalSearch, "All Center Animals", this, DetailsURL.fromString("/query/executeQuery.view?schemaName=study&query.queryName=Demographics"), "Browse Animals");
        EHRService.get().registerReportLink(EHRService.REPORT_LINK_TYPE.animalSearch, "Assigned To Breeding", this, DetailsURL.fromString("/query/executeQuery.view?schemaName=study&query.queryName=Demographics&query.Id/activeAssignments/availability~contains=b"), "Browse Animals");

        EHRService.get().registerReportLink(EHRService.REPORT_LINK_TYPE.animalSearch, "All Living Center Macaques Plus MHC Typing", this, DetailsURL.fromString("/query/executeQuery.view?schemaName=study&query.queryName=Demographics&query.viewName=Living Rhesus Plus MHC Typing"), "Browse Animals");
        EHRService.get().registerReportLink(EHRService.REPORT_LINK_TYPE.animalSearch, "Living With SIV", this, DetailsURL.fromString("/query/executeQuery.view?schemaName=study&query.queryName=Demographics&query.viewName=Living With SIV"), "Browse Animals");
        EHRService.get().registerReportLink(EHRService.REPORT_LINK_TYPE.animalSearch, "MHC SSP Data", this, DetailsURL.fromString("/query/executeQuery.view?schemaName=study&query.queryName=SSP_Pivot"), "Browse Animals");
        EHRService.get().registerReportLink(EHRService.REPORT_LINK_TYPE.animalSearch, "Single Housed Animals", this, DetailsURL.fromString("/query/executeQuery.view?schemaName=study&query.queryName=Demographics&query.viewName=Single Housed"), "Browse Animals");
        EHRService.get().registerReportLink(EHRService.REPORT_LINK_TYPE.animalSearch, "TB: Untested In Past 4 months", this, DetailsURL.fromString("/query/executeQuery.view?schemaName=study&query.queryName=Demographics&query.viewName=TB Older Than 4 Months"), "Browse Animals");
        EHRService.get().registerReportLink(EHRService.REPORT_LINK_TYPE.animalSearch, "Unassigned Animals", this, DetailsURL.fromString("/query/executeQuery.view?schemaName=study&query.queryName=Demographics&query.viewName=Unassigned%20Animals"), "Browse Animals");
        EHRService.get().registerReportLink(EHRService.REPORT_LINK_TYPE.animalSearch, "Unassigned Rhesus Plus MHC Typing", this, DetailsURL.fromString("/query/executeQuery.view?schemaName=study&query.queryName=Demographics&query.viewName=Unassigned%20Rhesus%20With%20MHC%20Typing"), "Browse Animals");
        EHRService.get().registerReportLink(EHRService.REPORT_LINK_TYPE.animalSearch, "Unweighed In Past 45 Days", this, DetailsURL.fromString("/query/executeQuery.view?schemaName=study&query.queryName=Demographics&query.viewName=Unweighed%20Over%2045%20Days"), "Browse Animals");
        EHRService.get().registerReportLink(EHRService.REPORT_LINK_TYPE.animalSearch, "List Most Recent Body Condition Code For Each Animal in the Colony", this, DetailsURL.fromString("/query/executeQuery.view?schemaName=study&query.queryName=Current Colony Condition"), "Browse Animals");
        EHRService.get().registerReportLink(EHRService.REPORT_LINK_TYPE.animalSearch, "List Of All Animals On Research Assignments During The Given Date Range", this, DetailsURL.fromString("/query/executeQuery.view?schemaName=study&query.queryName=totalResearchAssignmentsDuringRange"), "Browse Animals");

        EHRService.get().registerReportLink(EHRService.REPORT_LINK_TYPE.animalSearch, "Population Summary By Species, Gender and Age", this, DetailsURL.fromString("/query/executeQuery.view?schemaName=study&query.queryName=colonyPopulationByAge"), "Other Searches");
        EHRService.get().registerReportLink(EHRService.REPORT_LINK_TYPE.animalSearch, "Find Animals Housed At The Center Over A Date Range", this, DetailsURL.fromString("/ehr/housingOverlaps.view?groupById=1"), "Other Searches");
        EHRService.get().registerReportLink(EHRService.REPORT_LINK_TYPE.animalSearch, "List Singly-Housed Animals At The Center On A Given Date", this, DetailsURL.fromString("/query/executeQuery.view?schemaName=study&query.queryName=SinglyHousedAnimals"), "Other Searches");

        EHRService.get().registerDemographicsProvider(new MostRecentObsDemographicsProvider(this));
        EHRService.get().registerDemographicsProvider(new MedicalFieldDemographicsProvider(this));

        //buttons
        EHRService.get().registerMoreActionsButton(new WNPRCGoToTaskButton(this, "Assignment"), "study", "assignment");
        EHRService.get().registerMoreActionsButton(new WNPRCAddRecordsButton(this, "feeding"), "study", "feeding");
        EHRService.get().registerMoreActionsButton(new DuplicateTaskButton(this), "ehr", "Tasks_DataEntry");
        EHRService.get().registerMoreActionsButton(new DuplicateTaskButton(this), "ehr", "my_tasks");
        EHRService.get().registerMoreActionsButton(new MarkCompletedButton(this, "study", "assignment", "End Assignments"), "study", "assignment");
        EHRService.get().registerMoreActionsButton(new ChangeQCStateButton(this), "study", "foodDeprives");
        EHRService.get().registerMoreActionsButton(new ChangeQCStateButton(this), "study", "clinPathRuns");
        EHRService.get().registerMoreActionsButton(new CreateTaskFromRecordsButton(this, "Create Task From Selected", "Food Deprives", FoodDeprivesStartForm.NAME), "study", "foodDeprives");
        EHRService.get().registerMoreActionsButton(new CreateTaskFromRecordsButton(this, "Create Task From Selected", "Blood Draws", BloodDrawsForm.NAME), "study", "blood");
        EHRService.get().registerMoreActionsButton(new CreateTaskFromIdsButton(this, "Schedule Blood Draw For Selected", "Blood Draws", BloodDrawsForm.NAME, new String[]{"Blood Draws"}), "study", "demographics");
        EHRService.get().registerMoreActionsButton(new MarkReviewedButton(this), "study", "clinPathRuns");
        EHRService.get().registerMoreActionsButton(new CreateTaskButton(this, "Clinpath"), "study", "clinPathRuns");
        EHRService.get().registerMoreActionsButton(new CreateTaskButton(this, "Blood Draws"), "study", "blood");
        EHRService.get().registerMoreActionsButton(new CreateTaskButton(this, "Weight"), "study", "demographics");
        EHRService.get().registerMoreActionsButton(new ChangeBloodQCButton(this), "study", "blood");

        //override pages
        EHRService.get().registerActionOverride("dataEntry", this, "views/dataEntry.html");

        EHRService.get().registerOptionalClinicalHistoryResources(this);
        EHRService.get().registerHistoryDataSource(new DefaultAlopeciaDataSource(this));
        EHRService.get().registerHistoryDataSource(new DefaultBodyConditionDataSource(this));
        EHRService.get().registerHistoryDataSource(new DefaultTBDataSource(this));
        EHRService.get().registerHistoryDataSource(new DefaultClinicalRemarksDataSource(this));
        EHRService.get().registerLabworkType(new iStatLabworkType(this));

        EHRService.get().addModuleRequiringLegacyExt3EditUI(this);

        this.registerNotifications();
        this.registerDataEntryForms();

        EHRService.get().registerLabworkType(new WNPRCUrinalysisLabworkType(this));

        BCReportRunner.schedule();
        
        AdminConsole.addLink(AdminConsole.SettingsLinkType.Management, "azure auth settings", DetailsURL.fromString("/WNPRC_EHR/azureAuthenticationSettings.view").getActionURL(), AdminOperationsPermission.class);

        //Schedule jobs to refresh the access tokens for all Microsoft Azure accounts
        for (String name : AzureAccessTokenRefreshSettings.get().getNames()) {
            Thread refreshThread = new Thread(new AzureAccessTokenRefreshRunnable(name));
            refreshThread.setDaemon(true);
            refreshThread.start();
        }

        EHRService es = EHRService.get();
        if (loadOnStart) loadLatestDatasetMetadata(es);
    }

    private void registerPermissions() {
        RoleManager.registerPermission(new BehaviorAssignmentsPermission());
        RoleManager.registerPermission(new EHRStartedAdminPermission());
        RoleManager.registerPermission(new EHRStartedUpdatePermission());
        RoleManager.registerPermission(new EHRStartedDeletePermission());
        RoleManager.registerPermission(new EHRStartedInsertPermission());
    }

    @Override
    @NotNull
    public Set<String> getSchemaNames() {
        return Collections.singleton(WNPRC_Schema.NAME);
    }

    static public List<Supplier<ClientDependency>> getDataEntryClientDependencies() {
        List<Supplier<ClientDependency>> dataEntryClientDependencies = new ArrayList<>();

        List<String> paths = Arrays.asList(
                "/wnprc_ehr/wnprc_ext4",
                "/wnprc_ehr/dataentry"
        );

        for(String path : paths) {
            dataEntryClientDependencies.add(ClientDependency.supplierFromPath(path));
        }

        return dataEntryClientDependencies;
    }

    @Override
    public void registerSchemas() {
        DefaultSchema.registerProvider(WNPRC_Schema.NAME, new DefaultSchema.SchemaProvider(this) {
            @Override
            public QuerySchema createSchema(final DefaultSchema schema, Module module) {
                return new WNPRC_Schema(schema.getUser(), schema.getContainer());
            }
        });
    }

    public static String BC_GOOGLE_DRIVE_PROPERTY_NAME = "BCGoogleDriveAccount";
    public String getGoogleDriveAccountId(Container container) {
        return this.getModuleProperties().get(BC_GOOGLE_DRIVE_PROPERTY_NAME).getEffectiveValue(container);
    }

    @Override
    public @NotNull
    List<Supplier<ClientDependency>> getClientDependencies(Container c) {
        // allow other modules to register with EHR service, and include them when the module is turned on
        List<Supplier<ClientDependency>> ret = new LinkedList<>();
        ret.addAll(super.getClientDependencies(c));
        ret.addAll(EHRService.get().getRegisteredClientDependencies(c));

        //My stuff here...

        return ret;
    }

    public void registerNotifications() {
        List<Notification> notifications = Arrays.asList(
                new BehaviorNotification(this),
                new DeathNotification(),
                new ColonyAlertsNotification(this),
                new TreatmentAlertsNotification(this),
                new VvcNotification(this),
                new FoodNotStartedNotification(this),
                new FoodNotStartedNoonNotification(this),
                new FoodNotCompletedNotification(this),
                new FoodCompletedProblemsNotification(this),
                new AnimalRequestNotification(this),
                new AnimalRequestNotificationUpdate(this),
                new ProjectRequestNotification(this),
                new IrregularObsBehaviorNotification(this),
                new ViralLoadQueueNotification(this),
                new WaterOrdersAlertNotification(this),
                new WaterMonitoringAnimalWithOutEntriesNotification(this)
        );

        for (Notification notification : notifications)
        {
            NotificationService.get().registerNotification(notification);
        }
    }

    public void registerDataEntryForms() {
        // Register all of the data entry forms.
        List<Class<? extends DataEntryForm>> forms = Arrays.asList(
                ArrivalFormType.class,
                AssignmentForm.class,
                BehaviorAbstractForm.class,
                BirthFormType.class,
                BiopsyForm.class,
                BloodDrawRequestForm.class,
                BloodDrawsForm.class,
                ClinpathForm.class,
                ClinpathRequestForm.class,
                DeathForm.class,
                HousingForm.class,
                HousingRequestForm.class,
                InRoomsForm.class,
                IrregularObservationsFormType.class,
                MPRForm.class,
                NecropsyAbstractForm.class,
                NecropsyForm.class,
                NecropsyRequestForm.class,
                SurgeryProcedureRequestForm.class,
                MultipleSurgeryProcedureRequestForm.class,
                PhysicalExamNWMForm.class,
                PhysicalExamOWMForm.class,
                ProblemListForm.class,
                ProcedureRequestForm.class,
                SurgeryForm.class,
                TBTestsForm.class,
                TreatmentOrdersForm.class,
                TreatmentsForm.class,
                WeightForm.class,
                VVCRequestForm.class,
                VVCForm.class,
                WeightForm.class,
                FoodDeprivesStartForm.class,
                FoodDepriveCompleteForm.class,
                FoodDeprivesRequestForm.class,
                ProtocolForm.class,
                ResearchUltrasoundsForm.class,
                ResearchUltrasoundsTaskForm.class,
                ResearchUltrasoundsReviewForm.class,
                ProtocolForm.class,
                EnterWater.class,
                EnterMultipleWater.class,
                EnterWaterOrder.class,
                EnterSingleDayWater.class

        );
        for (Class<? extends DataEntryForm> form : forms)
        {
            EHRService.get().registerFormType(new DefaultDataEntryFormFactory(form, this));
        }

        // load all the breeding forms (which are embedded in the Breeding class)
        Breeding.registerDataEntryForms(EHRService.get(), this);
        Breeding.registerSingleFormOverrides(EHRService.get(), this);
    }

    public void registerRoles() {
        RoleManager.registerRole(new WNPRCFullSubmitterWithReviewerRole());
        RoleManager.registerRole(new BehaviorServiceWorker());
        RoleManager.registerRole(new WNPRCEHRRequestorSchedulerRole());
        RoleManager.registerRole(new WNPRCEHRFullSubmitterRole());
        RoleManager.registerRole(new WNPRCAnimalRequestsRole());
    }

    public Set<Container> getWNPRCStudyContainers() {
        Set<Container> studyContainers = new HashSet<>();
        WNPRC_EHRModule module = ModuleLoader.getInstance().getModule(WNPRC_EHRModule.class);

        for (Container container : getAllContainers()) {
            if (container.getActiveModules().contains(module)) {
                Container studyContainer = EHRService.get().getEHRStudyContainer(container);
                if (studyContainer != null) {
                    studyContainers.add(studyContainer);
                }
            }
        }

        return studyContainers;
    }

    public static Set<Container> getAllContainers() {

        Container root = ContainerManager.getRoot();
        return new HashSet<>(getChildContainers(root));
    }

    public static Set<Container> getChildContainers(Container parentContainer) {
        Set<Container> containers = new HashSet<>();

        for (Container container : parentContainer.getChildren()) {
            containers.add(container);
            containers.addAll(getChildContainers(container));
        }

        return containers;
    }

    public static Container getDefaultContainer() {
        if (ContainerManager.getForPath("/WNPRC") == null) {
            ContainerManager.createContainer(ContainerManager.getRoot(), "WNPRC");
        }
        Container wnprcContainer = ContainerManager.getForPath("/WNPRC");

        Container ehrContainer = wnprcContainer.getChild("EHR");
        if (ehrContainer == null) {
            ContainerManager.createContainer(wnprcContainer, "EHR");
            ehrContainer = wnprcContainer.getChild("EHR");
        }

        return ehrContainer;
    }

    @Override
    public void afterUpdate(ModuleContext moduleContext)
    {
       super.afterUpdate(moduleContext);
       ModuleUpdate.doAfterUpdate(moduleContext);
    }

   @Override
   public void beforeUpdate(ModuleContext moduleContext)
   {
       super.beforeUpdate(moduleContext);
       ModuleUpdate.doBeforeUpdate(moduleContext);
   }

    @Override
    public void versionUpdate(ModuleContext moduleContext) throws Exception
    {
        LOG.debug("deferring import of study metadata until module startup (after Spring config)");
        forceUpdate = false; // let the version report correctly from now on
        loadOnStart = true;  // indicate that we should load the study metadata on startup
        super.versionUpdate(moduleContext);
        ModuleUpdate.doVersionUpdate(moduleContext);
    }

    @Override
    @NotNull
    public Set<Class> getIntegrationTests()
    {
        return new Reflections("org.labkey.wnprc_ehr").getSubTypesOf(Assert.class).stream()
                .filter(c -> c.getSimpleName().endsWith("IntegrationTest"))
                .collect(Collectors.toSet());
    }

    @Override
    @NotNull
    public Set<Class> getUnitTests()
    {
        return new Reflections("org.labkey.wnprc_ehr").getSubTypesOf(Assert.class).stream()
                .filter(c -> c.getSimpleName().endsWith("UnitTest"))
                .collect(Collectors.toSet());
    }

    /**
     * Executes the import of the dataset metadata into every container that has the module enabled
     */
    private void loadLatestDatasetMetadata(EHRService es)
    {
        LOG.debug("importing study metadata from reference study to all study containers");
        File file = new File(Paths.get(getExplodedPath().getAbsolutePath(), "pregnancySubsetReferenceStudy", "study").toFile(), "study.xml");
        getWNPRCStudyContainers().forEach(c -> DatasetImportHelper.safeImportDatasetMetadata(es.getEHRUser(c), c, file));
    }
}
