package org.labkey.wnprc_ehr.calendar;

import org.json.JSONArray;
import org.labkey.api.data.Container;
import org.labkey.api.security.User;

import java.util.Date;

public interface Calendar
{
    enum EventType {CALENDAR, ROOM}
    void setUser(User u);
    void setContainer(Container c);
    JSONArray getEventsAsJson(String calendarId, String backgroundColor, EventType eventType, Date startDate, Date endDate) throws Exception;
}