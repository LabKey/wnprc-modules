package org.labkey.wnprc_ehr.calendar;

import com.google.api.client.http.HttpRequestInitializer;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.Events;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.GoogleCredentials;
import org.json.JSONArray;
import org.json.JSONObject;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.DbSchemaType;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.dbutils.api.SimplerFilter;

import java.io.IOException;
import java.io.InputStream;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

import static java.time.temporal.ChronoUnit.DAYS;

public class OnCallCalendar extends GoogleCalendar
{
    private static final String CALENDAR_UUID = "a3c471b4-6636-4b83-a65c-a33e2606a1ac";

    @Override
    protected String getCalendarUUID() {
        return CALENDAR_UUID;
    }

    @Override
    protected JSONObject getJsonEventList(Events events, String calendarId, String backgroundColor) {
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
        eventSourceObject.put("backgroundColor", backgroundColor);
        eventSourceObject.put("id", calendarId);
        eventSourceObject.put("nextAvailableId", jsonEvents.length());

        return eventSourceObject;
    }
}
