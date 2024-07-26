package org.labkey.wnprc_ehr.calendar;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.HttpRequestInitializer;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.CalendarScopes;
import com.google.api.services.calendar.model.Event;
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
import java.time.LocalTime;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public abstract class GoogleCalendar implements org.labkey.wnprc_ehr.calendar.Calendar
{
    private User user;
    private Container container;

    /** Application name. */
    private static final String APPLICATION_NAME =
            "Google Calendar API Java Quickstart";

    /** Global instance of the JSON factory. */
    private static final JsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();

    private static final String TOKENS_DIRECTORY_PATH = "tokens";

    /** Global instance of the HTTP transport. */
    private static NetHttpTransport HTTP_TRANSPORT;

    /** Global instance of the scopes required by this quickstart.
     *
     * If modifying these scopes, delete your previously saved credentials
     * at ~/.credentials/calendar-java-quickstart
     */
    protected static final List<String> SCOPES =
            Arrays.asList(CalendarScopes.CALENDAR_READONLY);

    private static final int MAX_EVENT_RESULTS = 2500;
    private static final long SIX_MONTHS_IN_MILLISECONDS = 1000L * 60L * 60L * 24L * 30L * 6L;
    private static final long TWO_YEARS_IN_MILLISECONDS = 1000L * 60L * 60L * 24L * 30L * 24L;
    private static final String CALENDAR_UUID = null;
    private static final String DEFAULT_BG_COLOR = "#a1fffa";
    private Map<String, String> CALENDAR_IDS = null;
    private Map<String, String> CALENDAR_COLORS = null;

    static {
        try {
            HTTP_TRANSPORT = GoogleNetHttpTransport.newTrustedTransport();
        } catch (Throwable t) {
            t.printStackTrace();
            System.exit(1);
        }
    }

    public GoogleCalendar(User user, Container container) {
        this.user = user;
        this.container = container;
        getCalendarIds();
        getCalendarColors();
    }

    /**
     * Creates an authorized HttpRequestInitializer object.
     * @return An authorized HttpRequestInitializer object.
     * @throws IOException If the credentials.json file cannot be found.
     */
    abstract protected HttpRequestInitializer getCredentials() throws Exception
    {
        // Load client secrets.
        SimplerFilter filter = new SimplerFilter("id", CompareType.EQUAL, getCalendarUUID());
        DbSchema schema = DbSchema.get("googledrive", DbSchemaType.Module);
        TableInfo ti = schema.getTable("service_accounts");
        TableSelector ts = new TableSelector(ti, filter, null);
        InputStream in = mapToInputStream(ts.getMap());

        GoogleCredentials credentials = GoogleCredentials.fromStream(in).createScoped(SCOPES);
        credentials.refreshIfExpired();

        return new HttpCredentialsAdapter(credentials);
    }

    @Override
    public void setUser(User u) {
        user = u;
    }

    @Override
    public void setContainer(Container c) {
        container = c;
    }

    protected String getCalendarUUID() {
        return CALENDAR_UUID;
    }

    protected Map<String, String> getCalendarIds() {
        return CALENDAR_IDS;
    }

    protected Map<String, String> getCalendarColors() {
        return getCalendarColors(false);
    }

    protected Map<String, String> getCalendarColors(boolean refresh) {
        return CALENDAR_COLORS;
    }

    // Converts a com.google.api.services.calendar.model.Events object into a JSONObject representation
    // of a fullcalendar Event Source Object (https://fullcalendar.io/docs/event-source-object)
    protected JSONObject getJsonEventList(Events events, String calendarId, String backgroundColor) {
        JSONObject eventSourceObject = new JSONObject();
        JSONArray jsonEvents = new JSONArray();
        String calendarName = events.getSummary();
        List<Event> items = events.getItems();

        for (int i = 0; i < items.size(); i++) {
            Event event = items.get(i);

            JSONObject jsonEvent = new JSONObject();
            jsonEvent.put("id", UUID.randomUUID().toString());
            jsonEvent.put("title", event.getSummary());
            jsonEvent.put("start", event.getStart().getDate() != null ? event.getStart().getDate() : event.getStart().getDateTime());
            jsonEvent.put("end", event.getEnd().getDate() != null ? event.getEnd().getDate() : event.getEnd().getDateTime());
            jsonEvent.put("htmlLink", event.getHtmlLink());
            jsonEvent.put("calendarId", calendarId);
            jsonEvent.put("calendarName", calendarName);
            String bgColor = getCalendarColors().get(calendarId);
            jsonEvent.put("backgroundColor", backgroundColor);
            jsonEvent.put("textColor", getTextColor(jsonEvent.getString("backgroundColor")));
            jsonEvent.put("eventId", i);
            jsonEvent.put("eventListSize", events.size());

            jsonEvents.put(jsonEvent);
        }
        eventSourceObject.put("events", jsonEvents);
        eventSourceObject.put("backgroundColor", getCalendarColors().get(calendarId));
        eventSourceObject.put("textColor", getTextColor(eventSourceObject.getString("backgroundColor")));
        eventSourceObject.put("id", calendarId);

        return eventSourceObject;
    }

    protected InputStream mapToInputStream(Map<String, Object> map)
    {
        JSONObject json = new JSONObject();
        json.put("type", "service_account");
        for (Map.Entry<String, Object> entry : map.entrySet())
        {
            json.put(entry.getKey(), entry.getValue());
        }

        return new ByteArrayInputStream(json.toString().getBytes(StandardCharsets.UTF_8));
    }

    private Calendar getCalendar() throws Exception {
        return new Calendar.Builder(HTTP_TRANSPORT, JSON_FACTORY, getCredentials())
                .setApplicationName(APPLICATION_NAME)
                .build();
    }

    private JSONObject getCalendarEvents(Calendar calendar, DateTime dateMin, DateTime dateMax) throws Exception {
        JSONObject allJsonData = new JSONObject();

        for (String calendarId : getCalendarIds().keySet()) {
            Events events = calendar.events().list(calendarId)
                    .setMaxResults(MAX_EVENT_RESULTS)
                    .setTimeMin(dateMin)
                    .setTimeMax(dateMax)
                    .setOrderBy("startTime")
                    .setSingleEvents(true)
                    .execute();

            allJsonData.put(calendarId, getJsonEventList(events, calendarId));
        }

        return allJsonData;
    }


    @Override
    public JSONArray getEventsAsJson(String calendarId, String backgroundColor, EventType eventType, Date startDate, Date endDate) throws Exception {
        Calendar calendar = getCalendar();
        java.util.Calendar currentDate = java.util.Calendar.getInstance();
        DateTime dateMin;
        DateTime dateMax;

        if (startDate != null) {
            ZonedDateTime startTime = ZonedDateTime.ofInstant(startDate.toInstant(), ZoneId.systemDefault()).with(LocalTime.MIN);
            dateMin = new DateTime(startTime.toInstant().toEpochMilli());
        } else {
            dateMin = new DateTime(currentDate.getTimeInMillis() - SIX_MONTHS_IN_MILLISECONDS);
        }
        if (endDate != null) {
            ZonedDateTime endTime = ZonedDateTime.ofInstant(endDate.toInstant(), ZoneId.systemDefault()).with(LocalTime.MAX);
            dateMax = new DateTime(endTime.toInstant().toEpochMilli());
        } else {
            dateMax = new DateTime(currentDate.getTimeInMillis() + TWO_YEARS_IN_MILLISECONDS);
        }

        return getCalendarEvents(calendar, dateMin, dateMax, MAX_EVENT_RESULTS, calendarId, backgroundColor);
    }

    public JSONArray getEventsArray(String calendarId, String backgroundColor, EventType eventType) throws Exception {
        return getEventsAsJson(calendarId, backgroundColor, eventType, null, null);
    }

    public JSONArray getRoomEventsArray(String roomId, String backgroundColor) throws Exception {
        return null;
    }
}