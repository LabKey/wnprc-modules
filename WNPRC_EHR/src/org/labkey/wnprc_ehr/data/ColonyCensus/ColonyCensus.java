package org.labkey.wnprc_ehr.data.ColonyCensus;

import org.joda.time.DateTime;
import org.joda.time.LocalDate;
import org.labkey.api.data.Container;
import org.labkey.api.data.Results;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryHelper;
import org.labkey.api.security.User;
import org.labkey.api.util.ResultSetUtil;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;

/**
 * Created by jon on 1/17/16.
 */
public class ColonyCensus {
    private List<PopulationChangeEvent> populationChangeEvents = new ArrayList<>();
    Map<String, AnimalEventSet> animalEventSetsById = new HashMap<>();
    Map<PopulationChangeEvent.Species, Set<String>> animalsBySpeciesId = new HashMap<>();

    public ColonyCensus(Container container, User user) {
        QueryHelper query = new QueryHelper(container, user, "study", "Population Change Events By Animal Id");

        Map<String, PopulationChangeEvent.Species> speciesMap = new HashMap<>();
        Map<String, List<PopulationChangeEvent>> populationChangeEventsById = new HashMap<>();

        Results rs = null;

        try {
            // Define columns to get
            List<FieldKey> columns = new ArrayList<FieldKey>();
            columns.add(FieldKey.fromString("Id"));
            columns.add(FieldKey.fromString("date"));
            columns.add(FieldKey.fromString("type"));
            columns.add(FieldKey.fromString("species"));
            columns.add(FieldKey.fromString("dateWithTime"));
            columns.add(FieldKey.fromString("description"));

            rs = query.select(columns, new SimpleFilter());

            if (rs.next()) {
                do {
                    String id      = rs.getString(FieldKey.fromString("Id"));
                    Date date      = rs.getDate(FieldKey.fromString("date"));
                    Date timestamp = rs.getTimestamp(FieldKey.fromString("dateWithTime"));
                    String type    = rs.getString(FieldKey.fromString("type"));
                    String species = rs.getString(FieldKey.fromString("species"));
                    String description = rs.getString(FieldKey.fromString("description"));

                    PopulationChangeEvent event = PopulationChangeEvent.newEvent(id, date, timestamp, type, species, description);

                    if (event != null) {
                        // Add to the list of events
                        populationChangeEvents.add(event);

                        // Add to the map of animal events
                        List<PopulationChangeEvent> eventsForAnimal = populationChangeEventsById.get(id);
                        if (eventsForAnimal == null) {
                            eventsForAnimal = new ArrayList<>();
                            populationChangeEventsById.put(id, eventsForAnimal);
                        }
                        eventsForAnimal.add(event);

                        // Add to the species lookup.
                        speciesMap.put(id, event.getSpecies());

                        // Ensure we have a set of animal ids for each species.
                        Set<String> idsForSpecies = animalsBySpeciesId.get(event.getSpecies());
                        if (idsForSpecies == null) {
                            idsForSpecies = new HashSet<>();
                            animalsBySpeciesId.put(event.getSpecies(), idsForSpecies);
                        }
                        idsForSpecies.add(id);
                    }
                } while (rs.next());
            }
        }
        catch(SQLException e) {}
        finally {
            ResultSetUtil.close(rs);
        }

        // Now, build a map of animalids -> animaleventsets
        for(String id : populationChangeEventsById.keySet()) {
            AnimalEventSet animalEventSet = new AnimalEventSet(id, speciesMap.get(id), populationChangeEventsById.get(id));

            // Put the event set in the map for later access
            animalEventSetsById.put(id, animalEventSet);
        }
    }

