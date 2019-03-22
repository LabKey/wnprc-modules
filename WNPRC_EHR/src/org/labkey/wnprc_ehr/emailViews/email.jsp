<%
    /*
     * Copyright (c) 2013-2014 LabKey Corporation
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *     http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
%>
<%@ page import="org.labkey.api.data.Container" %>
<%@ page import="org.labkey.api.view.ActionURL" %>
<%@ page import="org.labkey.api.view.JspView" %>
<%@ page import="org.labkey.api.view.UnauthorizedException" %>
<%@ page import="java.util.Map" %>
<%@ page import="org.labkey.wnprc_ehr.WNPRC_EHRController" %>
<%@ page import="java.util.Hashtable" %>
<%@ page import="java.util.HashMap" %>
<%@ page import="java.util.LinkedList" %>
<%@ page import="org.labkey.api.data.ConvertHelper" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>
<%
    Container c = getContainer();

    HashMap<String,HashMap> form = (HashMap<String,HashMap>)getModelBean();

    boolean isAdmin = getUser().hasSiteAdminPermission();
%>

<style>
    table, th, td {
        border: 1px solid black;
        padding: 5px;
    }

    table {
        border-collapse: collapse;
    }
</style>

<%
    String[] areaNames = form.keySet().toArray(new String[form.size()]);
    for( String areaName: areaNames) {
        Map<String, LinkedList> area = form.get(areaName);

        if ( area != null) {
%>
<h4><%= areaName %></h4>
<table>
    <thead>
    <tr>
        <th align="center">Room</th>
        <th align="center">AnimalId</th>
        <th align="center">Date</th>
        <th align="center">Treatment</th>
        <th align="center">Order By</th>
        <th align="center">Performed By</th>
        <th align="center">Discrepancy</th>
    </tr>
    </thead>
    <tbody>
    <%
        String[] roomNames = area.keySet().toArray(new String[area.size()]);
        for( String roomName: roomNames) {
            LinkedList<Map> animals = area.get(roomName);
            for (Map treatmentInfo : animals){
    %>
    <tr>
        <%
            if (animals.getFirst() == treatmentInfo) {
        %>
        <td rowspan="<%= animals.size() %>"><%= roomName %></td>
        <%
            }
        %>
        <td><%= treatmentInfo.get("id") %></td>
        <td><%= treatmentInfo.get("date") %></td>
        <td><%= treatmentInfo.get("meaning") %></td>
        <td><%= treatmentInfo.get("performedby") %></td>
        <td><%= treatmentInfo.get("drug_performedby") %></td>
        <td>

        <%
            String route              = ConvertHelper.convert(treatmentInfo.get("route"),              String.class);
            String drug_route         = ConvertHelper.convert(treatmentInfo.get("drug_route"),         String.class);
            String concentration      = ConvertHelper.convert(treatmentInfo.get("concentration"),      String.class);
            String drug_concentration = ConvertHelper.convert(treatmentInfo.get("drug_concentration"), String.class);
            String conc_units         = ConvertHelper.convert(treatmentInfo.get("conc_units"),         String.class);
            String drug_conc_units    = ConvertHelper.convert(treatmentInfo.get("drug_conc_units"),    String.class);
            String dosage             = ConvertHelper.convert(treatmentInfo.get("dosage"),             String.class);
            String drug_dosage        = ConvertHelper.convert(treatmentInfo.get("drug_dosage"),        String.class);
            String dosage_units       = ConvertHelper.convert(treatmentInfo.get("dosage_units"),       String.class);
            String drug_dosage_units  = ConvertHelper.convert(treatmentInfo.get("drug_dosage_units"),  String.class);
            String amount             = ConvertHelper.convert(treatmentInfo.get("amount"),             String.class);
            String drug_amount        = ConvertHelper.convert(treatmentInfo.get("drug_amount"),        String.class);
            String amount_units       = ConvertHelper.convert(treatmentInfo.get("amount_units"),       String.class);
            String drug_amount_units  = ConvertHelper.convert(treatmentInfo.get("drug_amount_units"),  String.class);
            String volume             = ConvertHelper.convert(treatmentInfo.get("volume"),             String.class);
            String drug_volume        = ConvertHelper.convert(treatmentInfo.get("drug_volume"),        String.class);
            String vol_units          = ConvertHelper.convert(treatmentInfo.get("vol_units"),          String.class);
            String drug_vol_units     = ConvertHelper.convert(treatmentInfo.get("drug_vol_units"),     String.class);

            if (route!=null &&!route.equals(drug_route)){
                %>Route Ordered: <%= route %><br>
                Route Entered: <%= drug_route %><br>
            <%
                }
                if (concentration!=null && (!concentration.equals(drug_concentration) || !conc_units.equals(drug_conc_units))){
            %>
                Concentration Ordered: <%=concentration%> <%=conc_units%> <br>
                Concentration Entered: <b><%=drug_concentration%> <%=drug_conc_units %> </b><br>
            <%
                }
                if ((dosage!=null) && (dosage_units!=null) && (!dosage.equals(drug_dosage) || !dosage_units.equals(drug_dosage_units))){
            %>
                Dosage Ordered: <%=dosage%> <%=dosage_units%> <br>
                Dosage Entered: <b><%=drug_route%> <%=drug_dosage_units%> </b><br>
            <%
                }
                if ((amount!=null) && (amount_units!=null) && (!amount.equals(drug_amount) || !amount_units.equals(drug_amount_units))){
            %>
                Amount Ordered: <%=amount%> <%=amount_units%> <br>
                Amount Entered: <b><%=drug_amount%> <%=drug_amount_units%></b><br>
            <%
                }
                if (volume!=null && !volume.equals(drug_volume) || !vol_units.equals(drug_vol_units)){
            %>
                Volume Ordered: <%=volume%> <%=vol_units%><br>
                Volume Entered: <b><%=drug_volume%> <%=drug_vol_units%></b><br>
            <% } %>


        </td>
    </tr>
    <%
            }
        }
    %>
    </tbody>
</table>
<%
        }
    }
%>