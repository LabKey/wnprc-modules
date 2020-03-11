import {
  default as React,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";
import { InfoProps, ConfigProps } from "../../typings/main";
import {
  getQCStateByLabel,
  getQCStateByRowId,
  getQCStateMap,
  labkeyActionSelectWithPromise, saveWeightActionSaveRowsDirect
} from "../../query/actions";
import { Button } from "react-bootstrap";
import AnimalInfoPane from "../../components/AnimalInfoPane";
import EnterWeightForm from "./EnterWeightForm";
import {
  getlocations,
  setupWeightValues,
  setupTaskValues,
  setupRestraintValues, groupCommands, checkUniqueIds
} from "../../query/helpers";
import BatchModal from "../../components/BatchModal";
import SubmitModal from "../../components/SubmitModal";
import BulkEditModal from "../../components/BulkEditModal";
import Spinner from "../../components/Spinner";
import SubmitForReviewModal from "../../components/SubmitForReviewModal";
import { AppContext } from "../App/ContextProvider";
import CustomAlert from "../../components/CustomAlert";
import dayjs from "dayjs";

interface RowMemberObj {
  value: any;
  error: string;
}

interface RowObj {
  animalid: RowMemberObj;
  date: RowMemberObj;
  weight?: RowMemberObj;
  remark: RowMemberObj;
  QCState: RowMemberObj;
  objectid: RowMemberObj;
  lsid: RowMemberObj;
  command: RowMemberObj;
  collapsed: RowMemberObj;
  visibility: RowMemberObj;
  restraint: RestraintObj;
}

//TODO add everything thats in the setupRestraintValues (date, taskid)
interface RestraintObj {
  value: string;
  objectid: string;
  weight_objectid: string;
  error: string;
}

export type errorLevels = "no-action" | "saveable" | "submittable";
export type infoStates =
  | "waiting"
  | "loading"
  | "loading-unsuccess"
  | "loading-success";

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Main parent component that holds most of the state.
 */
const EnterWeightFormContainer: React.FunctionComponent<any> = props => {
  const { submit, submitted, setrestraints, restraints } = useContext(AppContext);
  const [animalId, setAnimalId] = useState<string>("");
  const [animalInfo, setAnimalInfo] = useState<InfoProps>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [locloading, setLocLoading] = useState<boolean>(false);
  const [infoState, setInfoState] = useState<infoStates>("waiting");
  const [formdata, setFormData] = useState<Array<RowObj>>([]);
  const [location, setLocation] = useState<Array<string>>([]);
  const [ids, setIds] = useState<Array<string>>([]);
  const [submitBoxText, setSubmitBoxText] = useState<string>("Submit values?");
  const [current, setCurrent] = useState<number>(0);
  const [taskId, setTaskId] = useState<string>(
    LABKEY.Utils.generateUUID().toUpperCase()
  );
  const [wasSaved, setWasSaved] = useState<boolean>(false);
  const [wasError, setWasError] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string>("");
  const [editMode, setEditMode] = useState<boolean>(false);
  const [QCMap, setQCMap] = useState<any>();
  const [reviewer, setReviewer] = useState<string>(LABKEY.Security.currentUser.id);
  const [showAlert, setShowAlert] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<string>();
  const [errorLevel, setErrorLevel] = useState<errorLevels>("no-action");
  const [singleEditMode, setSingleEditMode] = useState(false);

  const formEl = useRef(null);

  //this is triggered by the child component
  const triggerAnimalInfo = (animalinfo: any) => {
    if (animalinfo) {
      setAnimalInfo(animalinfo);
      setLoading(false);
    }
  };

  const triggerLocation = (loc: Array<any>) => {
    setLocation(loc);
  };

  //here we lifted up state from the BulkEditFields - > BatchEditModal -> this component
  const updateValues = vals => {
    const copyformdata: RowObj[] = [...formdata];

    copyformdata.forEach(item => {
      item["weight"] = vals["weight"] ? vals["weight"] : item["weight"];
      item["date"] = vals["date"] ? vals["date"] : item["date"];
      item["restraint"]["value"] = vals["restraint"]["value"] ? vals["restraint"]["value"] : item["restraint"]["value"];
      item["remark"] = vals["remark"] ? vals["remark"] : item["remark"];
    });

    setFormData(copyformdata);
    onValidate();
  };
  const triggerIds = (ids: any) => {
    setFormData([]);
    setIds(ids);
  };

  useEffect(() => {
    if (location.length == 0) {
      return;
    }
    let animaldata: RowObj[] = [];
    setLocLoading(true);
    Promise.all(getlocations(location)).then(d => {
      d.forEach((promise, i) => {
        if (promise["rows"]) {
          promise["rows"].forEach((row, i) => {
            animaldata.push({
              animalid: { value: row.Id, error: "" },
              date: { value: new Date(), error: "" },
              weight: { value: undefined, error: "" },
              remark: { value: "", error: "" },
              objectid: {
                value: LABKEY.Utils.generateUUID().toUpperCase(),
                error: ""
              },
              lsid: { value: "", error: "" },
              QCState: {
                value: getQCStateByLabel(QCMap, "In Progress"),
                error: ""
              },
              command: { value: "insert", error: "" },
              collapsed: { value: true, error: "" },
              visibility: { value: "visible", error: "" },
              restraint: {value: "", error: "", weight_objectid: "", objectid: LABKEY.Utils.generateUUID().toUpperCase()}
            });
          });
        }
      });
      setFormData(animaldata);
      setLocLoading(false);
      setErrorLevel("saveable");
    });
  }, [location]);

  useEffect(() => {
    setFormIds();
  }, [ids]);

  //if we are in edit mode
  useEffect(() => {
    if (
      LABKEY.ActionURL.getParameter("taskid") == null &&
      LABKEY.ActionURL.getParameter("lsid") == null
    ) {
      return;
    }
    //set the ask id
    setEditMode(true);

    //if there's no task id, then we don't have to update the task table... just update the records
    //or more generally if we are in edit mode, we don't have ot update the task id...
    setTaskId(LABKEY.ActionURL.getParameter("taskid"));

    //TODO clean this up
    let filter = [];
    if (LABKEY.ActionURL.getParameter("taskid")) {
      filter.push(
        LABKEY.Filter.create(
          "taskid",
          LABKEY.ActionURL.getParameter("taskid"),
          LABKEY.Filter.EQUAL
        )
      );
    }
    if (LABKEY.ActionURL.getParameter("lsid")) {
      filter.push(
        LABKEY.Filter.create(
          "lsid",
          LABKEY.ActionURL.getParameter("lsid"),
          LABKEY.Filter.EQUAL
        )
      );
    }

    //if we have an lsid but no taskid, this probably means we are editing an individual record,
    //we should not try to insert into taskid table in this case
    if (LABKEY.ActionURL.getParameter("taskid") == null &&
      LABKEY.ActionURL.getParameter("lsid") != null){
      setSingleEditMode(true);
    }

    //TODO what if the url is complete rubbish?

    let config: ConfigProps = {
      schemaName: "study",
      queryName: LABKEY.ActionURL.getParameter("formtype"),
      filterArray: filter,
      columns: "Id,date,weight,remark,objectid,lsid,QCState,taskid"
    };

    let newformdata: RowObj[] = [];
    let newformdatarestraints: RowObj[] = [];
    let tempid = '';
    labkeyActionSelectWithPromise(config).then(data => {

      if (data["rows"].length == 0){
        setWasError(true);
        setErrorText("Cannot find a record with that taskid/lsid.");
        return;
      }

      data["rows"].forEach((row, i) => {
        newformdata.push({
          animalid: { value: row.Id, error: "" },
          date: { value: new Date(row.date), error: "" },
          weight: { value: row.weight, error: "" },
          remark: { value: row.remark || "", error: "" },
          objectid: { value: row.objectid, error: "" },
          lsid: { value: row.lsid, error: "" },
          QCState: { value: row.QCState, error: "" },
          command: { value: "update", error: "" },
          collapsed: { value: i != 0, error: "" },
          visibility: { value: "visible", error: "" },
          restraint: {value: "", error: "", objectid: "", weight_objectid: ""}
        });
        setTaskId(row.taskid);
        tempid = row.objectid;
      });
    }).then(()=> {

      //if theres no lsid/taskid, then we have to get the restraint record using weight objectid
      let filter = [];
      if (LABKEY.ActionURL.getParameter("taskid") == null){
        filter.push(
          LABKEY.Filter.create(
            "weight_objectid",
            tempid,
            LABKEY.Filter.EQUAL
          )
        )
      }

      let config: ConfigProps = {
        schemaName: "study",
        queryName: "restraints",
        filterArray: filter,
        columns: "objectid,weight_objectid,restraintType"
      };

      labkeyActionSelectWithPromise(config).then((data)=> {
        //load up the restraints type into state
        newformdatarestraints = [...newformdata];
          for (const [key, entry] of Object.entries(newformdatarestraints)) {
            for (const [key2, val] of Object.entries(data["rows"])) {
              if (val["weight_objectid"] == entry["objectid"]["value"]){
                newformdatarestraints[key].restraint.objectid = val["objectid"];
                newformdatarestraints[key].restraint.weight_objectid = val["weight_objectid"];
                newformdatarestraints[key].restraint.value = val["restraintType"];
              }
          }
        }
      }).then(() => {
        setFormData(newformdatarestraints);
        setErrorLevel("submittable");
      }).catch((data) => {
        setWasError(true);
        setErrorText("There was an error loading the record.");
      });

    });
  }, []);

  //load up lookupdata
  useEffect( () => {
    let config:ConfigProps = {
      schemaName: "ehr_lookups",
      queryName: "restraint_type",
    };
    labkeyActionSelectWithPromise(config).then((data) => {
      setrestraints(data.rows);
    })
  },[]);

  //mutate the array
  const liftUpVal = (name, value, index) => {
    let newValues = [...formdata];
    newValues[index][name]["value"] = value;
    setFormData(newValues);
    console.log(errorLevel);
  };

  const liftUpInfoState = (state: infoStates) => {
    setInfoState(state);
  };

  const onSubmit = e => {
    e.preventDefault();
    if (formEl.current.checkValidity()) {
      handleShowRewrite(e);
    } else {
      formEl.current.reportValidity();
    }
  };

  const onSubmitForReview = e => {
    e.preventDefault();
    if (formEl.current.checkValidity()) {
      handleShowRewrite(e);
    } else {
      formEl.current.reportValidity();
    }
  };

  const onValidate = () => {
    //e.preventDefault();
    //formEl.current.reportValidity();
    //TODO check all the fields
    let copyformdata = [...formdata];
    let checkdata = true;
    copyformdata.forEach(item => {
      //trigger validation in child?
      if (item["weight"]["value"] == ""){
        checkdata = false;
      }
    });
    if (checkdata){
      setErrorLevel("submittable");
    }

  };

  const changeActionToUpdate = () => {
    let copyformdata = [...formdata];
    copyformdata.forEach(item => {
      if (item["command"]["value"] != "delete") {
        item["command"]["value"] = "update";
      }
    });
    setFormData(copyformdata);
  };

  const setupJsonData = (values, QCState, taskId, reviewer, date, command) => {
    //for each grouped item (insert, update, delete), set up commands for each diff set.
    let commands =[];
    Object.keys(values).forEach(function(key,index) {
      let valuesToInsert = setupWeightValues(values[key], QCState, taskId);
      commands.push({
        schemaName: "study",
        queryName: "weight",
        command: key,
        rows: valuesToInsert
      })
    });

    let taskValue = setupTaskValues(taskId, date, reviewer, QCState);
    commands.push({
      schemaName: "ehr",
      queryName: "tasks",
      command: command,
      rows: taskValue
    });


    Object.keys(values).forEach(function(key,index) {
      let valuesToInsert = setupRestraintValues(values[key], taskId);
      commands.push({
        schemaName: "study",
        queryName: "restraints",
        command: key,
        rows: valuesToInsert
      })
    });
    //TODO add trackids somewhere
    /*if (!checkUniqueIds(trackIds)) {
      //find which index is affected and return it to the correct area?
      alert("Cannot insert duplicate animals per weight form.");
      return;
    }*/
    return {
      commands: commands
    };
  };

  const onSave = e => {
    e.preventDefault();
    //to animate the popup
    setSaving(true);
    let command = wasSaved || editMode ? "update" : "insert";
    //if we are in edit mode, just grab current QCState of a record...
    //TODO think about this qcstate implementation a bit more since the qc state gets saved "globally"
    // (see saveWeights function)...
    let QCState = "";
    if (editMode) {
      QCState = getQCStateByRowId(QCMap, formdata[0]["QCState"]);
    } else {
      QCState = "In Progress";
    }

    let itemsToInsert = groupCommands(formdata);
    let currentDate = dayjs(new Date()).format();
    let jsonData = setupJsonData(itemsToInsert, QCState, taskId, reviewer, currentDate, command);

    saveWeightActionSaveRowsDirect(jsonData).then(()=> {
      setWasSaved(true);
      setSaving(false);
      //need to set each record to update
      changeActionToUpdate();
      window.scrollTo(0,0);
    }).catch(()=>{
      setWasError(true);
      setErrorText("Error during operation.");
      window.scrollTo(0,0);
    });

  };

  const wait = time => {
    return new Promise(resolve => {
      let countdown = time;
      setInterval(() => {
        setSubmitBoxText("Success! Redirecting in..." + countdown);
        countdown--;
        if (countdown == 0) {
          resolve();
        }
      }, 1000);
    });
  };

  const triggerSubmit = () => {
    let command = wasSaved || editMode ? "update" : "insert";
    setSubmitBoxText("Submitting...");

    let itemsToInsert = groupCommands(formdata);
    let currentDate = dayjs(new Date()).format();
    let jsonData = setupJsonData(itemsToInsert, "Completed", taskId, reviewer, currentDate, command);

    saveWeightActionSaveRowsDirect(jsonData).then(()=> {
      wait(3).then(() => {
        window.location = LABKEY.ActionURL.buildURL(
          "ehr",
          "executeQuery.view?schemaName=study&query.queryName=weight",
          LABKEY.ActionURL.getContainer()
        );
      }).catch(e => {
          setSubmitBoxText(e);
        });
      submit();
    });

  };

  useEffect(() => {
    let initialdata: RowObj[] = [];
    initialdata.push({
      animalid: { value: "", error: "" },
      date: { value: new Date(), error: "" },
      weight: { value: undefined, error: "" },
      remark: { value: "", error: "" },
      objectid: { value: LABKEY.Utils.generateUUID().toUpperCase(), error: "" },
      lsid: { value: "", error: "" },
      QCState: {
        value: getQCStateByLabel(QCMap, "In Progress") || 2,
        error: ""
      },
      command: { value: "insert", error: "" },
      collapsed: { value: false, error: "" },
      visibility: { value: "visible", error: "" },
      restraint: {value: "None", error: "", objectid: LABKEY.Utils.generateUUID().toUpperCase(), weight_objectid: ""}
    });
    setFormData(initialdata);
    getQCStateMap().then(map => {
      setQCMap(map);
    });
  }, []);

  const setFormIds = () => {
    let t: RowObj[] = [];
    ids.forEach((id, i) => {
      t.push({
        animalid: { value: id, error: "" },
        date: { value: new Date(), error: "" },
        weight: { value: undefined, error: "" },
        remark: { value: "", error: "" },
        objectid: {
          value: LABKEY.Utils.generateUUID().toUpperCase(),
          error: ""
        },
        lsid: { value: "", error: "" },
        QCState: {
          value: getQCStateByLabel(QCMap, "In Progress") || 2,
          error: ""
        },
        command: { value: "insert", error: "" },
        collapsed: { value: false, error: "" },
        visibility: { value: "visible", error: "" },
        restraint: {value: "", error: "", objectid: LABKEY.Utils.generateUUID().toUpperCase(), weight_objectid: ""}
      });
    });
    setFormData(t);
  };

  const toggleCollapse = (item, i) => {
    let copyitem = [...item];
    copyitem["collapsed"]["value"] = false;
    if (copyitem["collapsed"]["value"] == false) {
      copyitem["collapsed"]["value"] = true;
    } else {
      copyitem["collapsed"]["value"] = false;
    }
    let copyformdata = [...formdata];
    //TODO fix this...
    copyformdata[i] = (copyitem as unknown) as RowObj;
    setFormData(copyformdata);
    return true;
  };

  const addRecord = () => {
    let copyformdata = [...formdata];
    copyformdata.push({
      animalid: { value: "", error: "" },
      date: { value: new Date(), error: "" },
      weight: { value: undefined, error: "" },
      remark: { value: "", error: "" },
      objectid: { value: LABKEY.Utils.generateUUID().toUpperCase(), error: "" },
      lsid: { value: "", error: "" },
      QCState: {
        value: getQCStateByLabel(QCMap, "In Progress") || 2,
        error: ""
      },
      command: { value: "insert", error: "" },
      collapsed: { value: false, error: "" },
      visibility: { value: "visible", error: "" },
      restraint: {value: "None", error: "", objectid: "", weight_objectid: ""}
    });
    return copyformdata;
  };

  const triggerSubmitForReview = () => {
    let command = wasSaved || editMode ? "update" : "insert";

    let itemsToInsert = groupCommands(formdata);
    let currentDate = dayjs(new Date()).format();
    let jsonData = setupJsonData(itemsToInsert, "In Progress", taskId, reviewer, currentDate, command);

    saveWeightActionSaveRowsDirect(jsonData)
      .then(data => {
        //TODO wait til this is done rather than sleep
        submit();
        wait(4).then(() => {
          window.location = LABKEY.ActionURL.buildURL(
            "ehr",
            "executeQuery.view?schemaName=study&query.queryName=weight",
            LABKEY.ActionURL.getContainer()
          );
        });
      })
      .catch(e => {
        setSubmitBoxText(e);
      });
  };

  const triggerReviewer = id => {
    setReviewer(id);
  };

  const onAlertClose = () => {
    setShowAlert(false);
  };

  //when this is called, just get the id and set which modal to show
  const handleShowRewrite = e => {
    setShowModal(e.target.id);
  };

  const flipModalState = () => {
    setShowModal("none");
  };

  const triggerUpAnyErrors = e => {
    setErrorLevel(e);
  };

  return (
    <div className={`content-wrapper-body ${saving ? "saving" : ""}`}>
      {wasSaved && (
        <CustomAlert
          body="Saved!"
          variant="success"
          show={showAlert}
          onClose={onAlertClose}
          dismissable={true}
        />
      )}
      {wasError && (
        <CustomAlert
          body={errorText}
          variant="danger"
          show={showAlert}
          onClose={onAlertClose}
          dismissable={true}
        />
      )}
      <div className="col-xs-6 panel panel-portal panel-portal-left">
        <div className="panel-heading">
          <h3>Weights</h3>
        </div>
        <Button
          variant="primary"
          className="wnprc-secondary-btn"
          id="add-record"
          disabled={singleEditMode}
          onClick={() => {
            let newform = addRecord();
            let index = formdata.length;
            setFormData(newform);
            setCurrent(index);
          }}
        >
          Add record
        </Button>
        <Button
          variant="primary"
          className="wnprc-secondary-btn"
          id="edit-batch"
          onClick={handleShowRewrite}
        >
          Bulk Edit
        </Button>
        <Button
          variant="primary"
          className="wnprc-secondary-btn"
          id="add-batch"
          disabled={singleEditMode}
          onClick={handleShowRewrite}
        >
          Add Batch
        </Button>
        <Button
          variant="primary"
          className="wnprc-secondary-btn"
          id="delete-record"
          disabled={singleEditMode}
          onClick={() => {
            setFormData([]);
            setAnimalInfo(null);
            setInfoState("waiting");
          }}
        >
          Delete All
        </Button>
        {showModal == "submit-all-btn" && (
          <SubmitModal
            name="final"
            title="Submit All"
            submitAction={triggerSubmit}
            bodyText={submitBoxText}
            submitText="Submit final"
            enabled={true}
            flipState={flipModalState}
          />
        )}
        {showModal == "submit-review-btn" && (
          <SubmitForReviewModal
            action={triggerSubmitForReview}
            setreviewer={triggerReviewer}
            flipState={flipModalState}
          />
        )}
        {showModal == "edit-batch" && (
          <BulkEditModal
            liftUpBulkValues={updateValues}
            flipState={flipModalState}
            restraints={restraints}
          />
        )}
        {showModal == "add-batch" && (
          <BatchModal
            setLocation={triggerLocation}
            setIds={triggerIds}
            flipState={flipModalState}
          />
        )}
        <form className="weights-form" ref={formEl}>

          {locloading ? (
            <Spinner text={"Loading..."} />
          ) : (
            <div>
              {formdata
                .filter(item => item.command.value != "delete")
                .map((item, i) => (
                  <div className={`row ${item.visibility.value}`} key={i}>
                    <div className="col-xs-10">
                      <div className="row card" key={i}>
                        <div
                          className="card-header"
                          data-toggle="collapse"
                          aria-controls={`#collapse${i}`}
                          aria-expanded="true"
                          data-target={`#collapse${i}`}
                          id={`heading${i}`}
                        >
                          <button
                            className="btn btn-link"
                            type="button"
                            onClick={e => {
                              if (
                                e.currentTarget.className.localeCompare(
                                  "remove-record-button"
                                ) != 0
                              ) {
                                toggleCollapse(item, i);
                              }
                              setAnimalId(item.animalid.value);
                            }}
                          >
                            <h4 className="card-header">
                              Animal: {item.animalid.value}{" "}
                            </h4>
                          </button>
                        </div>
                        <div
                          id={`collapse${i}`}
                          className={`collapse ${
                            item.collapsed.value ? "" : "in"
                          }`}
                          aria-labelledby={`heading${i}`}
                          data-parent="#accordionExample"
                        >
                          <div className="card-body">
                            <EnterWeightForm
                              liftUpAnimalInfo={triggerAnimalInfo}
                              key={i}
                              index={i}
                              animalid={item.animalid.value}
                              weight={item.weight.value}
                              date={item.date.value}
                              remark={item.remark.value}
                              restraint={item.restraint.value}
                              liftUpVal={liftUpVal}
                              infoState={liftUpInfoState}
                              liftUpErrorLevel={triggerUpAnyErrors}
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
                          let copyformdata = [...formdata];
                          copyformdata[i]["visibility"]["value"] =
                            "hide-record";
                          setFormData(copyformdata);
                          sleep(750).then(() => {
                            let copyformdata = [...formdata];
                            //only need to do this part if we are in wasSaved or editMode, otherwise we can splice.
                            if (wasSaved || editMode) {
                              copyformdata[i]["command"]["value"] = "delete";
                            } else {
                              copyformdata.splice(i, 1);
                            }
                            setFormData(copyformdata);
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
            </div>
          )}
          <div className="row">
            <button
              className={`btn btn-primary submit-btn ${saving ? "saving" : ""}`}
              id="submit-all-btn"
              onClick={e => onSubmit(e)}
              disabled={errorLevel !== "submittable"}
            >
              Submit all
            </button>
            <button
              className={`btn btn-primary submit-btn ${saving ? "saving" : ""}`}
              id="save-draft-btn"
              onClick={e => onSave(e)}
              disabled={errorLevel == "no-action"}
            >
              Save Draft
            </button>
            <button
              className={`btn btn-primary submit-btn ${saving ? "saving" : ""}`}
              id="submit-review-btn"
              onClick={e => onSubmitForReview(e)}
              disabled={errorLevel !== "submittable"}
            >
              Submit for Review
            </button>
          </div>
        </form>
      </div>
      <div className="col-xs-5 panel panel-portal animal-info-pane">
        <div className="panel-heading">
          <h3>Animal Info</h3>
        </div>
        <AnimalInfoPane animalInfo={animalInfo} infoState={infoState} />
      </div>
      <div className="clear"></div>
    </div>
  );
};

export default EnterWeightFormContainer;
