<%@ page import="org.labkey.wnprc_ehr.pathology.necropsy.ScheduledNecropsyRequestModel" %>
<%@ page import="java.text.SimpleDateFormat" %>
<%@ page import="org.labkey.api.view.ActionURL" %>
<%@ page import="org.labkey.wnprc_ehr.pathology.necropsy.NecropsyController" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>

<%
    ScheduledNecropsyRequestModel model = (ScheduledNecropsyRequestModel) getModelBean();

    SimpleDateFormat dayFormat = new SimpleDateFormat("MMMMMM dd, YYYY");
    SimpleDateFormat dayTimeFormat = new SimpleDateFormat("MMMMMM dd, YYYY 'at' hh:mm a");
    //SimpleDateFormat dayTimeFormat = new SimpleDateFormat("MMMMMM");

    ActionURL viewRequestUrl = new ActionURL("ehr", "dataEntryFormDetails", getContainer())
            .addParameter("formType", "NecropsyRequest")
            .addParameter("requestId", model.requestLsid);


    ActionURL scheduleUrl = new ActionURL(NecropsyController.NecropsySchedulePage.class, getContainer());
%>


<div>
    <p>
        The necropsy requested on <%= dayFormat.format(model.getSubmittedDate()) %> for <strong><%= model.animalId %></strong>
        (<a href="<%= viewRequestUrl.getBaseServerURI() +  viewRequestUrl.toString() %>">Request #<%= model.requestNumber %></a>) has been scheduled for <%= dayTimeFormat.format(model.getScheduledDate()) %>.
    </p>
    <p>
        You can view it on the <a href="<%= scheduleUrl.getBaseServerURI() + scheduleUrl.toString() %>">Necropsy Schedule</a>.
    </p>
</div>