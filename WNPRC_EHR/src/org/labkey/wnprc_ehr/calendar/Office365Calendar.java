package org.labkey.wnprc_ehr.calendar;

import microsoft.exchange.webservices.data.autodiscover.IAutodiscoverRedirectionUrl;
import microsoft.exchange.webservices.data.core.ExchangeService;
import microsoft.exchange.webservices.data.core.PropertySet;
import microsoft.exchange.webservices.data.core.enumeration.availability.AvailabilityData;
import microsoft.exchange.webservices.data.core.enumeration.misc.ExchangeVersion;
import microsoft.exchange.webservices.data.core.enumeration.misc.error.ServiceError;
import microsoft.exchange.webservices.data.core.enumeration.property.BodyType;
import microsoft.exchange.webservices.data.core.enumeration.property.LegacyFreeBusyStatus;
import microsoft.exchange.webservices.data.core.enumeration.property.WellKnownFolderName;
import microsoft.exchange.webservices.data.core.enumeration.search.FolderTraversal;
import microsoft.exchange.webservices.data.core.response.AttendeeAvailability;
import microsoft.exchange.webservices.data.core.service.folder.CalendarFolder;
import microsoft.exchange.webservices.data.core.service.folder.Folder;
import microsoft.exchange.webservices.data.core.service.item.Appointment;
import microsoft.exchange.webservices.data.core.service.schema.FolderSchema;
import microsoft.exchange.webservices.data.credential.ExchangeCredentials;
import microsoft.exchange.webservices.data.credential.WebCredentials;
import microsoft.exchange.webservices.data.misc.availability.AttendeeInfo;
import microsoft.exchange.webservices.data.misc.availability.GetUserAvailabilityResults;
import microsoft.exchange.webservices.data.misc.availability.TimeWindow;
import microsoft.exchange.webservices.data.property.complex.FolderId;
import microsoft.exchange.webservices.data.property.complex.ItemId;
import microsoft.exchange.webservices.data.property.complex.MessageBody;
import microsoft.exchange.webservices.data.property.complex.StringList;
import microsoft.exchange.webservices.data.property.complex.availability.CalendarEvent;
import microsoft.exchange.webservices.data.search.CalendarView;
import microsoft.exchange.webservices.data.search.FindFoldersResults;
import microsoft.exchange.webservices.data.search.FindItemsResults;
import microsoft.exchange.webservices.data.search.FolderView;
import microsoft.exchange.webservices.data.search.filter.SearchFilter;
import org.json.JSONArray;
import org.json.JSONObject;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.DbSchemaType;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.query.FolderSchemaProvider;
import org.labkey.api.security.User;
import org.labkey.dbutils.api.SimpleQuery;
import org.labkey.dbutils.api.SimpleQueryFactory;
import org.labkey.dbutils.api.SimplerFilter;
import org.labkey.webutils.api.json.JsonUtils;
import org.labkey.wnprc_ehr.encryption.AES;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Office365Calendar implements org.labkey.wnprc_ehr.calendar.Calendar
{
    public ExchangeService service = new ExchangeService(ExchangeVersion.Exchange2010_SP2);
    public static final DateFormat df = new SimpleDateFormat("yyyy-MM-dd HH:mm");
    private User user;
    private Container container;
    private String eventDefaultBgColor = "#90EE90"; //lightblue
    private String eventSelectedBgColor = "#50FF50"; //slightly darker
    private String heldEventDeafultBgColor = "#F0B0B0";
    private String heldEventSelectedBgColor = "#F0D0D0";

    public void setUser(User u)
    {
        user = u;
    }

    public void setContainer(Container c)
    {
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

    public String getHeldEventDeafultBgColor() {
        return heldEventDeafultBgColor;
    }

    public void setHeldEventDeafultBgColor(String color) {
        heldEventDeafultBgColor = color;
    }

    public String getHeldEventSelectedBgColor() {
        return heldEventSelectedBgColor;
    }

    public void setHeldEventSelectedBgColor(String color) {
        heldEventSelectedBgColor = color;
    }

    public void authenticate()
    {
        String emailAddress = null;
        try
        {
            SimplerFilter filter = new SimplerFilter("id", CompareType.EQUAL, "0ddbf045-1cfc-4cc5-8571-4028a92a5011");
            DbSchema schema = DbSchema.get("googledrive", DbSchemaType.Module);
            TableInfo ti = schema.getTable("service_accounts");
            TableSelector ts = new TableSelector(ti, filter, null);
            Map map = ts.getMap();
            emailAddress = (String) map.get("private_key_id");

            byte[] passwordBytes = AES.base64StringToByteArray((String) map.get("private_key"));
            byte[] keyBytes = AES.hexStringToByteArray(new String(Files.readAllBytes(Paths.get(System.getProperty("surgeries_key.file"))), StandardCharsets.UTF_8));
            byte[] ivBytes = AES.hexStringToByteArray(new String(Files.readAllBytes(Paths.get(System.getProperty("surgeries_iv.file"))), StandardCharsets.UTF_8));

            byte[] decrypted = AES.decrypt(passwordBytes, keyBytes, ivBytes);

            ExchangeCredentials credentials = new WebCredentials(emailAddress, new String(decrypted, StandardCharsets.UTF_8));
            service.setCredentials(credentials);
            URI uri = new URI("https://outlook.office365.com/EWS/Exchange.asmx");
            service.setUrl(uri);
            //service.autodiscoverUrl(emailAddress, new RedirectionUrlCallback());
        }
        catch (Exception e)
        {
            int x = 3;
        }
    }

    public boolean isRoomAvailable(String roomEmailAddress, Date start, Date end)
    {
        boolean isAvailable = true;
        try
        {
            // Create a list of attendees for which to request availability
            // information and meeting time suggestions.

            List<AttendeeInfo> attendees = new ArrayList<>();
            attendees.add(new AttendeeInfo(roomEmailAddress));

            TimeWindow surgeryTimeWindow = new TimeWindow(start, end);
            Calendar cal = Calendar.getInstance();
            cal.setTime(start);
            cal.set(Calendar.HOUR_OF_DAY, 0);
            cal.set(Calendar.MINUTE, 0);
            cal.set(Calendar.SECOND, 0);
            cal.set(Calendar.MILLISECOND, 0);
            Date d1 = new Date(cal.getTimeInMillis());
            cal.setTime(end);
            cal.set(Calendar.HOUR_OF_DAY, 23);
            cal.set(Calendar.MINUTE, 59);
            cal.set(Calendar.SECOND, 59);
            cal.set(Calendar.MILLISECOND, 999);
            Date d2 = new Date(cal.getTimeInMillis());

            // Call the availability service.
            GetUserAvailabilityResults results = service.getUserAvailability(
                    attendees,
                    new TimeWindow(d1, d2),
                    AvailabilityData.FreeBusy);

            for (AttendeeAvailability attendeeAvailability : results.getAttendeesAvailability())
            {
                if (attendeeAvailability.getErrorCode() == ServiceError.NoError)
                {
                    for (CalendarEvent calendarEvent : attendeeAvailability.getCalendarEvents())
                    {
                        TimeWindow eventTimeWindow = new TimeWindow(calendarEvent.getStartTime(), calendarEvent.getEndTime());
                        calendarEvent.getFreeBusyStatus();
                        if (isOverlapping(surgeryTimeWindow, eventTimeWindow) && isBusy(calendarEvent))
                        {
                            isAvailable = false;
                            break;
                        }
                    }
                }
                else
                {
                    isAvailable = false;
                }
            }
        }
        catch (Exception e)
        {
            int x = 3;
            //TODO fix this!
        }
        return isAvailable;
    }

    private boolean isOverlapping(TimeWindow t1, TimeWindow t2)
    {
        return t1.getStartTime().before(t2.getEndTime()) && t2.getStartTime().before(t1.getEndTime());
    }

    private boolean isBusy(CalendarEvent calendarEvent)
    {
        LegacyFreeBusyStatus status = calendarEvent.getFreeBusyStatus();
        boolean cancelled = calendarEvent.getDetails().getSubject().startsWith("Canceled:");
        return status != LegacyFreeBusyStatus.Free || !cancelled;
    }

    public String addEvent(Date start, Date end, String room, String subject, String requestId, List categories, boolean hold)
    {
        String apptId = null;
        try
        {
            SimplerFilter filter = new SimplerFilter("room", CompareType.EQUAL, room);
            DbSchema schema = DbSchema.get("wnprc", DbSchemaType.Module);
            TableInfo ti = schema.getTable("surgery_procedure_rooms");
            TableSelector ts = new TableSelector(ti, filter, null);
            Map map = ts.getMap();
            String roomEmailAddress = (String) map.get("email");
            if (isRoomAvailable(roomEmailAddress, start, end))
            {
                Appointment appt = new Appointment(service);
                appt.setStart(start);
                appt.setEnd(end);
                appt.setSubject(subject);
                if (hold) {
                    appt.setBody(new MessageBody(BodyType.Text, "Hold:" + requestId));
                } else {
                    appt.setBody(new MessageBody(BodyType.Text, requestId));
                }
                appt.setCategories(new StringList(categories));
                appt.getRequiredAttendees().add(roomEmailAddress);
                appt.save();
                apptId = appt.getId().getUniqueId();
            }
        }
        catch (Exception e)
        {
            int x = 3;
            //TODO DO NOTHING
        }
        return apptId;
    }

    public boolean confirmEvent(String apptId, String requestId) {
        boolean updated = false;
        try
        {
            Appointment appt = Appointment.bind(service, new ItemId(apptId));
            appt.setBody(new MessageBody(BodyType.Text, requestId));
            updated = true;
        }
        catch (Exception e)
        {
            int x = 3;
            //TODO error handling
        }
        return updated;
    }

    public void cancelEvent(String apptId) throws Exception
    {
        Appointment appt = Appointment.bind(service, new ItemId(apptId));
        appt.cancelMeeting();
    }

    private JSONArray getJsonEventList(List<Appointment> events)
    {
        JSONArray jsonEvents = new JSONArray();

        SimpleQueryFactory sqf = new SimpleQueryFactory(user, container);
        SimpleQuery requests = sqf.makeQuery("study", "SurgeryProcedureSchedule");
        //JSONObject bar = requests.getResults();
        List<JSONObject> requestList = JsonUtils.getListFromJSONArray(requests.getResults().getJSONArray("rows"));

        Map<String, JSONObject> queryResults = new HashMap<>();
        for (JSONObject o : requestList)
        {
            queryResults.put(o.getString("requestid"), o);
        }

        try
        {
            for (Appointment event : events)
            {
                boolean hold = false;
                event.load(PropertySet.FirstClassProperties);
                String requestId = event.getBody().toString();
                if(requestId != null && requestId.startsWith("Hold")) {
                    requestId = requestId.substring(5);
                    hold = true;
                }
                JSONObject surgeryInfo = queryResults.get(requestId);

                JSONObject jsonEvent = new JSONObject();
                jsonEvent.put("title", event.getSubject());
                jsonEvent.put("start", df.format(event.getStart()));
                jsonEvent.put("end", df.format(event.getEnd()));
                jsonEvent.put("defaultBgColor", hold ? getHeldEventDeafultBgColor() : getEventDefaultBgColor());
                jsonEvent.put("selectedBgColor", hold ? getHeldEventSelectedBgColor() : getEventSelectedBgColor());

                //Add data for details panel on Surgery Schedule page
                JSONObject rawRowData = new JSONObject();
                if (surgeryInfo != null)
                {
                    rawRowData.put("lsid", surgeryInfo.get("lsid"));
                    rawRowData.put("taskid", surgeryInfo.get("taskid"));
                    rawRowData.put("objectid", surgeryInfo.get("objectid"));
                    rawRowData.put("requestid", surgeryInfo.get("requestid"));
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
                    rawRowData.put("enddate", surgeryInfo.get("enddate"));
                    rawRowData.put("comments", surgeryInfo.get("comments"));
                    rawRowData.put("hold", hold);
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

    private String getCalendarEvents(Date startDate, Date endDate, String calendarName)
    {
        String eventsString = null;

        try
        {
            JSONArray jsonEvents = getJsonEventList(getAppointments(startDate, endDate, calendarName));
            eventsString = jsonEvents.toString();
        }
        catch (Exception e)
        {
            int x = 3;
            //TODO fix!
        }
        return eventsString;
    }

    private List<Appointment> getAppointments(Date startDate, Date endDate, String calendarName) throws Exception
    {
        List<Appointment> appts = new ArrayList<>();
        FolderView folderView = new FolderView(1);
        folderView.setTraversal(FolderTraversal.Shallow);
        SearchFilter searchFilter = new SearchFilter.IsEqualTo(FolderSchema.DisplayName, calendarName);
        FolderId rootFolder = new FolderId(WellKnownFolderName.Calendar);
        FindFoldersResults folderSearchResults = service.findFolders(rootFolder, searchFilter, folderView);
        ArrayList<Folder> folders = folderSearchResults.getFolders();
        if (folders.size() == 1) {
            FolderId folderId = folders.get(0).getId();
            CalendarFolder cf = CalendarFolder.bind(service, folderId);
            FindItemsResults<Appointment> findResults = cf.findAppointments(new CalendarView(startDate, endDate));
            appts = findResults.getItems();
        }
        else {
            //TODO throw exception??
        }
        return appts;
    }

    public String getCalendarEventsAsJson(String calendarName)
    {
        String events = "";
        try
        {
            authenticate();
            Calendar cal = Calendar.getInstance();
            cal.add(Calendar.MONTH, -2);
            Date startDate = cal.getTime();
            cal.add(Calendar.MONTH, 23);
            Date endDate = cal.getTime();
            events = getCalendarEvents(startDate, endDate, calendarName);
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