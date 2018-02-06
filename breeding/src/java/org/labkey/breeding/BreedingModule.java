package org.labkey.breeding;

import org.apache.log4j.Logger;
import org.apache.xmlbeans.XmlException;
import org.jetbrains.annotations.NotNull;
import org.junit.Assert;
import org.labkey.api.admin.ImportException;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.ehr.EHRService;
import org.labkey.api.ehr.dataentry.DataEntryForm;
import org.labkey.api.ehr.dataentry.DefaultDataEntryFormFactory;
import org.labkey.api.ehr.dataentry.TaskForm;
import org.labkey.api.ldk.ExtendedSimpleModule;
import org.labkey.api.module.ModuleContext;
import org.labkey.api.security.User;
import org.labkey.study.importer.DatasetImportUtils;
import org.reflections.Reflections;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.sql.SQLException;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Module class for the WNPRC breeding/pregnancy tracking module.
 */
public final class BreedingModule extends ExtendedSimpleModule
{
    /**
     * Logger for logging the logs
     */
    private static final Logger LOG = Logger.getLogger(BreedingModule.class);

    /**
     * Flag (from the VM) to indicate we should force the module to re-run all updates
     * regardless of the actual module version
     */
    private boolean forceUpdate = Boolean.getBoolean("labkey.module.forceupdate");

    @Override
    public void beforeUpdate(ModuleContext moduleContext)
    {
        // reset the flag to force the update (so the version reports correctly from now on)
        forceUpdate = false;
        try
        {
            setUpDatasetsAndForms(moduleContext.getUpgradeUser());
        }
        catch (IOException | DatasetImportUtils.DatasetLockExistsException | ImportException | XmlException | SQLException e)
        {
            LOG.error("failed during import of breeding dataset metadata", e);
        }
        super.beforeUpdate(moduleContext);
    }

    @Override
    public @NotNull Set<Class> getIntegrationTests()
    {
        return new Reflections("org.labkey.breeding").getSubTypesOf(Assert.class).stream()
                .filter(c -> c.getSimpleName().endsWith("IntegrationTest"))
                .collect(Collectors.toSet());
    }

    @Override
    public @NotNull Set<Class> getUnitTests()
    {
        return new Reflections("org.labkey.breeding").getSubTypesOf(Assert.class).stream()
                .filter(c -> c.getSimpleName().endsWith("UnitTest"))
                .collect(Collectors.toSet());
    }

    @Override
    public double getVersion()
    {
        return forceUpdate ? Double.POSITIVE_INFINITY : super.getVersion();
    }

    @Override
    protected void doStartupAfterSpringConfig(ModuleContext moduleContext)
    {
        Reflections r = new Reflections("org.labkey.breeding.dataentry");
        for (Class<? extends DataEntryForm> c : r.getSubTypesOf(TaskForm.class))
            EHRService.get().registerFormType(new DefaultDataEntryFormFactory(c, this));
    }

    @Override
    protected void init()
    {
        addController(getName().toLowerCase(), BreedingController.class);
    }

    /**
     * Executes the import of the dataset metadata into every container that has the breeding module enabled
     *
     * @param user
     * @throws XmlException
     * @throws SQLException
     * @throws ImportException
     * @throws DatasetImportUtils.DatasetLockExistsException
     * @throws IOException
     */
    private void setUpDatasetsAndForms(User user) throws XmlException, SQLException, ImportException,
            DatasetImportUtils.DatasetLockExistsException, IOException
    {
        File file = new File(Paths.get(getExplodedPath().getAbsolutePath(), "referenceStudy", "study").toFile(),
                "study.xml");
        for (Container c : ContainerManager.getAllChildrenWithModule(ContainerManager.getRoot(), this))
        {
            DatasetImportHelper.importDatasetMetadata(user, c, file);
        }
    }
}
