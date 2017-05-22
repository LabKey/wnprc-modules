package org.labkey.wnprc_ehr.pathology.necropsy;

import org.json.JSONObject;
import org.labkey.api.action.ApiUsageException;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.DbScope;
import org.labkey.api.ehr.EHRService;
import org.labkey.api.ehr.dataentry.RequestHelper;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.DuplicateKeyException;
import org.labkey.api.query.InvalidKeyException;
import org.labkey.api.security.GroupManager;
import org.labkey.api.security.User;
import org.labkey.api.security.UserPrincipal;
import org.labkey.api.security.permissions.Permission;
import org.labkey.dbutils.api.SimpleQueryFactory;
import org.labkey.dbutils.api.SimplerFilter;
import org.labkey.dbutils.api.exception.MissingPermissionsException;
import org.labkey.security.xml.GroupEnumType;
import org.labkey.wnprc_ehr.pathology.necropsy.messages.*;
import org.labkey.wnprc_ehr.pathology.necropsy.security.permission.ScheduleNecropsyPermission;
import org.labkey.wnprc_ehr.service.dataentry.DataEntryService;
import sun.reflect.generics.reflectiveObjects.NotImplementedException;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * Created by jon on 5/16/17.
 */
public class ScheduleNecropsyService extends DataEntryService {
    public ScheduleNecropsyService(User user, Container container) throws MissingPermissionsException {
        super(user, container, ScheduleNecropsyPermission.class);
    }


    public void scheduleNecropsy(String requestId, Date scheduledDate, UserPrincipal assignedTo, User pathogist, User assistant) {
        String comment = "Scheduling Necropsy";
        String taskid = UUID.randomUUID().toString().toUpperCase();
        Date taskDueDate = (Date) scheduledDate.clone();
        taskDueDate.setHours(17);
        taskDueDate.setMinutes(0);

        SimplerFilter requestIdFilter = new SimplerFilter("requestid", CompareType.EQUAL, requestId);
        SimpleQueryFactory queryFactory = new SimpleQueryFactory(getEscalationUser(), container);

        try (DbScope.Transaction transaction = DbSchema.get("study").getScope().ensureTransaction()) {
            JSONObject newTask = new JSONObject();
            newTask.put("taskid",     taskid);
            newTask.put("title",      "Necropsy");
            newTask.put("category",   "task");
            newTask.put("assignedTo", (assignedTo == null) ? null : assignedTo.getUserId());
            newTask.put("QCState",    EHRService.QCSTATES.Scheduled.getQCState(container).getRowId());
            newTask.put("duedate",    taskDueDate);
            newTask.put("formtype",   "Necropsy");

            getUpdateService("ehr", "tasks").insertRow(newTask, comment);

            for (String tableName : Arrays.asList("necropsies", "organ_weights", "tissue_samples")) {
                SimpleUpdateService updateService = getUpdateService("study", tableName);

                List<Map<String, Object>> rowsToUpdate = new ArrayList<>();
                for (JSONObject row : queryFactory.selectRows("study", tableName, requestIdFilter).toJSONObjectArray()) {
                    row.put("taskid",  taskid);
                    row.put("QCState", EHRService.QCSTATES.Scheduled.getQCState(container).getRowId());
                    row.put("date",    scheduledDate);

                    if ("necropsies".equals(tableName)) {
                        row.put("performedby", (pathogist == null) ? null : pathogist.getDisplayName(user));
                        row.put("assistant",   (assistant == null) ? null : assistant.getDisplayName(user));
                    }

                    rowsToUpdate.add(row);
                }

                updateService.updateRows(rowsToUpdate, comment);
            }

            for (JSONObject row : queryFactory.selectRows("ehr", "requests", requestIdFilter).toJSONObjectArray()) {
                row.put("QCState", EHRService.QCSTATES.RequestApproved.getQCState(container).getRowId());

                getUpdateService("ehr", "requests").updateRow(row, comment);
            }


            transaction.commit();

            RequestHelper requestHelper = new RequestHelper(requestId, user, container);
            requestHelper.sendEmail("Your Necropsy Request Has Been Scheduled", "");

        } catch (DuplicateKeyException |BatchValidationException |InvalidKeyException e) {
            e.printStackTrace();
            throw new ApiUsageException("Failed to schedule necropsy: " + e.getMessage(), e);
        }
    }

    public NecropsyRequestDetailsForm getNecropsyRequestDetails(String necropsyLsid) throws ParseException {
        NecropsyRequestDetailsForm response = new NecropsyRequestDetailsForm();

        SimplerFilter filter = new SimplerFilter("lsid", CompareType.EQUAL, necropsyLsid);
        SimpleQueryFactory queryFactory = new SimpleQueryFactory(getEscalationUser(), container);
        JSONObject row = queryFactory.selectRows("study", "Necropsy Requests", filter).toJSONObjectArray()[0];

        RequestStaticInfo info = new RequestStaticInfo();
        info.animalid = row.getString("animalid");
        info.comments = row.getString("comments");
        info.priority = row.getString("priority");
        info.requestid = row.getString("requestid");
        response.staticInfo = info;

        ScheduleNecropsyForm form = new ScheduleNecropsyForm();
        form.assignedTo    = GroupManager.getGroup(container, "pathology (LDAP)", GroupEnumType.SITE).getUserId();
        form.assistant     = row.isNull("assistant") ? null : row.getInt("assistant");
        form.location      = row.getString("location");
        form.scheduledDate = _parseDate(row.getString("date"));
        form.pathologist   = row.isNull("pathologist") ? null : row.getInt("pathologist");
        response.form = form;

        return response;
    }

    public NecropsyRequestListForm getNecropsyRequests() throws ParseException {
        NecropsyRequestListForm necropsyList = new NecropsyRequestListForm();

        int requestPending = EHRService.QCSTATES.RequestPending.getQCState(container).getRowId();
        SimplerFilter filter = new SimplerFilter("state", CompareType.EQUAL, requestPending);

        SimpleQueryFactory queryFactory = new SimpleQueryFactory(getEscalationUser(), container);
        for (JSONObject row : queryFactory.selectRows("study", "Necropsy Requests", filter).toJSONObjectArray()) {
            NecropsyRequestForm requestForm = new NecropsyRequestForm();

            requestForm.requestLsid = row.getString("lsid");
            requestForm.requestId = row.getString("requestid");
            requestForm.priority = row.getString("priority");
            requestForm.animalId = row.getString("animalid");
            requestForm.requestedBy = row.getString("requestor");
            requestForm.requestedOn = _parseDate(row.getString("created"));
            requestForm.requestedFor = _parseDate(row.getString("date"));

            necropsyList.requests.add(requestForm);
        }

        return necropsyList;
    }

    private Date _parseDate(String string) throws ParseException {
        if (string == null) {
            return null;
        }

        return (new SimpleDateFormat("yyyy-MM-dd HH:mm:ss")).parse(string);
    }
}
