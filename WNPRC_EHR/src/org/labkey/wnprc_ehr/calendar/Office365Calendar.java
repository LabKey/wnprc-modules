package org.labkey.wnprc_ehr.calendar;

import com.microsoft.graph.models.extensions.Attendee;
import com.microsoft.graph.models.extensions.Event;
import org.json.JSONArray;
import org.json.JSONObject;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.DbSchemaType;
import org.labkey.api.data.PropertyManager;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.security.User;
import org.labkey.api.util.PageFlowUtil;
import org.labkey.dbutils.api.SimpleQuery;
import org.labkey.dbutils.api.SimpleQueryFactory;
import org.labkey.dbutils.api.SimplerFilter;
import org.labkey.webutils.api.json.JsonUtils;
import org.labkey.wnprc_ehr.AzureAuthentication.AzureAccessTokenRefreshSettings;

import java.io.IOException;
import java.io.StringReader;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Set;
import java.util.UUID;

public class Office365Calendar implements org.labkey.wnprc_ehr.calendar.Calendar {

    private User user;
    private Container container;

    private Map<String, String> ACCOUNT_NAMES = null;
    private Map<String, String> UNMANAGED_CALENDARS = null;
    private Map<String, String> BASE_CALENDARS = null;
    private Map<String, String> CALENDARS_BY_ID = null;
    private Map<String, String> CALENDAR_COLORS = null;
    private static final String PROCEDURE_ACCOUNT_NAME = "ProcedureCalendar";
    public static final DateTimeFormatter dtf = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
    public static final String DEFAULT_BG_COLOR = "#3788D8";

