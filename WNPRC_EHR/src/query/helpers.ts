interface jsonDataType {
  commands: Array<any>;
}
import {Query,ActionURL} from '@labkey/api';

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
    for (let [key, entry] of Object.entries(item)){
      let pair = {[key]: entry[valuekey]};
      newobj = {...newobj, ...pair}
    }
    newarray.push(newobj);
  }
  return newarray;
};

export const setupJsonData = (values: any[], schemaName: string, queryName: string) => {
  //for each grouped item (insert, update, delete), set up commands for each diff set.
  let commands =[];
  Object.keys(values).forEach(function(key,index) {
    let rowsToInsert = setupValues(values[key],'Completed', "value");
    commands.push({
      schemaName: schemaName,
      queryName: queryName,
      command: key,
      rows: rowsToInsert
    })
  });

  return {
    commands: commands
  };
};

export const saveRowsDirect = (jsonData: jsonDataType) => {

  return new Promise((resolve, reject) => {
    let options = {
      commands: jsonData.commands,
      containerPath: ActionURL.getContainer(),
      success: (data) => {resolve(data)},
      failure: (data) => {reject(data)},
    };
    Query.saveRows(options);
  });
};

export const wait = (time: number, updateFn: any) => {
  return new Promise(resolve => {
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
    options
): Promise<any> {
  return new Promise((resolve, reject) => {
    options.success = (data) => {resolve(data)};
    options.failure = (data) => {reject(data)};
    Query.selectRows(options);
  });
}

export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
