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
/*
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
}; */

/*
An expanded helper function for lookupAnimalInfo. This function updates the components animalInfo state.
Caching has not been implemented yet.
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
Helper that finds the accounts associated with a project

@param projectId A project ID that you want to find the account of
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

@param projectId A project ID that you want to find the account of
 */
export const findProjects = async (animalId) => {
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

@props animalInfoCache Cache of animalInfos to reference for validity
@props formData Form data to validate, see triggerSubmit() for more details
@props setShowModal  see triggerSubmit() for more details
@props setErrorText see triggerSubmit() for more details
 */
export const validate = async (animalInfoCache, formData, setShowModal, setErrorText) => {
  return new Promise((resolve, reject) => {
    let promises = [];
    try
    {
      for (let record of formData) {
        if (animalInfoCache && animalInfoCache[record["id"]["value"]]) {
          let animalRecord = animalInfoCache[record["id"]["value"]];
          if (animalRecord["calculated_status"] == "Dead") {
            setErrorText("Cannot update dead animal record " + record["id"]["value"]);
            setShowModal("none");
            setShowModal("error");
            //return false;
            resolve(false);
          }
        } else {
          promises.push(lookupAnimalInfo(record["id"]["value"]));
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
            setErrorText("Cannot update dead animal record: " + result["id"]);
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
Main submit handler for forms

@props animalInfoCache The cache of info per animal for validation
@props formData Can be either rowObj or array<rowObj> if form is a single entry or batch
@props setSubmitTextBody handles the submission text for showModal
@props setShowModal handles the modal that appears when user clicks submit
@props setErrorText handles error texts for showModal if any occur
@props schemaName Name of schema to submit to
@props queryName Name of table of schema to submit to
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
  setSubmitTextBody("One moment. Performing validations...");
  await validate(animalInfoCache, formData, setShowModal, setErrorText).then((d) => {
    if (!d) {
      setShowModal("none");
      setShowModal("error");
      setSubmitTextBody("Submit values?");
      return;
    }

    /*let command = wasSaved || editMode ? "update" : "insert";*/
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
  });
  return jsonData;
}

/*
TODO create special handler for task submission (this is special)
 */
export const generateTask = (
    taskState,
    command
) => {

  return({
    schemaName: "ehr",
    queryName: "tasks",
    command: command,
    rows: [{
      taskId: taskState.taskId.value,
      duedate: taskState.taskDueDate.value,
      assignedTo: taskState.taskAssignedTo.value,
      category: taskState.taskCategory.value,
      title: taskState.taskTitle.value,
      formType: taskState.taskFormType.value,
      QCStateLabel: taskState.taskQCStateLabel.value
    }],
  });
}

export const generateRestraint = (
    formState,
    taskState,
    restraintState,
    command
) => {

  return({
    schemaName: "study",
    queryName: "restraints",
    command: command,
    rows: [{
      Id: formState.id.value,
      date: restraintState.restraintDate.value,
      objectid: restraintState.restraintObjectId.value,
      remark: restraintState.restraintRemark.value,
      restraintType: restraintState.restraintType.value,
      taskid: taskState.taskId.value,
    }]
  });
}