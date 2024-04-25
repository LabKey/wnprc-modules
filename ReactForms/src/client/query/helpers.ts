import { ActionURL, Filter, Query, Utils } from '@labkey/api';
import { SelectRowsOptions } from '@labkey/api/dist/labkey/query/SelectRows';
import { SaveRowsOptions } from '@labkey/api/dist/labkey/query/Rows';
import { SelectDistinctOptions } from '@labkey/api/dist/labkey/query/SelectDistinctRows';
import { GetQueryDetailsOptions, QueryDetailsResponse } from '@labkey/api/dist/labkey/query/GetQueryDetails';
import { QueryColumn } from '@labkey/api/dist/labkey/query/types';
import { cleanDropdownOpts } from '../components/actions';

interface jsonDataType {
  commands: Array<any>;
}

export const groupCommands = (values: Array<any>) => {
  return values.reduce((acc, item) => {
    if (!acc[item.command.value]) {
      acc[item.command.value] = [];
    }

    acc[item.command.value].push(item);
    return acc;
  }, {});
};

export const setupValues = (formdata: any[], QCStateLabel: string, valuekey: string) => {
  let newarray = [];
  for (let item of formdata){
    let newobj = {};
    for (let key of Object.keys(item)){
      let pair = {[key]: item[key][valuekey]};
      newobj = {...newobj, ...pair}
    }
    newarray.push(newobj);
  }
  return newarray;
};

export const setupJsonData = (values: any[], schemaName: string, queryName: string) => {
  //for each grouped item (insert, update, delete), set up commands for each diff set.
  let commands =[];
  try
  {
    Object.keys(values).forEach(function (key, index) {
      let rowsToInsert = setupValues(values[key], 'Completed', "value");
      commands.push({
        schemaName: schemaName,
        queryName: queryName,
        command: key,
        rows: rowsToInsert
      })

    });
  }catch (err) {
    console.log(JSON.stringify(err))
  }
  return {
    commands: commands
  };
};

export const saveRowsDirect = (jsonData: jsonDataType) => {
  return new Promise((resolve, reject) => {
    let options: SaveRowsOptions = {
      commands: jsonData.commands,
      containerPath: ActionURL.getContainer(),
      success: (data) => {resolve(data)},
      failure: (data) => {reject(data)},
    };
    Query.saveRows(options);
  });
};

export const wait = (time: number, updateFn: any) => {
  return new Promise<void>(resolve => {
    let countdown = time;
    setInterval(() => {
      updateFn("Success! Redirecting in..." + countdown);
      countdown--;
      if (countdown == 0) {
        resolve();
      }
    }, 1000);
  });
};

export const checkEditMode = () => {
  return (
      ActionURL.getParameter("taskid") != null ||
      ActionURL.getParameter("lsid") != null
  )
};

export function labkeyActionSelectWithPromise(
    options: SelectRowsOptions
): Promise<any> {
  return new Promise((resolve, reject) => {
    options.success = (data) => {resolve(data)};
    options.failure = (data) => {reject(data)};
    Query.selectRows(options);
  });
}

export function labkeyActionDistinctSelectWithPromise(
    options: SelectDistinctOptions
): Promise<any> {
  return new Promise((resolve, reject) => {
    options.success = (data) => {resolve(data)};
    options.failure = (data) => {reject(data)};
    Query.selectDistinctRows(options);
  });
}

export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export const getlocations = (location:Array<any>): Array<Promise<any>> => {
  if (location.length == 0) {
    //alert('please set a location')
    return;
  }
  let promises = [];
  location.forEach(loc => {
    let config = {
      schemaName: "study",
      queryName: "demographicsCurLocation",
      columns: ["Id,location"],
      sort: "Id",
      filterArray: [
        Filter.create(
            "location",
            loc.value,
            Filter.Types.CONTAINS
        )
      ]
    };
    promises.push(labkeyActionSelectWithPromise(config));
  });

  return promises;

};

export const getAnimalIdsFromLocation = (location) => {
  let animalIDArray = [];
  return new Promise((resolve, reject) => {
    if (!location){
      reject("Provide a location.")
    }
    Promise.all(getlocations(location)).then(d => {
      d.forEach((promise, i) => {
        if (promise["rows"]) {
          promise["rows"].forEach((row, i) => {
            animalIDArray.push(row.Id);
          });
        }
        resolve(animalIDArray);
      });
  });
  })
}

export const lookupAnimalInfo = (id:string) => {
  return new Promise ((resolve, reject) => {
    let config = {
      schemaName: "study",
      queryName: "demographics",
      sort: "-date",
      filterArray: [Filter.create("Id", id, Filter.Types.EQUAL)],
    };
    labkeyActionSelectWithPromise(config)
      .then((data) => {
        if (data["rows"].length === 1) {
          resolve(data["rows"][0])
        } else {
          reject(data);
        }
      })
      .catch((data) => {
        reject(data);
      });
  });
};

