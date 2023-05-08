import * as React from "react";
import { FC, useEffect, useState } from 'react';
import "../theme/css/react-datepicker.css";
import "../theme/css/index.css";
import { generateFormData, getTask, triggerValidation } from '../query/helpers';
import AnimalInfoPane from "../components/AnimalInfoPane";
import {TaskPane} from "../components/TaskPane";
import ErrorModal from '../feeding/base/ErrorModal';
import { InfoProps, infoStates } from './typings';


interface Component {
    type: React.FunctionComponent<any>;
    schemaName: string;
    queryName: string;
    command: string;
    syncedValues?: {
        [key: string]: string[];
    };
    validation?: boolean;
    main?: boolean;
    props?: {
        [key: string]: any;
    };
}
interface formProps {
    taskId?: string;
    taskType: string;
    taskTitle: string;
    components: Component[];
}

/*
Default form container that handles tasks and animal info, add other components as needed.

@param {string} taskId Task rowid if visiting a previous form
@param {Component[]} components Any extra components needed for the form
@param {string} taskType The type of task that the form is for
@param {string} taskTitle The title of the task that the form is for
 */
export const DefaultFormContainer: FC<formProps> = (props) => {

    const {taskId, components, taskType, taskTitle} = props;

    // States required for animal info
    const [animalInfo, setAnimalInfo] = useState<InfoProps>(null);
    const [animalInfoState, setAnimalInfoState] = useState<infoStates>("waiting");
    const [animalInfoCache, setAnimalInfoCache] = useState<any>();
    // States required for tasks
    const [prevTask, setPrevTask] = useState({});
    const [taskPaneState, setTaskPaneState] = useState({});

    const [dataFetching, setDataFetching] = useState(true);
    // States for each component passed in as a prop
    const [componentStates, setComponentStates] = useState(
        {
            ...components.reduce((acc, component) => {
                acc[component.type.name] = null;
                return acc;
            }, {}),
            TaskPane: {}
        }
    );
    // States for pop-ups
    const [errorText, setErrorText] = useState<string>("");
    const [showModal, setShowModal] = useState<string>();
    const [submitTextBody, setSubmitTextBody] = useState("Submit values?");
    // State for formData
    const [formData, setFormData] = useState({
            lsid: { value: "", error: "" },
            command: { value: "insert", error: "" },
            QCStateLabel: { value: "", error: "" },
        }
    );

    useEffect(() => {
        if(taskId) {
            getTask(taskId).then((result) => {
                console.log(result);
                setPrevTask(result);
                setDataFetching(false);
            });
        }else {
            setDataFetching(false);
        }
    },[]);


    useEffect(() => {
        handleChildStateChange("TaskPane",taskPaneState);
    },[taskPaneState])

    const updateSyncedValues = (syncedValues, currentComponent) => {
        let updatedState = {...componentStates};
        Object.keys(syncedValues).forEach((key) => {
            const toChange = syncedValues[key];
            toChange.forEach((value) => {
                updatedState[currentComponent] = {
                ...updatedState[currentComponent],
                        [value]: {value: componentStates[key][value].value, error: ""}
                }
            });
        });
        return updatedState;
    };

    // Form submission handler
    const handleSubmit = (event) => {
        event.preventDefault();
        const finalFormData = [];
        const taskData = generateFormData("ehr", "tasks", "insert", taskPaneState);
        finalFormData.push(taskData);

        components.map(async (component) => {
            const ComponentType = component.type;
            const schemaName = component.schemaName;
            const queryName = component.queryName;
            const command = component.command;
            const syncedValues = component.syncedValues;
            const validation = component.validation;
            let newData;
            if(validation){
                await triggerValidation(
                    animalInfoCache,
                    componentStates[ComponentType.name],
                    setSubmitTextBody,
                    setShowModal,
                    setErrorText
                );
            }
            if (syncedValues){
                const newState = updateSyncedValues(syncedValues, ComponentType.name);
                newData = generateFormData(
                    schemaName,
                    queryName,
                    command,
                    newState[ComponentType.name]
                );
            }else{
                newData = generateFormData(
                    schemaName,
                    queryName,
                    command,
                    componentStates[ComponentType.name]
                );
            }
            finalFormData.push(newData);
        });

        console.log("FINAL DATA: ", finalFormData)

    }

    const handleChildStateChange = (componentName, newState) => {
        setComponentStates((prevState) => ({
            ...prevState,
            [componentName]: newState,
        }));
    }

    /*
    TODO Write a way for the form to auto fill if under review from a task id
     */

    if(dataFetching){
        return <div>loading...</div>;
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
                            prevTask={prevTask}
                            id={taskId}
                            title={taskTitle}
                            onStateChange={setTaskPaneState}
                            formType={taskType}
                        />
                    </div>
                    <div className="col-xs-5 panel panel-portal animal-info-pane">
                        <div className="panel-heading">
                            <h3>Animal Info</h3>
                        </div>
                        <AnimalInfoPane animalInfo={animalInfo} infoState={animalInfoState}/>
                    </div>
                    {
                        components.map((component) => {
                            const { type: ComponentType, main } = component;

                            if(main){
                                return (
                                    <div key={ComponentType.name} className="col-xs-6 panel panel-portal panel-portal-beneath">
                                        <ComponentType
                                            setAnimalInfo={setAnimalInfo}
                                            setAnimalInfoState={setAnimalInfoState}
                                            setAnimalInfoCache={setAnimalInfoCache}
                                            state={componentStates[ComponentType.name]}
                                            onStateChange={(newState) => handleChildStateChange(ComponentType.name,newState)}
                                        />
                                    </div>
                                );
                            }
                            else {
                                return (
                                    <div key={ComponentType.name} className="col-xs-6 panel panel-portal panel-portal-beneath">
                                        <ComponentType
                                            {...component.props}
                                            state={componentStates[ComponentType.name]}
                                            onStateChange={(newState) => handleChildStateChange(ComponentType.name, newState)}
                                        />
                                    </div>
                                );
                            }
                        })
                    }
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
