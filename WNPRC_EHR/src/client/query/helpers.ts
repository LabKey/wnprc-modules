import { TaskValuesType } from '../watermonitoring/typings/main';
import { ActionURL, Filter, Query } from '@labkey/api';
import { SelectRowsOptions } from '@labkey/api/dist/labkey/query/SelectRows';
import { SaveRowsOptions } from '@labkey/api/dist/labkey/query/Rows';
import { SelectDistinctOptions } from '@labkey/api/dist/labkey/query/SelectDistinctRows';

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
An expanded helper function for lookupAnimalInfo. This function updates the components animalInfo state.
Caching has not been implemented yet.
@param id The animal ID that the user is requesting
@param setAnimalInfo A state setter for animalInfo
@param setAnimalInfoState A state setter for animalInfoState
 */
export const getAnimalInfo = (id, setAnimalInfo,setAnimalInfoState, setValidId, setAnimalInfoCache) => {
      lookupAnimalInfo(id).then((d) => {
        setAnimalInfo(d);
        setAnimalInfoState("loading-success");
        setValidId(true);
        setAnimalInfoCache(d);
      }).catch((d)=> {
        setAnimalInfoState("loading-unsuccess");
        setValidId(false);
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
Generic state handler for dates, this is only for states that are one object

@param name Name of date object in state
@param date New date to set
@param setState Generic state setter for state object
 */
export const handleDateChange = (name, date, setState) => {
  setState((prevState) => ({
    ...prevState,
    [name]: date,
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
    [name]: value,
  }));
};

/*
Helper that connects dropdown values to display names and puts them into an available options state.

@param config Configuration for the query to be executed by labkeyActionSelectWithPromise
@param setState A state setter for the options to be presented in a dropdown selector
@param value The true value of the dropdown options
@param display The display value of the dropdown options
 */
export const findDropdownOptions = (config, setState, value, display) => {

  labkeyActionSelectWithPromise(config).then(data => {
    let temp = [];
    data["rows"].forEach(item => {
      temp.push({value: item[value], label: item[display]});
    });
    setState(temp);
  });
}
