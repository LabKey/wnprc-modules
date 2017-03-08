package org.labkey.webutils.view;

import org.labkey.api.view.JspView;
import org.labkey.webutils.WebUtilsServiceImpl;

/**
 * Created by jon on 3/7/17.
 */
public class ReactPage extends JspView<ReactPageModel> {
    static private String _packagePathDir = WebUtilsServiceImpl.getPackageDirFromClass(JspPage.class);

    public ReactPage(JspView view, ReactPageModel model) {
        super(_packagePathDir + "ReactPage.jsp", model);

        // Set the body to the passed in view
        this.setBody(view);

        // Set the frame to none, since we don't want WebPartView to add any wrapping HTML, such as a web part.
        this.setFrame(FrameType.NONE);
    }
}
