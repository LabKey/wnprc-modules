import * as React from "react";
import { useEffect, useState, useContext, useRef } from "react";
import { Button } from "react-bootstrap";
import FeedingForm from "./FeedingForm";
import { Query, ActionURL } from "@labkey/api";
import { AppContext } from "./ContextProvider";
import "../../theme/css/react-datepicker.css";
import "../../theme/css/index.css";
import SubmitModal from "../../components/SubmitModal";
import {
  getAnimalIdsFromLocation,
  groupCommands,
  lookupAnimalInfo,
  saveRowsDirect,
  setupJsonData,
  sleep,
  wait,
} from "../../query/helpers";
import AnimalInfoPane from "../../components/AnimalInfoPane";
import BatchModal from "../../components/BatchModal";
import BulkEditModal from "../../components/BulkEditModal";
import BulkEditFields from "./BulkEditFields";
import ErrorModal from "./ErrorModal";

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
    setEditMode,
    updateFormDataExternal,
    animalInfoCache,
    updateAnimalInfoCacheExternal,
    errorText,
    setErrorTextExternal
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

  //set focus to record only when formdata length changes AND the last record is blank
  useEffect(()=> {
    let el = document.getElementById("id_"+(formData.length-1).toString());
    if (el)
      if (el['value'] == ""){
        el.focus()
      }
  },[formData.length])

  const onSubmit = (e) => {
    e.preventDefault();
    if (formEl.current.checkValidity()) {
      handleShowRewrite(e);
    } else {
      formEl.current.reportValidity();
    }
  };

  const handleShowRewrite = (e) => {
    setShowModal(e.target.id);
  };

  const flipModalState = () => {
    setShowModal("none");
  };

  const addRecord = () => {
    let copyFormData = [...formData];
    copyFormData.push({
      Id: { value: "", error: "" },
      date: { value: new Date(), error: "" },
      type: { value: "", error: "" },
      amount: { value: "", error: "" },
      remark: { value: "", error: "" },
      lsid: { value: "", error: "" },
      command: { value: "insert", error: "" },
      QCStateLabel: { value: "Completed", error: "" },
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

  const validate = () => {
    return new Promise((resolve, reject) => {
      let promises = [];
      try
      {
        for (let record of formData)
        {
          if (animalInfoCache && animalInfoCache[record["Id"]["value"]])
          {
            let animalRecord = animalInfoCache[record["Id"]["value"]];
            if (animalRecord["calculated_status"] == "Dead")
            {
              setErrorTextExternal("Cannot update dead animal record " + record["Id"]["value"]);
              setShowModal("none");
              setShowModal("error");
              //return false;
              resolve(false);
            }
          }
          else
          {
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
              setErrorTextExternal("Cannot update dead animal record: " + result["Id"]);
              resolve(false);
            }
          }
        } catch (err) {
          console.log(JSON.stringify(err));
        }
        resolve(true);
      }).catch((d)=>{
        if (d.rows.length == 0){
          setErrorTextExternal("One or more animals not found. Unable to submit records.")
        } else {
          setErrorTextExternal("Unknown error. Unable to submit records.")
        }
        console.log(d);
        resolve(false);
      });
    });
  };

  function triggerSubmit() {
    //do some validation here
    setSubmitTextBody("One moment. Performing validations...");
    validate().then((d) => {
      if (!d) {
        setShowModal("none");
        setShowModal("error");
        setSubmitTextBody("Submit values?");
        return;
      }

      /*let command = wasSaved || editMode ? "update" : "insert";*/
      setSubmitTextBody("Submitting...");


      let jsonData;
      console.log('grouping stuff... but skipping group cmds');
      try {
        console.log('grouping stuff')
        let itemsToInsert = groupCommands(formData);
        console.log('setting up stuff')
        jsonData = setupJsonData(itemsToInsert, "study", "feeding");
      }catch(err) {
        console.log(JSON.stringify(err))
      }

      console.log('calling save rows');
      saveRowsDirect(jsonData)
        .then((data) => {
          console.log('done!!');
          console.log(JSON.stringify(data));
          setSubmitTextBody("Success!");
          wait(3, setSubmitTextBody).then(() => {
            window.location.href = ActionURL.buildURL(
              "ehr",
              "executeQuery.view?schemaName=study&query.queryName=Feeding",
              ActionURL.getContainer()
            );
          });
        })
        .catch((e) => {
          console.log(e);
          setSubmitTextBody(e.exception);
        });
    });
  }

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
        date: { value: new Date(), error: "" },
        type: { value: "", error: "" },
        amount: { value: "", error: "" },
        remark: { value: "", error: "" },
        lsid: { value: "", error: "" },
        command: { value: "insert", error: "" },
        QCStateLabel: { value: "Completed", error: "" },
      });
    });
    setFormDataExternal(t);
  };

  const passLocationAndSetIds = (location) => {
    const e = getAnimalIdsFromLocation(location).then((f) => {
      setFormIds(f);
    }).catch((e)=> {
      console.log(e)
    });
  };

  const resetErrorText = () => {
    setErrorTextExternal("")
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
            setFormDataExternal(newForm);
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
        <Button
          variant="primary"
          className="wnprc-secondary-btn"
          id="edit-batch"
          disabled={editMode}
          onClick={handleShowRewrite}
        >
          Edit Batch
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
        {showModal == "edit-batch" && (
          <BulkEditModal
            updateFormDataFunction={updateFormDataExternal}
            flipState={flipModalState}
            bulkEditFields={
              <BulkEditFields
                fieldValues={() => {
                }}
              />
            }
          />
        )}
        {showModal == "error" && (
          <ErrorModal
            errorText={errorText}
            flipState={flipModalState}
          />
        )}
        <form className="feeding-form" ref={formEl}>
          {formData.map((item, i) => (
              <div className="row" key={i}>
                <div className="col-xs-10">
                  <div className="row card">
                    <div className="card-header"></div>
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
                    onClick={(e) => {
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
          ))}
          <button
            className={`btn btn-primary submit-btn ${false ? "saving" : ""}`}
            id="submit-all-btn"
            onClick={(e) => onSubmit(e)}
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
