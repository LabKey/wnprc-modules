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

import org.jetbrains.annotations.NotNull;
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
import org.labkey.api.exp.ChangePropertyDescriptorException;
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
import org.labkey.api.security.User;
import org.labkey.api.security.roles.RoleManager;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.bc.BCReportRunner;
import org.labkey.wnprc_ehr.buttons.DuplicateTaskButton;
import org.labkey.wnprc_ehr.buttons.WNPRCGoToTaskButton;
import org.labkey.wnprc_ehr.dataentry.ProtocolDataEntry.ProtocolForm;
import org.labkey.wnprc_ehr.dataentry.forms.Arrival.ArrivalFormType;
import org.labkey.wnprc_ehr.dataentry.forms.Assignment.AssignmentForm;
import org.labkey.wnprc_ehr.dataentry.forms.BehaviorAbstract.BehaviorAbstractForm;
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
import org.labkey.wnprc_ehr.dataentry.forms.Surgery.SurgeryForm;
import org.labkey.wnprc_ehr.dataentry.forms.TBTests.TBTestsForm;
import org.labkey.wnprc_ehr.dataentry.forms.TreatmentOrders.TreatmentOrdersForm;
import org.labkey.wnprc_ehr.dataentry.forms.Treatments.TreatmentsForm;
import org.labkey.wnprc_ehr.dataentry.forms.VVC.VVCForm;
import org.labkey.wnprc_ehr.dataentry.forms.VVC.VVCRequestForm;
import org.labkey.wnprc_ehr.dataentry.forms.Weight.WeightForm;
import org.labkey.wnprc_ehr.demographics.MedicalFieldDemographicsProvider;
import org.labkey.wnprc_ehr.demographics.MostRecentObsDemographicsProvider;
import org.labkey.wnprc_ehr.history.DefaultAlopeciaDataSource;
import org.labkey.wnprc_ehr.history.DefaultBodyConditionDataSource;
import org.labkey.wnprc_ehr.history.DefaultTBDataSource;
import org.labkey.wnprc_ehr.history.WNPRCUrinalysisLabworkType;
import org.labkey.wnprc_ehr.notification.BehaviorNotification;
import org.labkey.wnprc_ehr.notification.ColonyAlertsNotification;
import org.labkey.wnprc_ehr.notification.DeathNotification;
import org.labkey.wnprc_ehr.notification.FoodCompletedProblemsNotification;
import org.labkey.wnprc_ehr.notification.FoodNotCompletedNotification;
import org.labkey.wnprc_ehr.notification.FoodNotStartedNoonNotification;
import org.labkey.wnprc_ehr.notification.FoodNotStartedNotification;
import org.labkey.wnprc_ehr.notification.TreatmentAlertsNotification;
import org.labkey.wnprc_ehr.notification.VvcNotification;
import org.labkey.wnprc_ehr.notification.WaterMonitoringNotification;
import org.labkey.wnprc_ehr.notification.AnimalRequestNotification;
import org.labkey.wnprc_ehr.schemas.TissueSampleTable;
import org.labkey.wnprc_ehr.schemas.WNPRC_Schema;
import org.labkey.wnprc_ehr.security.permissions.BehaviorAssignmentsPermission;
import org.labkey.wnprc_ehr.security.roles.BehaviorServiceWorker;
import org.labkey.wnprc_ehr.security.roles.WNPRCEHRFullSubmitterRole;
import org.labkey.wnprc_ehr.security.roles.WNPRCEHRRequestorSchedulerRole;
import org.labkey.wnprc_ehr.security.roles.WNPRCFullSubmitterWithReviewerRole;
import org.labkey.wnprc_ehr.table.WNPRC_EHRCustomizer;
import org.labkey.wnprc_ehr.updates.ModuleUpdate;
import org.reflections.Reflections;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
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

    public static String BC_GOOGLE_DRIVE_PROPERTY_NAME = "BCGoogleDriveAccount";

    static public LinkedHashSet<ClientDependency> getDataEntryClientDependencies()
    {
        LinkedHashSet<ClientDependency> dataEntryClientDependencies = new LinkedHashSet<>();

        List<String> paths = Arrays.asList(
                "/wnprc_ehr/wnprc_ext4",
                "/wnprc_ehr/dataentry"
        );

        for (String path : paths)
        {
            dataEntryClientDependencies.add(ClientDependency.fromPath(path));
        }

        return dataEntryClientDependencies;
    }

    public static Set<Container> getAllContainers()
    {
        return new HashSet<>(getChildContainers(ContainerManager.getRoot()));
    }

    public static Set<Container> getChildContainers(Container parentContainer)
    {
        Set<Container> containers = new HashSet<>();

        for (Container container : parentContainer.getChildren())
        {
            containers.add(container);
            containers.addAll(getChildContainers(container));
        }

        return containers;
    }

    public static Container getDefaultContainer()
    {
        if (ContainerManager.getForPath("/WNPRC") == null)
        {
            ContainerManager.createContainer(ContainerManager.getRoot(), "WNPRC");
        }
        Container wnprcContainer = ContainerManager.getForPath("/WNPRC");

        Container ehrContainer = wnprcContainer.getChild("EHR");
        if (ehrContainer == null)
        {
            ContainerManager.createContainer(wnprcContainer, "EHR");
            ehrContainer = wnprcContainer.getChild("EHR");
        }

        return ehrContainer;
    }

    public String getName()
    {
        return NAME;
    }

    public double getVersion()
    {
        return 18.31;
    }

    public boolean hasScripts()
    {
        return true;
    }

    protected void init()
    {
        TissueSampleTable.registerProperties();
        addController(CONTROLLER_NAME, WNPRC_EHRController.class);
        addController(TEST_CONTROLLER_NAME, WNPRC_EHRTestController.class);
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
        EHRService.get().registerClientDependency(ClientDependency.fromPath("ehr/ehr_ext3_api"), this);
        EHRService.get().registerClientDependency(ClientDependency.fromPath("wnprc_ehr/wnprcCoreUtils.js"), this);
        EHRService.get().registerClientDependency(ClientDependency.fromPath("wnprc_ehr/wnprcOverRides.js"), this);
        EHRService.get().registerClientDependency(ClientDependency.fromPath("wnprc_ehr/wnprcReports.js"), this);
        EHRService.get().registerClientDependency(ClientDependency.fromPath("wnprc_ehr/datasetButtons.js"), this);
        EHRService.get().registerClientDependency(ClientDependency.fromPath("wnprc_ehr/animalPortal.js"), this);
        EHRService.get().registerClientDependency(ClientDependency.fromPath("wnprc_ehr/reports/PregnancyReport.js"), this);
        EHRService.get().registerClientDependency(ClientDependency.fromPath("wnprc_ehr/Inroom.js"), this);

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

        EHRService.get().registerReportLink(EHRService.REPORT_LINK_TYPE.animalSearch, "Population Summary By Species, Gender and Age", this, DetailsURL.fromString("/query/executeQuery.view?schemaName=study&query.queryName=colonyPopulationByAge"), "Other Searches");
        EHRService.get().registerReportLink(EHRService.REPORT_LINK_TYPE.animalSearch, "Find Animals Housed At The Center Over A Date Range", this, DetailsURL.fromString("/ehr/housingOverlaps.view?groupById=1"), "Other Searches");
        EHRService.get().registerReportLink(EHRService.REPORT_LINK_TYPE.animalSearch, "List Singly-Housed Animals At The Center On A Given Date", this, DetailsURL.fromString("/query/executeQuery.view?schemaName=study&query.queryName=SinglyHousedAnimals"), "Other Searches");

        EHRService.get().registerDemographicsProvider(new MostRecentObsDemographicsProvider(this));
        EHRService.get().registerDemographicsProvider(new MedicalFieldDemographicsProvider(this));

        //buttons
        EHRService.get().registerMoreActionsButton(new WNPRCGoToTaskButton(this, "Assignment"), "study", "assignment");
        EHRService.get().registerMoreActionsButton(new WNPRCGoToTaskButton(this, "Feeding"), "study", "feeding");
        EHRService.get().registerMoreActionsButton(new DuplicateTaskButton(this), "ehr", "Tasks_DataEntry");
        EHRService.get().registerMoreActionsButton(new DuplicateTaskButton(this), "ehr", "my_tasks");
        EHRService.get().registerMoreActionsButton(new MarkCompletedButton(this, "study", "assignment", "End Assignments"), "study", "assignment");
        EHRService.get().registerMoreActionsButton(new ChangeQCStateButton(this), "study", "blood");
        EHRService.get().registerMoreActionsButton(new ChangeQCStateButton(this), "study", "foodDeprives");
        EHRService.get().registerMoreActionsButton(new CreateTaskFromRecordsButton(this, "Create Task From Selected", "Food Deprives", FoodDeprivesStartForm.NAME), "study", "foodDeprives");
        EHRService.get().registerMoreActionsButton(new CreateTaskFromRecordsButton(this, "Create Task From Selected", "Blood Draws", BloodDrawsForm.NAME), "study", "blood");
        EHRService.get().registerMoreActionsButton(new CreateTaskFromIdsButton(this, "Schedule Blood Draw For Selected", "Blood Draws", BloodDrawsForm.NAME, new String[]{"Blood Draws"}), "study", "demographics");

        EHRService.get().registerOptionalClinicalHistoryResources(this);
        EHRService.get().registerHistoryDataSource(new DefaultAlopeciaDataSource(this));
        EHRService.get().registerHistoryDataSource(new DefaultBodyConditionDataSource(this));
        EHRService.get().registerHistoryDataSource(new DefaultTBDataSource(this));

        EHRService.get().addModuleRequiringLegacyExt3EditUI(this);

        this.registerNotifications();
        this.registerDataEntryForms();

        EHRService.get().registerLabworkType(new WNPRCUrinalysisLabworkType(this));

        this.registerRoles();
        this.registerPermissions();

        BCReportRunner.schedule();

        for (Container studyContainer : getWNPRCStudyContainers())
        {
            User user = EHRService.get().getEHRUser(studyContainer);
            try
            {
                WNPRC_Schema.ensureStudyShape(user, studyContainer);
            }
            catch (ChangePropertyDescriptorException e)
            {
                e.printStackTrace();
                throw new RuntimeException(e);
            }

        }
    }

    private void registerPermissions()
    {
        RoleManager.registerPermission(new BehaviorAssignmentsPermission());
        RoleManager.registerPermission(new EHRStartedAdminPermission());
        RoleManager.registerPermission(new EHRStartedUpdatePermission());
        RoleManager.registerPermission(new EHRStartedDeletePermission());
        RoleManager.registerPermission(new EHRStartedInsertPermission());
    }

    @Override
    @NotNull
    public Set<String> getSchemaNames()
    {
        return Collections.singleton(WNPRC_Schema.NAME);
    }

    @Override
    public void registerSchemas()
    {
        DefaultSchema.registerProvider(WNPRC_Schema.NAME, new DefaultSchema.SchemaProvider(this)
        {
            public QuerySchema createSchema(final DefaultSchema schema, Module module)
            {
                return new WNPRC_Schema(schema.getUser(), schema.getContainer());
            }
        });
    }

    public String getGoogleDriveAccountId(Container container)
    {
        return this.getModuleProperties().get(BC_GOOGLE_DRIVE_PROPERTY_NAME).getEffectiveValue(container);
    }

    @Override
    public @NotNull
    LinkedHashSet<ClientDependency> getClientDependencies(Container c)
    {
        // allow other modules to register with EHR service, and include them when the module is turned on
        LinkedHashSet<ClientDependency> ret = new LinkedHashSet<>();
        ret.addAll(super.getClientDependencies(c));
        ret.addAll(EHRService.get().getRegisteredClientDependencies(c));

        //My stuff here...

        return ret;
    }

    public void registerNotifications()
    {
        List<Notification> notifications = Arrays.asList(
                new BehaviorNotification(this),
                new DeathNotification(),
                new ColonyAlertsNotification(this),
                new WaterMonitoringNotification(this),
                new TreatmentAlertsNotification(this),
                new VvcNotification(this),
                new FoodNotStartedNotification(this),
                new FoodNotStartedNoonNotification(this),
                new FoodNotCompletedNotification(this),
                new FoodCompletedProblemsNotification(this),
                new AnimalRequestNotification(this)
        );

        for (Notification notification : notifications)
        {
            NotificationService.get().registerNotification(notification);
        }
    }

    public void registerDataEntryForms()
    {
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
                NecropsyForm.class,
                NecropsyRequestForm.class,
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
                ProtocolForm.class
        );
        for (Class<? extends DataEntryForm> form : forms)
        {
            EHRService.get().registerFormType(new DefaultDataEntryFormFactory(form, this));
        }

        // load all the breeding forms (which are embedded in the Breeding class)
        Breeding.registerDataEntryForms(EHRService.get(), this);
        Breeding.registerSingleFormOverrides(EHRService.get(), this);
    }

    public void registerRoles()
    {
        RoleManager.registerRole(new WNPRCFullSubmitterWithReviewerRole());
        RoleManager.registerRole(new BehaviorServiceWorker());
        RoleManager.registerRole(new WNPRCEHRRequestorSchedulerRole());
        RoleManager.registerRole(new WNPRCEHRFullSubmitterRole());
    }

    public Set<Container> getWNPRCStudyContainers()
    {
        Set<Container> studyContainers = new HashSet<>();
        WNPRC_EHRModule module = ModuleLoader.getInstance().getModule(WNPRC_EHRModule.class);

        for (Container container : getAllContainers())
        {
            if (container.getActiveModules().contains(module))
            {
                Container studyContainer = EHRService.get().getEHRStudyContainer(container);
                studyContainers.add(studyContainer);
            }
        }

        return studyContainers;
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
}
