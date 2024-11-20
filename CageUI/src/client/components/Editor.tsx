import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { BaseType, svg } from 'd3';
import { ActionURL } from '@labkey/api';
import { ReactSVG } from 'react-svg';
import { useLayoutContext } from './ContextManager';
import { RackTemplate } from './RackTemplate';
import {
    Cage,
    CageActionProps, CageNumber,
    LayoutDragProps,
    LocationCoords,
    PendingRoomUpdate,
    Rack,
    RackTypes,
    RoomItemClass, RoomObject,
    RoomObjectTypes, UnitLocations
} from './typings';
import { LayoutTooltip } from './LayoutTooltip';
import { CageNumInput } from './CageNumInput';
import {
    areCagesInSameRack,
    checkAdjacent,
    createDragInLayout,
    createEndDragInLayout,
    createStartDragInLayout,
    drawGrid, findRackInGroup, findSelectObjRack,
    getLayoutOffset,
    getTargetRect,
    isRack,
    mergeRacks,
    placeAndScaleGroup,
    setupEditCageEvent, showLayoutEditorError,
    updateGrid
} from './LayoutEditorHelpers';
import EditorContextMenu from './EditorContextMenu';
import { convertCageNumToNum, convertCageNumToType, parseRoomItemNum, parseRoomItemType } from './helpers';

