//package org.labkey.wnprc_ehr.calendar;
//
//import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
//import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
//import com.google.api.client.http.HttpTransport;
//import com.google.api.client.json.JsonFactory;
//import com.google.api.client.json.jackson2.JacksonFactory;
//import com.google.api.client.util.DateTime;
//import com.google.api.services.calendar.Calendar;
//import com.google.api.services.calendar.CalendarScopes;
//import com.google.api.services.calendar.model.Event;
//import com.google.api.services.calendar.model.EventDateTime;
//import com.google.api.services.calendar.model.Events;
//import org.json.JSONArray;
//import org.json.JSONObject;
//import org.labkey.api.data.CompareType;
//import org.labkey.api.data.Container;
//import org.labkey.api.data.DbSchema;
//import org.labkey.api.data.DbSchemaType;
//import org.labkey.api.data.TableInfo;
//import org.labkey.api.data.TableSelector;
//import org.labkey.api.security.User;
//import org.labkey.dbutils.api.SimpleQuery;
//import org.labkey.dbutils.api.SimpleQueryFactory;
//import org.labkey.dbutils.api.SimplerFilter;
//import org.labkey.webutils.api.json.JsonUtils;
//
//import java.io.ByteArrayInputStream;
//import java.io.IOException;
//import java.io.InputStream;
//import java.nio.charset.StandardCharsets;
//import java.util.ArrayList;
//import java.util.Arrays;
//import java.util.HashMap;
//import java.util.List;
//import java.util.Map;
//
//public class GoogleCalendar
//{
//    private User user;
//    private Container container;
//
//    /** Application name. */
//    private static final String APPLICATION_NAME =
//            "Google Calendar API Java Quickstart";
//
//    /** Global instance of the JSON factory. */
//    private static final JsonFactory JSON_FACTORY =
//            JacksonFactory.getDefaultInstance();
//
//    /** Global instance of the HTTP transport. */
//    private static HttpTransport HTTP_TRANSPORT;
//
//    /** Global instance of the scopes required by this quickstart.
//     *
//     * If modifying these scopes, delete your previously saved credentials
//     * at ~/.credentials/calendar-java-quickstart
//     */
//    private static final List<String> SCOPES =
//            Arrays.asList(CalendarScopes.CALENDAR_READONLY);
//
//    static {
//        try {
//            HTTP_TRANSPORT = GoogleNetHttpTransport.newTrustedTransport();
//        } catch (Throwable t) {
//            t.printStackTrace();
//            System.exit(1);
//        }
//    }
//
//    public void setUser(User u) {
//        user = u;
//    }
//
//    public void setContainer(Container c) {
//        container = c;
//    }
//
//    private JSONArray getJsonEventList(List<Event> events) {
//        JSONArray jsonEvents = new JSONArray();
//
//
//        for(Event event : events) {
//            JSONObject jsonEvent = new JSONObject();
//            jsonEvent.put("title", event.getSummary());
//            jsonEvent.put("start", event.getStart() != null ? event.getStart().getDate() : null);
//            jsonEvent.put("end", event.getEnd() != null ? event.getEnd().getDate() : null);
//            jsonEvent.put("htmlLink", event.getHtmlLink());
//
//            jsonEvents.put(jsonEvent);
//        }
//        return jsonEvents;
//    }
//
//    private JSONArray getJsonEventList(Event event) {
//        List<Event> eventList = new ArrayList<>();
//        eventList.add(event);
//        return getJsonEventList(eventList);
//    }
//
//    private InputStream mapToInputStream(Map<String, Object> map) {
//        InputStream is = null;
//        JSONObject json = new JSONObject();
//        json.put("type", "service_account");
//        for (Map.Entry<String, Object> entry : map.entrySet()) {
//            json.put(entry.getKey(), entry.getValue());
//        }
//
//        try {
//            is = new ByteArrayInputStream(json.toString().getBytes(StandardCharsets.UTF_8));
//        } catch (Exception e) {
//
//        }
//
//        return is;
//    }
//
//    private Calendar getCalendar() throws IOException {
//        SimplerFilter filter = new SimplerFilter("id", CompareType.EQUAL, "f5c49137-186d-41fb-9c93-9979b7f4c2ba");
//        DbSchema schema = DbSchema.get("googledrive", DbSchemaType.Module);
//        TableInfo ti = schema.getTable("service_accounts");
//        TableSelector ts = new TableSelector(ti, filter, null);
//        InputStream is = mapToInputStream(ts.getMap());
//        GoogleCredential credential = GoogleCredential.fromStream(is).createScoped(SCOPES);
//
//        Calendar service = new Calendar.Builder(HTTP_TRANSPORT, JSON_FACTORY, credential)
//                .setApplicationName(APPLICATION_NAME)
//                .build();
//        return service;
//    }
//
//    private String getCalendarEvents(Calendar calendar, DateTime minTime, Integer maxResults) throws IOException {
//        String eventsString = null;
//        Events events = calendar.events().list("f5uogvepmaroft2dh30fqh7g7o@group.calendar.google.com")
//                .setMaxResults(maxResults)
//                .setTimeMin(minTime)
//                .setOrderBy("startTime")
//                .setSingleEvents(true)
//                .execute();
//        List<Event> items = events.getItems();
//
//        JSONArray jsonEvents = getJsonEventList(items);
//        eventsString = jsonEvents.toString();
//
//        return eventsString;
//    }
//
//    public String getCalendarEventsAsJson() {
//        String events;
//        try {
//            Calendar calendar = getCalendar();
//            DateTime dateMin = new DateTime(0);
//            events = getCalendarEvents(calendar, dateMin, Integer.MAX_VALUE);
//        } catch (Exception e) {
//            Event error = new Event();
//            error.setStart(new EventDateTime().setDate(new DateTime(true, System.currentTimeMillis(), null)));
//            error.setSummary("Error Loading Calendar!!");
//            events = getJsonEventList(error).toString();
//        }
//
//        return events;
//    }
//}