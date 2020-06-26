import * as React from "react";
import { useEffect, useState, useContext, useRef } from "react";
import {Button} from "react-bootstrap";
import FeedingForm from "./FeedingForm";
import { Query, Security, Filter, Utils} from "@labkey/api";
import { AppContext } from "./ContextProvider";
import "../../theme/css/react-datepicker.css";
import "../../theme/css/index.css";
import SubmitModal from "../../components/SubmitModal";
import {
  checkEditMode, getAnimalIdsFromLocation,
  groupCommands,
  labkeyActionSelectWithPromise,
  saveRowsDirect,
  setupJsonData, sleep,
  wait
} from "../../query/helpers";
import {ActionURL} from '@labkey/api';
import AnimalInfoPane from "../../components/AnimalInfoPane";
import BatchModal from "../../components/BatchModal";

const FeedingFormContainer: React.FunctionComponent<any> = (props) => {
  const {
    setQueryDetailsExternal,
    queryDetails,
    setFormDataExternal,
    formData,
    setAnimalInfoExternal,
    animalInfo,
    setAnimalInfoStateExternal,
    animalInfoState,
    setAnimalIdsExternal,
      animalIds,
    editMode,
      setEditMode
  } = useContext(AppContext);
  const [showModal, setShowModal] = useState<string>();
  const formEl = useRef(null);
  const [submitTextBody, setSubmitTextBody] = useState("Submit values?");

  //mutate the array
  const liftUpVal = (name, value) => {
    const newValues = Object.assign({}, formData);
    newValues[name]["value"] = value;
    setFormDataExternal(newValues);
  };

  useEffect(() => {
    Query.getQueryDetails({
      schemaName: "study",
      queryName: "feeding",
      success: (result) => {
        let columnData = result.columns;
        if (columnData.length > 0) {
          //make an object whos keys are the column names
          let newDataArr = columnData.reduce((acc, item) => {
            if (item.required && !item.autoIncrement){
              console.log(item.name);
            }
            if (!acc[item.name]) {
              acc[item.name] = [];
            }
            acc[item.name] = item;
            return acc;
          }, {});
          setQueryDetailsExternal(newDataArr);
        }
      },
    });
  }, []);

  const onSubmit = e => {
    e.preventDefault();
    if (formEl.current.checkValidity()) {
      handleShowRewrite(e);
    } else {
      formEl.current.reportValidity();
    }
  };

  const handleShowRewrite = e => {
    setShowModal(e.target.id);
  };

  const flipModalState = () => {
    setShowModal("none");
  };

  const addRecord = () => {
    let copyFormData = [...formData];
    copyFormData.push({
      Id: { value: "", error: "" },
      date: { value: new Date() , error: ""},
      type: { value: "", error: "" },
      amount: { value: "", error: "" },
      remark: { value: "", error: "" },
      lsid: { value: "", error: "" },
      command: {value: "insert", error: ""},
      QCStateLabel: {value: "Completed", error: ""}
    });
    return copyFormData;
  };

  const removeRecord = (i) => {
    let copyformdata = [...formData];
    //only need to do this part if we are in wasSaved or editMode, otherwise we can splice.
    //TODO cover edit mode
    copyformdata.splice(i, 1);
    //the validity of this record is no longer valid, so set the error level to whatever it was
    setFormDataExternal(copyformdata);
    /*onValidate();*/
  };

  const triggerSubmit = () => {
    /*let command = wasSaved || editMode ? "update" : "insert";*/
    setSubmitTextBody("Submitting...");

    let itemsToInsert = groupCommands(formData);
    let jsonData = setupJsonData(itemsToInsert, 'study', 'feeding');

    saveRowsDirect(jsonData).then((data) => {
      console.log(data);
      setSubmitTextBody("Success!");
      wait(3, setSubmitTextBody).then(() => {
        window.location.href = ActionURL.buildURL(
            "wnprc_ehr",
            "dataEntry",
            ActionURL.getContainer()
        );
      });
    }).catch(e => {
      console.log(e);
      setSubmitTextBody(e.exception)
    });
  };

  /*const triggerLocation = (loc: Array<any>) => {
    setLocation(loc);
  };*/

  const setFormIds = (ids: any) => {
    setFormDataExternal([]);
    setAnimalIdsExternal(ids);
      let t = [];
      ids.forEach((id, i) => {
        t.push({
          Id: { value: id, error: "" },
          date: { value: new Date() , error: ""},
          type: { value: "", error: "" },
          amount: { value: "", error: "" },
          remark: { value: "", error: "" },
          lsid: { value: "", error: "" },
          command: {value: "insert", error: ""},
          QCStateLabel: {value: "Completed", error: ""}
        });
      });
    setFormDataExternal(t);
  };

  const passLocationAndSetIds = (location) => {
    const e = getAnimalIdsFromLocation(location).then((f)=>{
      console.log(f);
      setFormIds(f);
    });
  }


  return (
    <div className={`content-wrapper-body ${false ? "saving" : ""}`}>
      <div className="col-xs-6 panel panel-portal panel-portal-left">
        <div className="panel-heading">
          <h3>Data entry</h3>
        </div>
        <Button
            variant="primary"
            className="wnprc-secondary-btn"
            id="add-record"
            disabled={editMode}
            onClick={() => {
              let newForm = addRecord();
              setFormDataExternal(newForm)
              /*let index = formdata.length;
              setCurrent(index);*/
            }}
        >
          Add record
        </Button>
        <Button
            variant="primary"
            className="wnprc-secondary-btn"
            id="add-batch"
            disabled={editMode}
            onClick={handleShowRewrite}
        >
          Add Batch
        </Button>

        {showModal == "submit-all-btn" && (
            <SubmitModal
                name="final"
                title="Submit All"
                submitAction={triggerSubmit}
                bodyText={submitTextBody}
                submitText="Submit final"
                enabled={true}
                flipState={flipModalState}
            />
        )}
        {showModal == "add-batch" && (
            <BatchModal
                setLocation={passLocationAndSetIds}
                setIds={setFormIds}
                flipState={flipModalState}
            />
        )}
        <form className="feeding-form" ref={formEl}>
          {formData.map((item, i) => (
            <div>
              <div className="row" key={i}>
                <div className="col-xs-10">
                  <div className="row card">
                    <div className="card-header">
                    </div>
                    <div>
                      <div className="card-body">
                        <FeedingForm
                          liftUpValue={liftUpVal}
                          values={item}
                          index={i}
                          key={i}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-xs-2">
                  <button
                      className="remove-record-button"
                      id={`remove-record-btn_${i}`}
                      type="button"
                      title="Remove Record"
                      aria-label="Close"
                      onClick={e => {
                        let copyformdata = [...formData];
                        /*copyformdata[i]["visibility"]["value"] =
                            "hide-record";*/
                        setFormDataExternal(copyformdata);
                        sleep(100).then(() => {
                          removeRecord(i);
                        });
                      }}
                  >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                    >
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        <button
          className={`btn btn-primary submit-btn ${false ? "saving" : ""}`}
          id="submit-all-btn"
          onClick={e => onSubmit(e)}
          /*disabled={errorLevel !== "submittable"}*/
        >
          Submit
        </button>
        </form>
      </div>
      <div className="col-xs-5 panel panel-portal animal-info-pane">
        <div className="panel-heading">
          <h3>Animal Info</h3>
        </div>
        <AnimalInfoPane animalInfo={animalInfo} infoState={animalInfoState} />
      </div>
      <div className="clear"></div>
    </div>
  );
};

export default FeedingFormContainer;
