<%@ page import="org.json.JSONObject" %>
<%@ page import="org.json.JSONArray" %>
<%@ page import="org.labkey.dbutils.api.SimpleQueryFactory" %>
<%@ page import="org.labkey.dbutils.api.SimplerFilter" %>
<%@ page import="org.labkey.api.data.CompareType" %>
<%@ page import="org.labkey.wnprc_ehr.schemas.enum_lookups.NecropsySampleDeliveryDestination" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>

<%
    String taskId = getViewContext().getRequest().getParameter("taskid");
    SimplerFilter taskFilter = new SimplerFilter("taskid", CompareType.EQUAL, taskId);
    SimpleQueryFactory queryFactory = new SimpleQueryFactory(getUser(), getContainer());

    JSONArray tasks = queryFactory.selectRows("ehr", "tasks", taskFilter);
    JSONArray necropsies = queryFactory.selectRows("study", "necropsies", taskFilter);
%>

<style type="text/css">
    #report hr.sectionBar {
        border: none;
        height: 1px;
        margin-top: 0;
        border-top: solid 1px #aaa;
    }

    @media print{@page {size: landscape}}

</style>

<%-- Disclaimer --%>
<div class="alert alert-warning hidden-print text-center" role="alert">
    <p>
        Some browsers may mangle the report formatting when printing.  For best results, print from Safari.
    </p>
    <p>
        In Chrome on a Mac, you can select "Print using system dialog" from the print menu, which will give you the
        same print dialog as Safari.
    </p>
</div>

<hr style="margin: 20px 0 20px 0; border: 0; height: 1px; background-image: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0));"/>

<%-- Make sure that we have exactly one task --%>
<% if (tasks.length() != 1) { %>
<div class="container">
    <div class="alert alert-danger hidden-print text-center" role="alert">
        <strong>There are no necropsies associated with this taskid!</strong>
    </div>
</div>

<%-- Make sure that we have exactly one associated necropsy--%>
<% } else if (necropsies.length() != 1) { %>
<div class="container">
    <div class="alert alert-danger hidden-print text-center" role="alert">
        <strong>There are no necropsies associated with this taskid!</strong>
    </div>
</div>

<%-- Now for the actual text--%>
<% } else { %>
<div id="report" class="container">
    <%
        JSONObject task = tasks.getJSONObject(0);
        JSONObject necropsy = necropsies.getJSONObject(0);
        JSONObject[] tissueSamples = queryFactory.selectRows("study", "tissue_samples", taskFilter).toJSONObjectArray();
        JSONObject[] organWeights  = queryFactory.selectRows("study", "organ_weights",  taskFilter).toJSONObjectArray();
    %>
    <div class="row">
        <%-- A footer --%>
        <div>
            <div class="text-right">
                <span>Report Generated On: <span class="todaysDate"></span></span>
            </div>
        </div>
    </div>

    <h2 class="text-center">Collection List for <%= h(necropsy.optString("caseno", "")) %> (<%= h(necropsy.optString("id", "[unknown animal]")) %>)</h2>

    <div class="row">
        <h4>Pathology Unit Notes</h4>
        <hr class="sectionBar"/>

        <div class="container"><%= necropsy.optString("patho_notes", "-- none --").replaceAll("\n", "<br>")%></div>
    </div>

    <div class="row">
        <h4>Tissue Samples</h4>
        <hr class="sectionBar"/>

        <% if (tissueSamples.length > 0) { %>
        <table class="table">
            <thead>
                <tr>
                    <th>Tissue</th>
                    <th>Tissue Qualifer</th>
                    <th>Preservation</th>
                    <th>Tissue Remarks</th>
                    <th>Quantity</th>
                    <th>Recipient</th>
                    <th>Transfer</th>
                    <th>Shipping Note</th>
                    <th>Container Type</th>
                    <th>Slide Number</th>
                    <th>Trim Remarks</th>
                </tr>
            </thead>
            <%
                for (JSONObject tissueSample : tissueSamples) {

                    String deliveryMethod = tissueSample.getString("ship_to");
                    if (deliveryMethod != null) {
                        NecropsySampleDeliveryDestination.SampleDeliveryDestination deliveryDestination = NecropsySampleDeliveryDestination.SampleDeliveryDestination.valueOf(deliveryMethod);

                        if (deliveryDestination != null) {
                            deliveryMethod = deliveryDestination.getTitle();
                        }
                    }
            %>
            <tr>
                <td style="font-weight: bold"><%= h(tissueSample.optString("tissue_fs_meaning", "")) %></td>
                <td><%= h(tissueSample.optString("qualifier_fs_value", tissueSample.optString("qualifier", ""))) %></td>
                <td><%= h(tissueSample.optString("preservation_fs_value", "")) %> </td>
                <td><%= h(tissueSample.optString("tissueremarks")) %>             </td>
                <td><%= h(tissueSample.optString("quantity")) %>                  </td>
                <td><%= h(tissueSample.optString("recipient")) %>                 </td>
                <td><%= h(deliveryMethod) %>                                      </td>
                <td><%= h(tissueSample.optString("ship_to_comment")) %>           </td>
                <td><%= h(tissueSample.optString("container_type_fs_value")) %>   </td>
                <td><%= h(tissueSample.optString("slidenum")) %>                  </td>
                <td><%= h(tissueSample.optString("trimremarks")) %>               </td>
            </tr>
            <% } %>
        </table>
        <% } else { %>
        <p>
            There are no requested tissue samples for this necropsy.
        </p>
        <% } %>
    </div>

    <div class="row">
        <h4>Organ Weights</h4>
        <hr class="sectionBar"/>

        <% if (organWeights.length > 0) { %>
        <table class="table">
            <thead>
            <tr>
                <th>Organ</th>
                <th>Qualifier</th>
                <th>Time</th>
                <th>Weight</th>
            </tr>
            </thead>
            <tbody>
                <% for (JSONObject organ : organWeights) { %>
                <tr>
                    <td><%= h(organ.optString("tissue_fs_meaning")) %></td>
                    <td><%= h(organ.optString("qualifier")) %></td>
                    <td></td>
                    <td></td>
                </tr>
                <% } %>
            </tbody>
        </table>
        <% } else { %>
        <p>
            There are no requested organ weights for this necropsy.
        </p>
        <% } %>
    </div>
</div>

<% } %>


<script>
    (function() {
        $(".todaysDate").text(moment().format("dddd, MMMM Do YYYY [at] h:mm:ss a"));
    })();
</script>