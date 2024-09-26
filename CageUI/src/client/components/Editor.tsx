import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { ActionURL } from '@labkey/api';
import { ReactSVG } from 'react-svg';
import { useLayoutContext } from './ContextManager';
import { RackTemplate } from './RackTemplate';
import { RackTypes, PendingRackUpdate, LayoutDragProps } from './typings';
import { LayoutTooltip } from './LayoutTooltip';
import { svg, zoomTransform } from 'd3';
import { CageNumInput } from './CageNumInput';
import {
    startDragInLayout,
    createEndDragInLayout,
    checkAdjacent,
    drawGrid, updateGrid, getTargetRect, placeAndScaleGroup, createDragInLayout, getLayoutOffset, mergeRacks
} from './LayoutEditorHelpers';
import { areCagesInSameRack, parseCage, parseRack } from './helpers';

const Editor = () => {
    const MAX_SNAP_DISTANCE = 100;  // Adjust this value as needed
    const SVG_WIDTH = 1290;
    const SVG_HEIGHT = 810;
    const GRID_RATIO = 4;
    const GRID_SIZE = 30;
    const utilsRef = useRef(null);
    const [showGrid, setShowGrid] = useState<boolean>(false);
    const [addingRack, setAddingRack] = useState<boolean>(false);
    const [editCageNum, setEditCageState] = useState<number | null>(null);
    const [clickedCageNum, setClickedCageNum] = useState<number>(null); // Cage number of svg id (rack specific)
    const [draggedCageNum, setDraggedCageNum] = useState<number>(null);
    const [clickedRackNum, setClickedRackNum] = useState<number>(null); // Cage number of svg id (rack specific)
    const [layoutSvg, setLayoutSvg] = useState<d3.Selection<SVGElement, {}, HTMLElement, any>>(null);
    const [pendingRackUpdate, setPendingRackUpdate] = useState<PendingRackUpdate>(null);
    const {
        localRoom,
        addRack,
        room,
        delRack,
        cageCount,
        changeCageId,
        cageNumChange,
        cageLocs,
        addNewCageLocation,
        moveCageLocation,
        mergeLocalRacks,
        getCageCount
    } = useLayoutContext();

    useEffect(() => {
        console.log("xxx Room: ", room);
        console.log("xxx LocalRoom: ", localRoom);
    }, [room, localRoom, cageLocs]);

    useEffect(() => {
        if(cageLocs.length === 0 || !draggedCageNum ) return;
        console.log("Dragged cage: ", draggedCageNum);
        const currCage = cageLocs.find((cage) => cage.num === draggedCageNum)


        cageLocs.forEach((cage) => {
            if(draggedCageNum === cage.num) return; // cant merge into itself
            let inSameRack = false;

            localRoom.forEach(rack => {
                if(areCagesInSameRack(rack, cage, currCage)) {
                    inSameRack = true;
                    return;
                }
            });
            if(inSameRack){
                return;
            }
            const mergeAvail = checkAdjacent(cage, currCage, GRID_SIZE, GRID_RATIO);
            if(mergeAvail){
                const targetShape = layoutSvg.select(`[id*="cage-${cage.num}"]`);
                const targetRack = (targetShape.node() as SVGGElement).closest('[id^=rack-]');
                const draggedShape = layoutSvg.select(`[id*="cage-${draggedCageNum}"]`);
                const draggedRack = (draggedShape.node() as SVGGElement).closest('[id^=rack-]');
                console.log("Merging: ", targetRack, draggedRack);
                const layoutDragProps: LayoutDragProps = {
                    MAX_SNAP_DISTANCE: MAX_SNAP_DISTANCE,
                    delRack: delRack,
                    gridRatio: GRID_RATIO,
                    gridSize: GRID_SIZE,
                    layoutSvg: layoutSvg,
                    moveCage: moveCageLocation,
                    setCurrCage: setDraggedCageNum
                };
                mergeRacks(d3.select(targetRack), d3.select(draggedRack), mergeLocalRacks, layoutDragProps);
            }
            console.log("Cage Loc: ", cage)
        });
        setDraggedCageNum(null);
    }, [cageLocs])

    // This effect updates racks for adding to the room and merging
    useEffect(() => {
        if(!pendingRackUpdate) return;
        const {draggedShape, cellX, cellY, id} = pendingRackUpdate;
        draggedShape.classed('dragging', false);

        let group;
        if ((draggedShape.node() as SVGElement).children['rack-room-util']) {
            group = layoutSvg.append('g')
                .data([{x: cellX, y: cellY}])
                .attr('class', "draggable room-obj")
                .style('pointer-events', "bounding-box");
            group.append(() => draggedShape.node());
        } else {
            const cageGroup = draggedShape.select('#cage-x');
            const cageIdText = draggedShape.select('tspan');
            const transform = d3.zoomTransform(layoutSvg.node());

            // Change the id of the group in the pre-created svg img, and set class name for top level group.
            const currentId = cageGroup.attr('id');
            // set first cage in rack to be 1
            if(currentId){
                const newRackId = currentId.replace('cage-x', `cage-${getCageCount()}`)
                cageGroup.attr('id', newRackId); // Set the new ID
            }
            cageIdText.node().textContent = `${getCageCount()}`;

            group = layoutSvg.append('g')
                .attr('class', `draggable rack room-obj`)
                .attr('id', `rack-${id}`)
                .style('pointer-events', "bounding-box");

            group.append(() => draggedShape.node());
            placeAndScaleGroup(group, cellX, cellY, transform);
            addNewCageLocation({
                num: cageLocs.length + 1 || 1,
                cellX: cellX,
                cellY: cellY,
                scale: transform.k
            });
        }

        const addProps: LayoutDragProps = {
            gridSize: GRID_SIZE,
            gridRatio: GRID_RATIO,
            MAX_SNAP_DISTANCE: MAX_SNAP_DISTANCE,
            layoutSvg: layoutSvg,
            delRack: delRack,
            moveCage: moveCageLocation,
            setCurrCage: setDraggedCageNum
        };
        // Reattach drag listeners for interaction within layout
        group.call(d3.drag().on('start', startDragInLayout)
            .on('drag', createDragInLayout({layoutSvg: layoutSvg}))
            .on('end', createEndDragInLayout(addProps)));

        // Reattach click listener for text editing
        group.selectAll('text').each(function () {
            const textElement: SVGTextElement = d3.select(this).node() as SVGTextElement;
            textElement.setAttribute('contentEditable', 'true');
            (textElement.children[0] as SVGTSpanElement).style.cursor = "pointer";
            (textElement.children[0] as SVGTSpanElement).style.pointerEvents = "auto";
            textElement.addEventListener('click', function (event) {
                event.stopPropagation();
                const cageNum: number = parseInt((event.target as SVGTSpanElement).textContent);
                setEditCageState(cageNum);
                // Use closest to find the nearest element that contains 'rack-' in the class name
                const rackGroupElement = (event.target as SVGTSpanElement).closest('[id*="rack-"]');
                const cageGroupElement = (event.target as SVGTSpanElement).closest('[id*="cage-"]');

                if (rackGroupElement && /^rack-\d+$/.test(rackGroupElement.id)) {
                    if(cageGroupElement && /^cage-\d+$/.test(cageGroupElement.id)){
                        // Valid cage and rack
                        setClickedCageNum(parseCage((cageGroupElement as SVGGElement).getAttribute('id')));
                        setClickedRackNum(parseRack((rackGroupElement as SVGGElement).getAttribute('id')));
                        console.log("Found the valid Rack, Cage:", rackGroupElement, cageGroupElement);
                    }
                    else{
                        console.log("No group for cage found")
                    }
                    // Do something with the found element
                } else {
                    console.log("No group for rack found");
                }
            });
        });
        setAddingRack(false);
    }, [cageCount]);

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
                const newId = localRoom.length + 1;
                setPendingRackUpdate({
                    draggedShape: draggedShape,
                    cellX: cellX,
                    cellY: cellY,
                    id: newId});
                setAddingRack(true);
                addRack(newId);
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
            let group = layoutSvg.select(`#rack-${clickedRackNum}`).select(`#cage-${clickedCageNum}`);
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
        <div className={"layout-editor"}>
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
                    <LayoutTooltip text={"1x0"}>
                        <RackTemplate
                            fileName={"SingleCageRack"}
                            className={"draggable"}
                            gridSize={GRID_SIZE}
                            localRoom={localRoom}
                            room={room}
                            setAddingRack={setAddingRack}
                            rackType={RackTypes.OneOfOne}
                        />
                    </LayoutTooltip>
                    <LayoutTooltip text={"Pen"}>
                        <RackTemplate
                            fileName={"Pen"}
                            className={"draggable"}
                            gridSize={GRID_SIZE}
                            localRoom={localRoom}
                            room={room}
                            setAddingRack={setAddingRack}
                            rackType={RackTypes.OneOfOne}
                        />
                    </LayoutTooltip>
                </div>
            </div>
            <div id={"layout-grid"} style={{width: SVG_WIDTH, height: SVG_HEIGHT}}>
                {editCageNum &&
                        <CageNumInput
                                onSubmit={(num) => {
                                    changeCageId(editCageNum, num);
                                }}
                                onClose={() => setEditCageState(null)}
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
        </div>
    );
};

export default Editor;