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
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.query.QueryService;
import org.labkey.api.security.User;
import org.labkey.api.util.PageFlowUtil;
import org.labkey.dbutils.api.SimpleQuery;
import org.labkey.dbutils.api.SimpleQueryFactory;
import org.labkey.dbutils.api.SimplerFilter;
import org.labkey.webutils.api.json.JsonUtils;
import org.labkey.wnprc_ehr.AzureAuthentication.AzureAccessTokenRefreshSettings;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class Office365Calendar implements org.labkey.wnprc_ehr.calendar.Calendar {

    private User user;
    private Container container;

    private static Map<String, String> BASE_CALENDARS = null;
    private static Map<String, String> CALENDARS_BY_ID = null;
    private static Map<String, String> CALENDAR_COLORS = null;
    private static final String AZURE_NAME = "ProcedureCalendar";
    public static final DateTimeFormatter dtf = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

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
    private String getAccessToken() {
        return PropertyManager.getEncryptedStore().getWritableProperties(AZURE_NAME + ".Credentials", false).get("AccessToken");
    }

    private synchronized Map<String, String> getBaseCalendars() {
        return getBaseCalendars(false);
    }

    //Gets the base calendars (surgeries_scheduled, surgeries_on_hold, procedures_scheduled, procedures_on_hold)
    private synchronized Map<String, String> getBaseCalendars(boolean refresh) {
        if (BASE_CALENDARS == null || refresh) {
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
        return getCalendarsById(false);
    }

    private synchronized Map<String, String> getCalendarsById(boolean refresh) {
        if (CALENDARS_BY_ID == null || refresh) {
            CALENDARS_BY_ID = new HashMap<>();
            SimplerFilter filter = new SimplerFilter("calendar_type", CompareType.EQUAL, "Office365");
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
        return getCalendarColors(false);
    }

    private synchronized Map<String, String> getCalendarColors(boolean refresh) {
        if (CALENDAR_COLORS == null || refresh) {
            CALENDAR_COLORS = new HashMap<>();
            SimplerFilter filter = new SimplerFilter("calendar_type", CompareType.IN, List.of("Office365", "Office365Resource"));
            TableInfo ti = QueryService.get().getUserSchema(user, container, "wnprc").getTable("procedure_calendars_and_rooms");
            TableSelector ts = new TableSelector(ti, PageFlowUtil.set("calendar_id", "default_bg_color"), filter, null);
            Map<String, Object>[] calendars = ts.getMapArray();
            for (Map<String, Object> calendar : calendars) {
                CALENDAR_COLORS.put((String) calendar.get("calendar_id"), (String) calendar.get("default_bg_color"));
            }
        }
        return CALENDAR_COLORS;
    }

    public Map<String, Boolean> isRoomAvailable(List<String> rooms, Date start, Date end) {
        ZonedDateTime startTime = ZonedDateTime.ofInstant(start.toInstant(), ZoneId.of("America/Chicago"));
        ZonedDateTime endTime = ZonedDateTime.ofInstant(end.toInstant(), ZoneId.of("America/Chicago"));

        Map<String, Boolean> availability = Graph.getAvailability(getAccessToken(), rooms, startTime, endTime);
        return availability;
    }

    public boolean addEvents(String calendarId, List<Map<String, Object>> roomRequests, String subject, String requestId, JSONObject response) {
        boolean allRoomsAvailable = true;
        List<Event> addedEvents = new ArrayList<>();

        for (Map<String, Object> roomRequest : roomRequests) {
            Date start = (Timestamp) roomRequest.get("date");
            Date end = (Timestamp) roomRequest.get("enddate");
            String roomEmailAddress = (String) roomRequest.get("room_fs_email");

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
            for (Map<String, Object> roomRequest : roomRequests) {
                Date start = (Timestamp) roomRequest.get("date");
                Date end = (Timestamp) roomRequest.get("enddate");
                String roomEmailAddress = (String) roomRequest.get("room_fs_email");

                ZonedDateTime startTime = ZonedDateTime.ofInstant(start.toInstant(), ZoneId.of("America/Chicago"));
                ZonedDateTime endTime = ZonedDateTime.ofInstant(end.toInstant(), ZoneId.of("America/Chicago"));

                List<Attendee> attendees = Graph.buildAttendeeList(roomEmailAddress);
                Event newEvent = Graph.buildEvent(startTime, endTime, subject, requestId, attendees);
                Event createdEvent = Graph.createEvent(getAccessToken(), getBaseCalendars().get(calendarId), newEvent);
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
        Graph.deleteEvent(getAccessToken(), eventId);
    }

    private JSONObject getJsonEventList(List<Event> events) {
        JSONObject allJsonData = new JSONObject();
        JSONObject allJsonEvents = new JSONObject();
        Map<String, String> parentIds = new HashMap<>();

        //Get all existing rows in the study.surgery_procedure table (and lots of other auxiliary data for each row)
        //to match with the request ids of the incoming events list
        SimpleQueryFactory sqf = new SimpleQueryFactory(user, container);
        SimpleQuery requests = sqf.makeQuery("study", "SurgeryProcedureSchedule");
        List<JSONObject> requestList = JsonUtils.getListFromJSONArray(requests.getResults().getJSONArray("rows"));

        SimpleQuery allCalendars = sqf.makeQuery("wnprc", "procedure_calendars_and_rooms");
        List<JSONObject> calendarList = JsonUtils.getListFromJSONArray(allCalendars.getResults().getJSONArray("rows"));

        for (JSONObject calendar : calendarList) {
            JSONObject eventSource = new JSONObject();
            eventSource.put("backgroundColor", getCalendarColors().get(calendar.getString("calendar_id")));
            eventSource.put("id", calendar.getString("calendar_id"));
            allJsonData.put(calendar.getString("calendar_id"), eventSource);

            if (allJsonEvents.get(calendar.getString("calendar_id")) == null) {
                allJsonEvents.put(calendar.getString("calendar_id"), new JSONArray());
            }
        }

        //Used to keep track of which events have already been loaded onto the base calendars, so that
        //they're not accidentally double loaded.
        //This is needed because of how we're combining multiple events with the same request id
        //into a single event for the base calendars
        Map<String, Boolean> loadedRequests = new HashMap<>();

        Map<String, JSONObject> queryResults = new HashMap<>();
        for (JSONObject o : requestList) {
            queryResults.put(o.getString("requestid"), o);
        }

        //Load all of the start and end times, organized by request id
        //This will help with getting the right start/end times for the full combined events
        Map<String, Map<String, List<LocalDateTime>>> eventTimesByRequestId = new HashMap<>();
        for (Event event : events) {
            String requestId = event.body.content;
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
            String requestId = event.body.content;

            JSONObject surgeryInfo = queryResults.get(requestId);
            //Skip the event if there's not a corresponding record in the study.surgery_procedure dataset
            if (surgeryInfo == null) {
                continue;
            }
            List<Attendee> attendees = event.attendees;

            List<String> rooms = new ArrayList<>();
            //Process each event multiple times. Once for each attendee, and then once to put on the base calendar
            for (int j = 0; j <= attendees.size(); j++) {
                boolean isBaseCalendar = false;
                Attendee attendee = j < attendees.size() ? attendees.get(j) : null;
                String currentCalName = attendee != null ? attendee.emailAddress.address : getCalendarsById().get(event.calendar.id);
                //If the surgeries account is listed as an attendee for some reason, then skip it
                //The base calendar event will be processed on the last time through the loop regardless,
                //and we want it organized by which surgeries calendar it's on
                if (currentCalName.equalsIgnoreCase(settings.getAccount(AZURE_NAME))) {
                    continue;
                }

                if (getBaseCalendars().get(currentCalName) != null) {
                    isBaseCalendar = true;
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
                    }
                    jsonEvent.put("start", start);
                    jsonEvent.put("end", end);
                    jsonEvent.put("calendarId", currentCalName);
                    jsonEvent.put("backgroundColor", getCalendarColors().get(currentCalName));
                    jsonEvent.put("id", id);

                    //Add data for details panel on Surgery Schedule page
                    JSONObject rawRowData = new JSONObject();
                    if (surgeryInfo != null) {
                        rawRowData.put("lsid", surgeryInfo.get("lsid"));
                        rawRowData.put("taskid", surgeryInfo.get("taskid"));
                        rawRowData.put("objectid", surgeryInfo.get("objectid"));
                        rawRowData.put("requestid", surgeryInfo.get("requestid"));
                        rawRowData.put("rowid", surgeryInfo.get("rowid"));
                        rawRowData.put("priority", surgeryInfo.get("priority"));
                        rawRowData.put("requestor", surgeryInfo.get("requestor"));
                        rawRowData.put("procedurecategory", surgeryInfo.get("procedurecategory"));
                        rawRowData.put("procedurename", surgeryInfo.get("procedurename"));
                        rawRowData.put("age", surgeryInfo.get("age"));
                        rawRowData.put("animalid", surgeryInfo.get("animalid"));
                        rawRowData.put("created", surgeryInfo.get("created"));
                        rawRowData.put("date", start);
                        rawRowData.put("enddate", end);
                        rawRowData.put("account", surgeryInfo.get("account"));
                        rawRowData.put("cur_room", surgeryInfo.get("cur_room"));
                        rawRowData.put("cur_cage", surgeryInfo.get("cur_cage"));
                        rawRowData.put("cur_cond", surgeryInfo.get("cur_cond"));
                        rawRowData.put("location", surgeryInfo.get("location"));
                        rawRowData.put("rooms", surgeryInfo.get("rooms"));
                        rawRowData.put("medical", surgeryInfo.get("medical"));
                        rawRowData.put("project", surgeryInfo.get("project"));
                        rawRowData.put("protocol", surgeryInfo.get("protocol"));
                        rawRowData.put("sex", surgeryInfo.get("sex"));
                        rawRowData.put("weight", surgeryInfo.get("weight"));
                        rawRowData.put("comments", surgeryInfo.get("comments"));
                        jsonEvent.put("rawRowData", rawRowData);
                    }
                    ((JSONArray) allJsonEvents.get(currentCalName)).put(jsonEvent);
                }
            }
            //Populate the parentId for each of the rooms (the id of the event on the base calendar)
            for (String room : rooms) {
                JSONArray roomEvents = allJsonEvents.getJSONArray(room);
                JSONObject roomEvent = roomEvents.getJSONObject(roomEvents.length() - 1);
                JSONObject rawRowData = roomEvent.getJSONObject("rawRowData");
                rawRowData.put("parentid", parentIds.get(rawRowData.get("requestid")));
            }
        }

        for (Map.Entry<String, Object> entry : allJsonData.entrySet()) {
            ((JSONObject) entry.getValue()).put("events", allJsonEvents.get(entry.getKey()));
        }

        return allJsonData;
    }

    private JSONObject getCalendarEvents(String start, String end) {
        JSONObject jsonEvents = getJsonEventList(getCalendarAppointments(start, end));
        return jsonEvents;
    }

//    private JSONObject getRoomEvents(String start, String end, String roomId) {
//        JSONObject jsonEvents = getJsonEventList(getRoomAppointments(start, end, roomId), roomId);
//        return jsonEvents;
//    }

    private List<Event> getCalendarAppointments(String start, String end) {
        List<Event> events = new ArrayList<>();
        for (Map.Entry<String, String> entry : getBaseCalendars().entrySet()) {
            events.addAll(Graph.readEvents(getAccessToken(), entry.getValue(), start, end));
        }
        return events;
    }

//    public List<Event> getRoomAppointments(String start, String end, String roomId) {
//        return Graph.readRoomEvents(getAccessToken(), roomId, start, end);
//    }

    public JSONObject getEventsAsJson(LocalDate startDate, LocalDate endDate) {
        String start = startDate != null
                ? startDate.format(DateTimeFormatter.ISO_LOCAL_DATE)
                : LocalDate.now().minusYears(1).withDayOfMonth(1).format(DateTimeFormatter.ISO_LOCAL_DATE);
        String end = endDate != null
                ? endDate.format(DateTimeFormatter.ISO_LOCAL_DATE)
                : LocalDate.now().plusYears(2).plusMonths(1).withDayOfMonth(1).format(DateTimeFormatter.ISO_LOCAL_DATE);
        return getCalendarEvents(start, end);
    }
}