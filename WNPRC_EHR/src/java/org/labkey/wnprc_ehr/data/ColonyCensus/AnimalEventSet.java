package org.labkey.wnprc_ehr.data.ColonyCensus;

import org.joda.time.DateTimeComparator;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * Created by jon on 1/17/16.
 */
public class AnimalEventSet {
    private String _id;
    private PopulationChangeEvent.Species _species;
    private EventList _cleanedUpEvents;

    public enum Status {
        Alive, Dead, Shipped
    }

    public AnimalEventSet(String id, PopulationChangeEvent.Species species, List<PopulationChangeEvent> events) {
        _id = id;
        _species = species;

        _cleanedUpEvents = new EventList(events);
    }

    public List<StintAtPrimateCenter> getStints() {
        return  _cleanedUpEvents.getStints();
    }

    public Status getStatus() {
        return _cleanedUpEvents.getStatus();
    }

    public List<PopulationChangeEvent> getCleanedUpEvents() {
        return _cleanedUpEvents.getEvents();
    }

    public class EventList {
        List<PopulationChangeEvent> _events;

        public EventList(List<PopulationChangeEvent> events) {
            _events = events;

            Collections.sort(_events);
            this.fix();
            this.trim();
        }

        public List<PopulationChangeEvent> getEvents() {
            return _events;
        }

        private PopulationChangeEvent[] getListAsArray() {
            return _events.toArray(new PopulationChangeEvent[_events.size()]);
        }

        private PopulationChangeEvent[] getFirstTwoEvents() {
            if (getListAsArray().length < 2) {
                return null;
            }

            return Arrays.copyOfRange(getListAsArray(), 0, 2);
        }

        private PopulationChangeEvent[] getLastTwoEvents() {
            if (getListAsArray().length < 2) {
                return null;
            }

            int lastIndex = getListAsArray().length - 1;
            return Arrays.copyOfRange(getListAsArray(), lastIndex - 1 , lastIndex + 1);
        }

        private void fix() {
            while(innerFix()) {
                // innerFix will return false when it couldn't find anything to fix.
            }
        }

        private boolean innerFix() {
            for (PopulationChangeEvent event : getListAsArray()) {
                int index = _events.indexOf(event);
                int nextIndex = index + 1;
                int lastIndex = _events.size() - 1;

                if (nextIndex <= lastIndex) {
                    PopulationChangeEvent thisEvent = _events.get(index);
                    PopulationChangeEvent nextEvent = _events.get(nextIndex);

                    // Check to make sure both are the same day.
                    if (DateTimeComparator.getDateOnlyInstance().compare(thisEvent.getDate(), nextEvent.getDate()) == 0) {
                        // Check for two arrivals on the same day.
                        if (thisEvent.getType().isArrival() && nextEvent.getType().isArrival()) {
                            _events.remove(thisEvent);
                            return true;
                        }

                        // Check for two departures in a row on the same day.
                        if (thisEvent.getType().isDeparture() && nextEvent.getType().isDeparture()) {
                            _events.remove(thisEvent);
                            return true;
                        }

                        // Check for a same day arrival and birth, and remove the birth.
                        if (thisEvent.getType().isArrival() && nextEvent.getType().isBirth()) {
                            _events.remove(nextEvent);
                            return true;
                        }
                        else if (thisEvent.getType().isBirth() && nextEvent.getType().isArrival()) {
                            _events.remove(thisEvent);
                            return true;
                        }

                        // Check for DOA, where the death was before the arrival, and mark the death as after arrival.
                        if (thisEvent.getType().isDeath() && nextEvent.getType().isArrival()) {
                            _events.set(index, nextEvent);
                            _events.set(nextIndex, thisEvent);
                            return true;
                        }

                        // Ensure that same day birth/deaths are in that order.
                        if (thisEvent.getType().isDeath() && nextEvent.getType().isBirth()) {
                            _events.set(index, nextEvent);
                            _events.set(nextIndex, thisEvent);
                            return true;
                        }

                        // If the animal departed before being born, reverse the events
                        if (thisEvent.getType().isDeparture() && nextEvent.getType().isBirth()) {
                            _events.set(index, nextEvent);
                            _events.set(nextIndex, thisEvent);
                            return true;
                        }
                    }
                }
            }

            return false;
        }

