/*
 *
 *  * Copyright (c) 2025 Board of Regents of the University of Wisconsin System
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *     http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
 */

import * as React from 'react';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { BaseType, zoomTransform } from 'd3';
import { ActionURL } from '@labkey/api';
import { ReactSVG } from 'react-svg';
import { useLayoutEditorContext } from '../../context/LayoutEditorContextManager';
import { RoomItemTemplate } from './RoomItemTemplate';
import {
    Cage,
    CageDirection,
    CageSvgId,
    Rack,
    RackGroup,
    RackStringType,
    RoomItemType,
    RoomObject,
    RoomObjectTypes,
    UnitLocations
} from '../../types/typings';
import {
    CageActionProps,
    DeleteActions,
    LayoutSaveResult,
    MergeProps,
    PendingRoomUpdate
} from '../../types/layoutEditorTypes';
import { LayoutTooltip } from './LayoutTooltip';
import {
    areCagesInSameRack,
    checkAdjacent,
    createDragInLayout,
    createEmptyUnitLoc,
    createEndDragInLayout,
    createStartDragInLayout,
    dragBorder,
    drawGrid,
    findCageInGroup,
    findRackInGroup,
    getLayoutOffset,
    getTargetRect,
    isRackEnum,
    isRoomCreator,
    isTemplateCreator,
    mergeRacks,
    parseWrapperId,
    placeAndScaleGroup,
    setupEditCageEvent,
    showLayoutEditorConfirmation,
    showLayoutEditorError,
    updateBorderSize,
} from '../../utils/LayoutEditorHelpers';
import {
    addPrevRoomSvgs,
    getNextDefaultRackId,
    parseRoomItemNum,
    parseRoomItemType,
    roomItemToString,
    stringToRoomItem
} from '../../utils/helpers';
import { SelectorOptions } from './RoomSizeSelector';
import { ConfirmationPopup } from '../ConfirmationPopup';
import { RoomSelectorPopup } from './RoomSelectorPopup';
import { ChangeRack } from './ChangeRack';
import { EditorContextMenu } from './EditorContextMenu';
import { GateChangeRoom } from './GateChangeRoom';
import { TextInput } from '../TextInput';
import { GateSwitch } from './GateSwitch';
import { CELL_SIZE, SVG_HEIGHT, SVG_WIDTH } from '../../utils/constants';
import { LayoutErrors } from '../LayoutErrors';
import { LoadingScreen } from '../LoadingScreen';
import { RotateRackGroup } from './RotateRackGroup';

interface EditorProps {
    roomSize: SelectorOptions;
}

