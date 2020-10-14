package org.labkey.wnprc_ehr.calendar;

import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import com.microsoft.graph.logger.DefaultLogger;
import com.microsoft.graph.logger.LoggerLevel;
import com.microsoft.graph.models.extensions.Attendee;
import com.microsoft.graph.models.extensions.Calendar;
import com.microsoft.graph.models.extensions.DateTimeTimeZone;
import com.microsoft.graph.models.extensions.EmailAddress;
import com.microsoft.graph.models.extensions.Event;
import com.microsoft.graph.models.extensions.IGraphServiceClient;
import com.microsoft.graph.models.extensions.ItemBody;
import com.microsoft.graph.models.extensions.ScheduleInformation;
import com.microsoft.graph.models.extensions.User;
import com.microsoft.graph.models.generated.AttendeeType;
import com.microsoft.graph.models.generated.BodyType;
import com.microsoft.graph.options.HeaderOption;
import com.microsoft.graph.options.Option;
import com.microsoft.graph.options.QueryOption;
import com.microsoft.graph.requests.extensions.GraphServiceClient;
import com.microsoft.graph.requests.extensions.ICalendarCollectionPage;
import com.microsoft.graph.requests.extensions.ICalendarGetScheduleCollectionPage;
import com.microsoft.graph.requests.extensions.IEventCollectionPage;

/**
 * Graph
 */
public class Graph {

    private static IGraphServiceClient graphClient = null;
    private static SimpleAuthProvider authProvider = null;
    private static DateTimeFormatter isoLocalDateTimeFormatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    private static void ensureGraphClient(String accessToken) {
        if (graphClient == null) {
            // Create the auth provider
            authProvider = new SimpleAuthProvider(accessToken);

            // Create default logger to only log errors
            DefaultLogger logger = new DefaultLogger();
            logger.setLoggingLevel(LoggerLevel.ERROR);

            // Build a Graph client
            graphClient = GraphServiceClient.builder()
                .authenticationProvider(authProvider)
                .logger(logger)
                .buildClient();
        }
    }

    public static User getUser(String accessToken) {
        ensureGraphClient(accessToken);

        // GET /me to get authenticated user
        User me = graphClient
            .me()
            .buildRequest()
            .get();

        return me;
    }

    public static List<Calendar> readCalendars(String accessToken) {
    	ensureGraphClient(accessToken);

    	ICalendarCollectionPage calendarPage = graphClient
    		.me()
    		.calendars()
    		.buildRequest()
    		.get();

    	return calendarPage.getCurrentPage();
    }

    public static Event createEvent(String accessToken, String calendarId, Event newEvent) {
    	ensureGraphClient(accessToken);

    	Event addedEvent = graphClient
    		.me()
    		.calendars()
    		.byId(calendarId)
    		.events()
    		.buildRequest()
    		.post(newEvent);

    	return addedEvent;
    }

    public static List<Event> readRoomEvents(String accessToken, String roomEmailAddress, String start, String end) {
    	ensureGraphClient(accessToken);

    	// Use HeaderOption to specify that we want the event body to be text rather than html
        List<Option> options = new LinkedList<Option>();
        options = addPreferTextHeader(options);
    	options = addPreferCentralTimeZone(options);
    	options = addDateFilters(options, start, end);

    	IEventCollectionPage eventPage = graphClient
    		.users(roomEmailAddress)
    		.events()
    		.buildRequest(options)
    		.get();

    	List<Event> events = new ArrayList<>();

        // Page through to get all events (default is 10 per page)
        events.addAll(eventPage.getCurrentPage());
        while (eventPage.getNextPage() != null && (eventPage = eventPage.getNextPage().buildRequest().get()) != null) {
        	events.addAll(eventPage.getCurrentPage());
        }

        return events;
    }

    public static Event readEvent(String accessToken, String eventId) {
    	ensureGraphClient(accessToken);

    	List<Option> options = new LinkedList<>();
    	options = addPreferTextHeader(options);
    	options = addPreferCentralTimeZone(options);
    	options.add(new QueryOption("expand", "calendar"));

    	Event event = graphClient
			.me()
			.events(eventId)
			.buildRequest(options)
			.get();

    	Calendar calendar = graphClient
    		.me()
    		.calendars(event.calendar.id)
    		.buildRequest()
    		.get();

    	event.calendar = calendar;

    	return event;
	}

    public static List<Event> readEvents(String accessToken, String calendarId, String start, String end) {
        ensureGraphClient(accessToken);

        List<Event> events = new ArrayList<>();

        // Use HeaderOption to specify that we want the event body to be text rather than html
        List<Option> options = new LinkedList<>();
        options = addPreferTextHeader(options);
    	options = addPreferCentralTimeZone(options);
    	options = addDateFilters(options, start, end);

        // GET /me/events
        IEventCollectionPage eventPage = graphClient
            .me()
            .calendars()
            .byId(calendarId)
            .events()
            .buildRequest(options)
            .select("id,subject,organizer,start,end,body")
            .get();

        // Page through to get all events (default is 10 per page)
        events.addAll(eventPage.getCurrentPage());
        while (eventPage.getNextPage() != null && (eventPage = eventPage.getNextPage().buildRequest().get()) != null) {
        	events.addAll(eventPage.getCurrentPage());
        }

        return events;
    }