    //Populate the calendar maps when the object is first created
    public Office365Calendar(User user, Container container) {
        setUser(user);
        setContainer(container);
        getBaseCalendars();
        getCalendarColors();
        getCalendarsById();
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setContainer(Container container) {
        this.container = container;
    }

    //Gets the access token from the property manager. The access token is kept up to date via a scheduled job
    private String getAccessToken(String accountName) {
        return PropertyManager.getEncryptedStore().getWritableProperties(accountName + ".Credentials", false).get("AccessToken");
    }

    //Gets the base calendars (surgeries_scheduled, surgeries_on_hold, procedures_scheduled, procedures_on_hold)
    private synchronized Map<String, String> getAccountNames() {
        if (ACCOUNT_NAMES == null) {
            ACCOUNT_NAMES = new HashMap<>();
            TableInfo ti = QueryService.get().getUserSchema(user, container, "wnprc").getTable("procedure_calendars_and_rooms");
            TableSelector ts = new TableSelector(ti, PageFlowUtil.set("calendar_id", "account_name"), null, null);
            Map<String, Object>[] calendars = ts.getMapArray();
            for (Map<String, Object> calendar : calendars) {
                ACCOUNT_NAMES.put((String) calendar.get("calendar_id"), (String) calendar.get("account_name"));
            }
        }
        return ACCOUNT_NAMES;
    }

    //Gets the base calendars (surgeries_scheduled, surgeries_on_hold, procedures_scheduled, procedures_on_hold)
    private synchronized Map<String, String> getUnmanagedCalendars() {
        if (UNMANAGED_CALENDARS == null) {
            UNMANAGED_CALENDARS = new HashMap<>();
            SimplerFilter filter = new SimplerFilter("calendar_type", CompareType.EQUAL, "Office365Unmanaged");
            DbSchema schema = DbSchema.get("wnprc", DbSchemaType.Module);
            TableInfo ti = schema.getTable("procedure_calendars");
            TableSelector ts = new TableSelector(ti, PageFlowUtil.set("calendar_id", "folder_id"), filter, null);
            Map<String, Object>[] calendars = ts.getMapArray();
            for (Map<String, Object> calendar : calendars) {
                UNMANAGED_CALENDARS.put((String) calendar.get("calendar_id"), (String) calendar.get("folder_id"));
            }
        }
        return UNMANAGED_CALENDARS;
    }

    //Gets the base calendars (surgeries_scheduled, surgeries_on_hold, procedures_scheduled, procedures_on_hold)
    private synchronized Map<String, String> getBaseCalendars() {
        if (BASE_CALENDARS == null) {
            BASE_CALENDARS = new HashMap<>();
            SimplerFilter filter = new SimplerFilter("calendar_type", CompareType.EQUAL, "Office365");
            DbSchema schema = DbSchema.get("wnprc", DbSchemaType.Module);
            TableInfo ti = schema.getTable("procedure_calendars");
            TableSelector ts = new TableSelector(ti, PageFlowUtil.set("calendar_id", "folder_id"), filter, null);
            Map<String, Object>[] calendars = ts.getMapArray();
            for (Map<String, Object> calendar : calendars) {
                BASE_CALENDARS.put((String) calendar.get("calendar_id"), (String) calendar.get("folder_id"));
            }
        }
        return BASE_CALENDARS;
    }

    private synchronized Map<String, String> getCalendarsById() {
        if (CALENDARS_BY_ID == null) {
            CALENDARS_BY_ID = new HashMap<>();
            SimplerFilter filter = new SimplerFilter("calendar_type", CompareType.IN, List.of("Office365", "Office365Unmanaged"));
            DbSchema schema = DbSchema.get("wnprc", DbSchemaType.Module);
            TableInfo ti = schema.getTable("procedure_calendars");
            TableSelector ts = new TableSelector(ti, PageFlowUtil.set("calendar_id", "folder_id"), filter, null);
            Map<String, Object>[] calendars = ts.getMapArray();
            for (Map<String, Object> calendar : calendars) {
                CALENDARS_BY_ID.put((String) calendar.get("folder_id"), (String) calendar.get("calendar_id"));
            }
        }
        return CALENDARS_BY_ID;
    }

    private synchronized Map<String, String> getCalendarColors() {
        if (CALENDAR_COLORS == null) {
            CALENDAR_COLORS = new HashMap<>();
            SimplerFilter filter = new SimplerFilter("calendar_type", CompareType.IN, List.of("Office365", "Office365Resource", "Office365Unmanaged"));
            TableInfo ti = QueryService.get().getUserSchema(user, container, "wnprc").getTable("procedure_calendars_and_rooms");
            TableSelector ts = new TableSelector(ti, PageFlowUtil.set("calendar_id", "default_bg_color"), filter, null);
            Map<String, Object>[] calendars = ts.getMapArray();
            for (Map<String, Object> calendar : calendars) {
                CALENDAR_COLORS.put((String) calendar.get("calendar_id"), (String) calendar.get("default_bg_color"));
            }
        }
        return CALENDAR_COLORS;
    }

    public Map<String, Boolean> isRoomAvailable(List<String> rooms, ZonedDateTime startTime, ZonedDateTime endTime) {
        Map<String, Boolean> availability = Graph.getAvailability(getAccessToken(PROCEDURE_ACCOUNT_NAME), rooms, startTime, endTime);
        return availability;
    }

    public boolean updateProcedureEvents(String baseCalendarName, List<Event> events, JSONObject response, boolean returnEvents) throws IOException {
        List<Event> updatedEvents = new ArrayList<>();
        for (Event event : events) {
            Event updatedEvent = Graph.updateEvent(getAccessToken(getAccountNames().get(baseCalendarName)), event.id, event);
            updatedEvent.calendar = new com.microsoft.graph.models.extensions.Calendar();
            updatedEvent.calendar.id = getBaseCalendars().get(baseCalendarName);
            updatedEvents.add(updatedEvent);
        }

        if (returnEvents) {
            JSONObject updatedEventsJson = getJsonEventList(updatedEvents);
            response.put("events", updatedEventsJson);
        }
        return true;
    }

    public boolean updateUnmanagedEvent(String calendarName, Event event, JSONObject response) {
        Event updatedEvent = Graph.updateEvent(getAccessToken(getAccountNames().get(calendarName)), event.id, event);
        updatedEvent.calendar = new com.microsoft.graph.models.extensions.Calendar();
        updatedEvent.calendar.id = getUnmanagedCalendars().get(calendarName);

        List<Event> updatedEvents = new ArrayList<>();
        updatedEvents.add(updatedEvent);

        JSONObject updatedEventsJson = getUnmanagedJsonEventList(updatedEvents);
        response.put("events", updatedEventsJson);

        return true;
    }

    public boolean addEvents(String calendarId, JSONArray roomRequests, String subject, String requestId, JSONObject response) throws IOException {
        if (response == null) {
            response = new JSONObject();
        }
        boolean allRoomsAvailable = true;
        List<Event> addedEvents = new ArrayList<>();

        for (int i = 0; i < roomRequests.length(); i++) {
            JSONObject roomRequest = roomRequests.getJSONObject(i);

            ZonedDateTime start = LocalDateTime.parse((String) roomRequest.get("date"), DateTimeFormatter.ISO_LOCAL_DATE_TIME).atZone(ZoneId.of("America/Chicago"));
            ZonedDateTime end = LocalDateTime.parse((String) roomRequest.get("enddate"), DateTimeFormatter.ISO_LOCAL_DATE_TIME).atZone(ZoneId.of("America/Chicago"));
            String roomEmailAddress = (String) roomRequest.get("email");

            List<String> rooms = new ArrayList<>();
            rooms.add(roomEmailAddress);
            if (!isRoomAvailable(rooms, start, end).get(roomEmailAddress)) {
                allRoomsAvailable = false;
                response.put("error", "Room " + (roomEmailAddress != null ? roomEmailAddress.substring(0, roomEmailAddress.indexOf("@")) : "null") + " is not available at the requested time." +
                        "\nIf you just cancelled an event in this room at the requested time, it may not have freed up the time slot yet. Please try again momentarily.");
                break;
            }
        }

        if (allRoomsAvailable) {
            for (int i = 0; i < roomRequests.length(); i++) {
                JSONObject roomRequest = roomRequests.getJSONObject(i);

                String roomEmailAddress = (String) roomRequest.get("email");
                ZonedDateTime startTime = LocalDateTime.parse((String) roomRequest.get("date"), DateTimeFormatter.ISO_LOCAL_DATE_TIME).atZone(ZoneId.of("America/Chicago"));
                ZonedDateTime endTime = LocalDateTime.parse((String) roomRequest.get("enddate"), DateTimeFormatter.ISO_LOCAL_DATE_TIME).atZone(ZoneId.of("America/Chicago"));

                List<Attendee> attendees = Graph.buildAttendeeList(roomEmailAddress);

                Properties props = new Properties();
                props.setProperty("requestid", requestId);
                props.setProperty("objectid", (String) roomRequest.get("objectid"));

                Event newEvent = Graph.buildEvent(startTime, endTime, subject, props, attendees, false);
                Event createdEvent = Graph.createEvent(getAccessToken(getAccountNames().get(calendarId)), getBaseCalendars().get(calendarId), newEvent);
                roomRequest.put("event_id", createdEvent.id);
                createdEvent.calendar = new com.microsoft.graph.models.extensions.Calendar();
                createdEvent.calendar.id = getBaseCalendars().get(calendarId);
                addedEvents.add(createdEvent);
            }
        }
        JSONObject addedEventsJson = getJsonEventList(addedEvents);
        response.put("events", addedEventsJson);
        return allRoomsAvailable;
    }

    public void cancelEvent(String eventId) {
        cancelEvent(eventId, PROCEDURE_ACCOUNT_NAME);
    }

    public void cancelEvent(String eventId, String calendarName) {
        Graph.deleteEvent(getAccessToken(getAccountNames().get(calendarName)), eventId);
    }

    private JSONObject getJsonEventList(List<Event> events) throws IOException {
        JSONObject allJsonData = new JSONObject();
        JSONObject allJsonEvents = new JSONObject();
        Map<String, String> parentIds = new HashMap<>();
        Map<String, JSONArray> childIds = new HashMap<>();

        //Get all existing rows in the study.surgery_procedure table (and lots of other auxiliary data for each row)
        //to match with the request ids of the incoming events list
        Properties eventProps = new Properties();

        Set<String> requestIds = new HashSet<>();
        for (Event event : events) {
            eventProps.load(new StringReader(event.body.content));
            requestIds.add(eventProps.getProperty("requestid"));
        }
        SimpleFilter sf = new SimpleFilter(FieldKey.fromString("requestid"), requestIds, CompareType.IN);

        SimpleQueryFactory sqf = new SimpleQueryFactory(user, container);
        SimpleQuery requests = sqf.makeQuery("study", "SurgeryProcedureSchedule");
        List<JSONObject> requestList = JsonUtils.getListFromJSONArray(requests.getResults(sf).getJSONArray("rows"));

        SimpleQuery allCalendars = sqf.makeQuery("wnprc", "procedure_calendars_and_rooms");
        List<JSONObject> calendarList = JsonUtils.getListFromJSONArray(allCalendars.getResults().getJSONArray("rows"));

        for (JSONObject calendar : calendarList) {
            JSONObject eventSource = new JSONObject();
            String bgColor = getCalendarColors().get(calendar.getString("calendar_id"));
            eventSource.put("backgroundColor", bgColor != null ? bgColor : DEFAULT_BG_COLOR);
            eventSource.put("textColor", getTextColor(eventSource.getString("backgroundColor")));
            eventSource.put("id", calendar.getString("calendar_id"));
            eventSource.put("baseCalendar", "Office365".equalsIgnoreCase(calendar.getString("calendar_type")));
            eventSource.put("roomCalendar", "Office365Resource".equalsIgnoreCase(calendar.getString("calendar_type")));
            eventSource.put("displayName", calendar.getString("display_name"));
            eventSource.put("room", calendar.getString("room"));
            allJsonData.put(calendar.getString("calendar_id"), eventSource);

            allJsonEvents.computeIfAbsent(calendar.getString("calendar_id"), key -> new JSONArray());
        }

        //Used to keep track of which events have already been loaded onto the base calendars, so that
        //they're not accidentally double loaded.
        //This is needed because of how we're combining multiple events with the same request id
        //into a single event for the base calendars
        Map<String, Boolean> loadedRequests = new HashMap<>();

        Map<String, JSONObject> surgeryRequestResults = new HashMap<>();
        for (JSONObject o : requestList) {
            surgeryRequestResults.put(o.getString("requestid"), o);
        }

        //Load all of the start and end times, organized by request id
        //This will help with getting the right start/end times for the full combined events
        Map<String, Map<String, List<LocalDateTime>>> eventTimesByRequestId = new HashMap<>();
        for (Event event : events) {
            eventProps.load(new StringReader(event.body.content));
            String requestId = eventProps.getProperty("requestid");
            if (eventTimesByRequestId.get(requestId) == null) {
                Map<String, List<LocalDateTime>> eventTimes = new HashMap<>();
                eventTimes.put("startTimes", new ArrayList<>());
                eventTimes.put("endTimes", new ArrayList<>());
                eventTimesByRequestId.put(requestId, eventTimes);
            }
            Map<String, List<LocalDateTime>> eventTimes = eventTimesByRequestId.get(requestId);
            List<LocalDateTime> startTimes = eventTimes.get("startTimes");
            List<LocalDateTime> endTimes = eventTimes.get("endTimes");
            startTimes.add(LocalDateTime.parse(event.start.dateTime));
            endTimes.add(LocalDateTime.parse(event.end.dateTime));
        }

        AzureAccessTokenRefreshSettings settings = new AzureAccessTokenRefreshSettings();
        for (int i = 0; i < events.size(); i++) {
            Event event = events.get(i);
            eventProps.load(new StringReader(event.body.content));
            String requestId = eventProps.getProperty("requestid");
            String objectId = eventProps.getProperty("objectid");

            JSONObject surgeryInfo = surgeryRequestResults.get(requestId);
            //Skip the event if there's not a corresponding record in the study.surgery_procedure dataset
            if (surgeryInfo == null) {
                continue;
            }
            List<Attendee> attendees = event.attendees;

            List<String> rooms = new ArrayList<>();
            String baseCalendar = null;
            //Process each event multiple times. Once for each attendee, and then once to put on the base calendar
            for (int j = 0; j <= attendees.size(); j++) {
                boolean isBaseCalendar = false;
                Attendee attendee = j < attendees.size() ? attendees.get(j) : null;
                String currentCalName = attendee != null ? attendee.emailAddress.address : getCalendarsById().get(event.calendar.id);
                //If the surgeries account is listed as an attendee for some reason, then skip it
                //The base calendar event will be processed on the last time through the loop regardless,
                //and we want it organized by which surgeries calendar it's on
                if (currentCalName.equalsIgnoreCase(settings.getAccount(PROCEDURE_ACCOUNT_NAME))) {
                    continue;
                }

                if (getBaseCalendars().get(currentCalName) != null) {
                    isBaseCalendar = true;
                    baseCalendar = currentCalName;
                } else {
                    rooms.add(currentCalName);
                }

                //only restrict the base calendars to not having duplicate events
                if (!isBaseCalendar || loadedRequests.get(requestId) == null || !loadedRequests.get(requestId)) {
                    JSONObject jsonEvent = new JSONObject();
                    jsonEvent.put("title", event.subject);
                    String start, end;
                    String id = UUID.randomUUID().toString();
                    if (isBaseCalendar) {
                        loadedRequests.put(requestId, true);
                        start = dtf.format(Collections.min(eventTimesByRequestId.get(requestId).get("startTimes")));
                        end = dtf.format(Collections.max(eventTimesByRequestId.get(requestId).get("endTimes")));

                        parentIds.put(requestId, id);
                    } else {
                        start = dtf.format(LocalDateTime.parse(event.start.dateTime));
                        end = dtf.format(LocalDateTime.parse(event.end.dateTime));

                        childIds.computeIfAbsent(requestId, key -> new JSONArray()).put(id);
                    }
                    jsonEvent.put("start", start);
                    jsonEvent.put("end", end);
                    jsonEvent.put("allDay", event.isAllDay);
                    jsonEvent.put("calendarId", currentCalName);
                    String bgColor = getCalendarColors().get(currentCalName);
                    jsonEvent.put("backgroundColor", bgColor != null ? bgColor : DEFAULT_BG_COLOR);
                    jsonEvent.put("textColor", getTextColor(jsonEvent.getString("backgroundColor")));
                    jsonEvent.put("id", id);

                    //Add data for details panel on Surgery Schedule page
                    JSONObject extendedProps = new JSONObject();
                    if (surgeryInfo != null) {
                        extendedProps.put("lsid", surgeryInfo.get("lsid"));
                        extendedProps.put("taskid", surgeryInfo.get("taskid"));
                        extendedProps.put("objectid", isBaseCalendar ? surgeryInfo.get("objectid") : objectId);
                        extendedProps.put("requestid", surgeryInfo.get("requestid"));
                        extendedProps.put("rowid", surgeryInfo.get("rowid"));
                        extendedProps.put("priority", surgeryInfo.get("priority"));
                        extendedProps.put("requestor", surgeryInfo.get("requestor"));
                        extendedProps.put("procedurecategory", surgeryInfo.get("procedurecategory"));
                        extendedProps.put("procedurename", surgeryInfo.get("procedurename"));
                        extendedProps.put("age", surgeryInfo.get("age"));
                        extendedProps.put("animalid", surgeryInfo.get("animalid"));
                        extendedProps.put("created", surgeryInfo.get("created"));
                        extendedProps.put("date", start);
                        extendedProps.put("enddate", end);
                        extendedProps.put("account", surgeryInfo.get("account"));
                        extendedProps.put("cur_room", surgeryInfo.get("cur_room"));
                        extendedProps.put("cur_cage", surgeryInfo.get("cur_cage"));
                        extendedProps.put("cur_cond", surgeryInfo.get("cur_cond"));
                        extendedProps.put("location", surgeryInfo.get("location"));
                        extendedProps.put("rooms", surgeryInfo.get("rooms"));
                        extendedProps.put("medical", surgeryInfo.get("medical"));
                        extendedProps.put("project", surgeryInfo.get("project"));
                        extendedProps.put("protocol", surgeryInfo.get("protocol"));
                        extendedProps.put("sex", surgeryInfo.get("sex"));
                        extendedProps.put("weight", surgeryInfo.get("weight"));
                        extendedProps.put("comments", surgeryInfo.get("comments"));
                        extendedProps.put("selected", false);
                        jsonEvent.put("extendedProps", extendedProps);
                    }
                    ((JSONArray) allJsonEvents.get(currentCalName)).put(jsonEvent);
                }
            }
            //Populate the parentId for each of the rooms (the id of the event on the base calendar)
            for (String room : rooms) {
                JSONArray roomEvents = allJsonEvents.getJSONArray(room);
                JSONObject roomEvent = roomEvents.getJSONObject(roomEvents.length() - 1);
                JSONObject extendedProps = roomEvent.getJSONObject("extendedProps");
                extendedProps.put("parentid", parentIds.get(requestId));
            }
            //Populate the childIds for the baseCalendar (the ids of the events on the room calendars)
            JSONArray calendarEvents = allJsonEvents.getJSONArray(baseCalendar);
            JSONObject calendarEvent = calendarEvents.getJSONObject(calendarEvents.length() - 1);
            JSONObject extendedProps = calendarEvent.getJSONObject("extendedProps");
            extendedProps.put("childids", childIds.get(requestId));
        }

        for (Map.Entry<String, Object> entry : allJsonData.entrySet()) {
            ((JSONObject) entry.getValue()).put("events", allJsonEvents.get(entry.getKey()));
        }

        return allJsonData;
    }

    private JSONObject getUnmanagedJsonEventList(List<Event> events) {
        //JSONObject allJsonData = new JSONObject();
        JSONObject allJsonEvents = new JSONObject();
        for (Event event : events) {
            String currentCalName = getCalendarsById().get(event.calendar.id);
            allJsonEvents.computeIfAbsent(currentCalName, key -> new JSONArray());
            JSONObject jsonEvent = new JSONObject();
            JSONObject extendedProps = new JSONObject();

            jsonEvent.put("title", event.subject);
            String id = UUID.randomUUID().toString();
            String start = dtf.format(LocalDateTime.parse(event.start.dateTime));
            String end = dtf.format(LocalDateTime.parse(event.end.dateTime));
            jsonEvent.put("start", start);
            jsonEvent.put("end", end);
            jsonEvent.put("allDay", event.isAllDay);
            jsonEvent.put("calendarId", currentCalName);
            String bgColor = getCalendarColors().get(currentCalName);
            jsonEvent.put("backgroundColor", bgColor != null ? bgColor : DEFAULT_BG_COLOR);
            jsonEvent.put("textColor", getTextColor(jsonEvent.getString("backgroundColor")));
            jsonEvent.put("id", id);

            extendedProps.put("isUnmanaged", true);
            extendedProps.put("eventId", event.id);
            jsonEvent.put("extendedProps", extendedProps);

            ((JSONArray) allJsonEvents.get(currentCalName)).put(jsonEvent);
        }

        return allJsonEvents;
    }

    private JSONObject getCalendarEvents(String start, String end) throws IOException {
        JSONObject baseCalendarEvents = getJsonEventList(getCalendarAppointments(start, end, getBaseCalendars()));
        JSONObject unmanagedEvents = getUnmanagedJsonEventList(getCalendarAppointments(start, end, getUnmanagedCalendars()));

        for (Map.Entry entry : unmanagedEvents.entrySet()) {
            ((JSONObject) baseCalendarEvents.get(entry.getKey())).put("events", entry.getValue());
        }

        return baseCalendarEvents;
    }

//    private JSONObject getRoomEvents(String start, String end, String roomId) {
//        JSONObject jsonEvents = getJsonEventList(getRoomAppointments(start, end, roomId), roomId);
//        return jsonEvents;
//    }

    private List<Event> getCalendarAppointments(String start, String end, Map<String, String> calendars) {
        List<Event> events = new ArrayList<>();
        for (Map.Entry<String, String> entry : calendars.entrySet()) {
            events.addAll(Graph.readEvents(getAccessToken(getAccountNames().get(entry.getKey())), entry.getValue(), start, end));
        }
        return events;
    }

//    public List<Event> getRoomAppointments(String start, String end, String roomId) {
//        return Graph.readRoomEvents(getAccessToken(), roomId, start, end);
//    }

    public JSONObject getEventsAsJson(LocalDate startDate, LocalDate endDate) throws IOException {
        String start = startDate != null
                ? startDate.format(DateTimeFormatter.ISO_LOCAL_DATE)
                : LocalDate.now().minusMonths(3).withDayOfMonth(1).format(DateTimeFormatter.ISO_LOCAL_DATE);
        String end = endDate != null
                ? endDate.format(DateTimeFormatter.ISO_LOCAL_DATE)
                : LocalDate.now().plusYears(1).plusMonths(1).withDayOfMonth(1).format(DateTimeFormatter.ISO_LOCAL_DATE);
        return getCalendarEvents(start, end);
    }
}