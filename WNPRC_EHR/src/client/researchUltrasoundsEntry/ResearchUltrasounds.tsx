import * as React from "react";
import { FC } from 'react';
import { DefaultFormContainer } from './DefaultFormContainer';
import { ResearchUltrasoundsPane } from './ResearchUltrasoundsPane';
import {RestraintPane} from '../components/RestraintPane';

export const ResearchUltrasounds: FC<any> = (props) => {
    const taskid: string = LABKEY.ActionURL.getParameter('taskid');
    return (
        <div>
            <DefaultFormContainer
                taskId={taskid}
                taskTitle={"Research Ultrasounds"}
                taskType={"Research Ultrasounds"}
                components={[
                    {
                        type: ResearchUltrasoundsPane,
                        main: true,
                        schemaName: "study",
                        queryName: "research_ultrasounds",
                        command: taskid ? "update" : "insert",
                        syncedValues: {
                            TaskPane: ["taskid"],
                        },
                        validation: true
                    },{
                        type: RestraintPane,
                        schemaName: "study",
                        queryName: "restraints",
                        command: taskid ? "update" : "insert",
                        syncedValues: {
                            ResearchUltrasoundsPane: ["Id"],
                            TaskPane: ["taskid"],
                        },
                    }
                ]}
            />
        </div>
    );
};