    public static Event updateEvent(String accessToken, String eventId, Event event) {
    	ensureGraphClient(accessToken);

    	Event updatedEvent = graphClient
    		.me()
    		.events(eventId)
    		.buildRequest()
    		.patch(event);

    	return updatedEvent;
    }

    public static void deleteEvent(String accessToken, String eventId) {
    	ensureGraphClient(accessToken);

    	graphClient
    		.me()
    		.events(eventId)
    		.buildRequest()
    		.delete();
    }

    public static Map<String, Boolean> getAvailability(String accessToken, List<String> attendees, ZonedDateTime start, ZonedDateTime end) {
    	ensureGraphClient(accessToken);

    	List<Option> options = new LinkedList<Option>();
    	options = addPreferCentralTimeZone(options);

    	List<ScheduleInformation> scheduleInfos = new ArrayList<>();
    	int duration = (int) ChronoUnit.MINUTES.between(start, end);

    	DateTimeTimeZone startTime = new DateTimeTimeZone();
    	startTime.dateTime = start.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
    	startTime.timeZone = start.getZone().toString();

    	DateTimeTimeZone endTime = new DateTimeTimeZone();
    	endTime.dateTime = end.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
    	endTime.timeZone = end.getZone().toString();

    	ICalendarGetScheduleCollectionPage schedulePage = graphClient
    		.me()
    		.calendar()
    		.getSchedule(attendees, endTime, startTime, duration)
    		.buildRequest(options)
    		.post();

    	// Page through to get all events (default is 10 per page)
    	scheduleInfos.addAll(schedulePage.getCurrentPage());
        while (schedulePage.getNextPage() != null && (schedulePage = schedulePage.getNextPage().buildRequest().post()) != null) {
        	scheduleInfos.addAll(schedulePage.getCurrentPage());
        }

        Map<String, Boolean> availability = new HashMap<>();

        for (ScheduleInformation scheduleInfo : scheduleInfos) {
        	if ("0".equals(scheduleInfo.availabilityView)) {
        		availability.put(scheduleInfo.scheduleId, true);
        	} else {
        		availability.put(scheduleInfo.scheduleId, false);
        	}
        }

    	return availability;
    }



    // Helper methods below

    public static Event buildEvent(ZonedDateTime start, ZonedDateTime end, String subject, String body, List<Attendee> attendees) {
    	Event event = new Event();
    	event.subject = subject;
    	ItemBody eventBody = new ItemBody();
    	eventBody.contentType = BodyType.TEXT;
    	eventBody.content = body;
    	event.body = eventBody;
    	DateTimeTimeZone eventStart = new DateTimeTimeZone();
    	eventStart.dateTime = start.format(isoLocalDateTimeFormatter);
    	eventStart.timeZone = start.getZone().toString();
    	DateTimeTimeZone eventEnd = new DateTimeTimeZone();
    	eventEnd.dateTime = end.format(isoLocalDateTimeFormatter);
    	eventEnd.timeZone = end.getZone().toString();
    	event.start = eventStart;
    	event.end = eventEnd;
    	event.attendees = attendees;

    	return event;
    }

    public static List<Attendee> buildAttendeeList(String ...emailAddresses) {
    	List<Attendee> attendees = new ArrayList<>();
    	for (String emailAddress : emailAddresses) {
    		Attendee attendee = new Attendee();
    		EmailAddress email = new EmailAddress();
    		email.address = emailAddress;
    		email.name = emailAddress.substring(0, emailAddress.indexOf('@'));
    		attendee.emailAddress = email;
    		attendee.type = AttendeeType.RESOURCE;
    		attendees.add(attendee);
    	}
    	return attendees;
    }

    private static List<Option> addPreferTextHeader(List<Option> options) {
    	options.add(new HeaderOption("Prefer", "outlook.body-content-type=\"text\""));
    	return options;
    }

    private static List<Option> addPreferCentralTimeZone(List<Option> options) {
    	options.add(new HeaderOption("Prefer", "outlook.timezone=\"America/Chicago\""));
    	return options;
    }

    private static List<Option> addDateFilters(List<Option> options, String start, String end) {
    	if (start != null && end != null) {
    		options.add(new QueryOption("filter", "start/datetime ge '" + start + "' and end/datetime lt '" + end + "'"));
    	} else if (start != null) {
    		options.add(new QueryOption("filter", "start/datetime ge '" + start + "'"));
    	} else if (end != null) {
    		options.add(new QueryOption("filter", "end/datetime lt '" + end + "'"));
    	}

    	return options;
    }
}