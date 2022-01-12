package org.labkey.wnprc_ehr.calendar;

import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.DbSchemaType;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.query.QueryService;
import org.labkey.api.security.User;
import org.labkey.api.util.PageFlowUtil;
import org.labkey.dbutils.api.SimplerFilter;

import java.util.HashMap;
import java.util.Map;

public class SurgeryCalendarGoogle extends GoogleCalendar
{
    private static final String CALENDAR_UUID = "f5c49137-186d-41fb-9c93-9979b7f4c2ba";
    private Map<String, String> CALENDAR_IDS;
    private Map<String, String> CALENDAR_COLORS;

    public SurgeryCalendarGoogle(User user, Container container) {
        super(user, container);
    }

    @Override
    protected String getCalendarUUID() {
        return CALENDAR_UUID;
    }

    @Override
    protected Map<String, String> getCalendarIds() {
        if (CALENDAR_IDS == null) {
            CALENDAR_IDS = new HashMap<>();
            SimplerFilter filter = new SimplerFilter("calendar_type", CompareType.EQUAL, "Google");
            DbSchema schema = DbSchema.get("wnprc", DbSchemaType.Module);
            TableInfo ti = schema.getTable("procedure_calendars");
            TableSelector ts = new TableSelector(ti, PageFlowUtil.set("calendar_id", "display_name"), filter, null);
            Map<String, Object>[] calendars = ts.getMapArray();
            for (Map<String, Object> calendar : calendars) {
                CALENDAR_IDS.put((String) calendar.get("calendar_id"), (String) calendar.get("display_name"));
            }
        }
        return CALENDAR_IDS;
    }

    @Override
    protected Map<String, String> getCalendarColors(boolean refresh) {
        if (CALENDAR_COLORS == null || refresh) {
            CALENDAR_COLORS = new HashMap<>();
            SimplerFilter filter = new SimplerFilter("calendar_type", CompareType.EQUAL, "Google");
            TableInfo ti = QueryService.get().getUserSchema(user, container, "wnprc").getTable("procedure_calendars_and_rooms");
            TableSelector ts = new TableSelector(ti, PageFlowUtil.set("calendar_id", "default_bg_color"), filter, null);
            Map<String, Object>[] calendars = ts.getMapArray();
            for (Map<String, Object> calendar : calendars) {
                CALENDAR_COLORS.put((String) calendar.get("calendar_id"), (String) calendar.get("default_bg_color"));
            }
        }
        return CALENDAR_COLORS;
    }
}