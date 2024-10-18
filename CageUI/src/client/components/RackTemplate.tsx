import * as React from 'react';
import { FC } from 'react';
import { ActionURL } from '@labkey/api';
import { Rack, RackTypes } from './typings';
import { ReactSVG } from 'react-svg';

interface RackTemplateProps {
    fileName: string,
    className?: string
}
export const RackTemplate: FC<RackTemplateProps> = (props) => {
    const {fileName, className} = props;


    return (
        <div className={"cage-template"}>
            <ReactSVG
                src={`${ActionURL.getContextPath()}/cageui/static/${fileName}.svg`}
                id={'cage_template'}
                wrapper={'svg'}
                className={className}
                width={"250"}
                height={"250"}
            />
        </div>
    );
}