const Editor = () => {
    const MAX_SNAP_DISTANCE = 100;  // Adjust this value as needed
    const SVG_WIDTH = 1290;
    const SVG_HEIGHT = 810;
    const SMALL_GRID_RATIO = 4;
    const LARGE_GRID_RATIO = 8;
    const GRID_SIZE = 30;
    const utilsRef = useRef(null);
    const [showGrid, setShowGrid] = useState<boolean>(true);
    const [addingRoomItem, setAddingRoomItem] = useState<boolean>(false);
    const [layoutSvg, setLayoutSvg] = useState<d3.Selection<SVGElement, {}, HTMLElement, any>>(null);
    const [pendingRoomUpdate, setPendingRoomUpdate] = useState<PendingRoomUpdate>(null);
    const [renameCage, setRenameCage] = useState<boolean>(false);

    const [ctxMenuStyle, setCtxMenuStyle] = useState({
        display: 'none',
        left: '',
        top: '',
    });

    const {
        localRoom,
        addRoomItem,
        room,
        delRack,
        changeCageNum,
        cageNumChange,
        moveObjLocation,
        doRackAction,
        getNextCageNum,
        selectedObj,
        setSelectedObj,
        delCage,
        unitLocs
    } = useLayoutContext();

    const handleClickRename = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        setRenameCage(true);
    };

    useEffect(() => {
        console.log("xxx Room: ", room);
        console.log("xxx LocalRoom: ", localRoom);
        console.log("xxx Locs: ", unitLocs);
    }, [room, localRoom, unitLocs]);

    // Effect checks for merging after a rack is moved
    useEffect(() => {
        if(!selectedObj || cageNumChange) return;

        let mergeAvail: boolean = false;
        let targetCageLoc;
        let draggedCageLoc;

        // if selectedObj is a group of racks, make dragged rack the group of racks
        if(selectedObj.includes('group')){
            const draggedRackGroup: Rack[] = localRoom.rackGroups.find((group) => group.groupId === selectedObj).racks;
            const draggedCagesGroup: string[] = draggedRackGroup.flatMap((rack) => rack.cages.map(cage => cage.cageNum));

            // Create temp object of cage locations not in the dragged group
            const cagesNotInDragged: UnitLocations = (() => {
                const tempLocs: UnitLocations = {...unitLocs};

                draggedRackGroup.forEach((rack) => {
                    tempLocs[rack.type.type] = tempLocs[rack.type.type].filter((unit) => !draggedCagesGroup.includes(unit.num))
                })

                return tempLocs;
            })();

            // Temp object of cages within the dragged group
            const cagesInDragged: UnitLocations = (() => {
                const tempLocs: UnitLocations = {
                    attachedPlayCage: [],
                    cage: [],
                    pen: [],
                    tempCage: []
                };

                draggedRackGroup.forEach((rack) => {
                    tempLocs[rack.type.type] = unitLocs[rack.type.type].filter((unit) => draggedCagesGroup.includes(unit.num))
                })

                return tempLocs;
            })();

            //Based off previous objects determine if a merge is possible
            Object.entries(cagesInDragged).forEach(([draggedRackType, draggedCageLocs]) => {
                if(draggedCageLocs.length === 0 || mergeAvail) return;
                draggedCageLocs.forEach((dragLoc) => {
                    if(mergeAvail) return;
                    Object.entries(cagesNotInDragged).forEach(([targetRackType, targetCageLocs]) => {
                        if(targetCageLocs.length === 0 || mergeAvail) return;
                        const gridRatio = (targetRackType === RackTypes.Pen || targetRackType === RackTypes.PlayCage) ? LARGE_GRID_RATIO : SMALL_GRID_RATIO;
                        targetCageLocs.forEach((targetLoc) => {
                            if(mergeAvail) return;
                            mergeAvail = checkAdjacent(targetLoc, dragLoc, GRID_SIZE, gridRatio);
                            if(mergeAvail){
                                targetCageLoc = targetLoc;
                                draggedCageLoc = dragLoc;
                            }
                        })
                    })
                })
            });
            console.log("End connected testing", cagesNotInDragged, cagesInDragged);
        }else{
            const {rack: draggedRack} = findRackInGroup(selectedObj, localRoom.rackGroups);
            const draggedRackType = draggedRack.type.type;

            if(!draggedRackType){
                return;
            }
            console.log("Dragged rack 1: ", selectedObj);

            //This is the first cage in the dragged rack that will determine if a merge is possible
            const draggedCage: Cage = draggedRack.cages.find((cage) => cage.id === 1);

            draggedCageLoc = unitLocs[draggedRackType].find((cage) => cage.num === draggedCage.cageNum);

            // rackType is the string for the enum here, cages is the array of locations for that unit
            Object.entries(unitLocs).forEach(([unitRackType, cageLocs]) => {
                if(cageLocs.length === 0 || mergeAvail) return;
                cageLocs.forEach((targetLoc) => {
                    if(draggedCage.cageNum === targetLoc.num || mergeAvail) return; // cant merge into itself
                    let inSameRack = false;
                    localRoom.rackGroups.forEach((group) => {
                        group.racks.forEach(rack => {
                            if(areCagesInSameRack(rack, targetLoc, draggedCageLoc)) {
                                console.log("Same Rack: ", rack, targetLoc, draggedCageLoc);
                                inSameRack = true;
                                return;
                            }
                        });
                    });

                    if(inSameRack) {
                        return;
                    }
                    const targetRackType = parseRoomItemType(targetLoc.num) as RackTypes;
                    const gridRatio = (targetRackType === RackTypes.Pen || targetRackType === RackTypes.PlayCage) ? LARGE_GRID_RATIO : SMALL_GRID_RATIO;

                    mergeAvail = checkAdjacent(targetLoc, draggedCageLoc, GRID_SIZE, gridRatio);
                    if(mergeAvail){
                        targetCageLoc = targetLoc;
                    }
                })
            });
            console.log("End Merge testing: ");
        }

        if(mergeAvail) {
            const targetShape = layoutSvg.select(`[id^="${targetCageLoc.num}"]`);
            if(targetShape.empty()) return; // Sometimes it doesn't register a targetShape causing a random crash
            const targetRackShape = (targetShape.node() as SVGGElement).closest('[class*=rack]');
            const {rack: targetRack, rackGroup: targetRackGroup} = findRackInGroup(targetRackShape.getAttribute('id'), localRoom.rackGroups);


            const draggedShape = layoutSvg.select(`[id^="${draggedCageLoc.num}"]`);
            const draggedRackShape = (draggedShape.node() as SVGGElement).closest('[class*=rack]');

            const {rack: draggedRack, rackGroup: draggedRackGroup} = findRackInGroup(draggedRackShape.getAttribute('id'), localRoom.rackGroups);

            const layoutDragProps: LayoutDragProps = {
                MAX_SNAP_DISTANCE: MAX_SNAP_DISTANCE,
                delRack: delRack,
                gridSize: GRID_SIZE,
                layoutSvg: layoutSvg,
                moveItem: moveObjLocation,
                itemClass: 'caging', // only caging units can be connected/merged
            };

            const cageActionProps: CageActionProps = {
                setEditCageNum: setSelectedObj,
                setCtxMenuStyle: setCtxMenuStyle,
            }

            mergeRacks(targetRack, draggedRack, targetRackGroup, draggedRackGroup, doRackAction, layoutDragProps, cageActionProps);
        }
        setSelectedObj(null);
    }, [unitLocs]);

    // This effect updates racks for adding to the room
    useEffect(() => {
        if(!pendingRoomUpdate) return;
        const {draggedShape, cellX, cellY, itemId, updateItemType, itemTypeClass} = pendingRoomUpdate;
        let group;

        draggedShape.classed('dragging', false);
        const transform = d3.zoomTransform(layoutSvg.node());
        if (itemTypeClass !== 'caging') { // adding dragged room object
            group = layoutSvg.append('g')
                .data([{x: cellX, y: cellY}])
                .attr('class', "draggable room-obj")
                .attr('id', `${itemId}`)
                .style('pointer-events', "bounding-box");
            group.append(() => draggedShape.node());
        } else { // adding dragged caging unit

            group = layoutSvg.append('g')
                .attr('class', `draggable rack type-${updateItemType as RackTypes}`)
                .attr('id', `${itemId}`)
                .style('pointer-events', 'bounding-box');

            const cageGroup: d3.Selection<BaseType, unknown, HTMLElement, any> = group.append('g')
                .attr('id', `${updateItemType}-${getNextCageNum(updateItemType as RackTypes)}`)
                .attr('transform', `translate(0,0)`)
                .append(() => draggedShape.node());

            const cageIdText: SVGTSpanElement = cageGroup.select('tspan').node() as SVGTSpanElement;

            cageIdText.textContent = `${getNextCageNum(updateItemType as RackTypes)}`;


            placeAndScaleGroup(group, cellX, cellY, transform);
        }
        addRoomItem(itemTypeClass, updateItemType, itemId, cellX, cellY, transform.k);

        const addProps: LayoutDragProps = {
            gridSize: GRID_SIZE,
            MAX_SNAP_DISTANCE: MAX_SNAP_DISTANCE,
            layoutSvg: layoutSvg,
            delRack: delRack,
            moveItem: moveObjLocation,
            itemClass: itemTypeClass
        };
        // Reattach drag listeners for interaction within layout
        group.call(d3.drag().on('start', createStartDragInLayout({setRoomItem: setSelectedObj}))
            .on('drag', createDragInLayout({layoutSvg: layoutSvg}))
            .on('end', createEndDragInLayout(addProps)));

        // Reattach click listener for text editing
        group.selectAll('text').each(function () {
            const textElement: SVGTextElement = d3.select(this).node() as SVGTextElement;
            textElement.setAttribute('contentEditable', 'true');
            (textElement.children[0] as SVGTSpanElement).style.cursor = "pointer";
            (textElement.children[0] as SVGTSpanElement).style.pointerEvents = "auto";
            setupEditCageEvent(textElement, setSelectedObj, setCtxMenuStyle, updateItemType as RackTypes);
        });
        setAddingRoomItem(false);
    }, [pendingRoomUpdate]);

    // Effect for handling the grid layout and drag effects on the layout and from the utils
    useEffect(() => {
        if (!layoutSvg) return;

        // Define drag behavior
        const drag = d3.drag()
            .on('start', dragStarted)
            .on('drag', dragging)
            .on('end', dragEnded);

        // Apply drag behavior to utils items
        d3.select(utilsRef.current).selectAll('.draggable')
            .call(drag);

        // Drag start for dragging from the utilities to the layout
        function dragStarted(event: d3.D3DragEvent<SVGElement, any, any>) {
            let shape: SVGElement;
            /*
               Selections can be picky depending on where the user clicks to drag the object,
               make sure it always assigns the shape to the top level SVG element for the object
             */
            if(event.sourceEvent.target.nodeName === 'tspan'){
                shape = (event.sourceEvent.target as SVGTSpanElement).closest(`[class*='draggable']`).cloneNode(true) as SVGElement;
            }else if(event.sourceEvent.target.nodeName === 'path'){
                shape = (event.sourceEvent.target as SVGPathElement).closest(`[class*='draggable']`).cloneNode(true) as SVGElement;
            }else{
                shape = event.sourceEvent.target.cloneNode(true) as SVGElement;
            }

            d3.select(shape)
                .style('pointer-events', 'none')
                .attr('class', 'dragging');
            d3.select(document.body).append(() => shape);

            d3.select(shape)
                .attr('transform', `translate(${event.x}, ${event.y})`);
        }
        // Drag move for dragging from the utilities to the layout

        function dragging(event) {
            d3.select('.dragging')
                .attr('transform', `translate(${event.x}, ${event.y})`);
        }
        // Drag end for dragging from the utilities to the layout
        function dragEnded(event) {
            const draggedShape:  d3.Selection<d3.BaseType, unknown, HTMLElement, any> = d3.select('.dragging');
            // sync x and y to the layout svg
            const {x,y} = getLayoutOffset({
                clientX: event.sourceEvent.clientX,
            clientY: event.sourceEvent.clientY,
            layoutSvg: layoutSvg})
            // Apply transforms for zoom on shape to scale to correct size when placed
            const transform = d3.zoomTransform(layoutSvg.node());
            // Discovers the grid cell to lock onto
            const targetRect = getTargetRect(x, y, GRID_SIZE, transform);
            if (targetRect) {
                const cellX = targetRect.x;
                const cellY = targetRect.y;

                // First expression is if dragged shape is a rack, the second is a room object.
                const draggedNodeId = ((draggedShape.node() as SVGElement).firstChild.firstChild as SVGElement).getAttribute('id') || ((draggedShape.node() as SVGElement).firstChild as SVGElement).getAttribute('id');

                let itemType: RoomItemClass;
                let updateItemType: RackTypes | RoomObjectTypes;
                let newId: string;
                if(draggedNodeId.includes("pen")) {
                    updateItemType = RackTypes.Pen;
                    itemType = 'caging';
                }else if (draggedNodeId.includes('cage')) {
                    updateItemType = RackTypes.Cage;
                    itemType = 'caging';
                }else if (draggedNodeId.includes('door')) {
                    updateItemType = RoomObjectTypes.Door;
                    itemType = 'roomObj';
                }else if (draggedNodeId.includes('drain')) {
                    updateItemType = RoomObjectTypes.Drain;
                    itemType = 'roomObj';
                }

                if(itemType === 'caging'){
                    // get new id for rack
                    const tempId = localRoom.rackGroups.reduce((max, group) => {
                        const groupMax = group.racks.reduce((groupMax, rack) => {
                            return parseRoomItemNum(rack.itemId) > groupMax ? parseRoomItemNum(rack.itemId) : groupMax;
                        }, 0);
                        return groupMax > max ? groupMax : max;
                    }, 0) + 1;
                    newId = `default-rack-${tempId}`;
                }else{
                    // get new id for room object
                    const tempId = localRoom.objects.reduce((max, obj) => {
                        return  parseRoomItemNum(obj.itemId)> max ? parseRoomItemNum(obj.itemId) : max;
                    }, 0) + 1;
                    newId = `default-object-${tempId}`;
                }
                setPendingRoomUpdate({
                    draggedShape: draggedShape,
                    cellX: cellX,
                    cellY: cellY,
                    itemId: newId,
                    itemTypeClass: itemType,
                    updateItemType: updateItemType
                });
                setAddingRoomItem(true);
            } else {
                draggedShape.remove();
            }
        }
    }, [ localRoom, layoutSvg]);

    // Cleanup for after updating rack
    useEffect(() => {
        if(!addingRoomItem){
            setPendingRoomUpdate(null);
        }
    }, [addingRoomItem]);

    // After state is done updating for cage id change. refresh svg text and ids
    useEffect(() => {
        if(cageNumChange){
            console.log("selected Obj change: ", selectedObj);
            const objType = parseRoomItemType(selectedObj);
            let group = layoutSvg.select(`#${selectedObj}`).attr('id', `${objType}-${cageNumChange.after}`);
            (group.selectAll('tspan').node() as SVGTSpanElement).textContent = cageNumChange.after.toString();
            setCtxMenuStyle({ display: 'none', top: '0px', left: '0px' });
            setSelectedObj(null);
        }
    }, [cageNumChange]);

    // Create a zoom behavior
    const zoom = d3.zoom()
        .scaleExtent([0.6, 1])
        .on("zoom", handleZoom);

    // Create a drag behavior
    const dragGrid = d3.drag()
        .on("drag", handleDrag);
    // Function to handle zoom
    function handleZoom(event) {
        const transform = event.transform;
        layoutSvg.select("g.grid").attr("transform", transform);
        // Apply zoom/pan to each individual "room-object" group, preserving their relative positions
        layoutSvg.selectAll(".room-obj").each(function(d: any) {
            const group = d3.select(this);
            // Use type assertion to tell TypeScript that d has x and y properties
            const newX = transform.applyX((d as { x: number }).x);
            const newY = transform.applyY((d as { y: number }).y);

            // Apply the transformed position and zoom scale
            group.attr("transform", `translate(${newX}, ${newY}) scale(${transform.k})`);
        });

        // Dynamically regenerate the grid based on current transform (zoom level)
        updateGrid(transform, SVG_WIDTH, SVG_HEIGHT, GRID_SIZE);
    }

    // Function to handle drag
    function handleDrag(event) {
        const g = d3.select("g.grid");
        const dx = event.dx;
        const dy = event.dy;
        const currentTransform = g.attr("transform") || "translate(0, 0)";
        const newTransform = currentTransform.replace(/translate\(([^,]+),([^)]+)\)/, (match, x, y) => {
            const newX = parseFloat(x) + dx;
            const newY = parseFloat(y) + dy;
            return `translate(${newX}, ${newY})`;
        });
        g.attr("transform", newTransform);
    }

    useEffect(() => {
        setLayoutSvg(d3.select('#layout-svg'));
    }, []);

    // remove grid if desired
    useEffect(() => {
        if(showGrid) return;
        layoutSvg.select(".grid").selectAll('.cell').remove();
    }, [showGrid]);

    // load grid at load in or after it was cleared
    useEffect(() => {
        if(!layoutSvg || !showGrid) return;
        const updateGridProps = {
            width: SVG_WIDTH,
            height: SVG_HEIGHT,
            gridSize: GRID_SIZE
        }
        drawGrid(layoutSvg, updateGridProps);
        layoutSvg.call(zoom); // Enable zoom
        layoutSvg.select("g.grid").call(dragGrid);
    }, [layoutSvg, showGrid]);

    const handleContextMenuClose = () => {
        setCtxMenuStyle({
            display: 'none',
            left: '',
            top: '',
        });
        setSelectedObj(null);
    };

    const handleSave = () => {
        console.log("Saving layout");
    }

    const handleDefaultSave = () => {
        console.log("Saving to default layout");
    }

    const handleReset = () => {
        console.log("Resetting to default layout");
    }

    const handleClear = () => {
        console.log("Resetting to default layout");
    }

    return (
        <div className={"layout-editor"} onClick={handleContextMenuClose}>
            <div ref={utilsRef} id="utils" className={"room-utils"}>
                <div className={'room-objects'}>
                    <LayoutTooltip text={"Door"}>
                        <svg id='door-util' className="draggable">
                            <ReactSVG
                                src={`${ActionURL.getContextPath()}/cageui/static/door.svg`}
                                id={'wrapped-door-util'}
                                wrapper={'svg'}
                            />
                        </svg>
                    </LayoutTooltip>
                    <LayoutTooltip text={"Drain"}>
                        <svg id={'drain-util'} className="draggable">
                            <ReactSVG
                                src={`${ActionURL.getContextPath()}/cageui/static/drain.svg`}
                                id={'wrapped-drain-util'}
                                wrapper={'svg'}
                            />
                        </svg>
                    </LayoutTooltip>
                </div>
                <div className={'cage-templates'}>
                    <LayoutTooltip text={"Single Cage"}>
                        <RackTemplate
                            divClassName={'cage-template'}
                            fileName={"SingleCageRack"}
                            className={"draggable"}
                        />
                    </LayoutTooltip>
                    <LayoutTooltip text={"Pen"}>
                        <RackTemplate
                            divClassName={'pen-template'}
                            fileName={"Pen"}
                            className={"draggable"}
                        />
                    </LayoutTooltip>
                </div>
            </div>
            <div id={"layout-grid"} style={{width: SVG_WIDTH, height: SVG_HEIGHT}}>
                {(renameCage) &&
                        <CageNumInput
                                onSubmit={(num) => {
                                    changeCageNum(parseRoomItemNum(selectedObj), num);
                                }}
                                onClose={() => setRenameCage(false)}
                        />
                }
                <svg
                    width={SVG_WIDTH}
                    height={SVG_HEIGHT}
                    id="layout-svg"
                ></svg>
            </div>
            <div id={"layout-toolbar"}>
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
                    className={"layout-toolbar-btn"}
                    onClick={handleClear}
                >Clear
                </button>
                <button
                    className={"layout-toolbar-btn"}
                    onClick={handleReset}
                >Reset To Default
                </button>
                <button
                    className={"layout-toolbar-btn"}
                    onClick={handleDefaultSave}
                >Save As Default
                </button>
                <button
                    className={"layout-toolbar-btn"}
                    onClick={handleSave}
                >Save
                </button>
            </div>
            <EditorContextMenu
                ctxMenuStyle={ctxMenuStyle}
                onClickDelete={delCage}
                onClickRename={handleClickRename}
            />
        </div>
    );
};

export default Editor;