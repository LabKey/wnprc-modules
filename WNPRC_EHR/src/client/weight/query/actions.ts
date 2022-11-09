//Returns most recent demographics given animal id
import { ConfigProps } from "../typings/main";
import {Query, ActionURL} from "@labkey/api";

interface jsonDataType {
  commands: object;
}

//Expects json row data with commands property, see API docs for saveRows
export function saveWeightActionSaveRowsDirect(jsonData: jsonDataType) {
  return new Promise((resolve, reject) => {


   /* Query.saveRows({
      commands: jsonData.commands,
      method: "POST",
      containerPath: ActionURL.getContainer(),
      success: data => {
        console.log("success");
        resolve(data);
      },
      failure: data => {
        console.log("error");
        console.log(data);
        reject(data);
      }
    });*/
  });
}

export interface qcMapType {
  label: {};
  rowid: {};
}

export function buildQCMap(data: any): qcMapType {
  let qcmap: qcMapType = {
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

export function getQCStateByRowId(qcmap: qcMapType, rowid: number): string {
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

export function getQCStateByLabel(qcmap: qcMapType, label: string): number {
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

export function getQCStateMap(): Promise<any> {
  return new Promise((resolve, reject) => {
    Query.selectRows({
      containerPath: ActionURL.getContainer(),
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
    Query.selectRows({
      schemaName: config.schemaName,
      queryName: config.queryName,
      columns: config.columns,
      sort: config.sort,
      containerPath: config.containerPath || ActionURL.getContainer(),
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
