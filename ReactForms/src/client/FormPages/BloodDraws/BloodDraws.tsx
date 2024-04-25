import * as React from "react";
import { FC } from 'react';
import { DefaultFormContainer } from '../../components/DefaultFormContainer';
import {ActionURL} from '@labkey/api';
import { TaskPane } from '../../components/TaskPane';
import {MUIEditableGridPanel} from '../../components/EditableGridPanel';
import { createMRTColumnHelper } from 'material-react-table';
import { lookupAnimalInfo } from '../../query/helpers';
import { InfoProps } from '../../query/typings';
import { submitRequest } from '../../components/actions';

const validateId = (id: string) => {
    return lookupAnimalInfo(id).then((data: InfoProps) => {
        if(data.calculated_status === "Alive"){
            return true;
        }
        return "Animal is not valid";
    }).catch(() => {
        return "Animal is not valid";
    });
}

type BloodRow = {
    key: string
    Id: string,
    date: Date,
    project: number,
    "project/protocol": string,
    quantity: string,
    performedby: string,
    assayCode: string,
    billedby: string,
    tube_type: string,
    additionalServices: string,
    instructions: string,
    remark: string,
    QCState: string,
    taskid: string,
    requestid: string
};
type BloodForm = {
    TaskModel: {
        rowid: number;
        created: Date;
        createdby: string;
        formtype: string;
        updateTitle: string;
        assignedto: string;
        duedate: Date;
        qcstate: string;
    };
    BloodModel: BloodRow[];
}

export const BloodDraws: FC<any> = (props) => {

    const taskid: string = ActionURL.getParameter('taskid');
    const formStartTime: Date = new Date(new Date().toISOString().slice(0, 16).replace('T', ' '));

    const formType: string = ActionURL.getParameter('formType');
    const reviewRequired = formType ? !formType.includes('Review') : true;
    const components: any[] = [
        {
            type: TaskPane,
            name: "TaskPane",
            schemaName: "ehr",
            queryName: "tasks",
            primaryKey: "rowid",
            componentProps: {
                defaultValues: {
                    qcstate: 2,
                    title: "Blood Draws",
                    updateTitle: "Blood Draws",
                    category: "tasks"
                },
                whitelist: ["title", "category"]
            }
        },{
            type: MUIEditableGridPanel,
            name: "BloodEditableGridPanel",
            schemaName: "study",
            queryName: "blood",
            primaryKey: "lsid",
            componentProps: {
                title: "Blood",
                blacklist: ['taskid', 'requestid'],
                whitelist: ["project/protocol"],
                columnHelper: createMRTColumnHelper<BloodRow>(),
                validationFns: { // input should be expected new cell value only
                    Id: validateId
                },
                wnprcMetaData: {
                    Id: {
                        type: "text"
                    },
                    project: {
                        type: "dropdown",
                        watchVar: "study-blood.Id",
                        lookup: {
                            schemaName: "study",
                            queryName: "Assignment",
                            displayColumn: "project/displayName",
                            keyColumn: "project",
                        },
                        defaultOpts: [{value:300901, label:"300901"},{value:400901, label:"400901"}]
                    },
                    "project/protocol": {
                        type: "text",
                        autoFill: {
                            watch: "study-blood.project",
                            lookup: {
                                schemaName: "ehr",
                                queryName: "project",
                                column: "protocol",
                            }
                        }
                    }
                }
            }
        }
    ];
    return (
        <div>
            <DefaultFormContainer
                prevTaskId={taskid}
                reviewRequired={reviewRequired}
                taskType={"Blood Draws"}
                components={components}
                redirectSchema={"study"}
                redirectQuery={"blood"}
                formStartTime={formStartTime}
                animalInfoPane={false}
            />
        </div>
    );
}