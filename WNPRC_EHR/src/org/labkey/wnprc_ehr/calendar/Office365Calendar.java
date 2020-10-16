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
import org.labkey.api.security.User;
import org.labkey.api.util.PageFlowUtil;
import org.labkey.dbutils.api.SimpleQuery;
import org.labkey.dbutils.api.SimpleQueryFactory;
import org.labkey.dbutils.api.SimplerFilter;
import org.labkey.webutils.api.json.JsonUtils;

import java.sql.Timestamp;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
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
import java.util.stream.Collectors;

public class Office365Calendar implements org.labkey.wnprc_ehr.calendar.Calendar {

    private User user;
    private Container container;

    private static final Map<String, String> BASE_CALENDARS;
    private static final String ACCOUNT_NAME = "ProcedureCalendar";
    public static final DateFormat df = new SimpleDateFormat("yyyy-MM-dd HH:mm");
    public static final DateTimeFormatter dtf = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    static {
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

    public void setUser(User user) {
        this.user = user;
    }

    public void setContainer(Container container) {
        this.container = container;
    }

    private String getAccessToken() {
        return PropertyManager.getEncryptedStore().getWritableProperties(ACCOUNT_NAME + ".Credentials", false).get("AccessToken");
    }

    public Map<String, Boolean> isRoomAvailable(List<String> rooms, Date start, Date end) {
        ZonedDateTime startTime = ZonedDateTime.ofInstant(start.toInstant(), ZoneId.of("America/Chicago"));
        ZonedDateTime endTime = ZonedDateTime.ofInstant(end.toInstant(), ZoneId.of("America/Chicago"));

        Map<String, Boolean> availability = Graph.getAvailability(getAccessToken(), rooms, startTime, endTime);
        return availability;
    }

    public boolean addEvents(String calendarId, List<Map<String, Object>> roomRequests, String subject, String requestId, JSONObject response) {
        boolean allRoomsAvailable = true;

        for (Map<String, Object> roomRequest : roomRequests) {
            Date start = (Timestamp) roomRequest.get("date");
            Date end = (Timestamp) roomRequest.get("enddate");
            String roomEmailAddress = (String) roomRequest.get("room_fs_email");

            List<String> rooms = new ArrayList<>();
            rooms.add(roomEmailAddress);
            if (!isRoomAvailable(rooms, start, end).get(roomEmailAddress)) {
                allRoomsAvailable = false;
                response.put("error", "Room " + roomEmailAddress != null ? roomEmailAddress.substring(0, roomEmailAddress.indexOf("@")) : "null" + " is not available at the requested time");
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
                Event createdEvent = Graph.createEvent(getAccessToken(), BASE_CALENDARS.get(calendarId), newEvent);
                roomRequest.put("event_id", createdEvent.id);
            }
        } else {

        }
        return allRoomsAvailable;
    }

    public void cancelEvent(String eventId) {
        JSONObject response = new JSONObject();
        response.put("success", false);
        cancelEvent(eventId, response);
    }

    public void cancelEvent(String eventId, JSONObject response) {
        Event event = Graph.readEvent(getAccessToken(), eventId);
        Graph.deleteEvent(getAccessToken(), eventId);

        List<String> rooms = event.attendees.stream().map(attendee -> attendee.emailAddress.address).collect(Collectors.toList());
        LocalDateTime start = LocalDateTime.parse(event.start.dateTime);
        LocalDateTime end = LocalDateTime.parse(event.end.dateTime);

        response.put("rooms", rooms);
        response.put("start", start);
        response.put("end", end);
        response.put("calendar", event.calendar.name);
    }

    private JSONObject getJsonEventList(List<Event> events, String calendarName, String backgroundColor) {
        JSONObject eventSourceObject = new JSONObject();
        JSONArray jsonEvents = new JSONArray();

        SimpleQueryFactory sqf = new SimpleQueryFactory(user, container);
        SimpleQuery requests = sqf.makeQuery("study", "SurgeryProcedureSchedule");
        List<JSONObject> requestList = JsonUtils.getListFromJSONArray(requests.getResults().getJSONArray("rows"));

        Map<String, Boolean> loadedRequests = new HashMap<>();

        Map<String, JSONObject> queryResults = new HashMap<>();
        for (JSONObject o : requestList) {
            queryResults.put(o.getString("requestid"), o);
        }

        //TODO group main events (surgeries_scheduled, etc) by requestid (time)
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

        for (int i = 0; i < events.size(); i++) {
            Event event = events.get(i);
            String requestId = event.body.content;
            JSONObject surgeryInfo = queryResults.get(requestId);

            if (loadedRequests.get(requestId) == null || !loadedRequests.get(requestId)) {
                JSONObject jsonEvent = new JSONObject();
                jsonEvent.put("title", event.subject);
                String start, end;
                if (BASE_CALENDARS.get(calendarName) != null) {
                    loadedRequests.put(requestId, true);
                    start = dtf.format(Collections.min(eventTimesByRequestId.get(requestId).get("startTimes")));
                    end = dtf.format(Collections.max(eventTimesByRequestId.get(requestId).get("endTimes")));
                } else {
                    start = dtf.format(LocalDateTime.parse(event.start.dateTime));
                    end = dtf.format(LocalDateTime.parse(event.end.dateTime));
                }
                jsonEvent.put("start", start);
                jsonEvent.put("end", end);
                jsonEvent.put("calendarId", calendarName);
                jsonEvent.put("backgroundColor", backgroundColor);
                jsonEvent.put("id", calendarName + "_" + i);
                jsonEvent.put("eventId", i);

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
                    //rawRowData.put("date", surgeryInfo.get("date"));
                    //rawRowData.put("enddate", surgeryInfo.get("enddate"));
                    rawRowData.put("date", start);
                    rawRowData.put("enddate", end);
                    rawRowData.put("account", surgeryInfo.get("account"));
                    rawRowData.put("cur_room", surgeryInfo.get("cur_room"));
                    rawRowData.put("cur_cage", surgeryInfo.get("cur_cage"));
                    rawRowData.put("cur_cond", surgeryInfo.get("cur_cond"));
                    rawRowData.put("location", surgeryInfo.get("location"));
                    rawRowData.put("medical", surgeryInfo.get("medical"));
                    rawRowData.put("project", surgeryInfo.get("project"));
                    rawRowData.put("protocol", surgeryInfo.get("protocol"));
                    rawRowData.put("sex", surgeryInfo.get("sex"));
                    rawRowData.put("weight", surgeryInfo.get("weight"));
                    rawRowData.put("comments", surgeryInfo.get("comments"));
                    jsonEvent.put("rawRowData", rawRowData);
                }
                jsonEvents.put(jsonEvent);
            }
        }
        eventSourceObject.put("events", jsonEvents);
        eventSourceObject.put("backgroundColor", backgroundColor);
        eventSourceObject.put("id", calendarName);
        eventSourceObject.put("nextAvailableId", jsonEvents.length());

        return eventSourceObject;
    }

