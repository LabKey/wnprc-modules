import * as React from "react";
import { useEffect, useState, useContext, useRef } from "react";
import {Button} from "react-bootstrap";
import FeedingForm from "./FeedingForm";
import { Query, Security, Filter } from "@labkey/api";
import { AppContext } from "./ContextProvider";
import "../../theme/css/react-datepicker.css";
import "../../theme/css/index.css";
import SubmitModal from "../../components/SubmitModal";
import {
  checkEditMode,
  groupCommands,
  labkeyActionSelectWithPromise,
  saveRowsDirect,
  setupJsonData, sleep,
  wait
} from "../../query/helpers";
import {ActionURL} from '@labkey/api';
import AnimalInfoPane from "../../components/AnimalInfoPane";

const FeedingFormContainer: React.FunctionComponent<any> = (props) => {
  const {
    setQueryDetailsExternal,
    queryDetails,
    setFormDataExternal,
    formData,
    setAnimalInfoExternal,
    animalInfo,
    setAnimalInfoStateExternal,
    animalInfoState

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
    //TODO
    //copyformdata[i]["visibility"]["value"] ="hide-record";
    setFormDataExternal(copyformdata);
    sleep(750).then(() => {
      let copyformdata = [...formData];
      //only need to do this part if we are in wasSaved or editMode, otherwise we can splice.
      //TODO
      /*if (wasSaved || editMode) {
        copyformdata[i]["command"]["value"] = "delete";
      } else {
        copyformdata.splice(i, 1);
      }*/
      copyformdata.splice(i, 1);
      //the validity of this record is no longer valid, so set the error level to whatever it was
      setFormDataExternal(copyformdata);
      //TODO
      //onValidate();
    });
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
            "ehr",
            "executeQuery.view?schemaName=study&query.queryName=Feeding",
            ActionURL.getContainer()
        );
      });
    }).catch(e => {
      console.log(e);
      setSubmitTextBody(e.exception)
    });
  };


  return (
    <div className={`content-wrapper-body ${false ? "saving" : ""}`}>
      <div className="col-xs-6 panel panel-portal panel-portal-left">
        <div className="panel-heading">
          <h3>Data entry</h3>
        </div>
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
        <form className="feeding-form" ref={formEl}>
          {formData.map((item, i) => (
            <div>
              <div className="row" key={i}>
                <div className="col-xs-12">
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
              </div>
            </div>
          ))}
        <button
          className={`btn btn-primary submit-btn ${false ? "saving" : ""}`}
          id="submit-all-btn"
          onClick={e => onSubmit(e)}
          /*disabled={errorLevel !== "submittable"}*/
        >
          Submit all
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
