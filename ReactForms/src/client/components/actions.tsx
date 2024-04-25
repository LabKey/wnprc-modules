import { ActionURL, Ajax, Utils } from '@labkey/api';

export async function submitRequest(
    commands: any,
): Promise<any> {
    console.log("FormData", {
        commands: commands,
    });
    return new Promise<any>((resolve, reject) => {
        return Ajax.request({
            url: ActionURL.buildURL('query', 'saveRows', ActionURL.getContainer()),
            method: 'POST',
            jsonData: {
                apiVersion: 13.2,
                transacted: true,
                containerPath: ActionURL.getContainer(),
                commands: commands,
                extraContext: {
                    isValidateOnly: true
                }
            },
            success: Utils.getCallbackWrapper(response => {
                resolve(response);
            }),
            failure: Utils.getCallbackWrapper(
                error => {
                    console.error('Failed to submit request.', error);
                    reject(error);
                },
                undefined,
                true
            ),
            headers : {
                'Content-Type' : 'application/json'
            }
        });
    });
}


export const parseErrors = (result: any) => {
    const errors = result.filter(res => res?.errors !== undefined && res?.errors?.exception !== "ERROR: Ignore this error");
    console.log(errors);
    return errors;
}

export const cleanDropdownOpts = (data, value, display, defaultOpts) => {
    const options = [];
    data["rows"].forEach(item => {
        options.push({value: item[value], label: item[display]});
    });

    if(defaultOpts) {
        defaultOpts.forEach((option) => {
            options.push(option);
        });
    }

    // remove possible duplicates
    return options.reduce((accumulator, currentObject) => {
        const isDuplicate = accumulator.some(
            (obj) => obj.value === currentObject.value && obj.label === currentObject.label
        );

        if (!isDuplicate) {
            accumulator.push(currentObject);
        }
        return accumulator;
    }, []);
}

/*
Compiles a state object into a submission ready object for labkey saverows API call

@param schemaName Name of schema for data to submit to
@param queryName Name of query for data to submit to
@param command Command of what to trigger for labkey saverows, insert or update
@param state Data object to package for submission
@returns {Object} New object ready for saverows
 */
export const generateFormData = (schemaName: string, queryName: string, command: string, state: any): object => {
    let rows;
    const insertObjID = (row) => {
        row.objectid = Utils.generateUUID();
        return row;
    }
    const genRow = (pkName: string, key?: string) => {
        if(pkName === "lsid"){ // pk is lsid
            if(state instanceof Array) {
                rows = state.map((row, index) => {
                    if (key) row = insertObjID(row);
                    return {oldKeys: {lsid: key ? "" : row.lsid}, values: row}
                })
            }
            else{
                if (key) state = insertObjID(state);
                rows = [{oldKeys: {lsid: key ? "" : state.lsid}, values: state}]
            }
        }else{// pk is taskid
            if(state instanceof Array) {
                rows = state.map((row, index) => {
                    if (key) row = insertObjID(row);
                    return {oldKeys: {taskid: key ? "" : row.taskid}, values: row}
                })
            }
            else{
                if (key) state = insertObjID(state);
                rows = [{oldKeys: {taskid: key ? "" : state.taskid}, values: state}]
            }
        }
    }
    const rowHelper = (pkName: string) => {
        if(command === "insertWithKeys") {
            genRow(pkName, "insert");
        }else {
            genRow(pkName);
        }
    }
    rowHelper(schemaName === "study" ? "lsid" : "taskid")
    return {
        schemaName,
        queryName,
        command,
        rows,
    };
};