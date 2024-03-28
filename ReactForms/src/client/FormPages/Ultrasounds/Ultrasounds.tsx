import * as React from "react";
import { FC } from 'react';
import { DefaultFormContainer } from '../../components/DefaultFormContainer';
import { CustomInputPane } from '../../components/CustomInputPane';
import {ActionURL} from '@labkey/api';
import { TaskPane } from '../../components/TaskPane';
import {MUIEditableGridPanel} from '../../components/EditableGridPanel';
import {BloodRow, UltrasoundsRow} from '../../components/testData';
import { createMRTColumnHelper } from 'material-react-table';
import { lookupAnimalInfo } from '../../query/helpers';
import { InfoProps } from '../../query/typings';

const validateId = (id: string) => {
    console.log("validate Id");
    return lookupAnimalInfo(id).then((data: InfoProps) => {
        if(data.calculated_status === "Alive"){
            return true;
        }
        return "Animal is not valid";
    }).catch(() => {
        return "Animal is not valid";
    });
}


export const Ultrasounds: FC<any> = (props) => {

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
            componentProps: {
                defaultValues: {
                    updateTitle: "Research Ultrasound",
                    qcstate: 2,
                }
            }
        },{
            type: MUIEditableGridPanel,
            name: "BloodEditableGridPanel",
            schemaName: "study",
            queryName: "blood",
            componentProps: {
                prevTaskId: taskid,
                title: "Blood",
                blacklist: ['taskid'],
                columnHelper: createMRTColumnHelper<BloodRow>(),
                validationFns: { // input should be expected new cell value only
                    Id: validateId
                }
            }
        }
    ];
    return (
        <div>
            <DefaultFormContainer
                prevTaskId={taskid}
                reviewRequired={reviewRequired}
                taskType={"Ultrasounds"}
                command={taskid ? "update" : "insert"}
                components={components}
                redirectSchema={"study"}
                redirectQuery={"ultrasounds"}
                formStartTime={formStartTime}
                animalInfoPane={false}
            />
        </div>
    );
}