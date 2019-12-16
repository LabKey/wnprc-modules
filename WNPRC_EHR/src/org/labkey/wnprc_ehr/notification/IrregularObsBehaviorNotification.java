package org.labkey.wnprc_ehr.notification;

import org.jetbrains.annotations.NotNull;
import org.labkey.api.collections.CaseInsensitiveHashMap;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.Results;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.Sort;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.module.Module;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.security.User;
import org.labkey.wnprc_ehr.notification.AbstractEHRNotification;

import java.sql.SQLException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Date;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;


public class IrregularObsBehaviorNotification extends AbstractEHRNotification
{
    public IrregularObsBehaviorNotification(Module owner){
        super (owner);
    }


    public String getName() {
        return "Irregular Obs Behavior Notification";
    }

    public String getDescription() {
        return "This notifies of any behavior related irregular obs that have been entered";
    }

    @Override
    public String getEmailSubject(Container c) {
        return "Behavior related irregular obs for "+ _dateTimeFormat.format(new Date());
    }

    public String getScheduleDescription() {
        return "Notifications for behavior related irregular obs are sent at 10:00, and 15:00";
    }

    @Override
    public String getCronString() {
        return "0 0 10,15 * * ?";
    }

    public String getCategory() {
        return "Behavior";
    }

    @Override
    public String getMessageBodyHTML (Container c, User u){
        StringBuilder msg = null;

        //LocalTime currentTime = LocalTime.now();
        //LocalTime morningNotification = LocalTime.of(10,0,0);
        //LocalTime afternoonNotification = LocalTime.of(15,0,0);

        LocalDateTime notificationStartTime = LocalDateTime.of(LocalDate.now(), LocalTime.MIDNIGHT);
        LocalDateTime notificationEndTime = LocalDateTime.now();

        msg = getBehavioralIrregularObs(c, u, notificationStartTime, notificationEndTime);

        if (msg.length() ==0){
            return null;
        }
        return "This email contains information regarding behavior related irregular obs across the center." + msg.toString();

    }

    @NotNull
    private StringBuilder getBehavioralIrregularObs (Container c, User u, LocalDateTime startTime, LocalDateTime endTime){
        StringBuilder msg = new StringBuilder();

        Map<String, Object> parameters = new CaseInsensitiveHashMap<>();
        parameters.put("START_DATE", startTime);
        parameters.put("END_DATE", endTime);

        TableInfo ti = QueryService.get().getUserSchema(u, c, "study").getTable("behaviorRelatedIrregularObs");

        TableSelector ts = new TableSelector(ti);
        ts.setNamedParameters(parameters);

        Results rs = ts.getResults();
        try {
            long count = ts.getRowCount();
            if (count > 0) {
                msg.append("<p>There have been <strong>").append(count).append("</strong> behavior related irregular observations between " + startTime + " and " + endTime + ".</p>");
                msg.append("<table>");

                msg.append("<tr>");
                msg.append("<td>|</td><td>--------------</td><td>|</td><td>-------------</td><td>|</td><td>-------------</td><td>|</td>");
                msg.append("<td>------------------------------------------</td><td>|</td><td>----------------------------------------------------------------------------------------------------</td><td>|</td>");
                msg.append("</tr>");

                msg.append("<tr>");
                msg.append("<th>|</th>");
                msg.append("<th>").append("Id").append("</th>");
                msg.append("<th>|</th>");
                msg.append("<th>").append("Room").append("</th>");
                msg.append("<th>|</th>");
                msg.append("<th>").append("Cage").append("</th>");
                msg.append("<th>|</th>");
                msg.append("<th>").append("Date/Time").append("</th>");
                msg.append("<th>|</th>");
                msg.append("<th>").append("Observation(s)").append("</th>");
                msg.append("<th>|</th>");
                msg.append("</tr>");

                TableInfo behaviorCodesTableInfo = QueryService.get().getUserSchema(u, c, "ehr_lookups").getTable("obs_behavior");
                while (rs.next()) {
                    StringBuilder behaviorTitles = new StringBuilder();
                    Map<String, Object> row = rs.getRowMap();
                    String behaviorCodes = (String) row.get("behavior");
                    if (behaviorCodes != null && behaviorCodes.length() > 0) {
                        String[] behaviorCodesArray = behaviorCodes.split(";");
                        for(int i = 0; i < behaviorCodesArray.length; i++) {
                            SimpleFilter filter = new SimpleFilter();
                            String behaviorCode = behaviorCodesArray[i] != null ? behaviorCodesArray[i].trim() : null;
                            filter.addCondition(FieldKey.fromString("value"), behaviorCode, CompareType.EQUAL);
                            TableSelector behaviorCodesTableSelector = new TableSelector(behaviorCodesTableInfo, filter, null);
                            Results results = behaviorCodesTableSelector.getResults();
                            if (results.next()) {
                                behaviorTitles.append((String) results.getRowMap().get("title"));
                                if (i + 1 < behaviorCodesArray.length) {
                                    behaviorTitles.append(", ");
                                }
                            }
                        }
                    }

                    String behaviors = Stream.of(behaviorTitles, (String)row.get("otherbehavior")).filter(s -> s != null && ((CharSequence) s).length() > 0).collect(Collectors.joining(", "));

                    msg.append("<tr>");
                    msg.append("<td>|</td><td>--------------</td><td>|</td><td>-------------</td><td>|</td><td>-------------</td><td>|</td>");
                    msg.append("<td>------------------------------------------</td><td>|</td><td>----------------------------------------------------------------------------------------------------</td><td>|</td>");
                    msg.append("</tr>");

                    msg.append("<tr>");
                    msg.append("<td>|</td>");
                    msg.append("<td>").append(row.get("Id")).append("</td>");
                    msg.append("<td>|</td>");
                    msg.append("<td>").append(row.get("roomattime")).append("</td>");
                    msg.append("<td>|</td>");
                    msg.append("<td>").append(row.get("cageattime")).append("</td>");
                    msg.append("<td>|</td>");
                    msg.append("<td>").append(row.get("date")).append("</td>");
                    msg.append("<td>|</td>");
                    msg.append("<td>").append(behaviors).append("</td>");
                    msg.append("<td>|</td>");
                    msg.append("</tr>");
                }

                msg.append("<tr>");
                msg.append("<td>|</td><td>--------------</td><td>|</td><td>-------------</td><td>|</td><td>-------------</td><td>|</td>");
                msg.append("<td>------------------------------------------</td><td>|</td><td>----------------------------------------------------------------------------------------------------</td><td>|</td>");
                msg.append("</tr>");

                msg.append("</table>");
            }
        } catch (SQLException e) {
            return new StringBuilder("<strong>There was an error retrieving the data. Please alert the IDS team.</strong>");
        }


        //msg.append("<a href='" + getExecuteQueryUrl(c, "study", "FoodDeprivesProblems", "Scheduled") + "&query.schedule~in="+ schedule + "&query.sort=-schedule/title'>Click here to view this list</a></p>\n");

        return msg;
    }
}