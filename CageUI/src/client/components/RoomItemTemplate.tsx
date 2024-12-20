import * as React from 'react';
import { FC, useEffect, useRef, useState } from 'react';
import { ActionURL } from '@labkey/api';
import { Rack, RackTypes, RoomItemStringType } from './typings';
import { ReactSVG } from 'react-svg';

interface RoomItemTemplateProps {
    fileName: string,
    className?: string
    type: RoomItemStringType;
}
export const RoomItemTemplate: FC<RoomItemTemplateProps> = (props) => {
    const {fileName, className, type} = props;

    return (
        <div id={`${type}-template`}>
            <ReactSVG
                src={`${ActionURL.getContextPath()}/cageui/static/${fileName}.svg`}
                id={`${type}_template_wrapper`}
                wrapper={'svg'}
                className={className}
                width={'250'}
                height={'250'}
            />
        </div>
    );
}