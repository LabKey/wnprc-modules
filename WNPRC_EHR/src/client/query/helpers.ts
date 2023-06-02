import { TaskValuesType } from '../watermonitoring/typings/main';
import { ActionURL, Filter, Query } from '@labkey/api';
import { SelectRowsOptions } from '@labkey/api/dist/labkey/query/SelectRows';
import { SaveRowsOptions } from '@labkey/api/dist/labkey/query/Rows';

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
        if (data["rows"][0]) {
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

export const insertTaskCommand = (taskid, title) => {
  let taskObject = {

    taskid:     taskid,
    title:      title,
    category:   "task",
    qcstate:    1, //Complete
    formType:   title
    // assignedTo:
  };
  let taskCommand = {
      schemaName: "ehr",
      queryName: "tasks",
      command: "insert",
      rows: [taskObject]
    };


  return taskCommand;

};

export const setupTaskValues = (taskId: string, dueDate: string, assignedTo: number, QCStateLabel: string): Array<TaskValuesType> => {
  return [{
    taskId: taskId,
    duedate: dueDate,
    assignedTo: assignedTo,
    category: "task",
    title: "Enter Water Daily Amount",
    formType: "Enter Water Daily Amount",
    QCStateLabel: QCStateLabel
  }];
};

/*
Retrieves url parameters along the form #param1:value1&param2:value2

@param url URL to get parameters for
 */
export const getURLParameters = (url: string): Object => {
  // Find the index of '#' character
  const hashIndex = url.indexOf('#');

  if (hashIndex !== -1) {
    // Extract the substring after '#' character
    const hashValue = url.substring(hashIndex + 1);

    // Split the hash value by '&' to get individual key-value pairs
    const keyValuePairs = hashValue.split('&');

    // Create an object to store the key-value pairs
    const parameters: { [key: string]: string | string[] } = {};
    for (const pair of keyValuePairs) {
      // Split each key-value pair by ':' to separate the key and value
      const [key, value] = pair.split(':');
      // Decode URL-encoded value if necessary
      const decodedValue = decodeURIComponent(value.replace(/\+/g, ' '));

      // Check if the value contains a comma
      if (decodedValue.includes(',')) {
        // Split the value by comma to create an array of values
        const arrayValue = decodedValue.split(',');
        parameters[key] = arrayValue;
      } else {
        parameters[key] = decodedValue;
      }
    }
    return parameters;
  } else {
    console.log('No hash value found in the URL.');
    return {};
  }
};
