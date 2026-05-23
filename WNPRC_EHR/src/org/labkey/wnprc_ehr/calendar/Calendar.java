/*
 * Copyright (c) 2021-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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