<%@ page import="org.labkey.webutils.api.model.JspPageModel" %>
<%@ page import="org.labkey.api.view.HttpView" %>
<%@ page import="org.labkey.webutils.view.ReactPageModel" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>
<%
    JspPage view = (JspPage) HttpView.currentView();
    ReactPageModel model = (ReactPageModel) getModelBean();
%>

<!doctype html>

<html lang="en">
    <head>
        <meta charset="utf-8">

        <title><%= model.getTitle() %></title>

        <!-- Provide Global Variables -->
        <script type="application/javascript" src="<%= getContextPath() %>/webutils/externals-debug.js"></script>

        <!-- Scripts Files -->
        <%
            for(String path : model.getScripts()) {
        %>
        <script type="application/javascript" src="<%= getContextPath() %><%= path %>"></script>
        <%
            }
        %>

        <!--[if lt IE 9]>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/html5shiv/3.7.3/html5shiv.js"></script>
        <![endif]-->
    </head>

    <body>
        <div id="reactDiv"></div>
    </body>
</html>