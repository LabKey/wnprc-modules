/*
 * Copyright (c) 2020-2026 Board of Regents of the University of Wisconsin System
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
import {saveRowsDirect} from "./actions";
import moment from 'moment';

//helper method to swap two fields (usecase: user input under a "dropdown" conditional select):
// https://github.com/final-form/react-final-form#conditional-fields
export const overrideAFieldValue = (values:Object, sourceField:string, destinationField:string) => {
    values[destinationField] = values[sourceField];
    return values;
};

//TODO
export const createTask = (config) => {
    //here this job is to run the saveRows query for the task.. just for an insert

};

export const submitAnimalRequest  = (values:Object, qcstate:string) => {
    let currentDate = moment(new Date()).format();
    let weightValToInsert = [];
    let jsonData;
    //we need to copy the values before the insert because if we update the values of the form then it messes it up
    let valuesToBeInserted = {...values};

    valuesToBeInserted['date'] = currentDate;
    valuesToBeInserted['QCStateLabel'] = qcstate;

    //replace the principalinvestigator (PI) field if there's custom input from an external PI
    if (valuesToBeInserted['externalprincipalinvestigator']) {
        let sourceField = 'externalprincipalinvestigator';
        let destinationField = 'principalinvestigator';
        let newvalues = overrideAFieldValue(valuesToBeInserted, sourceField, destinationField);
        valuesToBeInserted = newvalues;
    }

    weightValToInsert.push(valuesToBeInserted);

    jsonData =
        {
            commands:
                [
                    {
                        schemaName: "wnprc",
                        queryName: "animal_requests",
                        command: "insert",
                        rows: weightValToInsert
                    }
                ],
        };
    return saveRowsDirect(jsonData);
};


