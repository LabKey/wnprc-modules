/*
 * Copyright (c) 2013 LabKey Corporation
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
package org.labkey.ehr.table;

import org.apache.commons.lang3.time.DateUtils;
import org.apache.commons.lang3.time.DurationFormatUtils;
import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.DataColumn;
import org.labkey.api.data.RenderContext;
import org.labkey.api.query.FieldKey;

import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.Set;

/**
 * User: bimber
 * Date: 10/23/13
 * Time: 3:49 PM
 */
public class AgeDisplayColumn extends DataColumn
{
    public AgeDisplayColumn(ColumnInfo col)
    {
        super(col);
    }

    @Override
    public Class getDisplayValueClass()
    {
        //NOTE: this is required in order to get excel to output correctly
        //the raw value is numeric, but the displayValue is text
        return String.class;
    }

    @Override
    public Object getDisplayValue(RenderContext ctx)
    {
        return getFormattedAge((Date)ctx.get(getMappedFieldKey("birth")), (Date)ctx.get(getMappedFieldKey("death")));
    }

    @Override @NotNull
    public String getFormattedValue(RenderContext ctx)
    {
        Object val = getDisplayValue(ctx);
        return val == null ? "" : val.toString();
    }

    @Override
    public void addQueryFieldKeys(Set<FieldKey> keys)
    {
        super.addQueryFieldKeys(keys);

        keys.add(getMappedFieldKey("birth"));
        keys.add(getMappedFieldKey("death"));
    }

    private FieldKey getMappedFieldKey(String colName)
    {
        return new FieldKey(getBoundColumn().getFieldKey().getParent(), colName);
    }

    public static String getFormattedAge(Date birth, Date death)
    {
        if (birth == null)
            return null;

        Calendar birthCal = new GregorianCalendar();
        birthCal.setTime(birth);
        birthCal = DateUtils.truncate(birthCal, Calendar.DATE);

        Calendar deathCal = new GregorianCalendar();
        deathCal.setTime(death == null ? new Date() : death);
        deathCal = DateUtils.truncate(deathCal, Calendar.DATE);

        double yearPart = (deathCal.getTimeInMillis() - birthCal.getTimeInMillis()) / (DateUtils.MILLIS_PER_DAY * 365.25);
        int yearRounded = (int)yearPart;
        birthCal.set(Calendar.YEAR, birthCal.get(Calendar.YEAR) + yearRounded);
        int dayPart = (int)((deathCal.getTimeInMillis() - birthCal.getTimeInMillis()) / DateUtils.MILLIS_PER_DAY);

        //NOTE: it would be really nice to use a helper like the following; however, there seems to be a bug that causes year to be off by 1 in some cases
        //return DurationFormatUtils.formatPeriod(birthCal.getTimeInMillis(), deathCal.getTimeInMillis(), "y 'years, ' d 'days'");

        return yearRounded + " year" + (yearRounded == 1 ? "" : "s") + ", " + dayPart + " day" + (dayPart == 1 ? "" : "s");
    }
}
