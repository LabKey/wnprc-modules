package org.labkey.wnprc_ehr.data.ColonyCensus;

import org.joda.time.LocalDate;
import org.json.JSONObject;
import org.labkey.webutils.api.json.ConvertibleToJSON;

/**
 * Created by jon on 1/20/16.
 */
public class PopulationInstant implements ConvertibleToJSON
{
    Integer _population;
    LocalDate _date;

    public PopulationInstant(LocalDate date, Integer population) {
        _population = population;
        _date = date;
    }

    public Integer getPopulation() {
        return _population;
    }

    public LocalDate getDate() {
        return _date;
    }

    public String toString() {
        return getPopulation().toString();
    }

    public JSONObject toJSON() {
        JSONObject json = new JSONObject();

        json.put("date", _date);
        json.put("population", _population);

        return json;
    }

}
