package org.labkey.wnprc_ehr.data.ColonyCensus;

import org.joda.time.DateTime;
import org.joda.time.Duration;
import org.joda.time.LocalDate;
import org.joda.time.Period;
import org.json.old.JSONObject;
import org.labkey.webutils.api.json.ConvertibleToJSON;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.TreeMap;

/**
 * Created by jon on 1/17/16.
 */
public class PopulationsOverTime implements ConvertibleToJSON {
    private DateTime _start;
    private DateTime _end;
    private ColonyCensus _colonyCensus;
    private PopulationChangeEvent.Species _species;
    private List<PopulationChangeEvent> _eventList = null;


    public PopulationsOverTime(DateTime start, DateTime end, ColonyCensus colonyCensus, PopulationChangeEvent.Species species) {
        _start = start;
        _end = end;
        _colonyCensus = colonyCensus;
        _species = species;
    }

    private List<PopulationChangeEvent> getEvents() {
        if (_eventList == null) {
            List<PopulationChangeEvent> events = _colonyCensus.getPopulationChangeEventsOverTimeInterval(_start, _end);
            List<PopulationChangeEvent> filteredEvents = new ArrayList<>();

            for (PopulationChangeEvent event : events)
            {
                if (event.getSpecies() == _species)
                {
                    filteredEvents.add(event);
                }
            }

            _eventList = filteredEvents;
            Collections.sort(_eventList);
        }

        return _eventList;
    }

    public Period getTimeRange() {
        return new Period(_start, _end);
    }

    public List<PopulationInstant> getPopulationsForTimePeriod() {
        TreeMap<LocalDate, PopulationInstant> dateMap = _colonyCensus.getPopulationOverTimeForSpecies(_species);

        List<LocalDate> dates = new ArrayList<>(dateMap.keySet());
        List<PopulationInstant> populationInstantsInRange = new ArrayList<>();

        Integer lastPopulationValue = 0;
        for( LocalDate date : dates ) {
            DateTime dateTime = date.toDateTimeAtStartOfDay();

            // If we haven't gotten to our range yet, just continue.
            if (dateTime.isBefore(_start)) {
                lastPopulationValue = dateMap.get(date).getPopulation();
                continue;
            }
            // If we've passed the start date, start the list off.
            else if (!dateTime.isBefore(_start) && (populationInstantsInRange.size() == 0)) {
                if (!dateTime.isEqual(_start)) {
                    populationInstantsInRange.add(new PopulationInstant(new LocalDate(_start), lastPopulationValue));
                }

                populationInstantsInRange.add(dateMap.get(date));
            }
            // Add on the events in the range.
            else if (dateTime.isAfter(_start) && !dateTime.isAfter(_end)) {
                populationInstantsInRange.add(dateMap.get(date));
            }
            // Finally, if we're past the end of the range, add the last event, and break out of the for loop.
            else if (dateTime.isAfter(_end)) {
                break;
            }

            lastPopulationValue = dateMap.get(date).getPopulation();
        }

        if (populationInstantsInRange.size() > 0) {
            PopulationInstant lastInstantInSet = populationInstantsInRange.get(populationInstantsInRange.size() - 1);
            if (!lastInstantInSet.getDate().equals(_end)) {
                populationInstantsInRange.add(new PopulationInstant(new LocalDate(_end), lastPopulationValue));
            }
        }

        return populationInstantsInRange;
    }

    public Float getAverage() {
        float weightedSum = 0;
        List<PopulationInstant> events = getPopulationsForTimePeriod();

        // If there's only one event, the average population is the population during that one event.
        if (events.size() == 1) {
            return (float) events.get(0).getPopulation();
        }

        Integer eventsLastIndex = events.size() - 1;

        for( PopulationInstant populationInstant: events ) {
            Integer index = events.indexOf(populationInstant);

            if (!index.equals(eventsLastIndex)) {
                PopulationInstant nextPopulation = events.get(index + 1);

                Duration durationOfPopulation = new Duration(populationInstant.getDate().toDateTimeAtStartOfDay(), nextPopulation.getDate().toDateTimeAtStartOfDay());

                weightedSum = weightedSum + (durationOfPopulation.getMillis() * populationInstant.getPopulation());
            }
        }

        Duration totalDuration = new Duration(_start, _end);

        return weightedSum / totalDuration.getMillis();
    }


    public Float getStdDeviation() {
        float weightedSum = 0;
        List<PopulationInstant> events = getPopulationsForTimePeriod();
        Integer eventsLastIndex = events.size() - 1;
        float average = getAverage();

        for( PopulationInstant populationInstant: events ) {
            Integer index = events.indexOf(populationInstant);

            if (!index.equals(eventsLastIndex)) {
                PopulationInstant nextPopulation = events.get(index + 1);

                Duration durationOfPopulation = new Duration(populationInstant.getDate().toDateTimeAtStartOfDay(), nextPopulation.getDate().toDateTimeAtStartOfDay());

                weightedSum = weightedSum + ((float) durationOfPopulation.getMillis() * (float) Math.pow(populationInstant.getPopulation() - (long) average, 2));
            }
        }

        Duration totalDuration = new Duration(_start, _end);

        Float normalizedVariance = weightedSum / (float) totalDuration.getMillis();

        return (float) Math.sqrt( normalizedVariance );
    }


    @Override
    public JSONObject toJSON() {
        JSONObject json = new JSONObject();

        List<PopulationChangeEvent> events = getEvents();
        json.put("events", events);
        json.put("populations", getPopulationsForTimePeriod());

        json.put("average", getAverage());
        json.put("stddev",  getStdDeviation());

        return json;
    }
}
