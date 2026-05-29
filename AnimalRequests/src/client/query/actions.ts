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
//Expects json row data with commands property, see API docs for saveRows
export const saveRowsDirect = (jsonData) => {
    return new Promise((resolve, reject) => {
        LABKEY.Query.saveRows({
            commands: jsonData.commands,
            method: 'POST',
            success: (data) => {
                resolve(data);
            },
            failure: (data) => {
                reject(data);
            }

        })
    })
};

//returns a promise to get data from labkey
export const getEHRData = (schemaName,queryName,sort='rowid',columns='',filterArray=[], viewName = ''):any => {
    return new Promise((resolve, reject) => {
        return LABKEY.Query.selectRows({
            schemaName: schemaName,
            queryName: queryName,
            columns: columns,
            sort: sort,
            filterArray: filterArray,
            viewName: viewName,
            success: (data) => {
                resolve(data)
            },
            failure: (data) => {
                reject(data);
            }

        });
    });
};

//TODO need to use a specific queryname and make it an sql file?
export const selectRowsSql = (id) => {
    return new Promise((resolve, reject) => {
        return LABKEY.Query.selectRows({
            schemaName: 'study',
            queryName: 'demographicWeightChange',
            columns: 'participantid,weight',
            success: (data) => {
                resolve(data);
            },
            failure: (data) => {
                reject(data);
            }

        });
    });
};

export const findAccountByProject = (project, state) => {
    let account = '';
    let projectsAndAccounts = state.animal_requests_active_projects;
    for (let i = 0; i < projectsAndAccounts.length; i++){
        if (projectsAndAccounts[i]['project'] == project){
            account = projectsAndAccounts[i]['account'];
            break;
        }
    }
    return account;
}
