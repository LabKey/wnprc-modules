package org.labkey.wnprc_ehr.data.ColonyCensus;

import org.joda.time.DateTime;

/**
 * Created by jon on 1/17/16.
 */
public class StintAtPrimateCenter {
    private PopulationChangeEvent _start;
    private PopulationChangeEvent _end;

    public DateTime getStartDay() {
        if (_start == null) {
            return null;
        }
        return _start.getDate();
    }

    public DateTime getEndDay() {
        if (_end == null) {
            return null;
        }
        return _end.getDate();
    }

    public StintAtPrimateCenter(PopulationChangeEvent startDay, PopulationChangeEvent endDay) {
        _start = startDay;
        _end   = endDay;
    }
}
