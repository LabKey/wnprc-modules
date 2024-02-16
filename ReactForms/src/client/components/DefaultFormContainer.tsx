import * as React from "react";
import { FC, useEffect, useState } from 'react';
import "../theme/css/react-datepicker.css";
import "../theme/css/index.css";
import {
    generateFormData,
    getTask,
    saveRowsDirect,
    wait,
    getLsid,
    getQCRowID
} from '../query/helpers';
import AnimalInfoPane from "./AnimalInfoPane";
import ErrorModal from '../components/ErrorModal';
import { ActionURL, Filter, Utils } from '@labkey/api';
import { useForm, FormProvider } from 'react-hook-form';
import { FormMetadataCollection } from './FormMetadataCollection';

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
    prevTaskId?: string;
    taskType: string;
    redirectQuery: string;
    redirectSchema: string;
    command: string;
    components: Component[];
    reviewRequired: boolean;
    formStartTime: Date;
    animalInfoPane: boolean;
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
        prevTaskId,
        components,
        taskType,
        command,
        redirectSchema,
        redirectQuery,
        reviewRequired,
        formStartTime,
        animalInfoPane
    } = props;

    const methods = useForm({mode: "onChange"});

    // States required for animal info
    const [animalInfoCache, setAnimalInfoCache] = useState<any>();

    // States for pop-ups/form checking
    const [errorText, setErrorText] = useState<string>("");
    const [showModal, setShowModal] = useState<string>();
    const [submitTextBody, setSubmitTextBody] = useState("Submit values?");

    /*
    Helper function to compile all the component states into form ready submission commands

    @param finalFormData Array of generated form data to pass into the labkey saverows function
    @param newTaskId string of the previous taskId or new one if the form is being created for the first time
    @param currentFormData object containing the current data for the form
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
                if(prevTaskId && !commandOverride && command === 'update'){
                    await getLsid(schemaName, queryName, newTaskId).then((prevLsid) =>{
                        tempNewData.lsid = prevLsid;
                    }).catch(() => {
                        console.log("Error finding previous task lsid");
                    });
                }
                if(requiredFields){
                    requiredFields.forEach((field) => {
                        const [stateName, fieldName] = field.split(".");
                        if(stateName === "Key"){ // generate unique key
                            tempNewData[fieldName] = Utils.generateUUID().toUpperCase();
                        }else{
                            tempNewData[fieldName] = currentFormData[stateName][fieldName];
                        }
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
    const handleSubmit = async (data, e) => {
        e.preventDefault();
        console.log(data);
        const finalFormData = [];
        // generate taskId if required
        const newTaskId = prevTaskId ? prevTaskId : Utils.generateUUID().toUpperCase();
        const formMetaData = FormMetadataCollection( {
            schemaName:redirectSchema,
            queryName: redirectQuery,
            taskid: newTaskId,
            startTime: formStartTime,
        });
        finalFormData.push(generateFormData("wnprc", "session_log","insert", formMetaData));
        processComponents(finalFormData, newTaskId, data ).then((data) => {
            // For each component compile the state data into a format ready for submission

            let jsonData = {commands: data}
            console.log('calling save rows on: ', jsonData);
            // save rows to database and redirect to desired schema/query
            /*saveRowsDirect(jsonData)
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
                });*/
            }).catch(e => {
                console.error(e);
                setSubmitTextBody(e.exception);
            })

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
                                            prevTaskId={prevTaskId}
                                            name={name}
                                            componentProps={componentProps}
                                            redirectSchema={"study"}
                                            redirectQuery={"ultrasounds"}
                                        />
                                    </div>
                                );

                            })
                        }
                        <div className="col-xs-5 panel-portal-beneath">
                            <button
                                type="submit"
                                className={`btn btn-primary submit-btn ${false ? "saving" : ""}`}
                                id={"submit-btn"}
                            >
                                Submit For Review
                            </button>
                        </div>
                    </form>
                    {animalInfoPane && (
                        <AnimalInfoPane
                        setAnimalInfoCache={setAnimalInfoCache}
                        />
                    )}
                </FormProvider>
            </div>
    );

}
