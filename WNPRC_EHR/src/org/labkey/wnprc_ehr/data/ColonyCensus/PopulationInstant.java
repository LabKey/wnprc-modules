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

import org.json.JSONObject;
import org.labkey.webutils.api.json.ConvertibleToJSON;

/**
 * Created by jon on 1/20/16.
 */
public class PopulationInstant implements ConvertibleToJSON
{
    Integer _population;
    String _date;

    public PopulationInstant(String date, Integer population) {
        _population = population;
        _date = date;
    }

    public Integer getPopulation() {
        return _population;
    }

    public String getDate() {
        return _date;
    }

    public String toString() {
        return getPopulation().toString();
    }

    @Override
    public JSONObject toJSON()
    {
        JSONObject json = new JSONObject();

        json.put("date", _date);
        json.put("population", _population);

        return json;
    }
}
