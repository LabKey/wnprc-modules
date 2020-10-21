package org.labkey.wnprc_ehr.calendar;

import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.Events;
import org.json.JSONArray;
import org.json.JSONObject;
import org.labkey.api.data.Container;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.DbSchemaType;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.security.User;
import org.labkey.api.util.PageFlowUtil;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static java.time.temporal.ChronoUnit.DAYS;

public class OnCallCalendar extends GoogleCalendar
{
    private static final String CALENDAR_UUID = "a3c471b4-6636-4b83-a65c-a33e2606a1ac";
    private static final String BG_COLOR = "#34abeb";
    private Map<String, String> CALENDAR_IDS = null;

    public OnCallCalendar(User user, Container container) {
        super(user, container);
    }

    @Override
    protected String getCalendarUUID() {
        return CALENDAR_UUID;
    }

    @Override
    protected Map<String, String> getCalendarIds() {
        if (CALENDAR_IDS == null) {
            CALENDAR_IDS = new HashMap<>();
            DbSchema schema = DbSchema.get("wnprc", DbSchemaType.Module);
            TableInfo ti = schema.getTable("on_call_calendars");
            TableSelector ts = new TableSelector(ti, PageFlowUtil.set("calendar_id", "display_name"), null, null);
            Map<String, Object>[] calendars = ts.getMapArray();
            for (Map<String, Object> calendar : calendars) {
                CALENDAR_IDS.put((String) calendar.get("calendar_id"), (String) calendar.get("display_name"));
            }
        }
        return CALENDAR_IDS;
    }

    @Override
    protected JSONObject getJsonEventList(Events events, String calendarId) {
        JSONObject eventSourceObject = new JSONObject();
        JSONArray jsonEvents = new JSONArray();
        String calendarName = events.getSummary();
        List<Event> items = events.getItems();

        for (int i = 0; i < items.size(); i++) {
            Event event = items.get(i);
            if (event.getStart().getDate() != null && event.getStart().getDate().isDateOnly()) {
                LocalDate startDate = LocalDate.ofInstant(Instant.ofEpochMilli(event.getStart().getDate().getValue()), ZoneId.of("UTC"));
                LocalDate endDate = LocalDate.ofInstant(Instant.ofEpochMilli(event.getEnd().getDate().getValue()), ZoneId.of("UTC"));
                long daysBetween = DAYS.between(startDate, endDate);

                for (int j = 0; j < daysBetween; j++) {

                    JSONObject jsonEvent = new JSONObject();
                    jsonEvent.put("title", event.getSummary());
                    jsonEvent.put("description", event.getDescription());
                    jsonEvent.put("date", startDate.plusDays(j));
                    jsonEvent.put("calendarId", calendarId);
                    jsonEvent.put("calendarName", calendarName);

                    jsonEvents.put(jsonEvent);
                }
            } else {
                LocalDate startDate = LocalDateTime.ofInstant(Instant.ofEpochMilli(event.getStart().getDateTime().getValue()), ZoneId.systemDefault()).toLocalDate();
                LocalDate endDate = LocalDateTime.ofInstant(Instant.ofEpochMilli(event.getEnd().getDateTime().getValue()), ZoneId.systemDefault()).toLocalDate();
                long daysBetween = DAYS.between(startDate, endDate);

                for (int j = 0; j <= daysBetween; j++) {
                    JSONObject jsonEvent = new JSONObject();
                    jsonEvent.put("title", event.getSummary());
                    jsonEvent.put("description", event.getDescription());
                    jsonEvent.put("date", startDate.plusDays(j));
                    jsonEvent.put("calendarId", calendarId);
                    jsonEvent.put("calendarName", calendarName);

                    jsonEvents.put(jsonEvent);
                }
            }
        }
        eventSourceObject.put("events", jsonEvents);
        eventSourceObject.put("backgroundColor", BG_COLOR);
        eventSourceObject.put("id", calendarId);
        eventSourceObject.put("nextAvailableId", jsonEvents.length());

        return eventSourceObject;
    }
}
