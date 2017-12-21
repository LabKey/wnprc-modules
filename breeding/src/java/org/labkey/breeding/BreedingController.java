package org.labkey.breeding;

import org.labkey.api.action.ApiAction;
import org.labkey.api.action.ApiSimpleResponse;
import org.labkey.api.action.SpringActionController;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.security.RequiresPermission;
import org.labkey.api.security.permissions.AdminPermission;
import org.springframework.validation.BindException;

import java.io.File;
import java.nio.file.Paths;

/**
 * Spring action controller for WNPRC's breeding/pregnancy module.
 */
public final class BreedingController extends SpringActionController
{
    /**
     * Default action resolver. Expected to follow the "*Action" naming convention as well as looking for
     * static pages in the &lt;module&gt;/resources/views folder.
     */
    private static final DefaultActionResolver ACTION_RESOLVER = new DefaultActionResolver(BreedingController.class);

    /**
     * Friendly name for the controller.
     */
    public static final String NAME = "breeding";

    public BreedingController()
    {
        setActionResolver(ACTION_RESOLVER);
    }

    /**
     * Action definition for the import dataset test API action. Executes the import based on a pre-defined study
     * definition.
     */
    @RequiresPermission(AdminPermission.class)
    public class ImportDatasetMetadata extends ApiAction<Void>
    {
        @Override
        public Object execute(Void aVoid, BindException errors) throws Exception
        {
            Module module = ModuleLoader.getInstance().getModuleForController(NAME);
            assert module != null;

            File file = new File(Paths.get(module.getExplodedPath().getAbsolutePath(), "referenceStudy", "study").toFile(),
                    "study.xml");
            DatasetImportHelper.importDatasetMetadata(getUser(), getContainer(), file);
            return new ApiSimpleResponse("success", true);
        }
    }
}
