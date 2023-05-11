import { TaskValuesType } from '../watermonitoring/typings/main';
import { ActionURL, Filter, Query, Utils } from '@labkey/api';
import { SelectRowsOptions } from '@labkey/api/dist/labkey/query/SelectRows';
import { SaveRowsOptions } from '@labkey/api/dist/labkey/query/Rows';
import { SelectDistinctOptions } from '@labkey/api/dist/labkey/query/SelectDistinctRows';
import { useState } from 'react';
import { ModifyRowsCommands } from '../weight/typings/main';

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


/*
Helper that finds the account associated with a project

@param projectId A project ID that you want to find the account of
@returns {Object} Account associated with a project
 */
export const findAccount = async (projectId) => {
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
  return {value: data["values"][0], error: ""};
}

/*
Helper that finds the projects associated with an animal

@param animalId An animal ID that you want to find the projects of
@returns {[Object]} Array of objects representing the projects associated with an animal ID
 */
export const findProjects = async (animalId: string) => {
  let config: SelectDistinctOptions = {
    schemaName: "study",
    queryName: "Assignment",
    column: "project",
    filterArray: [
      Filter.create(
          "Id",
          animalId,
          Filter.Types.EQUALS
      )
    ]
  };

  const data = await labkeyActionDistinctSelectWithPromise(config);

  let temp = [];
  // Default projects, these should always show
  temp.push({value:300901, label:"300901"});
  temp.push({value:400901, label:"400901"});

  data["values"].forEach(item => {
    // we don't want defaults added twice if an animal has already been in one
    if (item === 300901 || item === 400901) return;
    temp.push({value: item, label: item});
  });

  return temp;
}

/*
General validation helper function for form submission, currently only checks for valid id, and living status

@param animalInfoCache Cache of animalInfos to reference for validity
@param formData Form data to validate, see triggerSubmit() for more details
@param setShowModal  see triggerSubmit() for more details
@param setErrorText see triggerSubmit() for more details
@returns {Promise} Promise object representing a pass or fail validation check
 */
export const validate = async (animalInfoCache, formData, setShowModal, setErrorText) => {

  // Check if formData is a single submission (rowObj) or batch (array<rowObj>)
  if(!Array.isArray(formData)){
    formData = [formData]
  }

  return new Promise((resolve, reject) => {
    let promises = [];
    try
    {
      for (let record of formData) {
        if (animalInfoCache && animalInfoCache[record["Id"]["value"]]) {
          let animalRecord = animalInfoCache[record["Id"]["value"]];
          if (animalRecord["calculated_status"] == "Dead") {

            setErrorText("Cannot update dead animal record " + record["id"]["value"]);
            setShowModal("none");
            setShowModal("error");
            //return false;
            resolve(false);
          }
        } else {
          promises.push(lookupAnimalInfo(record["Id"]["value"]));
        }
      }
    } catch(err) {
      console.log(JSON.stringify(err));
    }
    Promise.all(promises).then((results) => {

      try
      {
        for (let result of results)
        {
          if (result["calculated_status"] == "Dead")
          {
            setErrorText("Cannot update dead animal record: " + result["Id"]);
            resolve(false);
          }
        }
      } catch (err) {
        console.log(JSON.stringify(err));
      }
      resolve(true);
    }).catch((d)=>{
      if (d.rows.length == 0){
        setErrorText("One or more animals not found. Unable to submit records.")
      } else {
        setErrorText("Unknown error. Unable to submit records.")
      }
      console.log(d);
      resolve(false);
    });
  });
};

/*
Function to trigger validation on an animal

@param animalInfoCache The cache of info per animal for validation
@param formData Can be either rowObj or array<rowObj> if form is a single entry or batch
@param setSubmitTextBody handles the submission text for showModal
@param setShowModal handles the modal that appears when user clicks submit
@param setErrorText handles error texts for showModal if any occur
 */
export const triggerValidation = async (
    animalInfoCache,
    formData,
    setSubmitTextBody,
    setShowModal,
    setErrorText,
) => {

  setSubmitTextBody("One moment. Performing validations...");
  await validate(animalInfoCache, formData, setShowModal, setErrorText).then((d) => {
    if (!d) {
      setShowModal("none");
      setShowModal("error");
      setSubmitTextBody("Submit values?");
      return;
    }
  });
}



/*
Main submit handler for forms
TODO maybe remove function
@param animalInfoCache The cache of info per animal for validation
@param formData Can be either rowObj or array<rowObj> if form is a single entry or batch
@param setSubmitTextBody handles the submission text for showModal
@param setShowModal handles the modal that appears when user clicks submit
@param setErrorText handles error texts for showModal if any occur
@param schemaName Name of schema to submit to
@param queryName Name of table of schema to submit to
*/

export const triggerSubmit = async (
    animalInfoCache,
    formData,
    setSubmitTextBody,
    setShowModal,
    setErrorText,
    schemaName,
    queryName,
    ): Promise<any> => {

  // Check if formData is a single submission (rowObj) or batch (array<rowObj>)
  if(!Array.isArray(formData)){
    formData = [formData]
  }
  let jsonData;

  //do some validation here
  await triggerValidation(animalInfoCache, formData, setShowModal, setErrorText, setSubmitTextBody);
  setSubmitTextBody("Submitting...");

  console.log('grouping stuff... but skipping group cmds');
  try {
    console.log('grouping stuff')
    let itemsToInsert = groupCommands(formData);
    console.log('setting up stuff')
    console.log("items: ", itemsToInsert);
    jsonData = setupJsonData(itemsToInsert, schemaName, queryName);
  }catch(err) {
    console.log(err);
    console.log(JSON.stringify(err))
    return;
  }
  console.log("jsonData: ", jsonData);
  console.log('calling save rows');

    /*
    saveRowsDirect(jsonData)
        .then((data) => {
            console.log('done!!');
            console.log(JSON.stringify(data));
            setSubmitTextBody("Success!");
            wait(3, setSubmitTextBody).then(() => {
                window.location.href = ActionURL.buildURL(
                    "ehr",
                    "executeQuery.view?schemaName=study&query.queryName=research_ultrasounds",
                    ActionURL.getContainer()
                );
            });
        })
        .catch((e) => {
            console.log(e);
            setSubmitTextBody(e.exception);
        }); */
  return jsonData;
}

/*
Compiles a state object into a submission ready object for labkey saverows API call

@param schemaName Name of schema for data to submit to
@param queryName Name of query for data to submit to
@param command Command of what to trigger for labkey saverows, insert or update
@param state Data object to package for submission
@returns {Object} New object ready for saverows
 */
export const generateFormData = (schemaName: string, queryName: string, command: string, state: object): object => {
  const rows = [{}];
  Object.keys(state).forEach(key => {
    rows[0][key] = state[key].value;
  });
  return {
    schemaName,
    queryName,
    command,
    rows,
  };
};

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
      columns: [],
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