package org.labkey.wnprc_compliance.protocol;

import org.labkey.api.action.SpringActionController;
import org.labkey.api.security.ActionNames;
import org.labkey.api.security.RequiresSiteAdmin;
import org.labkey.webutils.api.action.ReactPageAction;
import org.labkey.webutils.api.action.annotation.JspPath;
import org.labkey.webutils.api.action.annotation.PageTitle;

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
    @JspPath("protocol/view/EditProtocol.jsp")
    @PageTitle("New Protocol")
    @RequiresSiteAdmin()
    public class NewProtocolPage extends ProtocolPageAction {}


    @ActionNames("ProtocolList")
    @JspPath("protocol/view/ProtocolList.jsp")
    @PageTitle("Protocols List")
    @RequiresSiteAdmin()
    public class ListProtocolsPage extends ProtocolPageAction {}
}
