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
package org.labkey.wnprc_ehr.dataentry.validators;

import org.json.JSONObject;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.security.User;
import org.labkey.api.util.JsonUtil;
import org.labkey.dbutils.api.SimpleQueryFactory;
import org.labkey.dbutils.api.SimplerFilter;
import org.labkey.wnprc_ehr.dataentry.validators.exception.InvalidAnimalIdException;

import java.util.List;

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
        List<JSONObject> demoRecords = JsonUtil.toJSONObjectList(new SimpleQueryFactory(user, container).selectRows("study", "demographics", idFilter));

        if (!demoRecords.isEmpty()) {
            return demoRecords.get(0);
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
