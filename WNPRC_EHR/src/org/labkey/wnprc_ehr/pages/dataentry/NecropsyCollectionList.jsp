<%@ page import="org.json.JSONArray" %>
<%@ page import="org.json.JSONObject" %>
<%@ page import="org.labkey.api.data.CompareType" %>
<%@ page import="org.labkey.api.data.SimpleFilter" %>
<%@ page import="org.labkey.api.util.JsonUtil" %>
<%@ page import="org.labkey.dbutils.api.SimpleQueryFactory" %>
<%@ page import="org.labkey.dbutils.api.SimplerFilter" %>
<%@ page import="org.labkey.webutils.api.json.JsonUtils" %>
<%@ page import="org.labkey.webutils.api.json.NumberKeyComparator" %>
<%@ page import="org.labkey.wnprc_ehr.schemas.enum_lookups.NecropsySampleDeliveryDestination" %>
<%@ page import="java.sql.Timestamp" %>
<%@ page import="java.text.SimpleDateFormat" %>
<%@ page import="java.util.List" %>
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
        List<JSONObject> tissueSamples = JsonUtil.toJSONObjectList(queryFactory.selectRows("study", "tissue_samples", taskFilter));
        List<JSONObject> organWeights  = JsonUtil.toJSONObjectList(queryFactory.selectRows("study", "organ_weights",  taskFilter));

        Timestamp necropsyDate = (Timestamp) necropsy.get("date");
        String necropsyDisplayDate;
        if (necropsyDate != null) {
            necropsyDisplayDate = new SimpleDateFormat("MMM d, yyyy 'at' hh:mm a").format(necropsyDate);
        }
        else {
            necropsyDisplayDate = "unknown";
        }
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
        <h4>General</h4>
        <hr class="sectionBar"/>

        <div class="col-sm-6">
            <dl class="dl-horizontal">
                <dt>Necropsy Date</dt>
                <dd><%=h(necropsyDisplayDate)%></dd>
            </dl>
        </div>

        <div class="col-sm-6">
            <dl class="dl-horizontal">
                <dt>Perfusion</dt>
                <dd><%=h(necropsy.optString("perfusion_area_fs_value", "-- None --"))%></dd>
            </dl>
        </div>
    </div>

    <div class="row">
        <h4>Pathology Unit Notes</h4>
        <hr class="sectionBar"/>

        <div class="container"><%=unsafe(h(necropsy.optString("patho_notes", "-- none --")).toString().replaceAll("\n", "<br>"))%></div>
    </div>

    <div class="row">
        <h4>Antemortem Tissue Samples</h4>
        <hr class="sectionBar"/>

        <% if (!tissueSamples.isEmpty()) { %>
        <table class="table">
            <thead>
                <tr>
                    <th>Tissue</th>
                    <th>Tissue Qualifer</th>
                    <th>Preservation</th>
                    <th>Tissue Remarks</th>
                    <th>Quantity</th>
                    <th>Lab ID</th>
                    <th>Recipient</th>
                    <th>Transfer</th>
                    <th>Shipping Note</th>
                    <th>Container Type</th>
                    <th>Slide Number</th>
                    <th>Trim Remarks</th>
                </tr>
            </thead>
            <%
                SimplerFilter preDeathFilter = new SimplerFilter("collect_before_death", CompareType.EQUAL, true);
                preDeathFilter.addAllClauses(taskFilter);
                List<JSONObject> preDeathTissueSamples = JsonUtils.getSortedListFromJSONArray(queryFactory.selectRows("study", "tissue_samples", preDeathFilter), "collection_order");

                for (JSONObject tissueSample : preDeathTissueSamples) {
                    String deliveryMethod;
                    try{
                        deliveryMethod = tissueSample.getString("ship_to");
                    }catch(Exception JSONException){
                        deliveryMethod = null;
                    }
                    if (deliveryMethod != null)
                    {
                        NecropsySampleDeliveryDestination.SampleDeliveryDestination deliveryDestination = NecropsySampleDeliveryDestination.SampleDeliveryDestination.valueOf(deliveryMethod);

                        if (deliveryDestination != null)
                        {
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
                <td><%= h(tissueSample.optString("lab_sample_id")) %>                 </td>
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
        <h4>Postmortem Tissue Samples</h4>
        <hr class="sectionBar"/>

        <% if (!tissueSamples.isEmpty()) { %>
        <table class="table">
            <thead>
            <tr>
                <th>Tissue</th>
                <th>Tissue Qualifer</th>
                <th>Preservation</th>
                <th>Tissue Remarks</th>
                <th>Quantity</th>
                <th>Lab ID</th>
                <th>Recipient</th>
                <th>Transfer</th>
                <th>Shipping Note</th>
                <th>Container Type</th>
                <th>Slide Number</th>
                <th>Trim Remarks</th>
            </tr>
            </thead>
            <%
                SimpleFilter.OrClause orClause = new SimpleFilter.OrClause();
                orClause.addClause(new SimplerFilter("collect_before_death", CompareType.EQUAL, false).getClauses().get(0));
                orClause.addClause(new SimplerFilter("collect_before_death", CompareType.ISBLANK, null).getClauses().get(0));
                SimpleFilter preDeathFilter = taskFilter.clone();
                preDeathFilter.addClause(orClause);
                List<JSONObject> postmortemTissueSamples = JsonUtils.getSortedListFromJSONArray(queryFactory.selectRows("study", "tissue_samples", preDeathFilter), new NumberKeyComparator("collection_order"));

                for (JSONObject tissueSample : postmortemTissueSamples) {
                    String deliveryMethod;
                    try{
                        deliveryMethod = tissueSample.getString("ship_to");
                    }catch(Exception JSONException){
                        deliveryMethod = null;
                    }
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
                <td><%= h(tissueSample.optString("lab_sample_id")) %>                 </td>
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

        <% if (!organWeights.isEmpty()) { %>
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