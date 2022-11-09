package org.labkey.wnprc_virology;

import org.labkey.api.data.Container;
import org.labkey.api.module.Module;
import org.labkey.api.module.MultiPortalFolderType;
import org.labkey.api.view.ActionURL;
import org.labkey.api.view.NavTree;
import org.labkey.api.view.Portal;

import javax.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Set;

public class WNPRC_VirologyFolderType extends MultiPortalFolderType
{

    public WNPRC_VirologyFolderType(WNPRC_VirologyModule module)
    {
        this(module,
                "WNPRC_Virology",
                "Manage shared data for WNPRC Virology",
                getDefaultModuleSet(module, getModule("WNPRC_Virology"), getModule("Pipeline"), getModule("EHR"), getModule("LDK"), getModule("DBUtils")));
    }

    public WNPRC_VirologyFolderType(WNPRC_VirologyModule module, String name, String description, Set<Module> activeModules)
    {
        super(name,
                description,
                Collections.emptyList(),
                Arrays.asList(Portal.getPortalPart("bannerInfo").createWebPart(), Portal.getPortalPart("viralLoadData").createWebPart()),
                activeModules,
                module);
    }

    @NotNull
    @Override
    public List<NavTree> getExtraSetupSteps(Container c)
    {
        for(Module module: c.getActiveModules())
        {
            if (module instanceof WNPRC_VirologyModule)
            {
                List<NavTree> extraSteps = new ArrayList<>();
                ActionURL setupUrl = new ActionURL(WNPRC_VirologyController.SetupAction.class, c);
                ActionURL permsSetupUrl = new ActionURL("security", "permissions", c);
                extraSteps.add(new NavTree(WNPRC_VirologyController.CONFIGURE_VIROLOGY_FOLDER, setupUrl));
                //adds a step to appear in the nav menu but actually gets handled in the controller's success url handler
                extraSteps.add(new NavTree("Setup user access", permsSetupUrl));
                return extraSteps;
            }
        }
        return Collections.emptyList();
    }

}
