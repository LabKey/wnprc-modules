package org.labkey.wnprc_ehr.service.dataentry;

import org.json.JSONObject;
import org.labkey.api.data.*;
import org.labkey.api.ehr.EHRService;
import org.labkey.api.ehr.dataentry.RequestHelper;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.DuplicateKeyException;
import org.labkey.api.query.InvalidKeyException;
import org.labkey.api.security.User;
import org.labkey.dbutils.api.SimpleQueryFactory;
import org.labkey.dbutils.api.SimplerFilter;
import org.labkey.dbutils.api.exception.MissingPermissionsException;
import org.labkey.wnprc_ehr.pathology.necropsy.messages.*;
import org.labkey.wnprc_ehr.pathology.necropsy.security.permission.ScheduleNecropsyPermission;
import sun.reflect.generics.reflectiveObjects.NotImplementedException;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * Created by jon on 4/4/17.
 */
public class NecropsyDataEntryService extends DataEntryService {
    public NecropsyDataEntryService(User user, Container container) throws MissingPermissionsException {
        super(user, container, ScheduleNecropsyPermission.class);
    }

    public void scheduleNecropsy(String requestId, Date scheduledDate, User assignedTo, User pathogist, User assistant) {
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
            newTask.put("assignedTo", assignedTo.getUserId());
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
                        row.put("performedby", pathogist.getUserId());
                        row.put("assistant",   assistant.getUserId());
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

        } catch (DuplicateKeyException|BatchValidationException|InvalidKeyException e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to schedule necropsy", e);
        }
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

    public NecropsyRequestDetailsForm getNecropsyRequestDetails(String necropsyLsid) {
        throw new NotImplementedException();
    }

    public NecropsyRequestListForm getNecropsyRequests() {
        throw new NotImplementedException();
    }
}
