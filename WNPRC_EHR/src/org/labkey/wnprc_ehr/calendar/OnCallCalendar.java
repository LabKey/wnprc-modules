package org.labkey.wnprc_ehr.calendar;

import com.google.api.client.http.HttpRequestInitializer;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.Events;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.GoogleCredentials;
import org.json.old.JSONArray;
import org.json.old.JSONObject;
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
    /**
     * Creates an authorized HttpRequestInitializer object.
     * @return An authorized HttpRequestInitializer object.
     * @throws IOException If the credentials.json file cannot be found.
     */
    @Override
    protected HttpRequestInitializer getCredentials() throws Exception
    {
        // Load client secrets.
        SimplerFilter filter = new SimplerFilter("id", CompareType.EQUAL, "a3c471b4-6636-4b83-a65c-a33e2606a1ac");
        DbSchema schema = DbSchema.get("googledrive", DbSchemaType.Module);
        TableInfo ti = schema.getTable("service_accounts");
        TableSelector ts = new TableSelector(ti, filter, null);
        InputStream in = mapToInputStream(ts.getMap());

        GoogleCredentials credentials = GoogleCredentials.fromStream(in).createScoped(SCOPES);
        credentials.refreshIfExpired();

        return new HttpCredentialsAdapter(credentials);
    }

    @SuppressWarnings("Duplicates")
    @Override
    protected JSONArray getJsonEventList(Events events, String calendarId, String backgroundColor) {
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

        return jsonEvents;
    }
}
