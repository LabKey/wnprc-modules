package org.labkey.wnprc_ehr.data.ColonyCensus;

import org.joda.time.DateTime;
import org.joda.time.DateTimeComparator;
import org.json.JSONObject;
import org.json.JSONString;
import org.labkey.api.action.ApiResponse;
import org.labkey.api.action.ApiSimpleResponse;
import org.labkey.webutils.api.json.ConvertibleToJSON;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * Created by jon on 1/17/16.
 */
public class PopulationChangeEvent implements Comparable<PopulationChangeEvent>, JSONString, ConvertibleToJSON {
    static private DateTimeComparator _dateTimeComparator = DateTimeComparator.getDateOnlyInstance();

    private DateTime _date;
    private DateTime _timestamp;
    private String _id;
    private EventType _eventType;
    private Species _species;
    private String _description;

    public enum EventType {
        Birth (1), Death (-1), Arrival (2), Departure (-2)
        ; // Semicolon required for methods/fields

        // Constructor that gets passed the value for the event.
        private int _eventTypeCode;
        EventType(int eventTypeCode) {
            _eventTypeCode = eventTypeCode;
        }

        private int getEventCode() {
            return _eventTypeCode;
        }

        public boolean isArrival()   { return this._eventTypeCode == Arrival.getEventCode(); }
        public boolean isBirth()     { return this._eventTypeCode == Birth.getEventCode();   }
        public boolean isDeath()     { return this._eventTypeCode == Death.getEventCode();   }
        public boolean isDeparture() { return this._eventTypeCode == Departure.getEventCode();   }

        public boolean isIncrease()  { return this.isArrival()   || this.isBirth(); }
        public boolean isDecrease()  { return this.isDeparture() || this.isDeath(); }
    }

    public enum Species {
        Rhesus (0),
        Cynomolgus (1),
        Marmoset (2)
        ;

        private int _speciesCode;
        Species(int speciesCode) {
            _speciesCode = speciesCode;
        }

        public static Species getFromString(String speciesName) {
            for( Species species : Species.values() ) {
                if (species.name().equalsIgnoreCase(speciesName)) {
                    return species;
                }
            }

            return null;
        }
    }

    private PopulationChangeEvent(String Id, DateTime date, DateTime timestamp, EventType eventType, Species species, String description) {
        _date = date;
        _id = Id;
        _eventType = eventType;
        _species = species;
        _timestamp = timestamp;
        _description = description;
    }

    public static PopulationChangeEvent newEvent(String Id, Date date, Date timestamp, String eventTypeString, String speciesString, String description) {
        try {
            EventType eventType;
            switch (eventTypeString.toLowerCase()) {
                case "arrival":   eventType = EventType.Arrival;   break;
                case "birth":     eventType = EventType.Birth;     break;
                case "death":     eventType = EventType.Death;     break;
                case "departure": eventType = EventType.Departure; break;
                default:
                    throw new IllegalArgumentException(eventTypeString + " is not a valid event type.");
            }

            Species species;
            switch (speciesString.toLowerCase()) {
                case "cynomolgus": species = Species.Cynomolgus; break;
                case "rhesus":     species = Species.Rhesus;     break;
                case "marmoset":   species = Species.Marmoset;   break;
                default:
                    throw new IllegalArgumentException(speciesString + " is not a valid species.");
            }

            return new PopulationChangeEvent(Id, new DateTime(date), new DateTime(timestamp), eventType, species, description);
        }
        catch (Exception e) {
            return null;
        }
    }

    public Species getSpecies() {
        return _species;
    }

    public DateTime getDate() {
        return _date;
    }

    public DateTime getTimestamp() {
        return _timestamp;
    }

    public EventType getType() {
        return _eventType;
    }

    public String getDescription() {
        return _description;
    }

    @Override
    public int compareTo(PopulationChangeEvent otherEvent) {
        return _dateTimeComparator.compare(this.getTimestamp(), otherEvent.getTimestamp());
    }


    public ApiResponse toApiResponse() {
        ApiResponse apiResponse = new ApiSimpleResponse();
        Map<String, Object> props = new HashMap<>();

        props.put("species",     _species);
        props.put("date",        _date);
        props.put("id",          _id);
        props.put("type",        _eventType);
        props.put("description", _description);
        props.put("timestamp",   _timestamp);

        return apiResponse;
    }

    @Override
    public JSONObject toJSON() {
        JSONObject json = new JSONObject();

        json.put("species", _species);
        json.put("date", _date);
        json.put("id", _id);
        json.put("type", _eventType);
        json.put("description", _description);
        json.put("timestamp",   _timestamp);

        return json;
    }

    // Override for JSONObject.
    @Override
    public String toJSONString() {
        return toJSON().toString();
    }

    public String toString() {
        return toJSONString();
    }
}
