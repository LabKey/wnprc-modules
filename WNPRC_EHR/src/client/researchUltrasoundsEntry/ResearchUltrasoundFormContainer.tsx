import * as React from "react";
import { useEffect, useState, useContext, useRef } from "react";
//import { AppContext } from "./ContextProvider.tsx";
import "../theme/css/react-datepicker.css";
import "../theme/css/index.css";
import SubmitModal from "../components/SubmitModal";
import {
    groupCommands,
    lookupAnimalInfo,
    setupJsonData,
} from "../query/helpers";
import AnimalInfoPane from "../components/AnimalInfoPane";
import {TaskPane} from "../components/TaskPane";
import { ResearchUltrasounds } from './ResearchUltrasounds';
import {AppContext} from './ContextProvider';
import {RestraintPane} from '../components/RestraintPane';
import ErrorModal from '../feeding/base/ErrorModal';


export const ResearchUltrasoundFormContainer: React.FunctionComponent<any> = (props) => {
    const {animalInfo, animalInfoState, taskStatus, taskTitle,validId, formData, animalInfoCache, setAnimalInfoCache} = useContext(AppContext);

    // States for each subcomponent on the page. Each of their states will propagate upwards into these states
    const [taskPaneState, setTaskPaneState] = useState({});
    const [researchPaneState, setResearchPaneState] = useState({});
    const [restraintPaneState, setRestraintPaneState] = useState({});

    const [errorText, setErrorText] = useState<string>("");
    const [showModal, setShowModal] = useState<string>();
    const [submitTextBody, setSubmitTextBody] = useState("Submit values?");

    //"study", "research_ultrasounds", "Research Ultrasounds"

    const validate = () => {
        return new Promise((resolve, reject) => {
            let promises = [];
            console.log("formData: ", formData);
            console.log("animalCache: ", animalInfoCache);
            try
            {
                for (let record of formData)
                {
                    console.log("record: ", record);
                    if (animalInfoCache && animalInfoCache[record["Id"]["value"]])
                    {
                        let animalRecord = animalInfoCache[record["Id"]["value"]];
                        if (animalRecord["calculated_status"] == "Dead")
                        {
                            setErrorText("Cannot update dead animal record " + record["Id"]["value"]);
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
                            setErrorText("Cannot update dead animal record: " + result["Id"]);
                            resolve(false);
                        }
                    }
                } catch (err) {
                    console.log(JSON.stringify(err));
                }
                resolve(true);
            }).catch((d)=>{
                if (d.rows.length == 0){
                    setErrorText("One or more animals not found. Unable to submit records.")
                } else {
                    setErrorText("Unknown error. Unable to submit records.")
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
                jsonData = setupJsonData(itemsToInsert, "study", "research_ultrasounds");
            }catch(err) {
                console.log(JSON.stringify(err))
            }
            console.log(jsonData);
            /*
            console.log('calling save rows');
            saveRowsDirect(jsonData)
                .then((data) => {
                    console.log('done!!');
                    console.log(JSON.stringify(data));
                    setSubmitTextBody("Success!");
                    wait(3, setSubmitTextBody).then(() => {
                        window.location.href = ActionURL.buildURL(
                            "ehr",
                            "executeQuery.view?schemaName=study&query.queryName=research_ultrasounds",
                            ActionURL.getContainer()
                        );
                    });
                })
                .catch((e) => {
                    console.log(e);
                    setSubmitTextBody(e.exception);
                }); */
        });
    }

    // Form submission handler
    const handleSubmit = (event) => {
        event.preventDefault();
        console.log("hello");
        console.log("Tasks: ",taskPaneState);
        console.log("Research: ",researchPaneState);
        console.log("Restraint: ",restraintPaneState);
        //triggerSubmit();
    }

    return (
            <div className={`content-wrapper-body ${false ? "saving" : ""}`}>
                {showModal == "error" && (
                    <ErrorModal
                        errorText={errorText}
                        flipState={setShowModal}
                    />
                )}
                <form className={'default-form'} onSubmit={handleSubmit}>
                    <div className="col-xs-6 panel panel-portal panel-portal-left">
                        <TaskPane
                            title={taskTitle}
                            status={taskStatus}
                            onStateChange={setTaskPaneState}
                        />
                    </div>
                    <div className={"col-xs-6 panel panel-portal panel-portal-beneath"}>
                        <ResearchUltrasounds
                            onStateChange={setResearchPaneState}
                        />
                    </div>
                    <div className="col-xs-5 panel panel-portal animal-info-pane">
                        <div className="panel-heading">
                            <h3>Animal Info</h3>
                        </div>
                        <AnimalInfoPane animalInfo={animalInfo} infoState={animalInfoState}/>
                    </div>
                    <div className="col-xs-5 panel panel-portal panel-portal-beneath">
                        <RestraintPane
                            onStateChange={setRestraintPaneState}
                        />
                    </div>

                    <div className="col-xs-5 panel-portal-beneath">
                        <button
                            type="submit"
                            className={`btn btn-primary submit-btn ${false ? "saving" : ""}`}
                            disabled={!validId}
                        >
                            Submit For Review
                        </button>
                    </div>
                </form>
            </div>
    );

}
