import * as React from "react";
import {createContext, useEffect, useState} from "react";
import {checkEditMode, labkeyActionSelectWithPromise} from "../../query/helpers";
import {Query, ActionURL, Filter} from "@labkey/api";

interface ContextProps {
  setQueryDetailsExternal: any;
  queryDetails: any;
  setFormDataExternal: any;
  formData: any;
  animalInfo: any;
  setAnimalInfoExternal: any;
  animalInfoState: any;
  setAnimalInfoStateExternal: any;
  editMode: any;
  setEditMode: any;
}

const AppContext = createContext({} as ContextProps);

const ContextProvider: React.FunctionComponent = ({ children }) => {
  const [queryDetails, setQueryDetails] = useState(null);
  const [formData, setFormData] = useState([{
    Id: { value: "" },
    date: { value: new Date() },
    type: { value: "" },
    amount: { value: "" },
    remark: { value: "" },
    lsid: { value: "" },
    command: {value: "insert"},
    QCStateLabel: {value: "Completed"}
  }]);
  const [editMode, setEditMode] = useState(false);
  const [animalInfo, setAnimalInfo] = useState(null);
  const [animalInfoState, setAnimalInfoState] = useState("waiting");

  const setQueryDetailsExternal = (qd) => {
    setQueryDetails(qd);
  };
  const setFormDataExternal = (fd) => {
    setFormData(fd);
  };
  const setAnimalInfoExternal = (ai) => {
    setAnimalInfo(ai);
  };
  const setAnimalInfoStateExternal = (ais) => {
    setAnimalInfoState(ais);
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
    animalInfoState
  };

  useEffect( () => {
    setEditMode(checkEditMode);
  },[]);

  useEffect( () => {
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

    let options = {
      schemaName: "study",
      queryName: "feeding",
      filterArray: filter,
      columns: "Id,date,type,amount,remark,lsid,QCState"
    };

    let newformdata = [];

    labkeyActionSelectWithPromise(options).then(data => {

      if (data["rows"].length == 0){
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
          command: { value: "update", error: "" }
        });
      });
      setFormDataExternal(newformdata);
    })
  },[editMode]);

  return (
    <AppContext.Provider value={defaultContext}>{children}</AppContext.Provider>
  );
};

export { AppContext, ContextProvider };