        private void trim() {
            // Animal has two births
            if ( matchFirstEvents(PopulationChangeEvent.EventType.Birth,   PopulationChangeEvent.EventType.Birth    ) ) {
                if ("[calculated from demographics dataset]".equals(_events.get(0).getDescription())) {
                    _events.remove(0);
                }
                else {
                    _events.remove(1);
                }
            }

            // Animal has two first arrivals
            if( matchFirstEvents(PopulationChangeEvent.EventType.Arrival,  PopulationChangeEvent.EventType.Arrival  ) ) { _events.remove(1); }

            // If the animal was born before it arrived, the birth is irrelevant.
            if( matchFirstEvents(PopulationChangeEvent.EventType.Birth,    PopulationChangeEvent.EventType.Arrival  ) ) { _events.remove(0); }

            // If the animal had two first arrivals, only count the first one.
            if( matchFirstEvents(PopulationChangeEvent.EventType.Arrival,  PopulationChangeEvent.EventType.Arrival  ) ) { _events.remove(1); }

            // If the death occurred after departing, don't count it.
            if( matchLastEvents(PopulationChangeEvent.EventType.Departure, PopulationChangeEvent.EventType.Death    ) ) { _events.remove(_events.size() - 1); }

            // If the animal has multiple departures, only count the first one.
            if (matchLastEvents(PopulationChangeEvent.EventType.Departure, PopulationChangeEvent.EventType.Departure) ) { _events.remove(_events.size() - 1); }
        }

        private boolean matchLastEvents (PopulationChangeEvent.EventType firstType, PopulationChangeEvent.EventType secondType) {
            return matchEventPair(getLastTwoEvents(), firstType, secondType);
        }

        private boolean matchFirstEvents(PopulationChangeEvent.EventType firstType, PopulationChangeEvent.EventType secondType) {
            return matchEventPair(getFirstTwoEvents(), firstType, secondType);
        }

        private boolean matchEventPair(PopulationChangeEvent[] eventPair, PopulationChangeEvent.EventType firstType, PopulationChangeEvent.EventType secondType) {
            // The pair can't match if it isn't of enough length to be a pair.
            if ( (eventPair == null) || (eventPair.length != 2) || (eventPair[0] == null) || (eventPair[1] == null) ) {
                return false;
            }

            return (eventPair[0].getType() == firstType) && (eventPair[1].getType() == secondType);
        }

        public Status getStatus() {
            PopulationChangeEvent.EventType lastEventType = _events.get(_events.size() - 1).getType();

            if (lastEventType.isDeath()) {
                return Status.Dead;
            }
            else if (lastEventType.isDeparture()) {
                return Status.Shipped;
            }
            else {
                return Status.Alive;
            }
        }

        public List<StintAtPrimateCenter> getStints() {
            ArrayList<StintAtPrimateCenter> stints = new ArrayList<>();
            List<PopulationChangeEvent> events = new ArrayList<>(_events);

            // If we have no events, we have no stints.
            if (events.size() == 0) { return stints; }

            boolean done = false;
            while(!done) {
                if (events.size() == 1) {
                    PopulationChangeEvent event = events.get(0);

                    // If the list consists only
                    if (event.getType().isBirth() || event.getType().isArrival()) {
                        stints.add(new StintAtPrimateCenter(event, null));
                        done = true;
                    }
                    else if (event.getType().isDeparture() || event.getType().isDeath()) {
                        stints.add(new StintAtPrimateCenter(null, event));
                        done = true;
                    }
                }
                else {
                    PopulationChangeEvent startEvent = events.remove(0);
                    PopulationChangeEvent endEvent   = events.remove(0);

                    if ( !(startEvent.getType().isBirth() || startEvent.getType().isArrival()) ) {
                        throw new Error("Stints must start with either a birth or arrival.");
                    }
                    else if ( !(endEvent.getType().isDeath() || endEvent.getType().isDeparture()) ) {
                        throw new Error("Stints must end with either a death or departure.");
                    }
                    else {
                        stints.add(new StintAtPrimateCenter(startEvent, endEvent));
                    }

                    if (events.size() == 0) {
                        done = true;
                    }
                }
            }

            return stints;
        }
    }
}
