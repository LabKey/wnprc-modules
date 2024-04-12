import * as React from 'react';
import { FC, useEffect, useMemo, useState } from 'react';
import '../theme/css/react-datepicker.css';
import '../theme/css/index.css';
import { generateFormData, getFormData, getLsid, getQueryDetails } from '../query/helpers';
import AnimalInfoPane from './AnimalInfoPane';
import ErrorModal from '../components/ErrorModal';
import { Utils } from '@labkey/api';
import { FieldPathValue, FormProvider, useForm, useWatch } from 'react-hook-form';
import { FormMetadataCollection } from './FormMetadataCollection';
import { QueryDetailsResponse } from '@labkey/api/dist/labkey/query/GetQueryDetails';
import { QueryColumn } from '@labkey/api/dist/labkey/query/types';
import { parseErrors, submitRequest } from './actions';

interface Component {
    type: React.FunctionComponent<any>;
    name: string;
    schemaName?: string;
    queryName?: string;
    viewName?: string;
    required?: any;
    commandOverride?: boolean;
    componentProps?: {
        [key: string]: any;
    };
}
interface formProps<T> {
    prevTaskId?: string;
    taskType: string;
    redirectQuery: string;
    redirectSchema: string;
    components: Component[];
    reviewRequired: boolean;
    formStartTime: Date;
    animalInfoPane: boolean;
    submit?: (jsonData: T) => Promise<any>;
}

