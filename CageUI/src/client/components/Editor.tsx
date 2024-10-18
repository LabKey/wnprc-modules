import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { BaseType, svg } from 'd3';
import { ActionURL } from '@labkey/api';
import { ReactSVG } from 'react-svg';
import { useLayoutContext } from './ContextManager';
import { RackTemplate } from './RackTemplate';
import { Cage, CageActionProps, LayoutDragProps, LocationCoords, PendingRackUpdate, RackTypes } from './typings';
import { LayoutTooltip } from './LayoutTooltip';
import { CageNumInput } from './CageNumInput';
import {
    checkAdjacent,
    createDragInLayout,
    createEndDragInLayout,
    createStartDragInLayout,
    drawGrid,
    getLayoutOffset,
    getTargetRect,
    mergeRacks,
    placeAndScaleGroup,
    setupEditCageNumEvent,
    updateGrid
} from './LayoutEditorHelpers';
import { areCagesInSameRack } from './helpers';
import EditorContextMenu from './EditorContextMenu';

const Editor = () => {
    const MAX_SNAP_DISTANCE = 100;  // Adjust this value as needed
    const SVG_WIDTH = 1290;
    const SVG_HEIGHT = 810;
    const CAGE_GRID_RATIO = 4;
    const PEN_GRID_RATIO = 4;
    const GRID_SIZE = 30;
    const utilsRef = useRef(null);
    const [showGrid, setShowGrid] = useState<boolean>(false);
    const [addingRack, setAddingRack] = useState<boolean>(false);
    const [layoutSvg, setLayoutSvg] = useState<d3.Selection<SVGElement, {}, HTMLElement, any>>(null);
    const [pendingRackUpdate, setPendingRackUpdate] = useState<PendingRackUpdate>(null);
    const [renameCage, setRenameCage] = useState<boolean>(false);

    const [ctxMenuStyle, setCtxMenuStyle] = useState({
        display: 'none',
        left: '',
        top: '',
    });

    const {
        localRoom,
        addRack,
        room,
        delRack,
        changeCageId,
        cageNumChange,
        moveRackLocation,
        mergeLocalRacks,
        getNextCageNum,
        clickedRack,
        setClickedRack,
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
        if(!clickedRack) return;
        const rackType = localRoom.find(rack => rack.id === clickedRack).type;

        console.log("Dragged rack 1: ", clickedRack);

        //This is the first cage in the dragged rack that will determine if a merge is possible
        const currCage: Cage = localRoom.find(rack => rack.id === clickedRack).cages.find((cage) => cage.id === 1);

        const currCageLoc: LocationCoords = unitLocs[rackType].find((cage) => cage.num === currCage.cageNum);

        // rackType is the string for the enum here, cages is the array of locations for that unit
        Object.entries(unitLocs).forEach(([rackType, cages]) => {
            if(cages.length === 0) return;
            cages.forEach((cage) => {
                if(currCage.cageNum === cage.num) return; // cant merge into itself
                let inSameRack = false;

                localRoom.forEach(rack => {
                    if(areCagesInSameRack(rack, cage, currCageLoc)) {
                        inSameRack = true;
                        return;
                    }
                });
                if(inSameRack) {
                    return;
                }
                const gridRatio = rackType === RackTypes.Pen ? PEN_GRID_RATIO : CAGE_GRID_RATIO;

                const mergeAvail = checkAdjacent(cage, currCageLoc, GRID_SIZE, gridRatio);
                if(mergeAvail) {
                    const targetShape = layoutSvg.select(`[id*="${rackType}-${cage.num}"]`);
                    if(targetShape.empty()) return; // Sometimes it doesn't register a targetShape causing a random crash
                    const targetRack = (targetShape.node() as SVGGElement).closest('[id^=rack-]');
                    const draggedShape = layoutSvg.select(`[id*="${rackType}-${currCage.cageNum}"]`);
                    const draggedRack = (draggedShape.node() as SVGGElement).closest('[id^=rack-]');
                    console.log("Merging: ", targetRack, draggedRack);
                    const layoutDragProps: LayoutDragProps = {
                        MAX_SNAP_DISTANCE: MAX_SNAP_DISTANCE,
                        delRack: delRack,
                        gridRatio: gridRatio,
                        gridSize: GRID_SIZE,
                        layoutSvg: layoutSvg,
                        moveRack: moveRackLocation,
                        rackType: RackTypes[rackType]
                    };
                    const cageActionProps: CageActionProps = {
                        setEditCageNum: setClickedCage,
                        setClickedRackNum: setClickedRack,
                        setCtxMenuStyle: setCtxMenuStyle,
                    }
                    mergeRacks(d3.select(targetRack), d3.select(draggedRack), mergeLocalRacks, layoutDragProps, cageActionProps);
                }
            })
        });
        setClickedRack(null);
    }, [unitLocs])

    // This effect updates racks for adding to the room
    useEffect(() => {
        if(!pendingRackUpdate) return;
        const {draggedShape, cellX, cellY, rackId, rackType} = pendingRackUpdate;
        const gridRatio = rackType === RackTypes.Pen ? PEN_GRID_RATIO : CAGE_GRID_RATIO;

        draggedShape.classed('dragging', false);

        let group;
        if ((draggedShape.node() as SVGElement).children['rack-room-util']) {
            group = layoutSvg.append('g')
                .data([{x: cellX, y: cellY}])
                .attr('class', "draggable room-obj")
                .style('pointer-events', "bounding-box");
            group.append(() => draggedShape.node());
        } else {

            const cageGroup: d3.Selection<BaseType, unknown, HTMLElement, any> = draggedShape.select(`#${rackType}-x`);
            if(cageGroup.empty()) return; // Sometimes cage group isn't bound correctly causing a random crash
            const cageIdText = draggedShape.select('tspan');
            const transform = d3.zoomTransform(layoutSvg.node());

            // Change the id of the group in the pre-created svg img, and set class name for top level group.
            const currentId = cageGroup.attr('id');
            if(currentId){
                const newRackId = currentId.replace(`${rackType}-x`, `${rackType}-${getNextCageNum(rackType)}`)
                cageGroup.attr('id', newRackId); // Set the new ID
            }
            cageIdText.node().textContent = `${getNextCageNum(rackType)}`;

            group = layoutSvg.append('g')
                .attr('class', `draggable rack room-obj`)
                .attr('id', `rack-${rackId}`)
                .style('pointer-events', "bounding-box");

            group.append(() => draggedShape.node());
            placeAndScaleGroup(group, cellX, cellY, transform);
            addRack(rackId, cellX, cellY, transform.k, rackType);
        }

        const addProps: LayoutDragProps = {
            gridSize: GRID_SIZE,
            gridRatio: gridRatio,
            MAX_SNAP_DISTANCE: MAX_SNAP_DISTANCE,
            layoutSvg: layoutSvg,
            delRack: delRack,
            moveRack: moveRackLocation,
            rackType: rackType
        };
        // Reattach drag listeners for interaction within layout
        group.call(d3.drag().on('start', createStartDragInLayout({setRack: setClickedRack}))
            .on('drag', createDragInLayout({layoutSvg: layoutSvg}))
            .on('end', createEndDragInLayout(addProps)));

        // Reattach click listener for text editing
        group.selectAll('text').each(function () {
            const textElement: SVGTextElement = d3.select(this).node() as SVGTextElement;
            textElement.setAttribute('contentEditable', 'true');
            (textElement.children[0] as SVGTSpanElement).style.cursor = "pointer";
            (textElement.children[0] as SVGTSpanElement).style.pointerEvents = "auto";
            // Return the cleanup function to remove the event listener when the component unmounts
            setupEditCageNumEvent(textElement, setClickedCage, setClickedRack, setCtxMenuStyle, rackType);
        });
        setAddingRack(false);
    }, [pendingRackUpdate]);

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
                const newId = localRoom.reduce((max, obj) => (obj.id > max ? obj.id : max), 0) + 1;
                const draggedNodeId = ((draggedShape.node() as SVGElement).firstChild.firstChild as SVGElement).getAttribute('id');
                let rackType;
                if(draggedNodeId.includes("pen")){
                    rackType = RackTypes.Pen;
                }else{
                    rackType = RackTypes.Cage;
                }
                setPendingRackUpdate({
                    draggedShape: draggedShape,
                    rackType: rackType,
                    cellX: cellX,
                    cellY: cellY,
                    rackId: newId});
                setAddingRack(true);
            } else {
                draggedShape.remove();
            }
        }
    }, [ localRoom, layoutSvg]);

    // Cleanup for after updating rack
    useEffect(() => {
        if(!addingRack){
            setPendingRackUpdate(null);
        }
    }, [addingRack]);

    // After state is done updating for cage id change. refresh svg text and ids
    useEffect(() => {
        if(cageNumChange){
            let group = layoutSvg.select(`#rack-${clickedRack}`).select(`#cage-${cageNumChange.before}`).attr('id', `cage-${cageNumChange.after}`);
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
                                id={'rack-room-util'}
                                wrapper={'svg'}
                            />
                        </svg>
                    </LayoutTooltip>
                    <LayoutTooltip text={"Drain"}>
                        <svg className="draggable">
                            <ReactSVG
                                src={`${ActionURL.getContextPath()}/cageui/static/drain.svg`}
                                id={'rack-room-util'}
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
                                    changeCageId(clickedCage, num);
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