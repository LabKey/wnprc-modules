package org.labkey.wnprc_ehr.calendar;

import org.labkey.api.data.Container;
import org.labkey.api.security.User;

public interface Calendar
{
    enum EventType {CALENDAR, ROOM}
    void setUser(User u);
    void setContainer(Container c);
    String getEventsAsJson(String calendarId, String backgroundColor, EventType eventType) throws Exception;
}