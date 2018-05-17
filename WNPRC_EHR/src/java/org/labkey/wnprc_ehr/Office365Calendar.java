package org.labkey.wnprc_ehr;

import microsoft.exchange.webservices.data.autodiscover.IAutodiscoverRedirectionUrl;
import microsoft.exchange.webservices.data.autodiscover.exception.AutodiscoverLocalException;
import microsoft.exchange.webservices.data.core.ExchangeService;
import microsoft.exchange.webservices.data.core.PropertySet;
import microsoft.exchange.webservices.data.core.enumeration.availability.AvailabilityData;
import microsoft.exchange.webservices.data.core.enumeration.misc.ExchangeVersion;
import microsoft.exchange.webservices.data.core.enumeration.misc.error.ServiceError;
import microsoft.exchange.webservices.data.core.enumeration.property.BodyType;
import microsoft.exchange.webservices.data.core.enumeration.property.WellKnownFolderName;
import microsoft.exchange.webservices.data.core.response.AttendeeAvailability;
import microsoft.exchange.webservices.data.core.service.folder.CalendarFolder;
import microsoft.exchange.webservices.data.core.service.item.Appointment;
import microsoft.exchange.webservices.data.credential.ExchangeCredentials;
import microsoft.exchange.webservices.data.credential.WebCredentials;
import microsoft.exchange.webservices.data.misc.availability.AttendeeInfo;
import microsoft.exchange.webservices.data.misc.availability.GetUserAvailabilityResults;
import microsoft.exchange.webservices.data.misc.availability.TimeWindow;
import microsoft.exchange.webservices.data.property.complex.MessageBody;
import microsoft.exchange.webservices.data.property.complex.StringList;
import microsoft.exchange.webservices.data.property.complex.availability.CalendarEvent;
import microsoft.exchange.webservices.data.property.complex.availability.Suggestion;
import microsoft.exchange.webservices.data.property.complex.availability.TimeSuggestion;
import microsoft.exchange.webservices.data.search.CalendarView;
import microsoft.exchange.webservices.data.search.FindItemsResults;
import org.json.JSONArray;
import org.json.JSONObject;
import org.labkey.api.data.Container;
import org.labkey.api.security.User;
import org.labkey.dbutils.api.SimpleQuery;
import org.labkey.dbutils.api.SimpleQueryFactory;
import org.labkey.webutils.api.json.JsonUtils;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class OutlookCalendarTest
{
    public static final ExchangeService service = new ExchangeService(ExchangeVersion.Exchange2010_SP2);
    private static final SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    private User user;
    private Container container;


    public void setUser(User u)
    {
        user = u;
    }

    public void setContainer(Container c)
    {
        container = c;
    }

    public void authenticate()
    {
        try
        {
            ExchangeCredentials credentials = new WebCredentials("gottfredsen@wisc.edu", "p0K#bpyC");
            service.setCredentials(credentials);
            service.autodiscoverUrl("gottfredsen@wisc.edu");

        }
        catch (AutodiscoverLocalException ale)
        {
            try
            {
                service.autodiscoverUrl("gottfredsen@wisc.edu", new RedirectionUrlCallback());
            }
            catch (Exception e)
            {
                int x = 3;
                //TODO WHAT?
            }
        }
        catch (Exception e)
        {
            int x = 3;
        }
    }

    private void addEvents()
    {
        try
        {
            List<Appointment> appts = getAppointments(formatter.parse("2018-05-01 00:00:00"), formatter.parse("2018-05-31 23:59:59"));
            if (appts.size() == 0)
            {
                ArrayList<String> cats = new ArrayList<>();
                cats.add("Orange category");

                Appointment appt = new Appointment(service);
                appt.setStart(formatter.parse("2018-05-09 09:30:00"));
                appt.setEnd(formatter.parse("2018-05-09 10:30:00"));
                appt.setSubject("TestSave1");
                appt.setCategories(new StringList(cats));
                appt.setBody(new MessageBody(BodyType.Text, "3D493F0F-35CA-1036-9FC5-E3C4AAA55B3A"));
                appt.save();

                appt = new Appointment(service);
                appt.setStart(formatter.parse("2018-05-08 04:30:00"));
                appt.setEnd(formatter.parse("2018-05-08 15:45:00"));
                appt.setSubject("TestSave2");
                appt.setCategories(new StringList(cats));
                appt.setBody(new MessageBody(BodyType.Text, "3D493B9E-35CA-1036-9FC5-E3C4AAA55B3A"));
                appt.save();
            }
        }
        catch (Exception e)
        {
            int x = 3;
            //FYI FIX!
        }
    }

    private void getAvailability()
    {
        try
        {
            // Create a list of attendees for which to request availability
            // information and meeting time suggestions.

            List<AttendeeInfo> attendees = new ArrayList<AttendeeInfo>();
            attendees.add(new AttendeeInfo("gottfredsen@wisc.edu"));
            attendees.add(new AttendeeInfo("cstevens@primate.wisc.edu"));

            SimpleDateFormat formatter = new SimpleDateFormat("yyyy/MM/dd");

            //minimum time frame allowed by API is 24 hours
            Date start = formatter.parse("2018/05/08");
            Date end = formatter.parse("2018/05/09");

            // Call the availability service.
            GetUserAvailabilityResults results = service.getUserAvailability(
                    attendees,
                    new TimeWindow(start, end),
                    AvailabilityData.FreeBusyAndSuggestions);

            // Output attendee availability information.
            int attendeeIndex = 0;

            for (AttendeeAvailability attendeeAvailability : results.getAttendeesAvailability())
            {
                System.out.println("Availability for " + attendees.get(attendeeIndex));
                if (attendeeAvailability.getErrorCode() == ServiceError.NoError)
                {
                    for (CalendarEvent calendarEvent : attendeeAvailability.getCalendarEvents())
                    {
                        System.out.println("Calendar event");
                        System.out.println("  Start time: " + calendarEvent.getStartTime().toString());
                        System.out.println("  End time: " + calendarEvent.getEndTime().toString());

                        if (calendarEvent.getDetails() != null)
                        {
                            System.out.println("  Subject: " + calendarEvent.getDetails().getSubject());
                            // Output additional properties.
                        }
                    }
                }

                attendeeIndex++;
            }


            // Output suggested meeting times.
            for (Suggestion suggestion : results.getSuggestions())
            {
                System.out.println("Suggested day: " + suggestion.getDate().toString());
                System.out.println("Overall quality of the suggested day: " + suggestion.getQuality().toString());

                for (TimeSuggestion timeSuggestion : suggestion.getTimeSuggestions())
                {
                    System.out.println("  Suggested time: " + timeSuggestion.getMeetingTime().toString());
                    System.out.println("  Suggested time quality: " + timeSuggestion.getQuality().toString());
                    // Output additonal properties.
                }
            }
        }
        catch (Exception e)
        {
            int x = 3;
            //FYI FIX THIS!
        }
    }

    private JSONArray getJsonEventList(List<Appointment> events)
    {
        JSONArray jsonEvents = new JSONArray();

        SimpleQueryFactory sqf = new SimpleQueryFactory(user, container);
        SimpleQuery requests = sqf.makeQuery("study", "SurgerySchedule");
        //JSONObject bar = requests.getResults();
        List<JSONObject> requestList = JsonUtils.getListFromJSONArray(requests.getResults().getJSONArray("rows"));

        Map<String, JSONObject> queryResults = new HashMap<>();
        for (JSONObject o : requestList)
        {
            queryResults.put(o.getString("objectid"), o);
        }

        try
        {
            for (Appointment event : events)
            {
                event.load(PropertySet.FirstClassProperties);
                String objectid = event.getBody().toString();
                JSONObject surgeryInfo = queryResults.get(objectid);

                JSONObject jsonEvent = new JSONObject();
                jsonEvent.put("title", event.getSubject());
                jsonEvent.put("start", event.getStart() != null ? event.getStart() : null);
                jsonEvent.put("end", event.getEnd() != null ? event.getEnd() : null);

                //Add data for details panel on Surgery Schedule page
                JSONObject rawRowData = new JSONObject();
                if (surgeryInfo != null)
                {
                    rawRowData.put("lsid", surgeryInfo.get("lsid"));
                    rawRowData.put("taskid", surgeryInfo.get("taskid"));
                    rawRowData.put("procedure", surgeryInfo.get("procedure"));

                    rawRowData.put("age", surgeryInfo.get("age"));
                    rawRowData.put("animalid", surgeryInfo.get("animalid"));
                    rawRowData.put("date", surgeryInfo.get("date"));
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
                    jsonEvent.put("rawRowData", rawRowData);
                }

                jsonEvents.put(jsonEvent);
            }
        }
        catch (Exception e)
        {
            int x = 3;
            //FIXME WHAT?
        }
        return jsonEvents;
    }

    private String getCalendarEvents(Date startDate, Date endDate)
    {
        String eventsString = null;

        try
        {
            JSONArray jsonEvents = getJsonEventList(getAppointments(startDate, endDate));
            eventsString = jsonEvents.toString();
        }
        catch (Exception e)
        {
            int x = 3;
            //TODO fix!
        }
        return eventsString;
    }

    private List<Appointment> getAppointments(Date startDate, Date endDate) {
        List<Appointment> appts = new ArrayList<>();
        try
        {
            CalendarFolder cf = CalendarFolder.bind(service, WellKnownFolderName.Calendar);
            FindItemsResults<Appointment> findResults = cf.findAppointments(new CalendarView(startDate, endDate));
            appts = findResults.getItems();
        } catch(Exception e) {
            int x = 3;
            //FIXME fix!
        }
        return appts;
    }

    public String getCalendarEventsAsJson()
    {
        String events = "";
        try
        {
            authenticate();
            addEvents();

            Calendar cal = Calendar.getInstance();
            cal.add(Calendar.MONTH, -2);
            Date startDate = cal.getTime();
            cal.add(Calendar.MONTH, 23);
            Date endDate = cal.getTime();
            events = getCalendarEvents(startDate, endDate);
        }
        catch (Exception e)
        {
            int x = 3;
            //FIXME add error handling
        }
        return events;
    }

    static class RedirectionUrlCallback implements IAutodiscoverRedirectionUrl
    {
        public boolean autodiscoverRedirectionUrlValidationCallback(
                String redirectionUrl)
        {
            return redirectionUrl.toLowerCase().startsWith("https://");
        }
    }
}
