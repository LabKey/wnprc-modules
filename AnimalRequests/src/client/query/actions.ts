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
