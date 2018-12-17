package org.labkey.webutils;

import org.labkey.api.data.Container;
import org.labkey.api.security.User;
import org.labkey.api.view.JspView;
import org.labkey.api.view.ViewContext;
import org.labkey.api.view.WebPartView;
import org.labkey.webutils.view.JspPage;
import org.labkey.webutils.api.WebUtilsService;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletResponseWrapper;
import java.io.CharArrayWriter;
import java.io.IOException;
import java.io.PrintWriter;
/**
 * Created by jon on 2/23/16.
 */
public class WebUtilsServiceImpl extends WebUtilsService {
    @Override
    public String renderView(String fullPathToJsp, Container container, User user) throws Exception {
        return this.renderView(fullPathToJsp, container, user, null);
    }

    @Override
    public String renderView(String fullPathToJsp, Container container, User user, Object model) throws Exception {
        JspView view = new JspView(fullPathToJsp, model);

        MockHttpServletRequest req = new MockHttpServletRequest();

        // Build the mock response to capture the JSP rendering output.
        final CharArrayWriter charArray = new CharArrayWriter();
        HttpServletResponseWrapper response = new HttpServletResponseWrapper(new MockHttpServletResponse()) {
            @Override
            public PrintWriter getWriter() throws IOException {
                return new PrintWriter(charArray);
            }
        };

        try (ViewContext.StackResetter resetter = ViewContext.pushMockViewContext(user, container, null)) {
            view.setFrame(WebPartView.FrameType.NONE);
            view.render(req, response);

            return charArray.toString();
        }
    }

    @Override
    public ModelAndView getJspPageFromView(JspView view) {
        return getJspPage(view);
    }

    @Override
    public ModelAndView getJspReportPageFromView(JspView view) {
        String reportJspPath = WebUtilsService.resolveJspPath("view/JspReport.jsp", this.getClass());
        JspView reportView = new JspView(reportJspPath);

        reportView.setBody(view);

        return getJspPage(reportView);
    }

    private ModelAndView getJspPage(JspView view) {
        JspView jspPage = new JspPage(view);

        // Set the frame
        jspPage.setFrame(WebPartView.FrameType.NONE);

        // Set the body to our passed in view
        jspPage.setBody(view);

        return jspPage;
    }
}
