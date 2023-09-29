import * as React from "react";
import { FC, useEffect, useState } from 'react';
import "../theme/css/react-datepicker.css";
import "../theme/css/index.css";
import {
    generateFormData,
    getTask,
    labkeyActionDistinctSelectWithPromise,
    saveRowsDirect,
    triggerValidation,
    wait
} from '../query/helpers';
import AnimalInfoPane from "./AnimalInfoPane";
import {TaskPane} from "./TaskPane";
import ErrorModal from '../components/ErrorModal';
import { InfoProps, infoStates } from '../researchUltrasoundsEntry/typings';
import { ActionURL, Filter, Utils } from '@labkey/api';
import {isEmpty} from "lodash";
import { useForm, FormProvider } from 'react-hook-form';
import { SelectDistinctOptions } from '@labkey/api/dist/labkey/query/SelectDistinctRows';

interface Component {
    type: React.FunctionComponent<any>;
    name: string;
    required?: any;
    commandOverride?: string;
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
    reviewRequired: boolean;
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
        reviewRequired
    } = props;

    const methods = useForm({mode: "onChange"});

    // States required for animal info

    const [animalInfoCache, setAnimalInfoCache] = useState<any>();

    // States required for tasks
    const [prevTask, setPrevTask] = useState(undefined);

    const [dataFetching, setDataFetching] = useState(true);

    // States for pop-ups/form checking
    const [errorText, setErrorText] = useState<string>("");
    const [showModal, setShowModal] = useState<string>();
    const [submitTextBody, setSubmitTextBody] = useState("Submit values?");

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


    /*
    Helper function to compile all the component states into form ready submission commands

    @param finalFormData Array of generated form data to pass into the labkey saverows function
    @param newTaskId string of the previous taskId or new one if the form is being created for the first time
    @param currentFormData object containing the current data for the form, equal to react-hook-form control._fields object
    */
    const processComponents = async (finalFormData: Array<any>, newTaskId: string, currentFormData: any) => {
        const promises = components.map(async (component) => {
            const componentName = component.name;
            const schemaName = component.componentProps.schemaName;
            const queryName = component.componentProps.queryName;
            const requiredFields = component.required;
            //Override command in-case form is under review and needs update and insert commands.
            const commandOverride = component.commandOverride;

            if(currentFormData[componentName] !== null && currentFormData[componentName] !== undefined){
                // sync up task id
                const tempNewData = currentFormData[componentName];
                tempNewData.taskid = newTaskId;
                if(requiredFields){
                    requiredFields.forEach((field) => {
                        const [stateName, fieldName] = field.split(".");
                        tempNewData[fieldName] = currentFormData[stateName][fieldName];
                    })
                }
                // generate submission command for component
                const newData = generateFormData(
                    schemaName,
                    queryName,
                    commandOverride ? commandOverride : command,
                    tempNewData
                );
                finalFormData.push(newData);
            }
        });
        await Promise.all(promises);
        return finalFormData;
    };

    // Form submission handler
    const handleSubmit = async (data) => {
        //event.preventDefault();
        console.log("Data: ", data);
        const finalFormData = [];
        //Switch from label qcstate to number format
        // generate task/object IDs
        const newTaskId = taskId ? taskId : Utils.generateUUID().toUpperCase();
        //finalize (ehr/tasks) submission
        const tempTaskData = data.TaskPane;
        tempTaskData.taskid = newTaskId;
        tempTaskData.category = 'task';
        tempTaskData.formType = taskType;
        tempTaskData.qcstate = reviewRequired ? 4 : 1;
        data.TaskPane = tempTaskData;
        // Create format to submit new task
        const taskData = generateFormData("ehr", "tasks", command, tempTaskData);
        finalFormData.push(taskData);
        processComponents(finalFormData, newTaskId, data ).then((data) => {
            // For each component compile the state data into a format ready for submission

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
                <FormProvider {...methods}>
                    <form className={'default-form'} onSubmit={methods.handleSubmit(handleSubmit)}>
                        <TaskPane
                            prevTask={prevTask}
                            title={taskTitle}
                        />
                        {
                            components.map((component) => {
                                // sub-component props
                                const {
                                    type: ComponentType,
                                    componentProps,
                                    name
                                } = component;
                                return (
                                    <div key={name} className="col-md-8 panel panel-portal form-row-wrapper">
                                        <ComponentType
                                            prevTaskId={taskId}
                                            name={name}
                                            componentProps={componentProps}
                                        />
                                    </div>
                                );

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
                        setAnimalInfoCache={setAnimalInfoCache}
                    />
                </FormProvider>

            </div>
    );

}
