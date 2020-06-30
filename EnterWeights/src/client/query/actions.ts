//Returns most recent demographics given animal id
import { ConfigProps } from "../typings/main";

interface jsonDataType {
  commands: object;
}

//Expects json row data with commands property, see API docs for saveRows
export function saveWeightActionSaveRowsDirect(jsonData: jsonDataType) {
  return new Promise((resolve, reject) => {
    LABKEY.Query.saveRows({
      commands: jsonData.commands,
      method: "POST",
      containerPath: LABKEY.ActionURL.getContainer(),
      success: data => {
        console.log("success");
        resolve(data);
      },
      failure: data => {
        console.log("error");
        console.log(data);
        reject(data);
      }
    });
  });
}

export function buildQCMap(data) {
  let qcmap = {
    label: {},
    rowid: {}
  };

  let row;
  if (data.rows && data.rows.length) {
    for (let i = 0; i < data.rows.length; i++) {
      row = data.rows[i];
      qcmap.label[row.Label] = row;
      qcmap.rowid[row.RowId] = row;
    }
  }
  return qcmap;
}

export function getQCStateByRowId(qcmap, rowid) {
  if (!qcmap) {
    return null;
  }

  if (!qcmap.rowid[rowid]) {
    console.log(
      "ERROR: QC State associated with the rowId " + rowid + " not found"
    );
    return null;
  }
  return qcmap.rowid[rowid].Label;
}

export function getQCStateByLabel(qcmap, label) {
  if (!qcmap) {
    return null;
  }

  if (!qcmap.label[label]) {
    console.log(
      "ERROR: QC State associated with the rowId " + label + " not found"
    );
    return null;
  }
  return qcmap.label[label].RowId;
}

export function getQCStateMap() {
  return new Promise((resolve, reject) => {
    LABKEY.Query.selectRows({
      containerPath: LABKEY.ActionURL.getContainer(),
      schemaName: "core",
      queryName: "qcState",
      columns: "*",
      scope: this,
      success: function(data) {
        resolve(buildQCMap(data));
      },
      failure: function(data) {
        reject(data);
      }
    });
  });
}

export function labkeyActionSelectWithPromise(
  config: ConfigProps
): Promise<any> {
  return new Promise((resolve, reject) => {
    LABKEY.Query.selectRows({
      schemaName: config.schemaName,
      queryName: config.queryName,
      columns: config.columns,
      sort: config.sort,
      containerPath: config.containerPath || LABKEY.ActionURL.getContainer(),
      filterArray: config.filterArray,
      success: function(data) {
        if (data && data.exception) {
          reject(data);
        }
        resolve(data);
      },
      failure: function(data) {
        reject(data);
      }
    });
  });
}