const Editor: FC<EditorProps> = ({roomSize}) => {
    const utilsRef = useRef(null);
    const borderRef = useRef(null);
    const dragLockRef = useRef(false); // ref that helps ensure very fast drag actions don't crash

    const [showGrid, setShowGrid] = useState<boolean>(true);
    const [borderSetup, setBorderSetup] = useState<boolean>(false); // determines if the border svg has been loaded yet

    const [ctxMenuStyle, setCtxMenuStyle] = useState({
        display: 'none',
        left: '',
        top: '',
    });
    const [showCageContextMenu, setShowCageContextMenu] = useState<boolean>(false);
    const [showObjectContextMenu, setShowObjectContextMenu] = useState<boolean>(false);
    const [showSaveConfirm, setShowSaveConfirm] = useState<boolean>(false);
    const [showRoomSelector, setShowRoomSelector] = useState<boolean>(false);
    const [loadTemplate, setLoadTemplate] = useState<boolean>(false);
    const [showRoomSelectorTemplateLoad, setShowRoomSelectorTemplateLoad] = useState<boolean>(false);
    const [showSaveResult, setShowSaveResult] = useState<LayoutSaveResult>(null);
    const [templateOptions, setTemplateOptions] = useState<boolean>(false);
    const [templateRename, setTemplateRename] = useState<string>(null);
    const [startSaving, setStartSaving] = useState<boolean>(false);

    // number of cells in grid width/height, based off scale
    const gridWidth = Math.ceil(SVG_WIDTH / roomSize.scale / CELL_SIZE);
    const gridHeight = Math.ceil(SVG_HEIGHT / roomSize.scale / CELL_SIZE);

    const {
        localRoom,
        layoutSvg,
        room,
        setLayoutSvg,
        addRoomItem,
        setLocalRoom,
        changeCageNum,
        cageNumChange,
        moveObjLocation,
        doRackAction,
        getNextCageNum,
        selectedObj,
        setSelectedObj,
        delCage,
        unitLocs,
        saveRoom,
        changeRack,
        clearGrid,
        delObject,
        user,
        reloadRoom,
        setReloadRoom
    } = useLayoutEditorContext();

    const contextMenuRef = useRef(localRoom);
    contextMenuRef.current = localRoom;

    // Create a zoom behavior, prevent scale from changing
    const zoom = d3.zoom()
        .scaleExtent([roomSize?.scale || 1, roomSize?.scale || 1])
        .on('zoom', handleZoom);

    const dragInLayout = d3.drag().on('start',
        createStartDragInLayout({setSelectedObj: setSelectedObj, localRoomRef: contextMenuRef}))
        .on('drag', createDragInLayout())
        .on('end', createEndDragInLayout({gridSize: CELL_SIZE, moveItem: moveObjLocation}));

    // combined drag in layout for objects in the layout to close menus when they are selected
    const closeMenuThenDrag = d3.drag()
        .on('start', function (event) {
            setShowCageContextMenu(false); // Close the menu when drag starts
            setShowObjectContextMenu(false); // Close the menu when drag starts
            dragInLayout.on('start').call(this, event);
        })
        .on('drag', function (event) {
            dragInLayout.on('drag').call(this, event);
        })
        .on('end', function (event) {
            dragInLayout.on('end').call(this, event);
        });

    // This function makes changes to the rect svg and adding the new object to the layout, It also calls addRoomItem to add the item to state
    const addToLayout = async (update: PendingRoomUpdate) => {
        const {draggedShape, cellX, cellY, itemId, updateItemType} = update;
        let group;

        draggedShape.classed('dragging', false);
        const transform = d3.zoomTransform(layoutSvg.node());
        const res = await addRoomItem(updateItemType, itemId, cellX, cellY, transform.k);
        if (!res) {
            await showLayoutEditorError('Error adding item to layout');
            dragLockRef.current = false;
            return;
        }

        if (!isRackEnum(updateItemType)) { // adding dragged room object
            group = layoutSvg.append('g')
                .data([{x: cellX, y: cellY}])
                .attr('class', 'draggable room-obj')
                .attr('id', `${roomItemToString(updateItemType)}-${itemId}`)
                .style('pointer-events', 'bounding-box');
            group.append(() => draggedShape.node());

        } else { // adding dragged caging unit
            const newRack: Rack = res as Rack;
            const updateItemTypeString: RackStringType = roomItemToString(updateItemType) as RackStringType;
            group = layoutSvg.append('g')
                .attr('class', `draggable rack type-${updateItemTypeString}`)
                .attr('id', `${newRack.svgId}`)
                .style('pointer-events', 'bounding-box');

            const cageGroup: d3.Selection<BaseType, unknown, HTMLElement, any> = group.append('g')
                .attr('id', `${newRack.cages[0].svgId}`)
                .attr('name', newRack.cages[0].cageNum)
                .attr('transform', `translate(0,0)`)
                .append(() => draggedShape.node());

            const cageIdText: SVGTSpanElement = cageGroup.select('tspan').node() as SVGTSpanElement;

            cageIdText.textContent = `${getNextCageNum(updateItemTypeString)}`;

        }
        placeAndScaleGroup(group, cellX, cellY, transform);


        group.call(closeMenuThenDrag);

        // attach click listener for context menu
        if (isRackEnum(updateItemType)) {
            group.selectAll('text').each(function () {
                const textElement: SVGTextElement = d3.select(this).node() as SVGTextElement;
                textElement.setAttribute('contentEditable', 'true');
                (textElement.children[0] as SVGTSpanElement).style.cursor = 'pointer';
                (textElement.children[0] as SVGTSpanElement).style.pointerEvents = 'auto';
                const cageGroupElement = textElement.closest(`[id="${((res as Rack).cages[0] as Cage).svgId}"]`) as SVGGElement;
                setupEditCageEvent(cageGroupElement, setSelectedObj, contextMenuRef, 'edit', setCtxMenuStyle);
            });
        } else {
            setupEditCageEvent(group.node(), setSelectedObj, contextMenuRef, 'edit', setCtxMenuStyle);
        }

        dragLockRef.current = false;
    };

    // Drag start for dragging from the utilities to the layout
    const dragStarted = useCallback((event: d3.D3DragEvent<SVGElement, any, any>) => {
        if (dragLockRef.current) {
            event.sourceEvent.stopImmediatePropagation();
            return;
        } else {
            dragLockRef.current = true;
        }
        let shape: SVGElement;
        if (showCageContextMenu || showObjectContextMenu) {
            setShowCageContextMenu(false);
            setShowObjectContextMenu(false);
        }
        /*
           Selections can be picky depending on where the user clicks to drag the object,
           make sure it always assigns the shape to the top level SVG element for the object
         */
        if (event.sourceEvent.target.nodeName === 'tspan') {
            shape = (event.sourceEvent.target as SVGTSpanElement).closest(`[class*='draggable']`).cloneNode(true) as SVGElement;
        } else if (event.sourceEvent.target.nodeName === 'path') {
            shape = (event.sourceEvent.target as SVGPathElement).closest(`[class*='draggable']`).cloneNode(true) as SVGElement;
        } else if (event.sourceEvent.target.nodeName === 'polygon') {
            shape = (event.sourceEvent.target as SVGPolygonElement).closest(`[class*='draggable']`).cloneNode(true) as SVGElement;
        } else if (event.sourceEvent.target.nodeName === 'line') {
            shape = (event.sourceEvent.target as SVGLineElement).closest(`[class*='draggable']`).cloneNode(true) as SVGElement;
        } else if (event.sourceEvent.target.nodeName === 'rect') {
            shape = (event.sourceEvent.target as SVGRectElement).closest(`[class*='draggable']`).cloneNode(true) as SVGElement;
        } else {
            shape = event.sourceEvent.target.cloneNode(true) as SVGElement;
        }

        d3.select(shape)
            .style('pointer-events', 'none')
            .attr('class', 'dragging');
        d3.select(document.body).append(() => shape);

        d3.select(shape)
            .attr('transform', `translate(${event.x}, ${event.y})`);
    }, [layoutSvg, localRoom, dragLockRef.current]);

    // Drag move for dragging from the utilities to the layout
    const dragging = useCallback((event) => {
        d3.select('.dragging')
            .attr('transform', `translate(${event.x}, ${event.y})`);
    }, [layoutSvg, localRoom]);

    // Drag end for dragging from the utilities to the layout
    const dragEnded = useCallback(async (event) => {
        // clear transform attribute to prevent it from applying the transform while in groups. This was a change from Chrome 136 -> 137
        const draggedShape: d3.Selection<d3.BaseType, unknown, HTMLElement, any> = d3.select('.dragging').attr('transform', '');
        if (draggedShape.empty()) {
            dragLockRef.current = false;
            return;
        }
        // sync x and y to the layout svg
        const {x, y} = getLayoutOffset({
            clientX: event.sourceEvent.clientX,
            clientY: event.sourceEvent.clientY,
            layoutSvg: layoutSvg
        });

        // Apply transforms for zoom on shape to scale to correct size when placed
        const transform = d3.zoomTransform(layoutSvg.node());
        // Discovers the grid cell to lock onto
        const targetRect = getTargetRect(x, y, CELL_SIZE, transform);

        const draggedNodeId = draggedShape.attr('id');

        const updateItemType: RoomItemType = stringToRoomItem(parseWrapperId(draggedNodeId));

        if (targetRect) {
            // update the found x and y coords with new cell coords if the object was outside the available layout range.
            const cellX = targetRect.x < SVG_WIDTH && targetRect.x > 0 ? targetRect.x : 0;
            const cellY = targetRect.y < SVG_HEIGHT && targetRect.y > 0 ? targetRect.y : 0;

            let newId: number;

            if (isRackEnum(updateItemType)) {
                newId = getNextDefaultRackId(localRoom.rackGroups);
            } else {
                // get new id for room object
                const tempId = localRoom.objects.reduce((max, obj) => {
                    return parseRoomItemNum(obj.itemId) > max ? parseRoomItemNum(obj.itemId) : max;
                }, 0) + 1;
                newId = tempId;
            }
            await addToLayout({
                draggedShape: draggedShape,
                cellX: cellX,
                cellY: cellY,
                itemId: newId,
                updateItemType: updateItemType
            });
        } else {
            draggedShape.remove();
        }
    }, [layoutSvg, localRoom]);


    const zoomToScale = (scale: number) => {
        const newTransform = d3.zoomIdentity
            .translate(0, 0)
            .scale(scale);

        // Apply scale to existing zoom handler
        layoutSvg.call(zoom.transform, newTransform);
    };

    // Function to handle zoom level for grid
    function handleZoom(event) {
        setShowCageContextMenu(false); // close open context menu if one is open and the user drags the grid
        const transform = event.transform;
        layoutSvg.select('g.grid').attr('transform', transform);

        layoutSvg.selectAll('.draggable').each(function (d: any) {
            // d is the data object attached to anything that is placed in the grid at the highest group level for that object
            const group = d3.select(this);
            let scale = transform.k;
            // Use type assertion to tell TypeScript that d has x and y properties
            const newX = transform.applyX((d as { x: number }).x);
            const newY = transform.applyY((d as { y: number }).y);

            // Apply the transformed position and zoom scale
            group.attr('transform', `translate(${newX}, ${newY}) scale(${scale})`);
        });

        // Dynamically regenerate the grid based on current transform (zoom level)
        drawGrid(layoutSvg, {width: SVG_WIDTH, height: SVG_HEIGHT, gridSize: CELL_SIZE});
    }

    /* Function to be run after the svg border_template is injected into the dom from the ReactSVG component.
       ReactSVG has an afterInjection prop but that causes a rerender on the svg removing changes caused
       by d3 mutations.
    */
    function borderInject(svg) {
        // Ensure resize handle can receive events
        const resizeHandle = svg.querySelector('#resize-handle');
        resizeHandle.setAttribute('pointer-events', 'bounding-box');

        const rect = svg.querySelector('#border-rect');
        rect.setAttribute('pointer-events', 'none');
        setBorderSetup(true);
    }

    // Effect checks for merging/connecting after a rack is moved
    useEffect(() => {
        if (!selectedObj) {
            return;
        }
        let objSvg;
        if (selectedObj.selectionType === 'rackGroup') {
            objSvg = d3.select(`#${(selectedObj as RackGroup).groupId}`);
        } else {
            objSvg = d3.select(`#${(selectedObj as Rack).svgId}`);
        }
        // return if objSvg is not found or not a rack/rackgroup able to merge
        if (objSvg.empty()) {
            return;
        }
        if (!objSvg.classed('rack') && !objSvg.classed('rack-group')) {
            return;
        }


        let mergeAvail: boolean = false;
        let direction: CageDirection;
        let targetCageLoc;
        let draggedCageLoc;

        // if selectedObj is a group of racks, make dragged rack the group of racks
        if (selectedObj.selectionType === 'rackGroup') {
            const draggedRackGroup: Rack[] = localRoom.rackGroups.find((group) =>
                group.groupId === (selectedObj as RackGroup).groupId
            ).racks;
            const draggedCagesGroup: CageSvgId[] = draggedRackGroup.flatMap((rack) => rack.cages.map(cage => cage.svgId));

            // Create temp object of cage locations not in the dragged group
            const cagesNotInDragged: UnitLocations = (() => {
                const tempLocs: UnitLocations = {...unitLocs};

                draggedRackGroup.forEach((rack) => {
                    tempLocs[roomItemToString(rack.type.type)] = tempLocs[roomItemToString(rack.type.type)].filter((unit) => !draggedCagesGroup.includes(unit.cageId));
                });

                return tempLocs;
            })();

            // Temp object of cages within the dragged group
            const cagesInDragged: UnitLocations = (() => {
                // create empty unit locations object
                const tempLocs: UnitLocations = createEmptyUnitLoc();

                draggedRackGroup.forEach((rack) => {
                    tempLocs[roomItemToString(rack.type.type)] = unitLocs[roomItemToString(rack.type.type)].filter((unit) => draggedCagesGroup.includes(unit.cageId));
                });

                return tempLocs;
            })();

            //Based off previous objects determine if a merge is possible
            Object.entries(cagesInDragged).forEach(([draggedRackType, draggedCageLocs]) => {
                if (draggedCageLocs.length === 0 || mergeAvail) {
                    return;
                }
                draggedCageLocs.forEach((dragLoc) => {
                    if (mergeAvail) {
                        return;
                    }
                    Object.entries(cagesNotInDragged).forEach(([targetRackType, targetCageLocs]) => {
                        if (targetCageLocs.length === 0 || mergeAvail) {
                            return;
                        }
                        targetCageLocs.forEach((targetLoc) => {
                            if (mergeAvail) {
                                return;
                            }
                            const {cage: draggedCage} = findCageInGroup(dragLoc.cageId, localRoom.rackGroups);
                            const {cage: targetCage} = findCageInGroup(targetLoc.cageId, localRoom.rackGroups);

                            const adj = checkAdjacent(targetLoc, dragLoc, draggedCage.size, targetCage.size);
                            mergeAvail = adj.isAdjacent;
                            direction = adj.direction as CageDirection;

                            if (mergeAvail) {
                                targetCageLoc = targetLoc;
                                draggedCageLoc = dragLoc;
                            }
                        });
                    });
                });
            });
        } else {
            const draggedRack: Rack = selectedObj as Rack;
            const draggedRackType: RackStringType = roomItemToString(draggedRack.type.type) as RackStringType;


            if (!draggedRackType) {
                return;
            }
            //This is the first cage in the dragged rack that will determine if a merge is possible
            const draggedCage: Cage = draggedRack.cages.find((cage) => cage.positionId === 1);

            draggedCageLoc = unitLocs[draggedRackType].find((cage) => cage.cageId === draggedCage.svgId);

            // rackType is the string for the enum here, cages is the array of locations for that unit
            Object.entries(unitLocs).forEach(([unitRackType, cageLocs]) => {
                if (cageLocs.length === 0 || mergeAvail) {
                    return;
                }
                cageLocs.forEach((targetLoc) => {
                    if (draggedCage.svgId === targetLoc.cageId || mergeAvail) {
                        return;
                    } // cant merge into itself
                    const {cage: targetCage} = findCageInGroup(targetLoc.cageId, localRoom.rackGroups);
                    let inSameRack = false;
                    localRoom.rackGroups.forEach((group) => {
                        group.racks.forEach(rack => {
                            if (areCagesInSameRack(rack, targetLoc, draggedCageLoc)) {
                                inSameRack = true;
                                return;
                            }
                        });
                    });

                    if (inSameRack) {
                        return;
                    }
                    const adj = checkAdjacent(targetLoc, draggedCageLoc, draggedCage.size, targetCage.size);
                    mergeAvail = adj.isAdjacent;
                    direction = adj.direction as CageDirection;
                    if (mergeAvail) {
                        targetCageLoc = targetLoc;
                    }
                });
            });
        }

        if (mergeAvail) {
            const targetShape = layoutSvg.select(`#${targetCageLoc.cageId}`);
            if (targetShape.empty()) {
                return;
            } // Sometimes it doesn't register a targetShape causing a random crash
            const targetRackShape = (targetShape.node() as SVGGElement).closest('[class*="rack"]');
            const {
                rack: targetRack,
                rackGroup: targetRackGroup
            } = findRackInGroup(targetRackShape.getAttribute('id'), localRoom.rackGroups);


            const draggedShape = layoutSvg.select(`#${draggedCageLoc.cageId}`);
            const draggedRackShape = (draggedShape.node() as SVGGElement).closest('[class*="rack"]');

            const {
                rack: draggedRack,
                rackGroup: draggedRackGroup
            } = findRackInGroup(draggedRackShape.getAttribute('id'), localRoom.rackGroups);

            const cageActionProps: CageActionProps = {
                setSelectedObj: setSelectedObj,
                setCtxMenuStyle: setCtxMenuStyle,
            };

            const mergeProps: MergeProps = {
                contextMenuRef: contextMenuRef,
                targetRack,
                targetCageId: targetCageLoc.cageId,
                draggedRack,
                dragCageId: draggedCageLoc.cageId,
                targetRackGroup,
                dragRackGroup: draggedRackGroup,
                doRackAction,
                layoutDrag: closeMenuThenDrag,
                cageActionProps
            };
            mergeRacks(mergeProps);
        }
        setSelectedObj(null);
    }, [unitLocs]);


    // Effect for handling the grid layout and drag effects on the layout and from the utils
    useEffect(() => {
        if (!layoutSvg) {
            return;
        }

        // Define drag behavior
        const dragToLayout = d3.drag()
            .on('start', dragStarted)
            .on('drag', dragging)
            .on('end', dragEnded);

        // wrapper for dragToLayout to close the menus when drag starts
        const closeMenuThenDragToLayout = d3.drag()
            .on('start', function (event) {
                setShowCageContextMenu(false);
                setShowObjectContextMenu(false);
                dragToLayout.on('start').call(this, event);
            })
            .on('drag', function (event) {
                dragToLayout.on('drag').call(this, event);
            })
            .on('end', function (event) {
                dragToLayout.on('end').call(this, event);
            });

        // Apply drag behavior to utils items
        d3.select(utilsRef.current).selectAll('.draggable')
            .call(closeMenuThenDragToLayout);

    }, [localRoom, layoutSvg]);

    // After state is done updating for cage id change. refresh svg text and ids
    useEffect(() => {
        if (cageNumChange) {
            const cageId = (selectedObj as Cage).svgId;
            const cageNum = (selectedObj as Cage).cageNum;
            const objType = parseRoomItemType(cageNum);
            let group = layoutSvg.select(`#${cageId}`).attr('name', `${objType}-${cageNumChange.after}`);
            (group.selectAll('tspan').node() as SVGTSpanElement).textContent = cageNumChange.after.toString();
            setShowCageContextMenu(false);
        }
    }, [cageNumChange]);

    useEffect(() => {
        setLayoutSvg(d3.select('#layout-svg') as d3.Selection<SVGElement, {}, HTMLElement, any>);
    }, []);

    // remove grid if desired
    useEffect(() => {
        if (!layoutSvg) {
            return;
        }
        if (showGrid) {
            const updateGridProps = {
                width: SVG_WIDTH,
                height: SVG_HEIGHT,
                gridSize: CELL_SIZE
            };
            drawGrid(layoutSvg, updateGridProps);
        } else {
            layoutSvg.select('.grid').selectAll('.cell').remove();
        }
    }, [showGrid, layoutSvg]);

    // Border setup state attaches the data to the svg and a call listener for drag behavior
    useEffect(() => {
        if (!borderSetup) {
            return;
        }
        const borderGroup: d3.Selection<SVGGElement, {}, HTMLElement, any> = d3.select('#layout-border') as d3.Selection<SVGGElement, {}, HTMLElement, any>;
        const borderRect = d3.select('#border-rect');

        if (!localRoom.layoutData) {
            setLocalRoom(prevState => ({
                ...prevState,
                layoutData: {
                    scale: roomSize.scale,
                    borderWidth: parseInt(borderRect.attr('width')),
                    borderHeight: parseInt(borderRect.attr('height')),
                    status: false
                }
            }));
        } else {
            //update border width and height

            updateBorderSize(borderGroup, localRoom.layoutData.borderWidth, localRoom.layoutData.borderHeight);
        }
        // Attach x and y data to border group and drag call for resizing
        placeAndScaleGroup(borderGroup, 0, 0, zoomTransform(layoutSvg.node()));
        borderGroup.call(
            dragBorder(
                () => {
                    setShowObjectContextMenu(false);
                    setShowCageContextMenu(false);
                },
                CELL_SIZE,
                borderGroup,
                setLocalRoom
            )
        );

        // Set zoom after border is loaded in
        zoomToScale(roomSize.scale);

        if (localRoom.rackGroups.length > 0 || localRoom.objects.length > 0) {
            setReloadRoom(localRoom);
        }

        setBorderSetup(false);
    }, [borderSetup]);


    // reloads room svgs with updated state.
    useEffect(() => {
        if (!reloadRoom) {
            return;
        }
        // clears grid
        d3.select('#layout-svg').selectAll(':scope > g').each(function (d, i) {
            // 'this' refers to the current DOM element
            const element = d3.select(this) as d3.Selection<SVGGElement, {}, null, undefined>;
            if (element.node().id.includes('layout')) {
                return;
            } else {
                element.remove();
            }
        });
        // loads grid with new room
        addPrevRoomSvgs('edit', reloadRoom, layoutSvg, undefined, undefined, setSelectedObj, contextMenuRef, setCtxMenuStyle, closeMenuThenDrag);
        setReloadRoom(null);
    }, [reloadRoom]);

    // Effect attaches an observer to the border_template svg. after it is injected into the dom it will run
    // the function borderInject to set the state for border setup
    useEffect(() => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    // Look for the SVG in the mutation target
                    const svg = borderRef.current.reactWrapper.querySelector('#border_template');
                    if (svg) {
                        borderInject(svg);
                        observer.disconnect(); // Stop observing once SVG is found
                    }
                }
            });
        });

        // Start observing the parent container for child changes
        if (borderRef.current) {
            observer.observe(borderRef.current.reactWrapper, {childList: true, subtree: true});
        }

        // Cleanup observer on unmount
        return () => {
            observer.disconnect();
        };
    }, [borderRef]);

    // closes cage editor context menu
    useEffect(() => {
        if (!showCageContextMenu && !showObjectContextMenu) {
            setCtxMenuStyle({
                display: 'none',
                left: '',
                top: '',
            });
            setSelectedObj(null);
        }
    }, [showCageContextMenu, showObjectContextMenu]);

    useEffect(() => {
        if (!selectedObj) {
            return;
        }
        if (ctxMenuStyle.display !== 'none') {
            if (selectedObj.selectionType === 'cage') {
                setShowCageContextMenu(true);
            } else {
                setShowObjectContextMenu(true);
            }
        }
    }, [ctxMenuStyle]);

    // Template load is in effect instead of function so that localRoom updates before it starts
    useEffect(() => {
        if (loadTemplate) {
            window.location.href = ActionURL.buildURL(
                ActionURL.getController(),
                'cageui-editLayout',
                ActionURL.getContainer(),
                {room: localRoom.name}
            );
        }
    }, [loadTemplate]);

    // Deletes rack or cage from layout
    const handleDel = (type: 'rack' | 'cage') => {
        // state in local room of cage, rack, and group that cage is apart of
        const {
            cage: localCage,
            rack: localRack,
            rackGroup: localGroup
        } = findCageInGroup((selectedObj as Cage).svgId, localRoom.rackGroups);

        const cagesToDelete: string = type === 'rack' ? localRack.cages.map((cage) => cage.cageNum).join(', ') : localCage.cageNum;
        showLayoutEditorConfirmation(`Are you sure you want to delete ${cagesToDelete}`).then((r) => {
            if (r) {
                let deleteAction: DeleteActions;
                if (localRack.cages.length === 1) {// one cage in rack, delete rack element
                    if (localGroup.racks.length === 1) {// not in a rack group element
                        deleteAction = 'group'; // this is group, if one cage, is in one rack, in one group
                    } else if (localGroup.racks.length === 2) { // in a rack group element, pull other rack out of group element into rack element
                        deleteAction = 'rack';
                    } else { // in a rack group element, no need to pull out other racks since there is still enough to make a group
                        deleteAction = 'rack';
                    }
                } else if (type === 'rack') {
                    if (localGroup.racks.length === 1) {
                        deleteAction = 'group';
                    } else {
                        deleteAction = 'rack';
                    }
                } else { // multiple cages in rack, delete cage element
                    deleteAction = 'cage';
                }
                delCage(localCage, localRack, localGroup, deleteAction);
                setShowCageContextMenu(false);
            }
        });
    };


    const handleDelObject = () => {
        const selectionToDel = layoutSvg.select(`#${(selectedObj as RoomObject).itemId}`);
        let selectionName = selectionToDel.select('.injected-svg').attr('id'); // name from id in file/injected svg
        // parses the first word if id contains multiple words.
        selectionName = selectionName.indexOf('_') !== -1 ? selectionName.slice(0, selectionName.indexOf('_')) : selectionName;
        showLayoutEditorConfirmation(`Are you sure you want to delete ${selectionName}`).then((r) => {
            if (r) {
                selectionToDel.remove();
                delObject(selectionToDel.attr('id'));
            }
        });

    };

    // deletes all cages/objects from grid
    const handleClear = () => {
        clearGrid();
        d3.select('#layout-svg').selectAll(':scope > g').each(function (d, i) {
            // 'this' refers to the current DOM element
            const element = d3.select(this) as d3.Selection<SVGGElement, {}, null, undefined>;
            if (element.node().id.includes('layout')) {
                return;
            } else {
                element.remove();
            }
        });
    };

    const handleSave = async () => {


        const result = await saveRoom(templateRename);
        setStartSaving(false);
        setShowSaveResult(result);
    };

    const handleSaveClose = (roomName: string) => {
        if (!showSaveResult.success) { // don't switch windows if error occurred
            setShowSaveResult(null);
        } else {
            setShowSaveResult(null);
            window.location.href = ActionURL.buildURL(
                ActionURL.getController(),
                'editLayout',
                ActionURL.getContainer(),
                {room: roomName}
            );
        }
    };

    //Ensures if canceling the submit confirmation on an unselected room layout, it returns to default room.
    const handleCancelConfirm = () => {
        if (room.name !== localRoom.name) {
            setLocalRoom(prevRoom => ({
                ...prevRoom,
                name: room.name
            }));
        }
        if (templateOptions) {
            setTemplateOptions(false);
        }
    };

    // Handles changing racks in the layout editor
    const handleRackChange = async (newType: { value: string, label: string }, isNew: boolean) => {
        const result: string = await changeRack(newType, isNew);
        const {rack: currRack} = findCageInGroup((selectedObj as Cage).svgId, localRoom.rackGroups);
        const idToChange = currRack.svgId;
        if (result) {
            layoutSvg.select(`#${idToChange}`).attr('id', result);
        }
        setShowCageContextMenu(false);
    };

    return (
        <div className={'layout-editor'}>
            {startSaving &&
                    <LoadingScreen
                            isVisible={startSaving}
                            targetElement={document.getElementById('layout-editor-container')}
                    />
            }
            <div ref={utilsRef} id="utils" className={'room-utils'}>
                <div className={'room-objects'}>
                    <LayoutTooltip text={'Top'}>
                        <RoomItemTemplate
                            fileName={'top'}
                            className={'draggable'}
                        />
                    </LayoutTooltip>
                    <LayoutTooltip text={'Bottom'}>
                        <RoomItemTemplate
                            fileName={'bottom'}
                            className={'draggable'}
                        />
                    </LayoutTooltip>
                    <LayoutTooltip text={'Door'}>
                        <RoomItemTemplate
                            fileName={'door'}
                            className={'draggable'}
                        />
                    </LayoutTooltip>
                    <LayoutTooltip text={'Drain'}>
                        <RoomItemTemplate
                            fileName={'drain'}
                            className={'draggable'}
                        />
                    </LayoutTooltip>
                    <LayoutTooltip text={'Divider'}>
                        <RoomItemTemplate
                            fileName={'roomDivider'}
                            className={'draggable'}
                        />
                    </LayoutTooltip>
                    <LayoutTooltip text={'Room Gate (Closed)'}>
                        <RoomItemTemplate
                            fileName={'gateClosed'}
                            className={'draggable'}
                        />
                    </LayoutTooltip>
                    <LayoutTooltip text={'Room Gate (Open)'}>
                        <RoomItemTemplate
                            fileName={'gateOpen'}
                            className={'draggable'}
                        />
                    </LayoutTooltip>
                </div>
                <div className={'cage-templates'}>
                    <LayoutTooltip text={'Single Cage'}>
                        <RoomItemTemplate
                            fileName={'cage'}
                            className={'draggable'}
                        />
                    </LayoutTooltip>
                    <LayoutTooltip text={'Pen'}>
                        <RoomItemTemplate
                            fileName={'pen'}
                            className={'draggable'}
                        />
                    </LayoutTooltip>
                </div>
            </div>
            <div id={'layout-grid'}>
                <svg // Ensure the width/height fit the grid, using (scaled cell size * number of cells in width/height)
                    width={(roomSize.scale * CELL_SIZE) * gridWidth}
                    height={(roomSize.scale * CELL_SIZE) * gridHeight}
                    viewBox={`0 0 ${(roomSize.scale * CELL_SIZE) * gridWidth} ${(roomSize.scale * CELL_SIZE) * gridHeight}`}
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
                            viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
                            height={SVG_HEIGHT}
                            width={SVG_WIDTH}
                            pointerEvents={'none'}
                        />
                    </g>
                </svg>
            </div>
            <div id={'layout-toolbar'}>
                <div className="checkbox-wrapper-8">
                    <input
                        className="tgl tgl-skewed"
                        id="cb3-8"
                        type="checkbox"
                        checked={showGrid}
                        onChange={() => setShowGrid(prevState => !prevState)}
                    />
                    <label
                        className="tgl-btn"
                        data-tg-off="Grid Disabled"
                        data-tg-on="Grid Enabled"
                        htmlFor="cb3-8"></label>
                </div>
                <button
                    id={'clearBtn'}
                    className={'layout-toolbar-btn'}
                    onClick={handleClear}
                >Clear Layout
                </button>
                {isTemplateCreator(user) &&
                        <button
                                id={'saveTemplateBtn'}
                                className={'layout-toolbar-btn'}
                                onClick={() => {
                                    setTemplateOptions(true);
                                    setShowRoomSelector(true);
                                }}
                        >Save as Template
                        </button>
                }
                {(isRoomCreator(user) || isTemplateCreator(user)) &&
                        <button
                                id={'loadTemplateBtn'}
                                className={'layout-toolbar-btn'}
                                onClick={() => {
                                    setTemplateOptions(true);
                                    setShowRoomSelectorTemplateLoad(true);
                                }}
                        >Load Template
                        </button>
                }

                <button
                    id={'saveLayoutBtn'}
                    className={'layout-toolbar-btn'}
                    onClick={localRoom.name === 'new-layout' ? () => setShowRoomSelector(true) : () => setShowSaveConfirm(true)}
                >{localRoom.name === 'new-layout' ? 'Save Layout' : 'Update Layout'}
                </button>
            </div>
            {showSaveConfirm &&
                    <ConfirmationPopup
                            message={`Are you sure you want to save this current layout as the new layout for room <strong>${localRoom.name}</strong> ?`}
                            onConfirm={() => {
                                setStartSaving(true);
                                handleSave();
                            }}
                            onCancel={handleCancelConfirm}
                            onClose={() => setShowSaveConfirm(false)}
                    />
            }
            {showRoomSelector &&
                    <RoomSelectorPopup
                            setRoom={setLocalRoom}
                            template={templateOptions}
                            templateRename={setTemplateRename}
                            onConfirm={() => {
                                setShowRoomSelector(false);
                                setShowSaveConfirm(true);
                            }}
                            onCancel={() => {
                                setTemplateOptions(false);
                                setShowRoomSelector(false);
                            }}
                    />
            }
            {showRoomSelectorTemplateLoad &&
                    <RoomSelectorPopup
                            setRoom={setLocalRoom}
                            template={templateOptions}
                            templateLoad={true}
                            onConfirm={() => setLoadTemplate(true)}
                            onCancel={() => {
                                setShowRoomSelectorTemplateLoad(false);
                                setTemplateOptions(false);
                            }}
                    />
            }
            {showSaveResult && showSaveResult.success &&
                    <ConfirmationPopup
                            message={
                                `${showSaveResult.roomName} was submitted successfully.`
                            }
                            onClose={() => handleSaveClose(showSaveResult.roomName)}
                    />
            }
            {showSaveResult && !showSaveResult.success &&
                    <LayoutErrors
                            errors={showSaveResult.reason}
                    />
            }
            {showCageContextMenu &&
                    <EditorContextMenu
                            ctxMenuStyle={ctxMenuStyle}
                            type={'caging'}
                            selectedObj={selectedObj}
                            onClickDelete={handleDel}
                            closeMenu={() => setShowCageContextMenu(false)}
                            menuItems={[
                                {
                                    element:
                                        <ChangeRack
                                            onSubmit={handleRackChange}
                                            currRack={findCageInGroup((selectedObj as Cage).svgId, localRoom.rackGroups).rack}
                                        />,
                                    types: [],
                                    title: 'Change Rack'
                                },
                                {
                                    element:
                                        <TextInput
                                            onSubmit={(num) => {
                                                changeCageNum(parseRoomItemNum((selectedObj as Cage).cageNum), num);
                                                setShowCageContextMenu(false);
                                            }}
                                        />,
                                    types: [],
                                    title: 'Change Cage Number'
                                },
                                {
                                    element:
                                        <RotateRackGroup />,
                                    types: [],
                                    title: 'Rotate Rack Group'
                                }
                            ]}
                    />
            }
            {showObjectContextMenu &&
                    <EditorContextMenu
                            ctxMenuStyle={ctxMenuStyle}
                            type={'object'}
                            onClickDelete={handleDelObject}
                            selectedObj={selectedObj}
                            closeMenu={() => setShowObjectContextMenu(false)}
                            menuItems={[{
                                element:
                                    <GateChangeRoom
                                        key={`gate-change-${(selectedObj as RoomObject).itemId}`}
                                        selectedObj={selectedObj}
                                        setLocalRoom={setLocalRoom}
                                    />,
                                types: [RoomObjectTypes.GateClosed, RoomObjectTypes.GateOpen],
                                title: 'Change Connected Room'
                            },
                                {
                                    element:
                                        <GateSwitch
                                            key={`gate-switch-${(selectedObj as RoomObject).itemId}`}
                                            layoutSvg={layoutSvg}
                                            selectedObj={selectedObj as RoomObject}
                                            setLocalRoom={setLocalRoom}
                                            closeMenu={() => setShowObjectContextMenu(false)}
                                        />,
                                    types: [RoomObjectTypes.GateClosed, RoomObjectTypes.GateOpen],
                                    title: "Switch Gate Status"
                                }
                            ]}
                    />
            }
        </div>
    );
};

export default Editor;