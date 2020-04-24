import * as React from "react";
import { useEffect, useState, useContext, useRef } from "react";
import FeedingForm from "./FeedingForm";
import { Query, Security, Filter } from "@labkey/api";
import { AppContext } from "./ContextProvider";
import "../../theme/css/react-datepicker.css";
import "../../theme/css/index.css";
import SubmitModal from "../../components/SubmitModal";
import {groupCommands, labkeyActionSelectWithPromise, saveRowsDirect, setupJsonData, wait} from "../../query/helpers";
import {ActionURL} from '@labkey/api';
import AnimalInfoPane from "../../components/AnimalInfoPane";

const FeedingFormContainer: React.FunctionComponent<any> = (props) => {
  const {
    setQueryDetailsExternal,
    queryDetails,
    setFormDataExternal,
    formData,
  } = useContext(AppContext);
  const [columnData, setColumnData] = useState([]);
  const [columnDataTransformed, setColumnDataTransformed] = useState([]);
  const [showModal, setShowModal] = useState<string>();
  const formEl = useRef(null);
  const [submitTextBody, setSubmitTextBody] = useState("Submit values?");
  const [animalInfo, setAnimalInfo] = useState(null);

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
        setColumnData(result.columns);
      },
    });
  }, []);

  useEffect(() => {
    let newDataArr = [];
    if (columnData.length > 0) {
      //what do i want to here, store in global state?
      newDataArr = columnData.reduce((acc, item) => {
        if (!acc[item.name]) {
          acc[item.name] = [];
        }
        acc[item.name] = item;
        return acc;
      }, {});
      setQueryDetailsExternal(newDataArr);
      console.log(newDataArr["Id"]);
    }
  }, [columnData]);


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

  useEffect(() => {
    let config = {
      schemaName: "study",
      queryName: "demographics",
      sort: "-date",
      filterArray: [
        Filter.create("Id", formData[0]["animalid"]["value"], Filter.Types.EQUAL)
      ]
    };
    console.log(config);
    labkeyActionSelectWithPromise(config).then(data => {
      //cache animal info
      if (data["rows"][0]) {
        setAnimalInfo(data["rows"][0]);
        /*setPrevWeight(data["rows"][0]["Id/MostRecentWeight/MostRecentWeight"]);
        infoState("loading-success");
        validateItems("animalid", animalid);
        setAnimalError("");*/
      } else {
        //TODO propagate up animal not found issue?
        /*infoState("loading-unsuccess");
        setAnimalError("Animal Not Found");
        validateItems("animalid", animalid)*/
      }
    });

  },[formData[0]["animalid"]["value"]])

  return (
    <div className={`content-wrapper-body ${false ? "saving" : ""}`}>
      <div className="col-xs-6 panel panel-portal panel-portal-left">
        <div className="panel-heading">
          <h3>Feeding</h3>
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
              <div className="row">
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
        {animalInfo && <AnimalInfoPane animalInfo={animalInfo} infoState={"loading-success"} />}
      </div>
      <div className="clear"></div>
    </div>
  );
};

export default FeedingFormContainer;
