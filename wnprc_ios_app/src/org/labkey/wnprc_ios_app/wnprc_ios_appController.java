/*
 * Copyright (c) 2025 LabKey Corporation
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

package org.labkey.wnprc_ios_app;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.json.JSONObject;
import org.labkey.api.action.ApiSimpleResponse;
import org.labkey.api.action.MutatingApiAction;
import org.labkey.api.action.SimpleApiJsonForm;
import org.labkey.api.action.SimpleViewAction;
import org.labkey.api.action.SpringActionController;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.query.QueryService;
import org.labkey.api.security.ActionNames;
import org.labkey.api.security.RequiresLogin;
import org.labkey.api.security.RequiresPermission;
import org.labkey.api.security.permissions.ReadPermission;
import org.labkey.api.util.PageFlowUtil;
import org.labkey.api.view.JspView;
import org.labkey.api.view.NavTree;
import org.springframework.validation.BindException;
import org.springframework.web.servlet.ModelAndView;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.List;

public class wnprc_ios_appController extends SpringActionController
{
    private static Logger _log = LogManager.getLogger(wnprc_ios_appController.class);
    private static final DefaultActionResolver _actionResolver = new DefaultActionResolver(wnprc_ios_appController.class);
    public static final String NAME = "wnprc_ios_app";

    public wnprc_ios_appController()
    {
        setActionResolver(_actionResolver);
    }

//    @RequiresPermission(ReadPermission.class)
//    public class BeginAction extends SimpleViewAction
//    {
//        public ModelAndView getView(Object o, BindException errors)
//        {
//            return new JspView("/org/labkey/wnprc_ios_app/view/hello.jsp");
//        }
//
//        public void addNavTrail(NavTree root) { }
//    }



//    // This function is muted until needed.
//    // This function always returns 'true'.  It is a placeholder if we decide to implement any future validation for this dataset.
//    @ActionNames("updatePushNotification")
////    @RequiresLogin
//    @RequiresPermission(ReadPermission.class)
//    public static class UpdatePushNotificationAction extends MutatingApiAction<SimpleApiJsonForm> {
//        @Override
//        public Object execute(SimpleApiJsonForm form, BindException errors) throws Exception {
//            // Creates variables.
//            ApiSimpleResponse response = new ApiSimpleResponse();
//
//            // Retrieves passed-in arguments.
//            JSONObject myForm = form.getJsonObject();
//            String pushToken = myForm.getString("push_token").toString();
//            String targetUser = myForm.getString("target_user").toString();
//            String insertOrUpdate = myForm.getString("insert_or_update").toString();
//
//            // Code any necessary validation here.
//            // Verifies user is either inserting (with no previous preferences) or updating (with previous preferences).
//            SimpleFilter pushNotificationsFilter = new SimpleFilter("target_user", targetUser, CompareType.EQUAL);
//            TableInfo ti = QueryService.get().getUserSchema(getUser(), getContainer(), "wnprc_ios_app").getTable("push_notifications");
//            TableSelector myTable = new TableSelector(ti, PageFlowUtil.set("target_user"), pushNotificationsFilter, null);
//            Map<String, Object>[] rows = myTable.getMapArray();
//            if (insertOrUpdate.equals("insert")) {
//                if (rows.length > 0) {
//                    response.put("detailedResponse", "UpdatePushNotificationAction API: Insert failed due to multiple rows existing.");
//                    response.put("success", false);
//                    return response;
//                }
//            }
//            else if (insertOrUpdate.equals("update")) {
//                if (rows.length != 1) {
//                    response.put("detailedResponse", "UpdatePushNotificationAction API: Update failed due to not having 1 existing row.");
//                    response.put("success", false);
//                    return response;
//                }
//            }
//
//            // Successfully completes validation.
//            _log.info("UpdatePushNotificationAction API: pushToken=" + pushToken + ", targetUser=" + targetUser + ", insertOrUpdate=" + insertOrUpdate);
//            response.put("detailedResponse", "UpdatePushNotificationAction API: Push notification record validated successfully.");
//            response.put("success", true);
//            return response;
//        }
//    }



//    // This function is muted until needed.
//    // This function always returns 'true'.  It is a placeholder if we decide to implement any future validation for this dataset.
//    @RequiresLogin
//    public static class UpdateReportedIssuesAction extends MutatingApiAction<SimpleApiJsonForm> {
//        @Override
//        public Object execute(SimpleApiJsonForm form, BindException errors) throws Exception {
//            // Creates variables.
//            ApiSimpleResponse response = new ApiSimpleResponse();
//
//            // Retrieves passed-in arguments.
//            JSONObject myForm = form.getJsonObject();
//            String issueDescription = myForm.getString("issue_description").toString();
//            String issueStatus = myForm.getString("status").toString();
//
//            _log.info("UpdateReportedIssuesAction API: issueDescription=" + issueDescription + ", issueStatus=" + issueStatus);
//            // Code any necessary validation here.
//
//            response.put("detailedResponse", "UpdateReportedIssuesAction API: Reported issue validated successfully.");
//            response.put("success", true);
//            return response;
//        }
//    }



//    // This function is muted until needed.
//    // This function always returns 'true'.  It is a placeholder if we decide to implement any future validation for this dataset.
//    @RequiresLogin
//    public static class UpdateSessionLogAction extends MutatingApiAction<SimpleApiJsonForm>
//    {
//        @Override
//        public Object execute(SimpleApiJsonForm form, BindException errors) throws Exception
//        {
//            // Creates variables.
//            ApiSimpleResponse response = new ApiSimpleResponse();
//
//            // Retrieves passed-in arguments.
//            JSONObject myForm = form.getJsonObject();
//            String startTime = myForm.getString("start_time").toString();
//            String endTime = myForm.getString("end_time").toString();
//            String schemaName = myForm.getString("schema_name").toString();
//            String queryName = myForm.getString("query_name").toString();
//            String numberOfRecords = myForm.getString("number_of_records").toString();
//            String errorsOccurred = myForm.getString("errors_occurred").toString();
//            String createdBy = myForm.getString("createdby").toString();
//            String userAgent = myForm.getString("user_agent").toString();
//
//            _log.info("UpdateSessionLog API: startTime=" + startTime + ", endTime=" + endTime + ", schemaName=" + schemaName + ", queryName=" + queryName + ", numberOfRecords=" + numberOfRecords + ", errorsOccurred=" + errorsOccurred + ", createdBy=" + createdBy + ", userAgent=" + userAgent);
//            // Code any necessary validation here.
//
//            response.put("detailedResponse", "UpdateSessionLog API: Session log record validated successfully.");
//            response.put("success", true);
//            return response;
//        }
//    }



//    // This function is muted until needed.
//    @RequiresLogin
//    public static class UpdateUserAnimalAbstractPreferencesAction extends MutatingApiAction<SimpleApiJsonForm>
//    {
//        @Override
//        public Object execute(SimpleApiJsonForm form, BindException errors) throws Exception
//        {
//            // Creates variables.
//            ApiSimpleResponse response = new ApiSimpleResponse();
////            NotificationToolkit notificationToolkit = new NotificationToolkit();
//
//            // Retrieves passed-in arguments.
//            JSONObject myForm = form.getJsonObject();
//            int targetUser = myForm.getInt("target_user");
//            String insertOrUpdate = myForm.getString("insert_or_update").toString();
//
//            // Validates that the preferences to change are supported.
//            String[] supportedPreferences = {
//                "show_id",
//                "show_gender",
//                "show_availability",
//                "show_room",
//                "show_cage",
//                "show_condition",
//                "show_num_animals_in_cage",
//                "show_status",
//                "show_age",
//                "show_birth",
//                "show_dam",
//                "show_sire",
//                "show_tb_date",
//                "show_prepaid",
//                "show_mgap_ids",
//                "show_most_recent_weight",
//                "show_most_recent_weight_date",
//                "show_hold",
//                "show_medical",
//                "show_current_behaviors",
//                "show_most_recent_alopecia_score",
//                "show_most_recent_body_condition_score",
//                "show_origin",
//                "show_geographic_origin",
//                "show_ancestry",
//                "show_most_recent_arrival",
//                "show_most_recent_departure",
//                "show_death",
//                "show_remark",
//                "show_mgap_sequence_types"
//            };
//            List<String> supportedPreferencesList = Arrays.asList(supportedPreferences);
//            Iterator<String> keys = myForm.keys();
//            Boolean hasUnsupportedPreferences = false;
//            while (keys.hasNext()) {
//                String key = keys.next();
//                if (!key.equals("target_user") && !key.equals("date_last_updated") && !key.equals("insert_or_update")) {
//                    if (!supportedPreferencesList.contains(key)) {
//                        hasUnsupportedPreferences = true;
//                    }
//                }
//            }
//            if (hasUnsupportedPreferences) {
//                response.put("detailedResponse", "UpdateUserAnimalAbstractPreferences API: Abstract preferences were unsupported.");
//                response.put("success", false);
//                return response;
//            }
//
//            // Verifies user is either inserting (with no previous preferences) or updating (with previous preferences).
//            SimpleFilter animalAbstractPreferencesFilter = new SimpleFilter("target_user", targetUser, CompareType.EQUAL);
//            TableInfo ti = QueryService.get().getUserSchema(getUser(), getContainer(), "wnprc_ios_app").getTable("user_animal_abstract_preferences");
//            TableSelector myTable = new TableSelector(ti, PageFlowUtil.set("target_user"), animalAbstractPreferencesFilter, null);
//            Map<String, Object>[] rows = myTable.getMapArray();
//            if (insertOrUpdate.equals("insert")) {
//                if (rows.length > 0) {
//                    response.put("detailedResponse", "UpdateUserAnimalAbstractPreferences API: Insert failed due to multiple rows existing.");
//                    response.put("success", false);
//                    return response;
//                }
//            }
//            else if (insertOrUpdate.equals("update")) {
//                if (rows.length != 1) {
//                    response.put("detailedResponse", "UpdateUserAnimalAbstractPreferences API: Update failed due to not having 1 existing row.");
//                    response.put("success", false);
//                    return response;
//                }
//            }
//
//            // Successfully completes validation.
//            _log.info("UpdateUserAnimalAbstractPreferencesAction API: targetUser=" + targetUser + ", insertOrUpdate=" + insertOrUpdate);
//            response.put("detailedResponse", "UpdateUserAnimalAbstractPreferences API: Abstract preferences validated successfully.");
//            response.put("success", true);
//            return response;
//        }
//    }
}
