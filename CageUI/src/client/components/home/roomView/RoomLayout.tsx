import * as React from 'react';
import * as d3 from 'd3';
import { FC, useEffect, useRef, useState } from 'react';
import { SelectRowsOptions } from '@labkey/api/dist/labkey/query/SelectRows';
import { ActionURL, Filter } from '@labkey/api';
import { labkeyActionSelectWithPromise } from '../../../api/labkeyActions';
import { ReactSVG } from 'react-svg';
import { Cage, LayoutData, RoomItem, RoomItemType } from '../../../types/typings';
import { useHomeContext } from '../../../context/HomeContextManager';
import { addPrevRoomSvgs, parseRoomItemNum } from '../../../utils/helpers';
import { updateBorderSize } from '../../../utils/LayoutEditorHelpers';
import { SelectedObj } from '../../../types/layoutEditorTypes';
import { ChangeRack } from '../../layoutEditor/ChangeRack';
import { TextInput } from '../../TextInput';
import { EditorContextMenu } from '../../layoutEditor/EditorContextMenu';
import { ModificationEditor } from './ModificationEditor';

interface RoomLayoutProps {

}

export const RoomLayout: FC<RoomLayoutProps> = (props) => {
    const {selectedRoom} = useHomeContext();
    const [selectedObj, setSelectedObj] = useState<SelectedObj>(null);
    const [showCageContextMenu, setShowCageContextMenu] = useState<boolean>(false);
    const borderRef = useRef(null);
    const contextRef = useRef(selectedRoom);

    useEffect(() => {
        console.log("SR: ", selectedRoom);
    }, [selectedRoom]);

    // Loads room into the svg
    useEffect(() => {
        if(!selectedRoom.name) return;
        d3.select("#layout-svg").selectAll('*:not(#layout-border, #layout-border *)').remove();
        const layoutSvg = d3.select("#layout-svg") as d3.Selection<SVGElement, {}, HTMLElement, any>;
        contextRef.current = selectedRoom;
        addPrevRoomSvgs('view', selectedRoom, layoutSvg, setSelectedObj, contextRef);
    }, [selectedRoom.name]);

    // Effect watches for right clicks to open the modification editor
    useEffect(() => {
        if(selectedObj){
            setShowCageContextMenu(true);
        }
    }, [selectedObj]);

    // Cleans up selected object after modification editor is closed
    useEffect(() => {
        if(showCageContextMenu) return;
        setSelectedObj(null);
    }, [showCageContextMenu]);

    return (
        <div className={'room-layout'}>
            <div id={"layout-grid"}>
                <svg // svg here is the size of the border (objects outside of border ignored), add 1 to viewbox to prevent visual cutting by a pixel
                    width={selectedRoom.layoutData.borderWidth + 1}
                    height={selectedRoom.layoutData.borderHeight + 1}
                    viewBox={`0 0 ${selectedRoom.layoutData.borderWidth + 1} ${selectedRoom.layoutData.borderHeight + 1}`}
                    id="layout-svg"
                >
                    <g className={'draggable room-obj'}
                       id={'layout-border'}
                       pointerEvents={'none'}
                    >
                        <ReactSVG
                            src={`${ActionURL.getContextPath()}/cageui/static/RoomBorder.svg`}
                            id={`border_template_wrapper`}
                            wrapper={'svg'}
                            key={'border_template_key'}
                            ref={borderRef}
                            className={''}
                            viewBox={`0 0 ${selectedRoom.layoutData.borderWidth} ${selectedRoom.layoutData.borderHeight}`}
                            height={selectedRoom.layoutData.borderHeight}
                            width={selectedRoom.layoutData.borderWidth}
                            pointerEvents={'none'}
                            afterInjection={(svg) => {
                                const borderGroup = d3.select('#layout-border') as d3.Selection<SVGGElement, {}, HTMLElement, any>;
                                updateBorderSize(borderGroup, selectedRoom.layoutData.borderWidth, selectedRoom.layoutData.borderHeight)
                            }}
                        />
                    </g>
                </svg>
            </div>
            <ModificationEditor
                showEditor={showCageContextMenu}
                selectedObj={selectedObj}
                closeMenu={() => setShowCageContextMenu(false)}
            />
        </div>
    );
}
