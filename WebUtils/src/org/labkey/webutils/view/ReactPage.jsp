<%@ page import="org.labkey.webutils.api.model.JspPageModel" %>
<%@ page import="org.labkey.api.view.HttpView" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>
<%
    JspPage view = (JspPage) HttpView.currentView();
    JspPageModel model = (JspPageModel) getModelBean();
%>

<!doctype html>

<html lang="en">
    <head>
        <meta charset="utf-8">

        <title></title>
        <meta name="description" content="">
        <meta name="author" content="">


        <!--[if lt IE 9]>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/html5shiv/3.7.3/html5shiv.js"></script>
        <![endif]-->
    </head>

    <body>
        <div id="react"></div>
    </body>
</html>