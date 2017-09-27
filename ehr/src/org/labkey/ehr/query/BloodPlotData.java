/*
 * Copyright (c) 2016 LabKey Corporation
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
package org.labkey.ehr.query;

import org.json.JSONObject;
import java.util.Date;

/**
 * Created by Marty on 4/13/2016.
 */
public class BloodPlotData
{
    private String _id;
    private Date _date;
    private Double _quantity;
    private String _species;
    private Double _max_draw_pct;
    private int _blood_draw_interval;
    private Double _blood_per_kg;
    private Double _mostRecentWeight;
    private Date _mostRecentWeightDate;
    private Date _death;
    private Double _maxAllowableBlood;
    private Double _bloodPrevious;
    private Double _allowablePrevious;
    private Double _bloodFuture;
    private Double _allowableFuture;
    private Double _allowableBlood;
    private Date _minDate;
    private Date _maxDate;

    public String getId()
    {
        return _id;
    }

    public void setId(String id)
    {
        _id = id;
    }

    public Date getDate()
    {
        return _date;
    }

    public void setDate(Date date)
    {
        _date = date;
    }

    public Double getQuantity()
    {
        return _quantity;
    }

    public void setQuantity(Double quantity)
    {
        _quantity = quantity;
    }

    public String getSpecies()
    {
        return _species;
    }

    public void setSpecies(String species)
    {
        _species = species;
    }

    public Double getMax_draw_pct()
    {
        return _max_draw_pct;
    }

    public void setMax_draw_pct(Double max_draw_pct)
    {
        _max_draw_pct = max_draw_pct;
    }

    public int getBlood_draw_interval()
    {
        return _blood_draw_interval;
    }

    public void setBlood_draw_interval(int blood_draw_interval)
    {
        _blood_draw_interval = blood_draw_interval;
    }

    public Double getBlood_per_kg()
    {
        return _blood_per_kg;
    }

    public void setBlood_per_kg(Double blood_per_kg)
    {
        _blood_per_kg = blood_per_kg;
    }

    public Double getMostRecentWeight()
    {
        return _mostRecentWeight;
    }

    public void setMostRecentWeight(Double mostRecentWeight)
    {
        _mostRecentWeight = mostRecentWeight;
    }

    public Date getMostRecentWeightDate()
    {
        return _mostRecentWeightDate;
    }

    public void setMostRecentWeightDate(Date mostRecentWeightDate)
    {
        _mostRecentWeightDate = mostRecentWeightDate;
    }

    public Date getDeath()
    {
        return _death;
    }

    public void setDeath(Date death)
    {
        _death = death;
    }

    public Double getMaxAllowableBlood()
    {
        return _maxAllowableBlood;
    }

    public void setMaxAllowableBlood(Double maxAllowableBlood)
    {
        _maxAllowableBlood = maxAllowableBlood;
    }

    public Double getBloodPrevious()
    {
        return _bloodPrevious;
    }

    public void setBloodPrevious(Double bloodPrevious)
    {
        _bloodPrevious = bloodPrevious;
    }

    public Double getAllowablePrevious()
    {
        return _allowablePrevious;
    }

    public void setAllowablePrevious(Double allowablePrevious)
    {
        _allowablePrevious = allowablePrevious;
    }

    public Double getBloodFuture()
    {
        return _bloodFuture;
    }

    public void setBloodFuture(Double bloodFuture)
    {
        _bloodFuture = bloodFuture;
    }

    public Double getAllowableFuture()
    {
        return _allowableFuture;
    }

    public void setAllowableFuture(Double allowableFuture)
    {
        _allowableFuture = allowableFuture;
    }

    public Double getAllowableBlood()
    {
        return _allowableBlood;
    }

    public void setAllowableBlood(Double allowableBlood)
    {
        _allowableBlood = allowableBlood;
    }

    public Date getMinDate()
    {
        return _minDate;
    }

    public void setMinDate(Date minDate)
    {
        _minDate = minDate;
    }

    public Date getMaxDate()
    {
        return _maxDate;
    }

    public void setMaxDate(Date maxDate)
    {
        _maxDate = maxDate;
    }

    public JSONObject toJSON()
    {
        JSONObject json = new JSONObject();

        json.put("id", new JSONObject().put("value", getId()));
        json.put("date", new JSONObject().put("value", getDate()));
        json.put("quantity", new JSONObject().put("value", getQuantity()));
        json.put("species", new JSONObject().put("value", getSpecies()));
        json.put("max_draw_pct", new JSONObject().put("value", getMax_draw_pct()));
        json.put("blood_draw_interval", new JSONObject().put("value", getBlood_draw_interval()));
        json.put("blood_per_kg", new JSONObject().put("value", getBlood_per_kg()));
        json.put("mostRecentWeight", new JSONObject().put("value", getMostRecentWeight()));
        json.put("mostRecentWeightDate", new JSONObject().put("value", getMostRecentWeightDate()));
        json.put("death", new JSONObject().put("value", getDeath()));
        json.put("maxAllowableBlood", new JSONObject().put("value", getMaxAllowableBlood()));
        json.put("bloodPrevious", new JSONObject().put("value", getBloodPrevious()));
        json.put("allowablePrevious", new JSONObject().put("value", getAllowablePrevious()));
        json.put("bloodFuture", new JSONObject().put("value", getBloodFuture()));
        json.put("allowableFuture", new JSONObject().put("value", getAllowableFuture()));
        json.put("allowableBlood", new JSONObject().put("value", getAllowableBlood()));
        json.put("minDate", new JSONObject().put("value", getMinDate()));
        json.put("maxDate", new JSONObject().put("value", getMaxDate()));

        return json;
    }
}