    private JSONObject getCalendarEvents(String start, String end, String calendarName, String backgroundColor) {
        JSONObject jsonEvents = getJsonEventList(getCalendarAppointments(start, end, calendarName), calendarName, backgroundColor);
        return jsonEvents;
    }

    private JSONObject getRoomEvents(String start, String end, String roomId, String backgroundColor) {
        JSONObject jsonEvents = getJsonEventList(getRoomAppointments(start, end, roomId), roomId, backgroundColor);
        return jsonEvents;
    }

    private List<Event> getCalendarAppointments(String start, String end, String calendarName) {
        return Graph.readEvents(getAccessToken(), BASE_CALENDARS.get(calendarName), start, end);
    }

    public List<Event> getRoomAppointments(String start, String end, String roomId) {
        return Graph.readRoomEvents(getAccessToken(), roomId, start, end);
    }

    public JSONObject getEventsAsJson(String calendarName, String backgroundColor, EventType eventType, Date startDate, Date endDate) {
        String start = startDate != null ? df.format(startDate) : LocalDate.now().minusYears(1).withDayOfMonth(1).format(DateTimeFormatter.ISO_LOCAL_DATE);
        String end = endDate != null ? df.format(endDate) : LocalDate.now().plusYears(2).plusMonths(1).withDayOfMonth(1).format(DateTimeFormatter.ISO_LOCAL_DATE);
        if (eventType == EventType.CALENDAR) {
            return getCalendarEvents(start, end, calendarName, backgroundColor);
        } else if (eventType == EventType.ROOM) {
            return getRoomEvents(start, end, calendarName, backgroundColor);
        }
        return new JSONObject();
    }
}