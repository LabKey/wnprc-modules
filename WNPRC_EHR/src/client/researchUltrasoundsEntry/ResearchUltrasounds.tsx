import * as React from "react";
import { FC } from 'react';
import { DefaultFormContainer } from '../components/DefaultFormContainer';
import { CustomInputPane } from '../components/CustomInputPane';
import {RestraintPane} from '../components/RestraintPane';

export const ResearchUltrasounds: FC<any> = (props) => {
    const taskid: string = LABKEY.ActionURL.getParameter('taskid');
    return (
        <div>
            <DefaultFormContainer
                taskId={taskid}
                taskTitle={"Research Ultrasounds"}
                taskType={"Research Ultrasounds"}
                command={taskid ? "update" : "insert"}
                components={[
                    {
                        type: CustomInputPane,
                        title: "Research Ultrasounds",
                        custom: true,
                        inputPath: 'researchUltrasoundsEntry',
                        schemaName: "study",
                        queryName: "research_ultrasounds",
                        syncedValues: {
                            TaskPane: ["taskid"],
                        },
                        validation: true
                    },{
                        type: RestraintPane,
                        schemaName: "study",
                        queryName: "restraints",
                        syncedValues: {
                            CustomInputPane: ["Id"],
                            TaskPane: ["taskid"],
                        },
                    }
                ]}
                redirectSchema={"study"}
                redirectQuery={"research_ultrasounds"}
            />
        </div>
    );
};
