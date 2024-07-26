package org.labkey.wnprc_ehr.notification;
import org.labkey.api.collections.CaseInsensitiveHashMap;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.ConvertHelper;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.module.Module;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.security.User;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Author: Daniel Nicolalde
 * Date: 2021-07-28
 */
public class WaterOrdersAlertNotification extends WaterMonitoringNotification
{
    public WaterOrdersAlertNotification(Module owner){
        super(owner);
    }
    public String getName(){return "WNPRC Waters Orders Not Completed (ACT)";}

    public String getDescription(){
        return  "Send notification of any eater order not completed by the corresponding frequency.";
    }

    @Override
    public String getEmailSubject(Container c)
    {
        return "Daily Water Alerts: " + _dateTimeFormat.format(new Date());
    }

    @Override
    public String getCronString()
    {
        return "0 0 10,13,15,17,19 * * ?";
    }

    public String getScheduleDescription()
    {
        return "daily at 1000, 1300, 1500, 1700, 1900";
    }

    @Override
    public String getMessageBodyHTML(Container c, User u)
    {
        StringBuilder msg = new StringBuilder();
        int numDays = 1;

        final Date now = new Date();

        msg.append("This email contains any water orders not marked as completed.  It was run on: " + _dateFormat.format(now) + " at " + _timeFormat.format(now) + ".<p>");
        //Check animals that did not get any water for today and the last five days.
        findAnimalsWithWaterEntries(c,u,msg,numDays);
        findWaterOrdersNotCompleted(c,u,msg,LocalDateTime.now(), false);
        findWaterOrdersNotCompleted(c,u,msg,LocalDateTime.now(), true);

        return msg.toString();

    }
}
