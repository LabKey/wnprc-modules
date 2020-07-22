import * as React from "react";
import { createContext, useEffect, useState } from "react";
import {
  checkEditMode,
  labkeyActionSelectWithPromise,
} from "../../query/helpers";
import { ActionURL, Filter } from "@labkey/api";
import {
  ConfigProps,
  ContextProps,
  InfoProps,
  infoStates,
  RowObj,
} from "../typings/main";

const AppContext = createContext({} as ContextProps);

const ContextProvider: React.FunctionComponent = ({ children }) => {
  const [queryDetails, setQueryDetails] = useState(null);
  //introduce type of field here?
  const [formData, setFormData] = useState<Array<RowObj>>([
    {
      Id: { value: "", error: "" },
      date: { value: new Date(), error: "" },
      type: { value: "", error: "" },
      amount: { value: "", error: "" },
      remark: { value: "", error: "" },
      lsid: { value: "", error: "" },
      command: { value: "insert", error: "" },
      QCStateLabel: { value: "Completed", error: "" },
    },
  ]);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [animalInfo, setAnimalInfo] = useState<InfoProps>(null);
  const [animalInfoState, setAnimalInfoState] = useState<infoStates>("waiting");
  const [feedingTypes, setFeedingTypes] = useState<Array<any>>();
  const [animalIds, setAnimalIds] = useState<Array<any>>();
  const [locations, setLocations] = useState<Array<any>>();
  const [bulkEditValues, setBulkEditValues] = useState<any>();
  const [animalInfoCache, updateAnimalInfoCache] = useState<any>();
  const [errorText, setErrorText] = useState<string>("");

  const setQueryDetailsExternal = (qd) => {
    setQueryDetails(qd);
  };
  const setFormDataExternal = (fd) => {
    setFormData(fd);
  };

  const setBulkEditValuesExternal = (bev) => {
    setBulkEditValues(bev);
  };

  const updateAnimalInfoCacheExternal = (ai) => {
    let animalInfoCacheNew = {[ai["Id"]]: ai};
    let animalInfoCacheUpdated = {...animalInfoCache, ...animalInfoCacheNew}
    updateAnimalInfoCache(animalInfoCacheUpdated);
  }

  const updateFormDataExternal = () => {
    //take the form data and update the values?
    const copyformdata: RowObj[] = [...formData];

    copyformdata.forEach((item) => {
      item["date"] =
        bulkEditValues["date"]["value"] != ""
          ? Object.assign({}, bulkEditValues["date"])
          : Object.assign({}, item["date"]);
      item["type"] =
        bulkEditValues["type"]["value"] != ""
          ? Object.assign({}, bulkEditValues["type"])
          : Object.assign({}, item["type"]);
      item["amount"] =
        bulkEditValues["amount"]["value"] != ""
          ? Object.assign({}, bulkEditValues["amount"])
          : Object.assign({}, item["amount"]);
    });

    setFormData(copyformdata);
  };

  const setAnimalInfoExternal = (ai) => {
    setAnimalInfo(ai);
  };
  const setAnimalInfoStateExternal = (ais) => {
    setAnimalInfoState(ais);
  };

  const setAnimalIdsExternal = (ids) => {
    setAnimalIds(ids);
  };

  const setErrorTextExternal = (et) => {
    setErrorText(et);
  }

  const constructObject = (key, val) => {
    let add;
    if (key == "date") {
      add = { [key]: { value: new Date(val) } };
    } else {
      add = { [key]: { value: val } };
    }
    return add;
  };

  const defaultContext = {
    setQueryDetailsExternal,
    queryDetails,
    setFormDataExternal,
    formData,
    setAnimalInfoExternal,
    animalInfo,
    editMode,
    setEditMode,
    setAnimalInfoStateExternal,
    animalInfoState,
    feedingTypes,
    setAnimalIdsExternal,
    animalIds,
    updateFormDataExternal,
    setBulkEditValuesExternal,
    animalInfoCache,
    updateAnimalInfoCacheExternal,
    errorText,
    setErrorTextExternal
  };

  useEffect(() => {
    setEditMode(checkEditMode);
  }, []);

  useEffect(() => {
    let options: ConfigProps = {
      schemaName: "ehr_lookups",
      queryName: "feeding_types",
    };
    labkeyActionSelectWithPromise(options).then((res) => {
      setFeedingTypes(res.rows);
    });
  }, []);

  useEffect(() => {
    if (!editMode) return;

    let filter = [];
    if (ActionURL.getParameter("lsid")) {
      filter.push(
        Filter.create(
          "lsid",
          ActionURL.getParameter("lsid"),
          Filter.Types.EQUAL
        )
      );
    }

    let options: ConfigProps = {
      schemaName: "study",
      queryName: "feeding",
      filterArray: filter,
      columns: "Id,date,type,type,amount,remark,lsid,QCState",
    };

    let newformdata: Array<RowObj> = [];

    labkeyActionSelectWithPromise(options).then((data) => {
      if (data["rows"].length == 0) {
        //setWasError(true);
        //setErrorText("Cannot find a record with that taskid/lsid.");
        return;
      }

      data["rows"].forEach((row, i) => {
        newformdata.push({
          Id: { value: row.Id, error: "" },
          date: { value: new Date(row.date), error: "" },
          type: { value: row.type, error: "" },
          remark: { value: row.remark || "", error: "" },
          amount: { value: row.amount, error: "" },
          lsid: { value: row.lsid, error: "" },
          QCState: { value: row.QCState, error: "" },
          command: { value: "update", error: "" },
        });

        /*build up correct form data... need special command here though.

        let struct =  {
          0: "Id",
          1: "date",
          2: "type",
          3: "remark",
          4: "amount",
          5: "lsid",
          6: "QCState"
        };
        let obj:RowObj;
        for (let [key, entry] of Object.entries(struct) ) {
          let add = constructObject(entry, row[entry]);
          obj = {...obj, ...add};
        }
        let addCommand = constructObject("command", "update");
        obj = {...obj, ...addCommand};
        let addQC = constructObject("QCStateLabel", "Completed");
        obj = {...obj, ...addQC};
        newformdata.push(obj);*/
      });
      setFormDataExternal(newformdata);
    });
  }, [editMode]);

  return (
    <AppContext.Provider value={defaultContext}>{children}</AppContext.Provider>
  );
};

export { AppContext, ContextProvider };
