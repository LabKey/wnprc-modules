import * as React from "react";
import { FC, useEffect, useState } from 'react';
import "../theme/css/react-datepicker.css";
import "../theme/css/index.css";
import { generateFormData, getTask, saveRowsDirect, triggerValidation, wait } from '../query/helpers';
import AnimalInfoPane from "./AnimalInfoPane";
import {TaskPane} from "./TaskPane";
import ErrorModal from '../components/ErrorModal';
import { InfoProps, infoStates } from '../researchUltrasoundsEntry/typings';
import { ActionURL } from '@labkey/api';

interface Component {
    type: React.FunctionComponent<any>;
    syncedValues?: {
        [key: string]: string[];
    };
    validation?: boolean;
    componentProps?: {
        [key: string]: any;
    };
}
interface formProps {
    taskId?: string;
    taskType: string;
    taskTitle: string;
    redirectQuery: string;
    redirectSchema: string;
    command: string;
    components: Component[];
}

/*
Default form container that handles tasks and animal info, add other components as needed.

@param {string} taskId Task ID (not rowid) if visiting a previous form
@param {Component[]} components Any extra components needed for the form
@param {string} taskType The type of task that the form is for
@param {string} taskTitle The title of the task that the form is for
@param {string} command The command to execute, update or insert
@param {string} redirectSchema The name of the schema to redirect the page to after successful submission
@param {string} redirectQuery The name of the query to redirect the page to after successful submission
 */
export const DefaultFormContainer: FC<formProps> = (props) => {
    const {
        taskId,
        components,
        taskType,
        taskTitle,
        command,
        redirectSchema,
        redirectQuery,
    } = props;

    // States required for animal info
    const [animalInfo, setAnimalInfo] = useState<InfoProps>(null);
    const [animalInfoState, setAnimalInfoState] = useState<infoStates>("waiting");
    const [animalInfoCache, setAnimalInfoCache] = useState<any>();
    // States required for tasks
    const [prevTask, setPrevTask] = useState(undefined);
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
    // States for pop-ups/form checking
    const [errorText, setErrorText] = useState<string>("");
    const [showModal, setShowModal] = useState<string>();
    const [submitTextBody, setSubmitTextBody] = useState("Submit values?");
    const [validForm, setValidForm] = useState(true);

    useEffect(() => {
        if(taskId) {
            getTask(taskId).then((result) => {
                setPrevTask(result);
                setDataFetching(false);
            });
        }else {
            setDataFetching(false);
        }
    },[]);

    // This effect updates the task panes state in the componentStates state if it changes
    useEffect(() => {
        handleChildStateChange("TaskPane",taskPaneState);
    },[taskPaneState])

    /*
    This function makes sure values across components are synced if needed, ex. task ids

    @param syncedValues JSON object that holds a property (component needed to sync) and array of fields to sync
    @param currentComponent The current component to sync with other components according to what is described
                            in syncedValues
    */
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

    /*
    Helper function to compile all the component states into form ready submission commands

    @param finalFormData Generated form data from generateFormData function
    */
    const processComponents = async (finalFormData: Array<any>) => {
        const promises = components.map(async (component) => {
            const ComponentType = component.type;
            const schemaName = component.componentProps.schemaName;
            const queryName = component.componentProps.queryName;
            const syncedValues = component.syncedValues;
            const validation = component.validation;
            let newData;
            if(validation){ // runs if validation is required on component
                await triggerValidation(
                    animalInfoCache,
                    componentStates[ComponentType.name],
                    setSubmitTextBody,
                    setShowModal,
                    setErrorText
                ).then((result) => {
                    if(!result){
                        setValidForm(false);
                    }
                }).catch(e => {
                    console.error(e);
                });

            }
            if (syncedValues){ // updates synced values across components to maintain matching fields ex. (taskid)
                const newState = updateSyncedValues(syncedValues, ComponentType.name);
                newData = generateFormData(
                    schemaName,
                    queryName,
                    command,
                    newState[ComponentType.name]
                );
                finalFormData.push(newData);
            }else if (componentStates[ComponentType.name] !== null){
                newData = generateFormData(
                    schemaName,
                    queryName,
                    command,
                    componentStates[ComponentType.name]
                );
                finalFormData.push(newData);
            }
        });
        await Promise.all(promises);
        return finalFormData;
    };

    // Form submission handler
    const handleSubmit = (event) => {
        event.preventDefault();
        const finalFormData = [];
        // Create format to submit new task
        const taskData = generateFormData("ehr", "tasks", command, taskPaneState);
        finalFormData.push(taskData);
        processComponents(finalFormData).then((data) => {
            // For each component compile the state data into a format ready for submission
            if(!validForm){
                return;
            }
            let jsonData = {commands: data}
            console.log('calling save rows on: ', jsonData);
            // save rows to database and redirect to desired schema/query
            saveRowsDirect(jsonData)
                .then((data) => {
                    console.log('done!!');
                    console.log(JSON.stringify(data));
                    setSubmitTextBody("Success!");

                    wait(3, setSubmitTextBody).then(() => {
                        window.location.href = ActionURL.buildURL(
                            "ehr",
                            `executeQuery.view?schemaName=${redirectSchema}&query.queryName=${redirectQuery}`,
                            ActionURL.getContainer()
                        );
                    });
                })
                .catch((e) => {
                    console.log(e);
                    setSubmitTextBody(e.exception);
                });
            }).catch(e => {
                console.error(e);
                setSubmitTextBody(e.exception);
            });
    }

    /*
    Function that handles child state changes within component states

    @param componentName Name of component to add new state to
    @param newState New state of to add to component
     */
    const handleChildStateChange = (componentName, newState) => {
        setComponentStates((prevState) => ({
            ...prevState,
            [componentName]: newState,
        }));
    }

    // Make sure if loading in from a taskId the render doesn't return before it fetches the previous task
    if(dataFetching){
        return <div>loading...</div>;
    }
    return (
            <div className={`form-wrapper ${false ? "saving" : ""}`}>
                {showModal == "error" && (
                    <ErrorModal
                        errorText={errorText}
                        flipState={setShowModal}
                        setErrorText={setErrorText}
                    />
                )}
                <form className={'default-form'} onSubmit={handleSubmit}>
                    <TaskPane
                        prevTask={prevTask}
                        title={taskTitle}
                        onStateChange={setTaskPaneState}
                        formType={taskType}
                    />
                    {
                        components.map((component) => {
                            // sub-component props
                            const {
                                type: ComponentType,
                                componentProps
                            } = component;
                            if(ComponentType.name === "CustomInputPane"){
                                return (
                                    <div key={ComponentType.name} className="col-md-8 panel panel-portal form-row-wrapper">
                                        <ComponentType
                                            prevTaskId={taskId}
                                            componentProps={componentProps}
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
                                    <div key={ComponentType.name} className="col-md-8 panel panel-portal form-row-wrapper">
                                        <ComponentType
                                            prevTaskId={taskId}
                                            componentProps={componentProps}
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
                <AnimalInfoPane
                    animalInfo={animalInfo}
                    infoState={animalInfoState}
                />
            </div>
    );

}