/*
An expanded helper function for lookupAnimalInfo. This function updates the components animalInfo state.

TODO test caching if used for bulk animal upload
@param id The animal ID that the user is requesting
@param setAnimalInfo A state setter for animalInfo
@param setAnimalInfoState A state setter for animalInfoState
 */
export const getAnimalInfo = (id, setAnimalInfo,setAnimalInfoState, setAnimalInfoCache) => {
  lookupAnimalInfo(id).then((d) => {
    setAnimalInfo(d);
    setAnimalInfoState("loading-success");
    setAnimalInfoCache(d);
  }).catch((d)=> {
    setAnimalInfoState("loading-unsuccess");
  });
}
/*
Helper function to open the DatePicker component

@param caldenderEl calender reference object
 */
export const openDatepicker = (calendarEl) => {
  //@ts-ignore
  calendarEl.current.setOpen(true);
};
/*
const MyInput = React.forwardRef(function openDatepicker(props, ref) {
  if(!ref) return;
  ref.current.setOpen(true);
});*/

/*
Generic state handler for dates, this is only for states that are one object

@param name Name of date object in state
@param date New date to set
@param setState Generic state setter for state object
 */
export const handleDateChange = (name, date, setState) => {
  setState((prevState) => ({
    ...prevState,
    [name]: {value: date, error: ""}
  }));
};

/*
Generic state handler, this is only for states that are one object and does not work for dropdown menus

@param event Event of call that needs handling
@param setState Generic state setter for state object
 */
export const handleInputChange = (event, setState) => {
  const target = event.target;
  const value = target.type === 'checkbox'
      ? target.checked
      : target.value;
  const name = target.name;

  setState((prevState) => ({
    ...prevState,
    [name]: {value: value, error: ""}
  }));
};

/*
Helper that finds the account associated with a project

@param projectId A project ID that you want to find the account of
@returns {Object} Account associated with a project
 */
export const findAccount = async (projectId: string) => {
  let config: SelectDistinctOptions = {
    schemaName: "ehr",
    queryName: "project",
    column: "account",
    filterArray: [
      Filter.create(
          "project",
          projectId,
          Filter.Types.EQUALS
      )
    ]
  };
  const data = await labkeyActionDistinctSelectWithPromise(config);
  return data["values"][0];
}

/*
Helper function that finds task data from a task ID

@param taskId Task ID to find task information for
@returns {Promise} Promise object representing the task data
 */
export const getTask = (taskId: string): Promise<any> => {
  return new Promise ((resolve, reject) => {
    let config: SelectRowsOptions = {
      schemaName: "ehr",
      queryName: "tasks",
      columns: ["rowid,taskid,title,assignedto,duedate,qcstate"],
      filterArray: [Filter.create("taskid", taskId, Filter.Types.EQUAL)],
    };
    labkeyActionSelectWithPromise(config)
        .then((data) => {
          if (data["rows"][0]) {
            resolve(data["rows"][0]);
          } else {
            reject(data);
          }
        })
        .catch((data) => {
          reject(data);
        });
  });
}

/*
Helper function to find the label associated with a qc state number

@param rowId The requested qc state row id to find the label for
@returns {Promise} Promise object with the requested label
 */
export const getQCLabel = (rowId: number): Promise<any> => {
  return new Promise ((resolve, reject) => {
    let config: SelectRowsOptions = {
      schemaName: "core",
      queryName: "QCState",
      columns: ["Label"],
      filterArray: [Filter.create("rowid", rowId, Filter.Types.EQUAL)],
    };
    labkeyActionSelectWithPromise(config)
        .then((data) => {
          if (data["rows"][0]) {
            resolve(data["rows"][0]);
          } else {
            reject(data);
          }
        })
        .catch((data) => {
          reject(data);
        });
  });
}

/*
Helper function to get form data from a previous task

@param taskId Task id of previously created task/form
@param schemaName Schema name of the task/form that the taskId belongs to
@param queryName Query name of the task/form that the taskId belongs to
@returns {Promise} Promise object with the previous form data
 */
export const getFormData = (taskId: string, schemaName: string, queryName: string): Promise<any> => {
  return new Promise ((resolve, reject) => {
    let config: SelectRowsOptions = {
      schemaName: schemaName,
      queryName: queryName,
      filterArray: [Filter.create("taskid", taskId, Filter.Types.EQUAL)],
    };
    labkeyActionSelectWithPromise(config)
        .then((data) => {
          if (data["rows"][0]) {
            resolve(data["rows"]);
          } else {
            reject(data);
          }
        })
        .catch((data) => {
          reject(data);
        });
  });
}

