package org.labkey.wnprc_ehr.dataentry.validators;

import org.json.old.JSONObject;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.security.User;
import org.labkey.dbutils.api.SimpleQueryFactory;
import org.labkey.dbutils.api.SimplerFilter;
import org.labkey.wnprc_ehr.dataentry.validators.exception.InvalidAnimalIdException;

/**
 * Created by jon on 10/28/16.
 */
public class AnimalVerifier {
    private final String animalId;
    private final User user;
    private final Container container;

    public AnimalVerifier(String animalId, User user, Container container) {
        this.animalId = animalId;
        this.user = user;
        this.container = container;
    }

    private JSONObject getDemoRecord() throws InvalidAnimalIdException {
        SimplerFilter idFilter = new SimplerFilter("Id", CompareType.EQUAL, animalId);
        JSONObject[] demoRecords = new SimpleQueryFactory(user, container).selectRows("study", "demographics", idFilter).toJSONObjectArray();

        if (demoRecords.length > 0) {
            return demoRecords[0];
        }
        else {
            throw new InvalidAnimalIdException(String.format("%s does not exist", animalId));
        }
    }

    public AnimalVerifier isAliveAndAtCenter() throws InvalidAnimalIdException {
        JSONObject demoRecord = getDemoRecord();

        if (!demoRecord.getString("calculated_status").equals("Alive")) {
            throw new InvalidAnimalIdException(String.format("%s is not alive", animalId));
        }

        return this;
    }

    public AnimalVerifier exists() throws InvalidAnimalIdException {
        // This will throw an exception if the animal doesn't exist;
        getDemoRecord();
        return this;
    }
}
