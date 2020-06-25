package org.labkey.wnprc_ehr.calendar;

public class SurgeryCalendarGoogle extends GoogleCalendar
{
    private static final String CALENDAR_UUID = "f5c49137-186d-41fb-9c93-9979b7f4c2ba";

    @Override
    protected String getCalendarUUID() {
        return CALENDAR_UUID;
    }
}