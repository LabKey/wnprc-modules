<%
/*
 * Copyright (c) 2018-2026 Board of Regents of the University of Wisconsin System
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
<%@ page import="com.google.common.base.Joiner" %>
<%@ page import="org.apache.commons.lang3.ObjectUtils" %>
<%@ page import="org.json.JSONArray" %>
<%@ page import="org.json.JSONObject" %>
<%@ page import="org.labkey.api.data.CompareType" %>
<%@ page import="org.labkey.api.util.HtmlString" %>
<%@ page import="org.labkey.api.util.JsonUtil" %>
<%@ page import="org.labkey.dbutils.api.SimpleQueryFactory" %>
<%@ page import="org.labkey.dbutils.api.SimplerFilter" %>
<%@ page import="org.labkey.webutils.api.json.JsonUtils" %>
<%@ page import="java.util.ArrayList" %>
<%@ page import="java.util.List" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>
<%!
    private static final HtmlString NOT_SPECIFIED = HtmlString.unsafe("<em>[not specified]</em>");
    private static final HtmlString NONE = HtmlString.unsafe("<em>[none]</em>");

    private HtmlString valueOr(JSONObject row, String key, HtmlString defaultValue)
    {
        String value = row.optString(key, null);
        return null == value ? defaultValue : h(value);
    }

    private HtmlString multilineOr(JSONObject row, String key, HtmlString defaultValue)
    {
        String value = row.optString(key, null);
        return null == value ? defaultValue : h(value, true);
    }
%>

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

    JSONArray necropsyRecords = queryFactory.selectRows("study", "necropsy", taskFilter);

    // Get a string to display the weight(s)
    JSONArray weights = queryFactory.selectRows("study", "weight", taskFilter);
    List<String> weightList = new ArrayList();
    for (JSONObject weightRecord : JsonUtil.toJSONObjectList(weights)) {
        String weight;
        try{
            weight = weightRecord.getString("weight");

        }catch(Exception JSONException){
            weight = null;
        }
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

    HtmlString alopecia = NOT_SPECIFIED;
    if (alopecias.length() == 1) {
        alopecia = valueOr(alopecias.getJSONObject(0), "score", NOT_SPECIFIED);
    }
    else if (alopecias.length() > 1) {
        List<HtmlString> alopeciaStrings = new ArrayList<>();

        for (JSONObject alo : JsonUtil.toJSONObjectList(alopecias)) {
            alopeciaStrings.add(valueOr(alo, "score", NOT_SPECIFIED));
        }

        alopecia = HtmlString.join(alopeciaStrings, HtmlString.of(", "));
    }

    List<JSONObject> sortedMorphologies = JsonUtils.getSortedListFromJSONArray(morphologies, "remark");

    // Get the bcs score
    HtmlString bcs_score;
    if (bcs_scores.length() > 0) {
        JSONObject scoreRec = bcs_scores.getJSONObject(0);
        bcs_score = h(scoreRec.optString("score"));
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

    <h2 class="text-center">Necropsy Report <%=h(necropsy.optString("caseno", ""))%> for <%=h(necropsy.optString("id", "[unknown animal]"))%></h2>

    <div class="row">
        <h4>Necropsy Summary</h4>
        <hr class="sectionBar"/>

        <div class="col-xs-6">
                <dl class="dl-horizontal">
                    <dt>Time of Death</dt>
                    <dd class="dateWithTimeThatNeedsFormatting"><%=valueOr(necropsy, "timeofdeath", NOT_SPECIFIED)%></dd>

                    <dt>Manner of Death</dt>
                    <dd><%=valueOr(necropsy, "mannerofdeath", NOT_SPECIFIED)%></dd>

                    <dt>Cause of Death</dt>
                    <dd><%=valueOr(necropsy, "causeofdeath", NOT_SPECIFIED)%></dd>

                    <dt>Performed On</dt>
                    <dd class="dateWithTimeThatNeedsFormatting"><%=h(necropsy.optString("date", ""))%></dd>

                    <dt>Dam</dt>
                    <dd><%=valueOr(necropsy, "dam", NOT_SPECIFIED)%></dd>
                </dl>
        </div>

        <div class="col-xs-6">
            <dl class="dl-horizontal">
                <dt>Animal Weight</dt>
                <dd><%=h(weight)%></dd>

                <dt>Body Condition Score</dt>
                <dd><%=bcs_score%></dd>

                <dt>Alopecia Score</dt>
                <dd><%=alopecia%></dd>

                <dt>Perfusion</dt>
                <dd><%=valueOr(necropsy, "perfusion_area", NOT_SPECIFIED)%></dd>

                <dt>Tissue Distribution</dt>
                <dd><%=valueOr(necropsy, "tissue_distribution", NOT_SPECIFIED)%></dd>

            </dl>
        </div>

    </div>

    <div class="row">
        <h4>Final Summary Comments</h4>
        <hr class="sectionBar"/>

        <div class="container">
            <%=multilineOr(necropsy, "remark", NONE)%>
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
                    <td><%=h(morphology.optString("remark"))%></td>
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
            <%=multilineOr(necropsy, "grossdescription", NONE)%>
        </div>
    </div>

    <div class="row">
        <h4>Histological Description</h4>
        <hr class="sectionBar"/>

        <div class="container">
            <%=multilineOr(necropsy, "histologicaldescription", NONE)%>
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
                    for (JSONObject organ_weight : JsonUtil.toJSONObjectList(organ_weights)) {
                %>
                <tr>
                    <td><%=h(organ_weight.optString("tissue_fs_meaning"))%></td>
                    <td><%=h(organ_weight.optString("qualifier"))%></td>
                    <td><%=h(organ_weight.optString("weight"))%>g</td>
                    <td><%=h(organ_weight.optString("remark"), true)%></td>
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

<script type="text/javascript" nonce="<%=getScriptNonce()%>">
    (function() {
        $('.dateWithTimeThatNeedsFormatting').each(function() {
            var $this = $(this);

            $this.text(moment($this.text(), "YYYY/MM/DD HH:mm:ss").format('MMM D[,] YYYY [at] H:mma'));
        });
    })();
</script>