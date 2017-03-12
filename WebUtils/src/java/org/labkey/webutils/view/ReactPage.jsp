<%@ page import="org.labkey.webutils.api.model.JspPageModel" %>
<%@ page import="org.labkey.api.view.HttpView" %>
<%@ page import="org.labkey.webutils.api.model.ReactPageModel" %>
<%@ page import="org.labkey.api.view.JspView" %>
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

        <!-- Provide Global Variables -->
        <script type="application/javascript" src="<%= getContextPath() %>/webutils/externals-debug.js"></script>

        <%
            if (model.getBundlePath() != null) {
        %>
        <script type="application/javascript" src="<%= getContextPath() %><%= model.getBundlePath() %>"></script>
        <%
            }
        %>

        <% view.include(new JspView<JspPageModel>("/org/labkey/webutils/view/Resources.jsp", model), out); %>

        <!--[if lt IE 9]>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/html5shiv/3.7.3/html5shiv.js"></script>
        <![endif]-->
    </head>

    <body>
        <% view.include(new JspView<JspPageModel>("/org/labkey/webutils/view/fragments/ReactDiv.jsp", model), out); %>
    </body>
</html>