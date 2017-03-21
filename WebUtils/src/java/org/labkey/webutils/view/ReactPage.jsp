<%@ page import="org.labkey.webutils.api.model.JspPageModel" %>
<%@ page import="org.labkey.api.view.HttpView" %>
<%@ page import="org.labkey.webutils.api.model.ReactPageModel" %>
<%@ page import="org.labkey.api.view.JspView" %>
<%@ page import="org.labkey.api.view.WebPartView" %>
<%@ page import="org.springframework.web.servlet.ModelAndView" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>
<%
    JspView view = (JspView) HttpView.currentView();
    ReactPageModel model = (ReactPageModel) getModelBean();
%>

<!doctype html>

<html lang="en">
    <head>
        <meta charset="utf-8">

        <title><%= model.getTitle() %></title>

        <link rel="stylesheet" type="text/css" href="<%= getContextPath() %>/webutils/css/bootstrap-bundle.css">
        <link rel="stylesheet" type="text/css" href="<%= getContextPath() %>/webutils/css/webutils.css">

        <!-- Provide Global Variables -->
        <script type="application/javascript" src="<%= getContextPath() %>/webutils/lib/externals-debug.js"></script>


        <%
            JspView<JspPageModel> resourceView = new JspView<JspPageModel>("/org/labkey/webutils/view/fragments/Resources.jsp", model);
            resourceView.setFrame(WebPartView.FrameType.NONE);
            view.include(resourceView, out);
        %>

        <!--[if lt IE 9]>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/html5shiv/3.7.3/html5shiv.js"></script>
        <![endif]-->
    </head>

    <body>
        <%
            JspView<JspPageModel> reactDiv = new JspView<JspPageModel>("/org/labkey/webutils/view/fragments/ReactDiv.jsp", model);
            reactDiv.setFrame(WebPartView.FrameType.NONE);
            view.include(reactDiv, out);
        %>

        <%
            view.include(view.getBody(), out); // Don't need to handle exception here, because it'll get caught by the page handler
        %>


        <%
            if (model.getBundlePath() != null) {
        %>
        <script type="application/javascript" src="<%= getContextPath() %><%= model.getBundlePath() %>"></script>
        <%
            }
        %>

    </body>
</html>