interface FormMetaData {
    [key: string]: QueryColumn[];
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
export const DefaultFormContainer: FC<formProps<any>> = (props) => {
    const {
        prevTaskId,
        components,
        taskType,
        redirectSchema,
        redirectQuery,
        reviewRequired,
        formStartTime,
        animalInfoPane,
        submit
    } = props;

    const [defaultValues, setDefaultValues] = useState<any>();
    const [metaData, setMetaData] = useState<FormMetaData>({});
    const methods = useForm({
        mode: "onChange",
        reValidateMode: "onSubmit",
        defaultValues: useMemo(() => defaultValues, [defaultValues])
    });
    const [isLoadingPrevTask, setIsLoadingPrevTask] = useState(true);

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
            const formName = `${component.schemaName}-${component.queryName}`;
            const schemaName = component.schemaName;
            const queryName = component.queryName;
            const requiredFields = component.required;
            //Override command in-case form is under review and needs update and insert commands.
            const commandOverride = component.commandOverride;
            if(currentFormData[formName] !== null && currentFormData[formName] !== undefined){
                // sync up task id
                const tempNewData = currentFormData[formName];
                if(tempNewData instanceof Array){
                    tempNewData.forEach((row) => {
                        row.taskid = newTaskId;
                    });
                }else {
                    tempNewData.taskid = newTaskId;
                }

                if(prevTaskId && !commandOverride){
                    await getLsid(schemaName, queryName, newTaskId).then((prevLsid) =>{
                        tempNewData.lsid = prevLsid;
                    }).catch(() => {
                        console.log("Error finding previous task lsid");
                    });
                }
                if(requiredFields){
                    requiredFields.forEach((field) => {
                        const [stateName, fieldName] = field.split(".");
                        if(tempNewData instanceof Array){
                            tempNewData.forEach((row) => {
                                row[fieldName] = currentFormData[stateName][fieldName];
                            })
                        }else{
                            tempNewData[fieldName] = currentFormData[stateName][fieldName];
                        }
                    })
                }
                // generate submission command for component
                const newData = generateFormData(
                    schemaName,
                    queryName,
                    commandOverride ? "insertWithKeys" :
                        prevTaskId ? "updateChangingKeys" : "insertWithKeys",
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
        const finalFormData = [];
        // generate taskId if required
        const newTaskId = prevTaskId ? prevTaskId : Utils.generateUUID().toUpperCase();
        const formMetaData = FormMetadataCollection( {
            schemaName:redirectSchema,
            queryName: redirectQuery,
            taskid: newTaskId,
            startTime: formStartTime,
        });
        finalFormData.push(generateFormData("wnprc", "session_log","insertWithKeys", formMetaData));
        processComponents(finalFormData, newTaskId, data ).then((processedData) => {
            // For each component compile the state data into a format ready for submission

            //const commands = processedData
            console.log('calling save rows on: ', processedData);
            if(submit) {
                submitRequest(processedData).then((res) => {
                    console.log(res);
                    console.log("Error Ct: ", res.errorCount);
                    if(res.errorCount > 0) {
                        const errors = parseErrors(res.result);
                        console.log(errors);
                    }

                }).catch(rej => {
                    console.log(rej);
                })
            }
            // save rows to database and redirect to desired schema/query
            /*saveRows(jsonData)
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
    // use effect to store default values into react hook form state management framework
    useEffect(() => {
        Promise.all(components.map(async (component) => {
            if(component.type.name === "InstructionsPane") return;
            try {
                const metaData: QueryDetailsResponse = await getQueryDetails(component.schemaName, component.queryName);
                let tempMetaData = component.viewName ? metaData.views[component.viewName].filter(item => !component.componentProps.blacklist?.includes(item.name))
                    : metaData.defaultView.columns.filter(item => !component.componentProps.blacklist?.includes(item.name));
                const columnNameTypeMap = tempMetaData.reduce((map, obj) => {
                    map[obj.name] = obj.type || "String"; // Default to "String" type if not provided
                    return map;
                }, {});
                setMetaData(prevMetaData => ({
                    ...prevMetaData,
                    [`${component.schemaName}-${component.queryName}`]: tempMetaData
                }));

                if (prevTaskId) {
                    const result = await getFormData(prevTaskId, component.schemaName, component.queryName);
                    let tempDefaultValues: Array<any> | object = component.type.name === "MUIEditableGridPanel" ? [] : {};

                    if(component.type.name === "MUIEditableGridPanel"){
                        tempDefaultValues = result.map(obj => {
                            const newObj = {};
                            // Iterate through each property of the object
                            Object.keys(obj).forEach(key => {
                                // Check if the property key exists in the names array
                                if (columnNameTypeMap[key] === "Date and Time") {
                                    newObj[key] = new Date(obj[key]);
                                } else {
                                    newObj[key] = obj[key];
                                }
                            });
                            return newObj;
                        });
                    }else{
                        tempMetaData.forEach(column => {
                            tempDefaultValues[column.name] = result[0].hasOwnProperty(column.name)
                                ? (column.type === "Date and Time"
                                    ? new Date(result[0][column.name])
                                    : result[0][column.name])
                                : (column.type === "Date and Time"
                                    ? new Date()
                                    : column.defaultValue);
                        });
                    }
                    setDefaultValues(prevState => ({
                        ...prevState,
                        [`${component.schemaName}-${component.queryName}`]: tempDefaultValues
                    }));
                    methods.setValue(`${component.schemaName}-${component.queryName}`, tempDefaultValues);
                    await methods.trigger();
                } else {
                    let tempDefaultValues = component.type.name === "MUIEditableGridPanel" ? [{}] : {};
                    tempMetaData.forEach(column => {
                        if (component.type.name === "MUIEditableGridPanel"){
                            tempDefaultValues[0][column.name] = component.componentProps?.defaultValues?.hasOwnProperty(column.name) ? component.componentProps.defaultValues[column.name] : (column.type === "Date and Time" ? new Date() : column.defaultValue);
                        }else{
                            tempDefaultValues[column.name] = component.componentProps?.defaultValues?.hasOwnProperty(column.name) ? component.componentProps.defaultValues[column.name] : (column.type === "Date and Time" ? new Date() : column.defaultValue);
                        }

                    });
                    setDefaultValues(prevState => ({
                        ...prevState,
                        [`${component.schemaName}-${component.queryName}`]: tempDefaultValues
                    }));
                    methods.setValue(`${component.schemaName}-${component.queryName}`, tempDefaultValues);
                    await methods.trigger();
                }
            } catch (error) {

                console.error("Error occurred:", error);
            }
        }))
            .then(() => setIsLoadingPrevTask(false))
            .catch(error => {
                console.error('Error occurred loading previous tasks:', error);
                setIsLoadingPrevTask(false);
            });
    }, []);

    if(isLoadingPrevTask){
        return(<div>Loading...</div>);
    }else {
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
                    <form id={"default-form"} className={'default-form'} onSubmit={methods.handleSubmit(handleSubmit)}>
                        {
                            components.map((component) => {
                                // sub-component props
                                const {
                                    type: ComponentType,
                                    componentProps,
                                    name,
                                    schemaName,
                                    queryName
                                } = component;

                                return (
                                    <div key={`${name}-${schemaName}-${queryName}`}
                                         className="col-md-8 panel panel-portal form-row-wrapper">
                                        <ComponentType
                                            name={name}
                                            componentProps={componentProps}
                                            schemaName={schemaName}
                                            queryName={queryName}
                                            defaultValues={defaultValues}
                                            metaData={metaData[`${schemaName}-${queryName}`]}
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
                                form={"default-form"}
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
}
