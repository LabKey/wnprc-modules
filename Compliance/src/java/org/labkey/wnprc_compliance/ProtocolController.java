package org.labkey.wnprc_compliance;

import org.labkey.api.action.SpringActionController;
import org.labkey.api.security.ActionNames;
import org.labkey.api.security.RequiresPermission;
import org.labkey.api.security.RequiresSiteAdmin;
import org.labkey.webutils.api.action.ReactPageAction;
import org.labkey.webutils.api.action.annotation.JspPath;
import org.labkey.webutils.api.action.annotation.PageTitle;

/**
 * Created by jon on 3/21/17.
 */
public class ProtocolController extends SpringActionController {
    private static final SpringActionController.DefaultActionResolver _actionResolver = new SpringActionController.DefaultActionResolver(ProtocolController.class);
    public static final String NAME = "wnprc_compliance-protocols";

    public ProtocolController() {
        setActionResolver(_actionResolver);
    }

    public abstract class ProtocolPageAction extends ReactPageAction {
        @Override
        public Class getBaseClass() {
            return ProtocolController.class;
        }
    }

    @ActionNames("NewProtocolPage")
    @JspPath("protocol/view/NewProtocol.jsp")
    @PageTitle("New Protocol")
    @RequiresSiteAdmin()
    public class NewProtocolPage extends ProtocolPageAction {}


    @ActionNames("ListProtocolsPage")
    @JspPath("protocol/view/NewProtocol.jsp")
    @PageTitle("List Protocols")
    @RequiresSiteAdmin()
    public class ListProtocolsPage extends ProtocolPageAction {}
}
