import * as React from "react";
import { useEffect, useState } from "react";
import "../theme/css/react-datepicker.css";
import "../theme/css/index.css";
import { generateRestraint, generateTask, triggerSubmit } from '../query/helpers';
import AnimalInfoPane from "../components/AnimalInfoPane";
import {TaskPane} from "../components/TaskPane";
import { ResearchUltrasounds } from './ResearchUltrasounds';
import {RestraintPane} from '../components/RestraintPane';
import ErrorModal from '../feeding/base/ErrorModal';
import { InfoProps, infoStates } from './typings';
import { StatusStates,TaskValuesType } from '../typings/taskPaneTypes';
import { Utils } from '@labkey/api';

export const ResearchUltrasoundFormContainer: React.FunctionComponent<any> = (props) => {

    const [animalInfo, setAnimalInfo] = useState<InfoProps>(null);
    const [animalInfoState, setAnimalInfoState] = useState<infoStates>("waiting");
    const [animalInfoCache, setAnimalInfoCache] = useState<any>();

    const [taskStatus, setTaskStatus] = useState<StatusStates>("In Progress");

    // States for each subcomponent on the page. Each of their states will propagate upwards into these states
    const [taskPaneState, setTaskPaneState] = useState({});
    const [researchPaneState, setResearchPaneState] = useState({});
    const [restraintPaneState, setRestraintPaneState] = useState({});

    const [errorText, setErrorText] = useState<string>("");
    const [showModal, setShowModal] = useState<string>();
    const [submitTextBody, setSubmitTextBody] = useState("Submit values?");

    const [formData, setFormData] = useState({
            lsid: { value: "", error: "" },
            command: { value: "insert", error: "" },
            QCStateLabel: { value: taskStatus, error: "" },
        }
    );

    //"study", "research_ultrasounds", "Research Ultrasounds"

    //Update form data if a component state changes
    useEffect(() => {
        setFormData({
            ...formData,
            ...taskPaneState,
            ...researchPaneState,
            ...restraintPaneState,
        });
    }, [taskPaneState, researchPaneState, restraintPaneState]);


    //This function is used to pair all the submission data into one variable
    // to pass to saveRowsDirect. For this form that is tasks, research ultrasounds, and restraints
    const generateData = async () => {
        const finalJsonData = [];
        //const taskId = Utils.generateUUID().toUpperCase();
        finalJsonData.push(generateTask(taskPaneState, "insert"));
        finalJsonData.push(generateRestraint(formData,taskPaneState,restraintPaneState,"insert"));

        try {
            const tempData = await triggerSubmit(
                animalInfoCache,
                formData,
                setSubmitTextBody,
                setShowModal,
                setErrorText,
                "study",
                "research_ultrasounds");

            for (const item of tempData.commands) {
                finalJsonData.push(item);
            }
        }
        catch (error) {console.log(error);}


        return finalJsonData;

    }

    // Form submission handler
    const handleSubmit = async (event) => {
        event.preventDefault();
        const finalJsonData = await generateData();
        console.log("Tasks: ",taskPaneState);
        console.log("Research: ",researchPaneState);
        console.log("Restraint: ",restraintPaneState);

        // Generate taskUUID here? or in trigger submit, might run into errors... no use generating if I not gonna use
        // if in trigger submit then I have to add support for submissions that dont use tasks, possible?

        console.log("formData: ", formData);

        console.log("top commands: ", finalJsonData);
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
                            title={"Research Ultrasounds"}
                            status={taskStatus}
                            onStateChange={setTaskPaneState}
                            formType={"Research Ultrasounds"}
                        />
                    </div>
                    <div className={"col-xs-6 panel panel-portal panel-portal-beneath"}>
                        <ResearchUltrasounds
                            onStateChange={setResearchPaneState}
                            setAnimalInfo={setAnimalInfo}
                            setAnimalInfoState={setAnimalInfoState}
                            setAnimalInfoCache={setAnimalInfoCache}
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
                            taskState={taskPaneState}
                        />
                    </div>

                    <div className="col-xs-5 panel-portal-beneath">
                        <button
                            type="submit"
                            className={`btn btn-primary submit-btn ${false ? "saving" : ""}`}
                        >
                            Submit For Review
                        </button>
                    </div>
                </form>
            </div>
    );

}
