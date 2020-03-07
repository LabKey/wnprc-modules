package org.labkey.wnprc_ehr.notification;

import org.jetbrains.annotations.NotNull;
import org.labkey.api.collections.CaseInsensitiveHashMap;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.Results;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.module.Module;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.security.User;
import org.labkey.api.util.Path;
import org.labkey.api.view.ActionURL;

import java.sql.SQLException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;


public class IrregularObsBehaviorNotification extends AbstractEHRNotification
{
    private static DateTimeFormatter queryDateFormat = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm");
    private static DateTimeFormatter displayDateFormat = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

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
        return "Behavior related irregular obs for " + _dateTimeFormat.format(new Date());
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

        LocalDateTime notificationStartTime = LocalDateTime.of(LocalDate.now(), LocalTime.MIDNIGHT);
        LocalDateTime currentTime = LocalDateTime.now();
        if (currentTime.getHour() == 10) {
            notificationStartTime = LocalDateTime.of(LocalDate.now().minusDays(1), LocalTime.of(15, 0, 0));
        } else if (currentTime.getHour() == 15) {
            notificationStartTime = LocalDateTime.of(LocalDate.now(), LocalTime.of(10, 0, 0));
        }

        msg = getBehavioralIrregularObs(c, u, notificationStartTime, currentTime);

        if (msg.length() == 0){
            return "<p>There were no behavior related irregular obs between " + displayDateFormat.format(notificationStartTime) + " and " + displayDateFormat.format(currentTime) + ".</p>";
        }

        msg.insert(0, "<p>This email contains information regarding behavior related irregular obs across the center.</p>");
        return msg.toString();

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

        try (Results rs = ts.getResults()) {
            long count = ts.getRowCount();
            if (count > 0) {
                msg.append("<p>There have been <strong>");
                msg.append(count);
                msg.append("</strong> behavior related irregular observations between ");
                msg.append(startTime.format(displayDateFormat));
                msg.append(" and ");
                msg.append(endTime.format(displayDateFormat));
                msg.append(".</p>");

                TableInfo behaviorCodesTableInfo = QueryService.get().getUserSchema(u, c, "ehr_lookups").getTable("obs_behavior");

                int maxBehaviorsLength = 0;
                while (rs.next()) {
                    String behaviors = getBehaviorString(behaviorCodesTableInfo, rs.getRowMap());
                    if (behaviors != null && behaviors.length() > maxBehaviorsLength) {
                        maxBehaviorsLength = behaviors.length();
                    }
                }
                int behaviorsDashLength = (int) (maxBehaviorsLength * 1.75);

                msg.append("<table>");

                msg.append(createTableBorder(behaviorsDashLength));

                msg.append("<tr>");
                msg.append("<td>|</td>");
                msg.append("<th>").append("Id").append("</th>");
                msg.append("<td>|</td>");
                msg.append("<th>").append("Room").append("</th>");
                msg.append("<td>|</td>");
                msg.append("<th>").append("Cage").append("</th>");
                msg.append("<td>|</td>");
                msg.append("<th>").append("Date/Time").append("</th>");
                msg.append("<td>|</td>");
                msg.append("<th>").append("Observation(s)").append("</th>");
                msg.append("<td>|</td>");
                msg.append("</tr>");

                rs.beforeFirst();

                while (rs.next()) {
                    Map<String, Object> row = rs.getRowMap();
                    String behaviors = getBehaviorString(behaviorCodesTableInfo, rs.getRowMap());

                    StringBuilder hrefForAnimalAbstract = new StringBuilder();
                    hrefForAnimalAbstract.append(new Path(ActionURL.getBaseServerURL(), "ehr", c.getPath(), "animalHistory.view")).toString();
                    hrefForAnimalAbstract.append("?#subjects:").append(row.get("Id")).append("&inputType:singleSubject&showReport:1&activeReport:abstract");
                    StringBuilder animalId = new StringBuilder();
                    animalId.append("<a href='").append(hrefForAnimalAbstract).append("'>");
                    animalId.append(row.get("Id"));
                    animalId.append("</a>");

                    msg.append(createTableBorder(behaviorsDashLength));

                    msg.append("<tr>");
                    msg.append("<td>|</td>");
                    msg.append("<td>").append(animalId).append("</td>");
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

                msg.append(createTableBorder(behaviorsDashLength));

                msg.append("</table>");
            }
        } catch (SQLException e) {
            return new StringBuilder("<strong>There was an error retrieving the data. Please alert the IDS team.</strong>");
        }

        StringBuilder queryParams = new StringBuilder();
        queryParams.append("&query.param.START_DATE=");
        queryParams.append(startTime.format(queryDateFormat));
        queryParams.append("&query.param.END_DATE=");
        queryParams.append(endTime.format(queryDateFormat));
        msg.append("<p><a href='" + getExecuteQueryUrl(c, "study", "behaviorRelatedIrregularObs", null) + queryParams + "'>Click here to view this list in EHR</a></p>");

        return msg;
    }

    private String getBehaviorString(TableInfo behaviorCodesTableInfo, Map<String, Object> row) throws SQLException{
        String behaviorCodes = (String) row.get("behavior");
        StringBuilder behaviorTitles = new StringBuilder();

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

        return Stream.of(behaviorTitles, (String)row.get("otherbehavior")).filter(s -> s != null && s.length() > 0).collect(Collectors.joining(", "));
    }

    private CharSequence getNStrings(String string, int n) {
        StringBuilder result = new StringBuilder();
        for (int i = 0; i < n; i++) {
            result.append(string);
        }

        return result;
    }

    private CharSequence createTableBorder(int behaviorsDashLength) {
        StringBuilder border = new StringBuilder();
        border.append("<tr>");
        border.append("<td>|</td>");
        border.append("<td>").append(getNStrings("-", 13)).append("</td>");
        border.append("<td>|</td>");
        border.append("<td>").append(getNStrings("-", 13)).append("</td>");
        border.append("<td>|</td>");
        border.append("<td>").append(getNStrings("-", 13)).append("</td>");
        border.append("<td>|</td>");
        border.append("<td>").append(getNStrings("-", 38)).append("</td>");
        border.append("<td>|</td>");
        border.append("<td>").append(getNStrings("-", behaviorsDashLength)).append("</td>");
        border.append("<td>|</td>");
        border.append("</tr>");
        return border;
    }
}