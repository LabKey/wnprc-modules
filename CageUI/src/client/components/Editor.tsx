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
    RoomItemType, RoomObject,
    RoomObjectTypes
} from './typings';
import { LayoutTooltip } from './LayoutTooltip';
import { CageNumInput } from './CageNumInput';
import {
    areCagesInSameRack,
    checkAdjacent,
    createDragInLayout,
    createEndDragInLayout,
    createStartDragInLayout,
    drawGrid,
    getLayoutOffset,
    getTargetRect,
    isRack,
    mergeRacks,
    placeAndScaleGroup,
    setupEditCageNumEvent,
    updateGrid
} from './LayoutEditorHelpers';
import EditorContextMenu from './EditorContextMenu';
import { convertCageNumToNum, convertCageNumToType, parseRoomItem } from './helpers';

const Editor = () => {
    const MAX_SNAP_DISTANCE = 100;  // Adjust this value as needed
    const SVG_WIDTH = 1290;
    const SVG_HEIGHT = 810;
    const SMALL_GRID_RATIO = 4;
    const LARGE_GRID_RATIO = 8;
    const GRID_SIZE = 30;
    const utilsRef = useRef(null);
    const [showGrid, setShowGrid] = useState<boolean>(false);
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
        mergeLocalRacks,
        getNextCageNum,
        selectedObj,
        setSelectedObj,
        clickedCage,
        setClickedCage,
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
        if(!selectedObj) return;
        const draggedRackType = localRoom.find(rack => rack.itemId === selectedObj).type;
        const targetRackType = localRoom.find(rack => rack.itemId === selectedObj).type;
        if(!isRack(draggedRackType)) return;
        console.log("Dragged rack 1: ", selectedObj);

        //This is the first cage in the dragged rack that will determine if a merge is possible
        const draggedCage: Cage = (localRoom.find(roomItem => {
            if(isRack(roomItem.type)){
                return roomItem.itemId === selectedObj;
            }
            return false;
        }) as Rack).cages.find((cage) => cage.id === 1);

        const draggedCageLoc: LocationCoords = unitLocs[draggedRackType].find((cage) => cage.num === draggedCage.cageNum);

        // rackType is the string for the enum here, cages is the array of locations for that unit
        Object.entries(unitLocs).forEach(([unitRackType, cageLocs]) => {
            if(cageLocs.length === 0) return;
            cageLocs.forEach((targetCageLoc) => {
                if(draggedCage.cageNum === targetCageLoc.num) return; // cant merge into itself
                let inSameRack = false;
                //TODO fix this bug with checking if pens/cages/tempCages/playCages are in the same "rack"
                localRoom.forEach(roomItem => {
                    if(!isRack(roomItem.type)) return;
                    if(areCagesInSameRack(roomItem as Rack, targetCageLoc, draggedCageLoc)) {
                        console.log("Same Rack: ", roomItem, targetCageLoc, draggedCageLoc);
                        inSameRack = true;
                        return;
                    }
                });
                if(inSameRack) {
                    return;
                }
                const gridRatio = convertCageNumToType(targetCageLoc.num) === RackTypes.Pen || convertCageNumToType(targetCageLoc.num) === RackTypes.PlayCage ? LARGE_GRID_RATIO : SMALL_GRID_RATIO;

                const mergeAvail = checkAdjacent(targetCageLoc, draggedCageLoc, GRID_SIZE, gridRatio);
                if(mergeAvail) {
                    const targetShape = layoutSvg.select(`[id^="${targetCageLoc.num}"]`);
                    if(targetShape.empty()) return; // Sometimes it doesn't register a targetShape causing a random crash
                    const targetRackShape = (targetShape.node() as SVGGElement).closest('[class*=rack]');
                    const targetRack = localRoom.find(roomItem => {
                        if(isRack(roomItem.type)){
                            return roomItem.itemId === targetRackShape.getAttribute('id');
                        }
                        return false;
                    }) as Rack;
                    const targetCage = targetRack.cages.find((cage) => cage.cageNum === targetShape.attr('id') as CageNumber);

                    const draggedShape = layoutSvg.select(`[id^="${draggedCageLoc.num}"]`);
                    const draggedRackShape = (draggedShape.node() as SVGGElement).closest('[class*=rack]');
                    const draggedRack = localRoom.find(roomItem => {
                        if(isRack(roomItem.type)){
                            return roomItem.itemId === draggedRackShape.getAttribute('id');
                        }
                        return false;
                    }) as Rack;
                    const draggedCage = targetRack.cages.find((cage) => cage.cageNum === targetShape.attr('id') as CageNumber);


                    console.log("Merging: ", targetRack, draggedRack);
                    const layoutDragProps: LayoutDragProps = {
                        MAX_SNAP_DISTANCE: MAX_SNAP_DISTANCE,
                        delRack: delRack,
                        gridRatio: gridRatio,
                        gridSize: GRID_SIZE,
                        layoutSvg: layoutSvg,
                        moveItem: moveObjLocation,
                        itemType: Object.values(RackTypes).find(type => type === unitRackType) as RackTypes,
                    };
                    const cageActionProps: CageActionProps = {
                        setEditCageNum: setClickedCage,
                        setClickedRack: setSelectedObj,
                        setCtxMenuStyle: setCtxMenuStyle,
                    }

                    mergeRacks(targetRack, draggedRack, mergeLocalRacks, layoutDragProps, cageActionProps, targetCage, draggedCage);
                }
            })
        });
        setSelectedObj(null);
    }, [unitLocs]);

    // This effect updates racks for adding to the room
    useEffect(() => {
        if(!pendingRoomUpdate) return;
        const {draggedShape, cellX, cellY, itemId, itemType} = pendingRoomUpdate;
        let gridRatio: number;
        let group;

        draggedShape.classed('dragging', false);
        const transform = d3.zoomTransform(layoutSvg.node());
        
        if (!isRack(itemType)) {
            group = layoutSvg.append('g')
                .data([{x: cellX, y: cellY}])
                .attr('class', "draggable room-obj")
                .attr('id', `${itemId}`)
                .style('pointer-events', "bounding-box");
            group.append(() => draggedShape.node());
        } else {
            // Determine the grid ratio for merging depending on size of dragged object
            if(itemType === RackTypes.Pen || itemType === RackTypes.PlayCage){
                gridRatio = LARGE_GRID_RATIO;
            }else{
                gridRatio = SMALL_GRID_RATIO;
            }
            const cageGroup: d3.Selection<BaseType, unknown, HTMLElement, any> = draggedShape.select(`#${itemType}-x`);
            if(cageGroup.empty()) return; // Sometimes cage group isn't bound correctly causing a random crash
            const cageIdText = draggedShape.select('tspan');


            // Change the id of the group in the pre-created svg img, and set class name for top level group.
            const currentId = cageGroup.attr('id');
            if(currentId){
                const newRackId = currentId.replace(`${itemType}-x`, `${itemType}-${getNextCageNum(itemType as RackTypes)}`)
                cageGroup.attr('id', newRackId); // Set the new ID
            }
            cageIdText.node().textContent = `${getNextCageNum(itemType as RackTypes)}`;

            group = layoutSvg.append('g')
                .attr('class', `draggable rack`)
                .attr('id', `${itemId}`)
                .style('pointer-events', "bounding-box");

            group.append(() => draggedShape.node());
            placeAndScaleGroup(group, cellX, cellY, transform);
        }
        addRoomItem(itemType, itemId, cellX, cellY, transform.k);

        const addProps: LayoutDragProps = {
            gridSize: GRID_SIZE,
            gridRatio: gridRatio,
            MAX_SNAP_DISTANCE: MAX_SNAP_DISTANCE,
            layoutSvg: layoutSvg,
            delRack: delRack,
            moveItem: moveObjLocation,
            itemType: itemType as RackTypes
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
            // Return the cleanup function to remove the event listener when the component unmounts
            setupEditCageNumEvent(textElement, setClickedCage, setSelectedObj, setCtxMenuStyle, itemType as RackTypes);
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
            const shape = event.sourceEvent.target.cloneNode(true) as SVGElement;
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
            const draggedShape = d3.select('.dragging');
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
                // TODO currently the next avail rack id, fix to obj id and add a new field for rack ids or convert to obj ids only
                const draggedNodeId = ((draggedShape.node() as SVGElement).firstChild.firstChild as SVGElement).getAttribute('id') || ((draggedShape.node() as SVGElement).firstChild as SVGElement).getAttribute('id');
                let itemType: RoomItemType; // todo fix this rack type to be object type
                let newId: string;
                if(draggedNodeId.includes("pen")) {
                    itemType = RackTypes.Pen;
                }else if (draggedNodeId.includes('cage')) {
                    itemType = RackTypes.Cage;
                }else if (draggedNodeId.includes('door')){
                    itemType = RoomObjectTypes.Door;
                }
                // TODO might not need objType since rackType = null means its a room object
                if(isRack(itemType)){
                    // get new id for rack
                    const tempId = localRoom.reduce((max, obj) => {
                        if (!isRack(obj.type)) return max;
                        obj = obj as Rack;
                        return parseRoomItem(obj.itemId) > max ?  parseRoomItem(obj.itemId) : max;
                    }, 0) + 1;
                    newId = `default-rack-${tempId}`;
                }else{
                    // get new id for room object
                    const tempId = localRoom.reduce((max, obj) => {
                        if (isRack(obj.type)) return max;
                        obj = obj as RoomObject;
                        return  parseRoomItem(obj.itemId)> max ? parseRoomItem(obj.itemId) : max;
                    }, 0) + 1;
                    newId = `default-object-${tempId}`;
                }
                setPendingRoomUpdate({
                    draggedShape: draggedShape,
                    itemType: itemType,
                    cellX: cellX,
                    cellY: cellY,
                    itemId: newId,
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
            let group = layoutSvg.select(`#rack-${selectedObj}`).select(`#cage-${cageNumChange.before}`).attr('id', `cage-${cageNumChange.after}`);
            (group.selectAll('tspan').node() as SVGTSpanElement).textContent = cageNumChange.after.toString();
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
       /* do {
            setTimeout(() => {}, 1000);
        }while (d3.select('#layout-svg').empty())*/
        setLayoutSvg(d3.select('#layout-svg'));
    }, []);

    useEffect(() => {
        if(!layoutSvg) return;
        const updateGridProps = {
            width: SVG_WIDTH,
            height: SVG_HEIGHT,
            gridSize: GRID_SIZE
        }
        drawGrid(layoutSvg, updateGridProps);
        layoutSvg.call(zoom); // Enable zoom
        layoutSvg.select("g.grid").call(dragGrid);
    }, [layoutSvg]);

    const handleContextMenuClose = () => {
        setCtxMenuStyle({
            display: 'none',
            left: '',
            top: '',
        });
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
                        <svg className="draggable">
                            <ReactSVG
                                src={`${ActionURL.getContextPath()}/cageui/static/door.svg`}
                                id={'door-util'}
                                wrapper={'svg'}
                            />
                        </svg>
                    </LayoutTooltip>
                    <LayoutTooltip text={"Drain"}>
                        <svg className="draggable">
                            <ReactSVG
                                src={`${ActionURL.getContextPath()}/cageui/static/drain.svg`}
                                id={'drain-util'}
                                wrapper={'svg'}
                            />
                        </svg>
                    </LayoutTooltip>
                </div>
                <div className={'cage-templates'}>
                    <LayoutTooltip text={"Single Cage"}>
                        <RackTemplate
                            fileName={"SingleCageRack"}
                            className={"draggable"}
                        />
                    </LayoutTooltip>
                    <LayoutTooltip text={"Pen"}>
                        <RackTemplate
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
                                    changeCageNum(clickedCage, num);
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
            <EditorContextMenu ctxMenuStyle={ctxMenuStyle} onClickOutside={handleContextMenuClose} onClickDelete={delCage} onClickRename={handleClickRename}/>
        </div>
    );
};

export default Editor;