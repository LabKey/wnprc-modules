package org.labkey.wnprc_virology;

import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.Container;
import org.labkey.api.module.Module;
import org.labkey.api.module.MultiPortalFolderType;
import org.labkey.api.security.User;
import org.labkey.api.security.permissions.AdminPermission;
import org.labkey.api.view.ActionURL;
import org.labkey.api.view.FolderTab;
import org.labkey.api.view.NavTree;
import org.labkey.api.view.Portal;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedList;
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
                Collections.emptyList(),
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

    public static class SetupAccountsPage extends FolderTab.PortalPage
    {

        public static final String PAGE_ID = "wnprc_virology.UpdateAccounts";

        public SetupAccountsPage(String caption)
        {
            super(PAGE_ID, caption);
        }
        @Override
        public List<Portal.WebPart> createWebParts()
        {
            List<Portal.WebPart> parts = new ArrayList<>();
            parts.add(Portal.getPortalPart("setAccounts").createWebPart());
            return parts;
        }

        @Override
        public boolean isVisible(Container container, User user)
        {
            Container parentContainer = container.getParent();
            return parentContainer.hasPermission(user, AdminPermission.class);
        }
    }

    public static class HomePage extends FolderTab.PortalPage
    {

        public static final String PAGE_ID = "wnprc_virology.HomePage";

        public HomePage(String caption)
        {
            super(PAGE_ID, caption);
        }
        @Override
        public List<Portal.WebPart> createWebParts()
        {
            List<Portal.WebPart> parts = new ArrayList<>();
            parts.add(Portal.getPortalPart("bannerInfo").createWebPart());
            parts.add(Portal.getPortalPart("viralLoadData").createWebPart());
            return parts;
        }

        @Override
        public boolean isVisible(Container container, User user)
        {
            return true;
        }
    }

    @Override
    public List<FolderTab> getDefaultTabs()
    {
        List<FolderTab> tabs = new LinkedList<>();
        tabs.add(new HomePage("Home"));
        tabs.add(new SetupAccountsPage("Update Accounts"));
        return tabs;
    }

}
