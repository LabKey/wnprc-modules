<%@ page import="org.apache.commons.lang3.ObjectUtils" %>
<%@ page import="org.labkey.dbutils.api.SimpleQueryFactory" %>
<%@ page import="org.labkey.dbutils.api.SimplerFilter" %>
<%@ page import="org.labkey.api.data.CompareType" %>
<%@ page import="org.json.JSONArray" %>
<%@ page import="org.json.JSONObject" %>
<%@ page import="java.util.List" %>
<%@ page import="java.util.ArrayList" %>
<%@ page import="com.google.common.base.Joiner" %>
<%@ page import="org.labkey.webutils.api.json.JsonUtils" %>
<%@ page import="org.labkey.dbutils.api.SimpleQuery" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>


<style type="text/css">
    #report hr.sectionBar {
        border: none;
        height: 1px;
        margin-top: 0;
        border-top: solid 1px #aaa;
    }

    @media print {
        .row, tr {
            page-break-inside: avoid;
        }
    }
</style>
<%
    String taskid = ObjectUtils.firstNonNull(request.getParameter("taskid"), "");
    SimpleQueryFactory queryFactory = new SimpleQueryFactory(getUser(), getContainer());

    SimplerFilter taskFilter = new SimplerFilter("taskid", CompareType.EQUAL, taskid);

    String NOT_SPECIFIED = "<em>[not specified]</em>";
    String NONE = "<em>[none]</em>";

    JSONArray necropsyRecords = queryFactory.selectRows("study", "necropsy", taskFilter);

    // Get a string to display the weight(s)
    JSONArray weights = queryFactory.selectRows("study", "weight", taskFilter);
    List<String> weightList = new ArrayList();
    for(JSONObject weightRecord : weights.toJSONObjectArray()) {
        String weight = weightRecord.getString("weight");

        if (weight == null) {
            weight = "[not specified]";
        }
        else {
            weight = weight + " kg";
        }
        weightList.add(weight);
    }
    String weight = Joiner.on(", ").join(weightList);

    // Grab various tables
    JSONArray treatments     = queryFactory.selectRows("study", "Drug Administration",  taskFilter);
    JSONArray organ_weights  = queryFactory.selectRows("study", "organ_weights",        taskFilter);
    JSONArray morphologies   = queryFactory.selectRows("study", "morphologicDiagnosis", taskFilter);
    JSONArray tissue_samples = queryFactory.selectRows("study", "tissue_samples",       taskFilter);
    JSONArray bcs_scores     = queryFactory.selectRows("study", "bcs",                  taskFilter);
    JSONArray alopecias      = queryFactory.selectRows("study", "alopecia",             taskFilter);

    String alopecia = NOT_SPECIFIED;
    if (alopecias.length() == 1) {
        alopecia = alopecias.getJSONObject(0).optString("score", NOT_SPECIFIED);
    }
    else if (alopecias.length() > 1) {
        List<String> alopeciaStrings = new ArrayList<>();

        for (JSONObject alo : alopecias.toJSONObjectArray()) {
            alopeciaStrings.add(alo.optString("score", NOT_SPECIFIED));
        }

        alopecia = Joiner.on(", ").join(alopeciaStrings);
    }

    List<JSONObject> sortedMorphologies = JsonUtils.getSortedListFromJSONArray(morphologies, "remark");

    // Get the bcs score
    String bcs_score;
    if (bcs_scores.length() > 0) {
        JSONObject scoreRec = bcs_scores.getJSONObject(0);
        bcs_score = scoreRec.optString("score");
    }
    else {
        bcs_score = NOT_SPECIFIED;
    }
%>

