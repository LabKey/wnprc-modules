package org.labkey.wnprc_ehr.calendar;

import org.json.JSONObject;

import java.time.LocalDate;

public interface Calendar
{
    JSONObject getEventsAsJson(LocalDate startDate, LocalDate endDate) throws Exception;
}