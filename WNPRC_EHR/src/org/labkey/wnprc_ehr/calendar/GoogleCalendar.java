package org.labkey.wnprc_ehr.calendar;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.HttpRequestInitializer;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.CalendarScopes;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.EventDateTime;
import com.google.api.services.calendar.model.Events;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.GoogleCredentials;
import org.json.JSONArray;
import org.json.JSONObject;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.DbSchemaType;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.security.User;
import org.labkey.dbutils.api.SimplerFilter;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

public class GoogleCalendar implements org.labkey.wnprc_ehr.calendar.Calendar
{
    private User user;
    private Container container;
    private String eventDefaultBgColor = "#ADD8E6"; //lightblue
    private String eventSelectedBgColor = "#ADFFFF"; //slightly lighter

    /** Application name. */
    private static final String APPLICATION_NAME =
            "Google Calendar API Java Quickstart";

    /** Global instance of the JSON factory. */
    private static final JsonFactory JSON_FACTORY =
            JacksonFactory.getDefaultInstance();

    private static final String TOKENS_DIRECTORY_PATH = "tokens";

    /** Global instance of the HTTP transport. */
    private static NetHttpTransport HTTP_TRANSPORT;

    /** Global instance of the scopes required by this quickstart.
     *
     * If modifying these scopes, delete your previously saved credentials
     * at ~/.credentials/calendar-java-quickstart
     */
    private static final List<String> SCOPES =
            Arrays.asList(CalendarScopes.CALENDAR_READONLY);

    static {
        try {
            HTTP_TRANSPORT = GoogleNetHttpTransport.newTrustedTransport();
        } catch (Throwable t) {
            t.printStackTrace();
            System.exit(1);
        }
    }

    public void setUser(User u) {
        user = u;
    }

    public void setContainer(Container c) {
        container = c;
    }

    public String getEventDefaultBgColor() {
        return eventDefaultBgColor;
    }

    public void setEventDefaultBgColor(String color) {
        eventDefaultBgColor = color;
    }

    public String getEventSelectedBgColor() {
        return eventSelectedBgColor;
    }

    public void setEventSelectedBgColor(String color) {
        eventSelectedBgColor = color;
    }

    private JSONArray getJsonEventList(List<Event> events) {
        JSONArray jsonEvents = new JSONArray();


        for(Event event : events) {
            JSONObject jsonEvent = new JSONObject();
            jsonEvent.put("title", event.getSummary());
            jsonEvent.put("start", event.getStart() != null ? event.getStart().getDate() : null);
            jsonEvent.put("end", event.getEnd() != null ? event.getEnd().getDate() : null);
            jsonEvent.put("htmlLink", event.getHtmlLink());
            jsonEvent.put("defaultBgColor", getEventDefaultBgColor());
            jsonEvent.put("selectedBgColor", getEventSelectedBgColor());

            jsonEvents.put(jsonEvent);
        }
        return jsonEvents;
    }

    private JSONArray getJsonEventList(Event event) {
        List<Event> eventList = new ArrayList<>();
        eventList.add(event);
        return getJsonEventList(eventList);
    }

    private InputStream mapToInputStream(Map<String, Object> map) {
        InputStream is = null;
        JSONObject json = new JSONObject();
        json.put("type", "service_account");
        for (Map.Entry<String, Object> entry : map.entrySet()) {
            json.put(entry.getKey(), entry.getValue());
        }

        try {
            is = new ByteArrayInputStream(json.toString().getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {

        }

        return is;
    }

    /**
     * Creates an authorized HttpRequestInitializer object.
     * @return An authorized HttpRequestInitializer object.
     * @throws IOException If the credentials.json file cannot be found.
     */
    private HttpRequestInitializer getCredentials() throws IOException {
        // Load client secrets.
        SimplerFilter filter = new SimplerFilter("id", CompareType.EQUAL, "f5c49137-186d-41fb-9c93-9979b7f4c2ba");
        DbSchema schema = DbSchema.get("googledrive", DbSchemaType.Module);
        TableInfo ti = schema.getTable("service_accounts");
        TableSelector ts = new TableSelector(ti, filter, null);
        InputStream in = mapToInputStream(ts.getMap());

        GoogleCredentials credentials = GoogleCredentials.fromStream(in).createScoped(SCOPES);
        credentials.refreshIfExpired();

        return new HttpCredentialsAdapter(credentials);
    }

    private Calendar getCalendar() throws IOException {
        Calendar service = new Calendar.Builder(HTTP_TRANSPORT, JSON_FACTORY, getCredentials())
                .setApplicationName(APPLICATION_NAME)
                .build();
        return service;
    }

    private String getCalendarEvents(Calendar calendar, DateTime minTime, Integer maxResults) throws IOException {
        String eventsString = null;
        Events events = calendar.events().list("f5uogvepmaroft2dh30fqh7g7o@group.calendar.google.com")
                .setMaxResults(maxResults)
                .setTimeMin(minTime)
                .setOrderBy("startTime")
                .setSingleEvents(true)
                .execute();
        List<Event> items = events.getItems();

        JSONArray jsonEvents = getJsonEventList(items);
        eventsString = jsonEvents.toString();

        return eventsString;
    }

    public String getCalendarEventsAsJson() {
        String events;
        try {
            Calendar calendar = getCalendar();
            DateTime dateMin = new DateTime(0);
            events = getCalendarEvents(calendar, dateMin, Integer.MAX_VALUE);
        } catch (Exception e) {
            Event error = new Event();
            error.setStart(new EventDateTime().setDate(new DateTime(true, System.currentTimeMillis(), null)));
            error.setSummary("Error Loading Calendar!!");
            events = getJsonEventList(error).toString();
        }

        return events;
    }
}