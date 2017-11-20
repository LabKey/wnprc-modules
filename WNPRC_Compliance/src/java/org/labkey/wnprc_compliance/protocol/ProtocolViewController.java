package org.labkey.wnprc_compliance.protocol;

import org.labkey.api.action.SpringActionController;
import org.labkey.api.security.ActionNames;
import org.labkey.api.security.RequiresPermission;
import org.labkey.api.security.RequiresSiteAdmin;
import org.labkey.webutils.api.action.ReactPageAction;
import org.labkey.webutils.api.action.annotation.JspPath;
import org.labkey.webutils.api.action.annotation.PageTitle;
import org.labkey.wnprc_compliance.security.ComplianceAdminPermission;

/**
 * Created by jon on 3/21/17.
 */
public class ProtocolViewController extends SpringActionController {
    private static final SpringActionController.DefaultActionResolver _actionResolver = new SpringActionController.DefaultActionResolver(ProtocolViewController.class);
    public static final String NAME = "wnprc_compliance-protocol-view";

    public ProtocolViewController() {
        setActionResolver(_actionResolver);
    }

    public abstract class ProtocolPageAction extends ReactPageAction {
        @Override
        public Class getBaseClass() {
            return ProtocolViewController.class;
        }
    }

    @ActionNames("EditProtocol")
    @JspPath("view/EditProtocol.jsp")
    @PageTitle("New Protocol")
    @RequiresPermission(ComplianceAdminPermission.class)
    public class NewProtocolPage extends ProtocolPageAction {}


    @ActionNames("ProtocolList")
    @JspPath("view/ProtocolList.jsp")
    @PageTitle("Protocols List")
    @RequiresPermission(ComplianceAdminPermission.class)
    public class ListProtocolsPage extends ProtocolPageAction {}
}