/*
Helper function to find the lsid for a given schema/query and task id

@param schemaName string of the name for the schema to search
@param queryName string of the name for the query to search
@param taskId string of the task id to search for corresponding lsid
@returns Promise string of lsid value
 */
export const getLsid = (schemaName: string, queryName: string, taskId: string): Promise<[string]> => {
  const config: SelectDistinctOptions = {
    schemaName: schemaName,
    queryName: queryName,
    column: "lsid",
    filterArray: [
      Filter.create(
          "taskid",
          taskId,
          Filter.Types.EQUALS
      )
    ]
  }
  return new Promise ((resolve, reject) => {
    labkeyActionDistinctSelectWithPromise(config)
        .then((data) => {
          console.log("LSID: ",data);
          if (data.values[0]) {
            resolve(data.values);
          } else {
            reject(data);
          }
        })
        .catch((data) => {
          reject(data);
        });
  });
}

export const getQCRowID = async (qcLabel: string) => {
  const qcConfig: SelectRowsOptions = {
    schemaName: "core",
    queryName: "QCState",
    columns: ["RowId", "label"],
  };

  labkeyActionSelectWithPromise(qcConfig).then((data) => {
    for(let i = 0; i < data.rows.length; i++){
      if(data.rows[i].Label === qcLabel){
        return data.rows[i].RowId;
      }
    }
    console.log("No label found for rowid");

    return null;
  }).catch(() => {
    console.log("Error retrieving QC rowid");
    return null;
  })
}


export const getQueryDetails = async (schemaName, queryName): Promise<Awaited<any>> => {
    let config: GetQueryDetailsOptions = {
      schemaName: schemaName,
      queryName: queryName,
    };
    return new Promise((resolve, reject) => {
      config.success = (data) => {resolve(data)};
      config.failure = (data) => {reject(data)};
      Query.getQueryDetails(config)
    });
}

export const createTypeFromJson = (json: any): string => {
  let typeDefinition = 'type MyType = {\n';

  for (const key in json) {
    const value = json[key];
    const valueType = typeof value;

    if (valueType === 'object' && value !== null && !Array.isArray(value)) {
      // Recursively generate type for nested objects
      typeDefinition += `${key}: MyType;\n`;
    } else {
      typeDefinition += `${key}: ${valueType};\n`;
    }
  }

  typeDefinition += '};';

  return typeDefinition;
}

export const getConfig = (lookupMetaData, watchState?) => {
  if(watchState && watchState.field !== ''){
    return ({
      schemaName: lookupMetaData.schemaName,
      queryName: lookupMetaData.queryName,
      columns: [lookupMetaData.keyColumn, lookupMetaData.displayColumn],
      filterArray: [
        Filter.create(
            watchState.name,
            watchState.field,
            Filter.Types.CONTAINS
        )
      ]
    });
  }else{
    return ({
      schemaName: lookupMetaData.schemaName,
      queryName: lookupMetaData.queryName,
      columns: [lookupMetaData.keyColumn, lookupMetaData.displayColumn],
    });
  }
}

export const getDistinctConfig = (lookupMetaData, watchState?) => {
  if(watchState){
    return ({
      schemaName: lookupMetaData.schemaName,
      queryName: lookupMetaData.queryName,
      column: lookupMetaData.column,
      filterArray: [
        Filter.create(
            watchState.name,
            watchState.field,
            Filter.Types.EQUALS
        )
      ]
    });
  }else{
    return ({
      schemaName: lookupMetaData.schemaName,
      queryName: lookupMetaData.queryName,
      column: lookupMetaData.column,
    });
  }
}

export const findAutoFill = async (lookup, watchState) => {
  let config: SelectDistinctOptions = getDistinctConfig(lookup, watchState) as SelectDistinctOptions;
  const data = await labkeyActionDistinctSelectWithPromise(config);

  return data["values"][0];
};


export const parseGridName = (str) => {
  const regex = /^([^.-]+)-([^.-]+)\.(\d+)\.([^.-]+)$/;
  const match = str.match(regex);

  if (!match) {
    // Handle invalid input format
    console.error('Invalid input format');
    return null;
  }

  const [, schema, query, row, col] = match;
  return { schema, query, row, col};
}


export const findDropdownOptions = async (component, col) => {
      const tempConfig = {
        schemaName: col.lookup.schemaName,
        queryName: col.lookup.queryName,
        columns: [col.lookup.keyColumn, col.lookup.displayColumn],
      }
      const data = await labkeyActionSelectWithPromise(tempConfig);
      return cleanDropdownOpts(
          data,
          col.lookup.keyColumn,
          col.lookup.displayColumn,
          component.componentProps?.wnprcMetaData?.[col.name]?.defaultOpts
      );
}
