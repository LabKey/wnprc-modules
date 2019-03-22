<%@ page import="org.json.JSONObject" %>
<%@ page import="org.json.JSONArray" %>
<%@ page import="java.util.List" %>
<%@ page import="java.util.ArrayList" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>

<%
    JSONObject model = (JSONObject) getModelBean();

    JSONObject emailData = model.getJSONObject("emaildata");

    JSONArray rows = model.getJSONArray("rows");
    List<JSONArray> bodyRows = new ArrayList<>();
    for(int i = 0; i < rows.length(); i++) {
        bodyRows.add(rows.getJSONArray(i));
    }

    JSONArray headerRow = bodyRows.get(0);
    bodyRows.remove(0);
%>

<style type="text/css">
    table {
        color: #333;
        font-family: Helvetica, Arial, sans-serif;
        width: 640px;
        border-collapse:
        collapse; border-spacing: 0;
    }

    td, th {
        border: 1px solid #CCC;
        height: 30px;
    }

    th {
        background: #F3F3F3;
        font-weight: bold;
    }

    td {
        background: #FAFAFA;
        text-align: center;
    }
</style>

<%
    JSONArray contentParts = emailData.getJSONArray("contentParts");
    for(int i = 0; i < contentParts.length(); i++) {
%>
<pre>
    <%= contentParts.getJSONObject(i).getString("content") %>
</pre>
<%
    }
%>

<hr/>

<table>
    <thead>
        <tr>
            <%
                for (int i = 0; i < headerRow.length(); i++) {
            %>
            <th><strong><%= h(headerRow.getString(i)) %></strong></th>
            <%
                }
            %>
        </tr>
    </thead>
    <tbody>
        <%
            for(JSONArray row : bodyRows) {
        %>
        <tr>
            <%
                for (int i = 0; i < row.length(); i++) {
            %>
            <th><strong><%= h(row.getString(i)) %></strong></th>
            <%
                }
            %>
        </tr>
        <%
            }
        %>
    </tbody>
</table>
