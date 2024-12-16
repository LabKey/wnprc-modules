import * as React from 'react';
import { FC, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { BaseType, zoomTransform } from 'd3';
import { ActionURL } from '@labkey/api';
import { ReactSVG } from 'react-svg';
import { useLayoutContext } from './ContextManager';
import { RoomItemTemplate } from './RoomItemTemplate';
import {
    Cage,
    CageActionProps,
    CageNumber,
    DeleteActions,
    LayoutDragProps,
    LocationCoords,
    PendingRoomUpdate,
    Rack,
    RackTypes,
    RoomItemType,
    RoomObjectTypes,
    UnitLocations
} from './typings';
import { LayoutTooltip } from './LayoutTooltip';
import { CageNumInput } from './CageNumInput';
import {
    addPrevRoomSvgs,
    areCagesInSameRack,
    checkAdjacent,
    createDragInLayout,
    createEndDragInLayout,
    createStartDragInLayout, dragBorder,
    drawGrid,
    findCageInGroup,
    findRackInGroup,
    getLayoutOffset,
    getTargetRect,
    isRack,
    mergeRacks, parseWrapperId,
    placeAndScaleGroup,
    setupEditCageEvent,
    showLayoutEditorConfirmation,
    updateGrid
} from './LayoutEditorHelpers';
import EditorContextMenu from './EditorContextMenu';
import { parseLongId, parseRoomItemNum, parseRoomItemType } from './helpers';
import { SelectorOptions } from './RoomSizeSelector';
import { ConfirmationPopup } from './ConfirmationPopup';
import { RoomSelectorPopup } from './RoomSelectorPopup';

interface EditorProps {
    roomSize?: SelectorOptions
}

const Editor: FC<EditorProps> = ({roomSize}) => {
    const SVG_WIDTH = 1290; // starting pixel width of the layout svg
    const SVG_HEIGHT = 810; // starting pixel height of the layout svg
    const SMALL_GRID_RATIO = 4; // number of cells for length/width of a small cage
    const LARGE_GRID_RATIO = 8; // number of cells for length/width of a large cage
    const CELL_SIZE = 30; // number of pixels of a cell for length/width

    // number of cells in grid width/height, based off scale
    const gridWidth = Math.ceil(SVG_WIDTH / roomSize.scale / CELL_SIZE);
    const gridHeight = Math.ceil(SVG_HEIGHT / roomSize.scale / CELL_SIZE);

    const utilsRef = useRef(null);
    const borderRef = useRef(null);
    const [showGrid, setShowGrid] = useState<boolean>(true);
    const [pendingRoomUpdate, setPendingRoomUpdate] = useState<PendingRoomUpdate>(null);
    const [renameCage, setRenameCage] = useState<boolean>(false);
    const [changeRackType, setChangeRack] = useState<boolean>(false);
    const [borderSetup, setBorderSetup] = useState<boolean>(false); // determines if the border svg has been loaded yet
    const [ctxMenuStyle, setCtxMenuStyle] = useState({
        display: 'none',
        left: '',
        top: '',
    });
    const [showSaveConfirm, setShowSaveConfirm] = useState<boolean>(false);
    const [showRoomSelector, setShowRoomSelector] = useState<boolean>(false);

    const {
        localRoom,
        layoutSvg,
        setLayoutSvg,
        addRoomItem,
        room,
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
        saveRoom
    } = useLayoutContext();

    const dragInLayout = d3.drag().on('start', createStartDragInLayout({setSelectedObj: setSelectedObj}))
        .on('drag', createDragInLayout())
        .on('end', createEndDragInLayout({gridSize: CELL_SIZE, moveItem: moveObjLocation}));

    // combined drag in layout for objects in the layout to close menus when they are selected
    const closeMenuThenDrag = d3.drag()
        .on('start', function (event) {
            console.log("layout Drag started xxx");
            handleContextMenuClose(); // Close the menu when drag starts
            dragInLayout.on('start').call(this, event);
        })
        .on('drag', function (event) {
            dragInLayout.on('drag').call(this, event);
        })
        .on('end', function (event) {
            dragInLayout.on('end').call(this, event);
        });


    useEffect(() => {
        console.log("xxx Room: ", room);
        console.log("xxx LocalRoom: ", localRoom);
        console.log("xxx Locs: ", unitLocs);
        console.log("xxx RoomSize: ", roomSize);
    }, [room, localRoom, unitLocs]);

    // Effect checks for merging/connecting after a rack is moved
    useEffect(() => {
        if(!selectedObj) return;
        const objSvg = d3.select(`#${selectedObj}`);
        // return if selected object is not a rack group or rack
        if(!objSvg.classed('rack') && !objSvg.classed('rack-group')) return;

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
                // create empty unit locations object
                const tempLocs: UnitLocations = Object.fromEntries(
                        Object.values(RackTypes).map(key => [key, [] as LocationCoords[]])
                ) as UnitLocations;

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
                            mergeAvail = checkAdjacent(targetLoc, dragLoc, CELL_SIZE, gridRatio);
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

                    mergeAvail = checkAdjacent(targetLoc, draggedCageLoc, CELL_SIZE, gridRatio);
                    if(mergeAvail){
                        targetCageLoc = targetLoc;
                    }
                })
            });
            console.log("End Merge testing: ");
        }

        if(mergeAvail) {
            const targetShape = layoutSvg.select(`#${targetCageLoc.num}`);
            if(targetShape.empty()) return; // Sometimes it doesn't register a targetShape causing a random crash
            const targetRackShape = (targetShape.node() as SVGGElement).closest('[class*=rack]');
            const {rack: targetRack, rackGroup: targetRackGroup} = findRackInGroup(targetRackShape.getAttribute('id'), localRoom.rackGroups);


            const draggedShape = layoutSvg.select(`#${draggedCageLoc.num}`);
            const draggedRackShape = (draggedShape.node() as SVGGElement).closest('[class*=rack]');

            const {rack: draggedRack, rackGroup: draggedRackGroup} = findRackInGroup(draggedRackShape.getAttribute('id'), localRoom.rackGroups);

            const cageActionProps: CageActionProps = {
                setSelectedObj: setSelectedObj,
                setCtxMenuStyle: setCtxMenuStyle,
            }

            mergeRacks(targetRack, draggedRack, targetRackGroup, draggedRackGroup, doRackAction, closeMenuThenDrag, cageActionProps);
        }
        setSelectedObj(null);
    }, [unitLocs]);

    // This effect updates racks for adding to the room
    useEffect(() => {
        if(!pendingRoomUpdate) return;
        const {draggedShape, cellX, cellY, itemId, updateItemType} = pendingRoomUpdate;
        let group;

        draggedShape.classed('dragging', false);
        const transform = d3.zoomTransform(layoutSvg.node());
        if (!isRack(updateItemType)) { // adding dragged room object
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

        }
        placeAndScaleGroup(group, cellX, cellY, transform);

        addRoomItem(updateItemType, itemId, cellX, cellY, transform.k);

        group.call(closeMenuThenDrag);

        // attach click listener for context menu
        group.selectAll('text').each(function () {
            const textElement: SVGTextElement = d3.select(this).node() as SVGTextElement;
            textElement.setAttribute('contentEditable', 'true');
            (textElement.children[0] as SVGTSpanElement).style.cursor = "pointer";
            (textElement.children[0] as SVGTSpanElement).style.pointerEvents = "auto";
            setupEditCageEvent(textElement, setSelectedObj, setCtxMenuStyle, updateItemType as RackTypes);
        });
        setPendingRoomUpdate(null);
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
            const targetRect = getTargetRect(x, y, CELL_SIZE, transform);
            if (targetRect) {
                const cellX = targetRect.x;
                const cellY = targetRect.y;
                const draggedNodeId = draggedShape.attr('id');

                const updateItemType: RoomItemType = parseWrapperId(draggedNodeId);
                let newId: string;

                if(isRack(updateItemType)){
                    // get new id for rack
                    const tempId = localRoom.rackGroups.reduce((max, group) => {
                        const groupMax = group.racks.reduce((groupMax, rack) => {
                            return parseLongId(rack.itemId) > groupMax ? parseLongId(rack.itemId) : groupMax;
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
                    updateItemType: updateItemType
                });
            } else {
                draggedShape.remove();
            }
        }
    }, [ localRoom, layoutSvg]);

    // After state is done updating for cage id change. refresh svg text and ids
    useEffect(() => {
        if(cageNumChange){
            console.log("selected Obj change: ", selectedObj);
            const objType = parseRoomItemType(selectedObj);
            let group = layoutSvg.select(`#${selectedObj}`).attr('id', `${objType}-${cageNumChange.after}`);
            (group.selectAll('tspan').node() as SVGTSpanElement).textContent = cageNumChange.after.toString();
            handleContextMenuClose();
        }
    }, [cageNumChange]);

    const zoomToScale = (scale: number) => {
        const newTransform = d3.zoomIdentity
            .translate(0, 0)
            .scale(scale);

        // Apply scale to existing zoom handler
        layoutSvg.call(zoom.transform, newTransform);
    }

    // Create a zoom behavior, prevent scale from changing
    const zoom = d3.zoom()
        .scaleExtent([roomSize?.scale || 1, roomSize?.scale || 1])
        .on("zoom", handleZoom);

    // Function to handle zoom for grid, zoom also handles infinite grid generation and drag
    function handleZoom(event) {
        handleContextMenuClose(); // close open context menu if one is open and the user drags the grid
        const transform = event.transform;
        layoutSvg.select("g.grid").attr("transform", transform);

        // Apply zoom/pan to each individual "draggable" group, preserving their relative positions
        layoutSvg.selectAll(".draggable").each(function(d: any) {
            // d is the data object attached to anything that is placed in the grid at the highest group level for that object
            const group = d3.select(this);
            let scale = transform.k
            // Use type assertion to tell TypeScript that d has x and y properties
            const newX = transform.applyX((d as { x: number }).x);
            const newY = transform.applyY((d as { y: number }).y);

            // Apply the transformed position and zoom scale
            group.attr("transform", `translate(${newX}, ${newY}) scale(${scale})`);
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

    useEffect(() => {
        setLayoutSvg(d3.select('#layout-svg') as d3.Selection<SVGElement, {}, HTMLElement, any>);
    }, []);

    // remove grid if desired
    useEffect(() => {
        if(!layoutSvg) return;
        if(showGrid) {
            const updateGridProps = {
                width: SVG_WIDTH,
                height: SVG_HEIGHT,
                gridSize: CELL_SIZE
            }
            drawGrid(layoutSvg, updateGridProps);
        }
        else{
            layoutSvg.select(".grid").selectAll('.cell').remove();
        }
    }, [showGrid, layoutSvg]);

    // Border setup state attaches the data to the svg and a call listener for drag behavior
    useEffect(() => {
        if(!borderSetup) return;
        const borderGroup:  d3.Selection<SVGGElement, {}, HTMLElement, any> = d3.select('#border-template') as  d3.Selection<SVGGElement, {}, HTMLElement, any>;
        placeAndScaleGroup(borderGroup, 0, 0, zoomTransform(layoutSvg.node()));
        borderGroup.call(dragBorder(closeMenuThenDrag, CELL_SIZE, borderGroup));
        // Set zoom after border is loaded in
        if(roomSize){
            zoomToScale(roomSize.scale);

        }
        setBorderSetup(false);
    }, [borderSetup]);

    // Effect attaches an observer to the border_template svg. after it is injected into the dom it will run
    // the function borderInject to set the state for border setup
    useEffect(() => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    // Look for the SVG in the mutation target
                    const svg = borderRef.current.reactWrapper.querySelector('#border_template');
                    if (svg) {
                        console.log('SVG has been injected via MutationObserver:', svg);
                        borderInject(svg);
                        observer.disconnect(); // Stop observing once SVG is found
                    }
                }
            });
        });

        // Start observing the parent container for child changes
        if (borderRef.current) {
            observer.observe(borderRef.current.reactWrapper, { childList: true, subtree: true });
        }

        // Cleanup observer on unmount
        return () => {
            observer.disconnect();
        };
    }, [borderRef]);

    // load grid at load in, or after it was disabled and re-enabled
    useEffect(() => {
        if(layoutSvg){
            if(room.name !== 'new-layout') {
                addPrevRoomSvgs(room, layoutSvg, closeMenuThenDrag);
            }
            //layoutSvg.call(zoom);
        }
    }, [layoutSvg, room]);

    // closes cage editor context menu
    const handleContextMenuClose = () => {
        if(renameCage || changeRackType) return;
        setCtxMenuStyle({
            display: 'none',
            left: '',
            top: '',
        });
        setSelectedObj(null);
    };

    const handleDelCage = () => {
        // state in local room of cage, rack, and group that cage is apart of
        const {cage: localCage, rack: localRack, rackGroup: localGroup} = findCageInGroup(selectedObj as CageNumber, localRoom.rackGroups);

        showLayoutEditorConfirmation(`Are you sure you want to delete ${localCage.cageNum}`).then((r) => {
            if(r){
                let svgToRemove;
                let deleteAction: DeleteActions;
                let newSvgGroup;
                let newRackType: RackTypes;
                if(localRack.cages.length === 1){// one cage in rack, delete rack element
                    if(localGroup.racks.length === 1){// not in a rack group element
                        svgToRemove = layoutSvg.select(`#${localRack.itemId}`);
                        deleteAction = 'group';
                    }else if (localGroup.racks.length === 2){ // in a rack group element, pull other rack out of group element into rack element
                        const rackToSave: Rack = localGroup.racks.find((rack) => rack.itemId !== localRack.itemId);
                        const rackSvg = layoutSvg.select(`#${rackToSave.itemId}`);
                        const newX = rackToSave.x + localGroup.x;
                        const newY = rackToSave.y + localGroup.y;
                        svgToRemove = layoutSvg.select(`#${localGroup.groupId}`);
                        deleteAction = 'rack';
                        newRackType = rackToSave.type.type;
                        newSvgGroup = layoutSvg.append(() => rackSvg.node())
                            .classed('draggable', true);
                        placeAndScaleGroup(newSvgGroup, newX, newY, zoomTransform(layoutSvg.node()));
                    }else{ // in a rack group element, no need to pull out other racks since there is still enough to make a group
                        svgToRemove = layoutSvg.select(`#${localRack.itemId}`);
                        deleteAction = 'rack';
                    }
                }else{ // multiple cages in rack, delete cage element
                    svgToRemove = layoutSvg.select(`#${localCage.cageNum}`);
                    deleteAction = 'cage';
                }

                // reattach listeners if new svg group was created
                if(newSvgGroup){
                    const addProps: LayoutDragProps = {
                        gridSize: CELL_SIZE,
                        moveItem: moveObjLocation
                    };
                    newSvgGroup.call(closeMenuThenDrag);
                    // attach click listener for context menu
                    newSvgGroup.selectAll('text').each(function () {
                        const textElement: SVGTextElement = d3.select(this).node() as SVGTextElement;
                        setupEditCageEvent(textElement, setSelectedObj, setCtxMenuStyle, newRackType);
                    });
                }
                svgToRemove.remove();
                delCage(localCage, localRack, localGroup, deleteAction);
                handleContextMenuClose();
            }
        });
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

    const handleSave = () => {
        console.log("Saving: ", room);
            //saveRoom();
    }

    return (
        <div className={"layout-editor"} onClick={handleContextMenuClose}>
            <div ref={utilsRef} id="utils" className={"room-utils"}>
                <div className={'room-objects'}>
                    <LayoutTooltip text={"Door"}>
                        <RoomItemTemplate
                            type={RoomObjectTypes.Door}
                            fileName={"door"}
                            className={"draggable"}
                        />
                    </LayoutTooltip>
                    <LayoutTooltip text={"Drain"}>
                        <RoomItemTemplate
                            type={RoomObjectTypes.Drain}
                            fileName={"drain"}
                            className={"draggable"}
                        />
                    </LayoutTooltip>
                    <LayoutTooltip text={"Divider"}>
                        <RoomItemTemplate
                            type={RoomObjectTypes.RoomDivider}
                            fileName={"RoomDivider"}
                            className={"draggable"}
                        />
                    </LayoutTooltip>
                </div>
                <div className={'cage-templates'}>
                    <LayoutTooltip text={"Single Cage"}>
                        <RoomItemTemplate
                            type={RackTypes.Cage}
                            fileName={"SingleCageRack"}
                            className={"draggable"}
                        />
                    </LayoutTooltip>
                    <LayoutTooltip text={"Pen"}>
                        <RoomItemTemplate
                            type={RackTypes.Pen}
                            fileName={"Pen"}
                            className={"draggable"}
                        />
                    </LayoutTooltip>
                </div>
            </div>
            <div id={"layout-grid"}>
                {(renameCage) && // Opens menu for renaming cage
                        <CageNumInput
                                onSubmit={(num) => {
                                    changeCageNum(parseRoomItemNum(selectedObj), num);
                                }}
                                onClose={() => setRenameCage(false)}
                        />
                }
                <svg // Ensure the width/height fit the grid, using (scaled cell size * number of cells in width/height)
                    width={(roomSize.scale * CELL_SIZE) * gridWidth}
                    height={(roomSize.scale * CELL_SIZE)* gridHeight}
                    viewBox={`0 0 ${(roomSize.scale * CELL_SIZE) * gridWidth} ${(roomSize.scale * CELL_SIZE) * gridHeight}`}
                    id="layout-svg"
                >
                    <g className={'draggable room-obj'}
                       id={'border-template'}
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
                    onClick={room.name === 'new-layout' ? () => setShowRoomSelector(true) : () => setShowSaveConfirm(true)}
                >{room.name === 'new-layout' ? 'Save Layout' : 'Update Layout'}
                 </button>
            </div>
            {showSaveConfirm &&
                <ConfirmationPopup
                        message={`Are you sure you want to save this current layout as the new layout for room <strong>${localRoom.name}</strong> ?`}
                        onConfirm={handleSave}
                        onCancel={() => setShowSaveConfirm(false)}
                />
            }
            {showRoomSelector &&
                    <RoomSelectorPopup
                            setRoom={setLocalRoom}
                            onConfirm={() => setShowSaveConfirm(true)}
                            onCancel={() => setShowRoomSelector(false)}
                    />
            }
            <EditorContextMenu
                ctxMenuStyle={ctxMenuStyle}
                onClickDelete={handleDelCage}
                onClickRename={() => setRenameCage(true)}
                onClickChangeRack={() => setChangeRack(true)}
                closeMenu={handleContextMenuClose}
            />
        </div>
    );
};

export default Editor;