package org.labkey.breeding;

import org.apache.log4j.Logger;
import org.apache.xmlbeans.XmlException;
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
import org.labkey.api.security.UserManager;
import org.labkey.api.security.ValidEmail;
import org.labkey.api.settings.AppProps;
import org.labkey.study.importer.DatasetImportUtils;
import org.reflections.Reflections;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.sql.SQLException;

/**
 * Module class for the WNPRC breeding/pregnancy tracking module.
 */
public final class BreedingModule extends ExtendedSimpleModule
{
    /**
     * Logger for logging the logs
     */
    private static final Logger LOG = Logger.getLogger(BreedingModule.class);

    @Override
    protected void doStartupAfterSpringConfig(ModuleContext moduleContext)
    {
        Reflections r = new Reflections("org.labkey.breeding.dataentry");
        for (Class<? extends DataEntryForm> c : r.getSubTypesOf(TaskForm.class))
            EHRService.get().registerFormType(new DefaultDataEntryFormFactory(c, this));

        // if this is development mode, load the dataset metadata on every startup
        if (AppProps.getInstance().isDevMode())
        {
            try
            {
                User importingUser = moduleContext.getUpgradeUser();
                if (importingUser == null)
                    // WARNING: horrible devmode hack detected - clay, 18 Jan 2018
                    importingUser = UserManager.getUser(new ValidEmail("cdstevens3@wisc.edu"));
                importDatasetMetadata(importingUser);
            }
            catch (IOException | DatasetImportUtils.DatasetLockExistsException | ImportException | XmlException
                    | SQLException | ValidEmail.InvalidEmailException e)
            {
                LOG.error("Failed while loading reference study for breeding module", e);
            }
        }
    }

    @Override
    protected void init()
    {
        addController(getName().toLowerCase(), BreedingController.class);
    }

    private void importDatasetMetadata(User importingUser) throws XmlException, SQLException, ImportException,
            DatasetImportUtils.DatasetLockExistsException, IOException
    {
        File file = new File(Paths.get(getExplodedPath().getAbsolutePath(), "referenceStudy", "study").toFile(),
                "study.xml");
        for (Container c : ContainerManager.getAllChildrenWithModule(ContainerManager.getRoot(), this))
            DatasetImportHelper.importDatasetMetadata(importingUser, c, file);
    }
}
