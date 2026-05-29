/*
 * Copyright (c) 2018-2026 Board of Regents of the University of Wisconsin System
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