<%
    if (necropsyRecords.length() == 0) {
%>
<div class="container">
    <div class="alert alert-danger hidden-print text-center" role="alert">
        <strong>There are no necropsies associated with this taskid!</strong>
    </div>
</div>

<%
    }
    else {
        JSONObject necropsy = necropsyRecords.getJSONObject(0);
        boolean billingComplete = necropsy.optBoolean("billing", false);
%>

<div id="report" class="container">
    <div class="alert alert-warning hidden-print text-center" role="alert">
        <p>
            Some browsers may mangle the report formatting when printing.  For best results, print from Safari.
        </p>
        <p>
            In Chrome on a Mac, you can select "Print using system dialog" from the print menu, which will give you the
            same print dialog as Safari.
        </p>
    </div>

    <%
        if (!necropsy.optString("qcstate_fs_label").equals("Completed")) {
    %>
    <div class="container">
        <div class="alert alert-danger text-center" role="alert">
            <strong>Warning!  This necropsy is not yet complete!</strong>
        </div>
    </div>
    <%
        }
    %>

    <h2 class="text-center">Necropsy Report <%= necropsy.optString("caseno", "")%> for <%= necropsy.optString("id", "[unknown animal]") %></h2>

    <div class="row">
        <h4>Necropsy Summary</h4>
        <hr class="sectionBar"/>

        <div class="col-xs-6">
                <dl class="dl-horizontal">
                    <dt>Time of Death</dt>
                    <dd class="dateWithTimeThatNeedsFormatting"><%= necropsy.optString("timeofdeath", NOT_SPECIFIED)%></dd>

                    <dt>Manner of Death</dt>
                    <dd><%= necropsy.optString("mannerofdeath", NOT_SPECIFIED) %></dd>

                    <dt>Cause of Death</dt>
                    <dd><%= necropsy.optString("causeofdeath", NOT_SPECIFIED)%></dd>

                    <dt>Performed On</dt>
                    <dd class="dateWithTimeThatNeedsFormatting"><%= necropsy.optString("date", "")%></dd>

                    <dt>Dam</dt>
                    <dd><%= necropsy.optString("dam", NOT_SPECIFIED)%></dd>
                </dl>
        </div>

        <div class="col-xs-6">
            <dl class="dl-horizontal">
                <dt>Animal Weight</dt>
                <dd><%= weight %></dd>

                <dt>Body Condition Score</dt>
                <dd><%= bcs_score %></dd>

                <dt>Alopecia Score</dt>
                <dd><%= alopecia %></dd>

                <dt>Perfusion</dt>
                <dd><%= necropsy.optString("perfusion_area", NOT_SPECIFIED)%></dd>

                <dt>Tissue Distribution</dt>
                <dd><%= necropsy.optString("tissue_distribution", NOT_SPECIFIED)%></dd>

            </dl>
        </div>

    </div>

    <div class="row">
        <h4>Final Summary Comments</h4>
        <hr class="sectionBar"/>

        <div class="container">
            <%= necropsy.optString("remark", NONE).replaceAll("\n", "<br>") %>
        </div>
    </div>

    <div class="row">
        <h4>Morphological Diagnosis</h4>
        <hr class="sectionBar"/>

        <div class="container">
            <%
                if (morphologies.length() == 0) {
            %>
            <p><em>No morphological diagnoses were recorded during this necropsy.</em></p>
            <%
            }
            else {
            %>
            <table class="table">
                <thead>
                <tr>
                    <th>Diagnosis</th>
                </tr>
                </thead>
                <tbody>
                <%
                    for (JSONObject morphology : sortedMorphologies) {
                %>
                <tr>
                    <td><%= morphology.optString("remark") %></td>
                </tr>
                <%
                    }
                %>
                </tbody>
            </table>
            <%
                }
            %>
        </div>
    </div>

    <div class="row">
        <h4>Gross Morphological Description</h4>
        <hr class="sectionBar"/>

        <div class="container">
            <%= necropsy.optString("grossdescription", NONE).replaceAll("\n", "<br>") %>
        </div>
    </div>

    <div class="row">
        <h4>Histological Description</h4>
        <hr class="sectionBar"/>

        <div class="container">
            <%= necropsy.optString("histologicaldescription", NONE).replaceAll("\n", "<br>") %>
        </div>
    </div>


    <div class="row">
        <h4>Organ Weights</h4>
        <hr class="sectionBar"/>

        <div class="container">
            <%
                if (organ_weights.length() == 0) {
            %>
            <p><em>No organ weights were recorded during this necropsy.</em></p>
            <%
            }
            else {
            %>
            <table class="table">
                <thead>
                <tr>
                    <th>Organ/Tissue</th>
                    <th>Qualifier</th>
                    <th>Weight</th>
                    <th>Remark</th>
                </tr>
                </thead>
                <tbody>
                <%
                    for (JSONObject organ_weight : organ_weights.toJSONObjectArray()) {
                %>
                <tr>
                    <td><%= organ_weight.optString("tissue_fs_meaning") %></td>
                    <td><%= organ_weight.optString("qualifier") %></td>
                    <td><%= organ_weight.optString("weight") %>g</td>
                    <td><%= organ_weight.optString("remark").replaceAll("\n", "<br>") %></td>
                </tr>
                <%
                    }
                %>
                </tbody>
            </table>
            <%
                }
            %>
        </div>
    </div>
</div>
<%
    }
%>

<script type="application/javascript">
    (function() {
        $('.dateWithTimeThatNeedsFormatting').each(function() {
            var $this = $(this);

            $this.text(moment($this.text(), "YYYY/MM/DD HH:mm:ss").format('MMM D[,] YYYY [at] H:mma'));
        });
    })();
</script>