package org.labkey.wnprc_ehr.pathology.necropsy;

import org.json.JSONObject;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.security.User;
import org.labkey.api.security.permissions.Permission;
import org.labkey.dbutils.api.SimpleQuery;
import org.labkey.dbutils.api.SimpleQueryFactory;
import org.labkey.dbutils.api.SimplerFilter;
import org.labkey.dbutils.api.exception.MissingPermissionsException;
import org.labkey.webutils.api.json.JsonUtils;
import org.labkey.wnprc_ehr.pathology.necropsy.messages.NecropsyDetailsForm;
import org.labkey.wnprc_ehr.pathology.necropsy.messages.NecropsyEventForm;
import org.labkey.wnprc_ehr.pathology.necropsy.messages.NecropsySuiteInfo;
import org.labkey.wnprc_ehr.pathology.necropsy.messages.ScheduledNecropsiesForm;
import org.labkey.wnprc_ehr.pathology.necropsy.security.permission.ViewNecropsyPermission;
import org.labkey.wnprc_ehr.service.dataentry.DataEntryService;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * Created by jon on 5/16/17.
 */
public class ViewNecropsyService extends DataEntryService {
    public ViewNecropsyService(User user, Container container) throws MissingPermissionsException {
        super(user, container, ViewNecropsyPermission.class);
    }

    public ScheduledNecropsiesForm getScheduledNecropsies(Date startDate, Date endDate) throws ParseException {
        ScheduledNecropsiesForm returnForm = new ScheduledNecropsiesForm();

        SimplerFilter startFilter = new SimplerFilter("date", CompareType.DATE_GTE, startDate);
        SimplerFilter endFilter   = new SimplerFilter("date", CompareType.DATE_LTE, endDate);
        SimpleFilter filter = (new SimpleFilter()).addAllClauses(endFilter).addAllClauses(startFilter);

        SimpleQueryFactory queryFactory = new SimpleQueryFactory(getEscalationUser(), container);
        for (JSONObject row : queryFactory.selectRows("study", "Necropsy Schedule", filter).toJSONObjectArray()) {
            NecropsyEventForm event = new NecropsyEventForm();
            event.lsid = row.getString("lsid");
            event.animalId = row.getString("animalid");

            event.scheduledDate = (new SimpleDateFormat("yyyy-MM-dd HH:mm:ss")).parse(row.getString("date"));
            event.color = row.getString("display_color");

            returnForm.scheduledNecropsies.add(event);
        }

        return returnForm;
    }

    public NecropsyDetailsForm getNecropsyDetails(String necropsyLsid) throws ParseException {
        NecropsyDetailsForm detailsForm = new NecropsyDetailsForm();

        SimplerFilter filter = new SimplerFilter("lsid", CompareType.EQUAL, necropsyLsid);
        SimpleQueryFactory queryFactory = new SimpleQueryFactory(getEscalationUser(), container);
        JSONObject row = queryFactory.selectRows("study", "Necropsy Schedule Details", filter).toJSONObjectArray()[0];

        detailsForm.taskId = row.getString("taskid");
        detailsForm.animalId = row.getString("animalid");
        detailsForm.requestId = "";
        detailsForm.project   = row.getString("project");
        detailsForm.account   = row.getString("account");
        detailsForm.protocol  = row.getString("protocol");
        detailsForm.scheduledDate = (new SimpleDateFormat("yyyy-MM-dd HH:mm:ss")).parse(row.getString("date"));
        detailsForm.necropsyLocation = row.getString("location");
        detailsForm.whoDeliversToNx  = row.getString("who_delivers");
        detailsForm.deliveryComment  = row.optString("delivery_comment", "");
        detailsForm.currentRoom = row.getString("cur_room");
        detailsForm.currentCage = row.getString("cur_cage");
        detailsForm.housingType = row.getString("cur_cond");
        detailsForm.hasTissuesForAVRL = row.getBoolean("has_tissues_for_avrl");

        return detailsForm;
    }

    public List<NecropsySuiteInfo> getNecropsySuites() {
        List<NecropsySuiteInfo> suites = new ArrayList<>();

        SimpleQueryFactory queryFactory = new SimpleQueryFactory(user, container);
        List<JSONObject> necropsySuites = JsonUtils.getListFromJSONArray(queryFactory.selectRows("wnprc", "necropsy_suite"));

        for (JSONObject json : necropsySuites) {
            NecropsySuiteInfo info = new NecropsySuiteInfo();
            info.roomCode = json.getString("room");
            info.suiteName = json.getString("displayname");
            info.color = json.getString("display_color");

            suites.add(info);
        }

        return suites;
    }

    public Map<String, String> getPathologists() {
        Map<String, String> pathologists = new HashMap<>();

        SimpleQueryFactory queryFactory = new SimpleQueryFactory(user, container);
        SimpleQuery pathologistQuery = queryFactory.makeQuery("ehr_lookups", "pathologists");
        List<JSONObject> pathologistJSONList = JsonUtils.getSortedListFromJSONArray(pathologistQuery.getResults().getJSONArray("rows"), "userid");

        for (JSONObject pathologistJSON : pathologistJSONList) {
            pathologists.put(pathologistJSON.getString("internaluserid"), pathologistJSON.getString("userid"));
        }

        return pathologists;
    }
}
