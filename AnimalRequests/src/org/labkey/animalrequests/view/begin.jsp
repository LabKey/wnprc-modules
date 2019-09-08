<%@ page import="org.labkey.api.data.Container" %>
<%@ page import="org.labkey.api.security.User" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>
<%
    Container c = getContainer();
    User user = getUser();
%>
<script src="https://unpkg.com/react@16/umd/react.development.js"></script>
<script src="https://unpkg.com/react-dom@16/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/babel-standalone@6.15.0/babel.min.js"></script>


<div id="helloMessage">Begin, and welcome to the AnimalRequests module.</div>
<script type="text/babel">

    ReactDOM.render(
            <h3>Hello, world!</h3>,
            document.getElementById('helloMessage')
    );

</script>