    public List<PopulationChangeEvent> getPopulationChangeEventsOverTimeInterval(DateTime startDate, DateTime endDate) {
        List<PopulationChangeEvent> eventsInRange = new ArrayList<>();

        // If the start date null, grab the earliest possible time.
        if (startDate == null) {
            startDate = new DateTime().year().withMinimumValue();
        }

        // If the end date is null, consider today
        if (endDate == null) {
            endDate = new DateTime();
        }


        for( String id : animalEventSetsById.keySet() ) {
            AnimalEventSet animalEventSet = animalEventSetsById.get(id);

            for( PopulationChangeEvent event : animalEventSet.getCleanedUpEvents() ) {
                DateTime eventDate = event.getDate();

                if (!eventDate.isBefore(startDate) && !eventDate.isAfter(endDate) ) {
                    eventsInRange.add(event);
                }
            }
        }

        Collections.sort(eventsInRange);

        return eventsInRange;
    }

    public TreeMap<LocalDate, PopulationInstant> getPopulationOverTimeForSpecies(PopulationChangeEvent.Species species) {
        Map<LocalDate, Integer> deltasPerDate = new HashMap<>();
        Integer animalsAtStart = 0;

        for( String id : animalsBySpeciesId.get(species)) {
            AnimalEventSet animalEventSet = animalEventSetsById.get(id);
            for( StintAtPrimateCenter stint: animalEventSet.getStints() ) {
                // Null startdate is okay...
                LocalDate startDate = (stint.getStartDay() == null) ? null : new LocalDate(stint.getStartDay());
                LocalDate endDate   = ( stint.getEndDay()  == null) ? null : new LocalDate(stint.getEndDay());


                // Increment the counter for start of stints, if there was a start
                if (startDate != null) {
                    Integer currentStartDelta = deltasPerDate.get(startDate);
                    if (currentStartDelta == null) {
                        currentStartDelta = 0;
                    }
                    deltasPerDate.put(startDate, currentStartDelta + 1);
                }
                else {
                    // If there wasn't a start, assume the animal was always in the colony
                    animalsAtStart++;
                }

                // Decrement the counter for end of stints, if there was an end
                if ( endDate != null) {
                    Integer currentEndDelta = deltasPerDate.get(endDate);
                    if ( currentEndDelta == null ) {
                        currentEndDelta = 0;
                    }
                    deltasPerDate.put(endDate, currentEndDelta - 1);
                }

            }
        }

        Integer rollingTotal = animalsAtStart;
        TreeMap<LocalDate, PopulationInstant> populationPerDate = new TreeMap<>();
        List<LocalDate> datesInOrder = new ArrayList<>(deltasPerDate.keySet());
        Collections.sort(datesInOrder);
        for(LocalDate date: datesInOrder) {
            rollingTotal = rollingTotal + deltasPerDate.get(date);
            populationPerDate.put(date, new PopulationInstant(date.toString(), rollingTotal));
        }

        return populationPerDate;
    }

    public Map<String, PopulationInstant> getPopulationPerMonthForSpecies(PopulationChangeEvent.Species species) {
        TreeMap<LocalDate, PopulationInstant> populationPerDay = getPopulationOverTimeForSpecies(species);
        Map<String, PopulationInstant> populationPerMonth = new HashMap<>();

        for( LocalDate date : populationPerDay.descendingKeySet()) {
            // Map each date to the last of the month.
            String monthOnly = new LocalDate(date.getYear(), date.getMonthOfYear(), date.dayOfMonth().getMaximumValue()).toString();

            // Grab count so far or initialize at zero.
            PopulationInstant populationForMonth = populationPerMonth.get(monthOnly);
            // Initialize the month, if we haven't already.
            if (populationForMonth == null) {
                populationForMonth = new PopulationInstant(monthOnly, populationPerDay.get(date).getPopulation());
                populationPerMonth.put(monthOnly, populationForMonth);
            }
        }

        return populationPerMonth;
    }

    public Map<String, Map<String, PopulationInstant>> getPopulationsPerMonthForAllSpecies() {
        Map<String, Map<String, PopulationInstant>> populations = new HashMap<>();

        for(PopulationChangeEvent.Species species : PopulationChangeEvent.Species.values()) {
            Map<String, PopulationInstant> populationInstantMap = getPopulationPerMonthForSpecies(species);
            populations.put( species.toString(), populationInstantMap );
        }

        return populations;
    }
}
