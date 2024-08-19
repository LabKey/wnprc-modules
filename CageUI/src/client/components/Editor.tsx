import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { ActionURL } from '@labkey/api';
import { addNewRack, changeStyleProperty } from './helpers';
import { ReactSVG } from 'react-svg';
import { useRoomContext, useLayoutContext } from './ContextManager';
import { RackTemplate } from './RackTemplate';
import { RackTypes } from './typings';
import { LayoutTooltip } from './LayoutTooltip';
import { svg } from 'd3';

const Editor = () => {
    const MAX_SNAP_DISTANCE = 100;  // Adjust this value as needed
    const gridSize = 30; // Adjust based on your room size, in pixels the size of the grid square side
    const gridWidth = 43; // col of grid
    const gridHeight = 27; // row of grid
    const gridRatio = 4; // how many grid cells to equal the cage side length
    const svgRef = useRef(null);
    const utilsRef = useRef(null);
    const [showGrid, setShowGrid] = useState<boolean>(true);
    const [addingRack, setAddingRack] = useState<boolean>(false);
    const [selectedEditRect, setSelectedEditRect] = useState<SVGRectElement>(null);
    const {
        localRoom,
        addRack,
        room,
    } = useLayoutContext();

    // Effect for handling the grid layout and drag effects on the layout and from the utils
    useEffect(() => {
        if (!svgRef.current || !utilsRef.current) return;
        const layoutSvg = d3.select('#layout')
            .attr('width', gridWidth * gridSize)
            .attr('height', gridHeight * gridSize);

        // Clear existing grid
        layoutSvg.selectAll('.cell').remove();

        // Draw grid or outer border based on showGrid flag
        if (showGrid) {
            const gridLines = drawGrid();
            gridLines.forEach(line => {
                layoutSvg.append('rect')
                    .attr('class', 'cell')
                    .attr('x', line.x)
                    .attr('y', line.y)
                    .attr('width', line.width)
                    .attr('height', line.height)
                    .attr('fill', 'none')
                    .attr('stroke', 'lightblue');
            });
        } else {
            layoutSvg.append('rect')
                .attr('class', 'outline')
                .attr('x', 0)
                .attr('y', 0)
                .attr('width', gridWidth * gridSize)
                .attr('height', gridHeight * gridSize)
                .attr('fill', 'none')
                .attr('stroke', 'blue')
        }

        // Define drag behavior
        const drag = d3.drag()
            .on('start', dragStarted)
            .on('drag', dragging)
            .on('end', dragEnded);

        // Apply drag behavior to utils items
        d3.select(utilsRef.current).selectAll('.draggable')
            .call(drag);

        function checkAdjacent(targetShape, draggedShape) {
            const getCoords = (box) => {
                if(box instanceof SVGGElement){
                    const x = parseInt(box.getAttribute('x') || '0');
                    const y = parseInt(box.getAttribute('y') || '0');
                    console.log(`Coords for ${box.getAttribute('class')}:`, {x, y});
                    return {x, y};

                }else{
                    const x = parseInt(box.attr('x') || box.attr('data-x') || '0');
                    const y = parseInt(box.attr('y') || box.attr('data-y') || '0');
                    console.log(`Coords for ${box.attr('class')}:`, {x, y});
                    return {x, y};
                }
            };

            const coords1 = getCoords(targetShape);
            const coords2 = getCoords(draggedShape);

            console.log("Checking adjacency:", coords1, coords2);

            const boxWidth = gridSize * gridRatio;  // Assuming each box is 4 grid cells wide
            let horizontallyAdjacent;
            let verticallyAdjacent;

            // offset for length of group
            if(targetShape instanceof SVGGElement){
                horizontallyAdjacent = (
                    Math.abs(coords1.x - coords2.x) === (boxWidth * targetShape.children.length) &&
                    coords1.y === coords2.y
                );

                verticallyAdjacent = (
                    Math.abs(coords1.y - coords2.y) === (boxWidth * targetShape.children.length) &&
                    coords1.x === coords2.x
                );

            }else{
                // Check if boxes are adjacent horizontally (left or right)
                horizontallyAdjacent = (
                    Math.abs(coords1.x - coords2.x) === boxWidth &&
                    coords1.y === coords2.y
                );

                // Check if boxes are adjacent vertically (top or bottom)
                verticallyAdjacent = (
                    Math.abs(coords1.y - coords2.y) === boxWidth &&
                    coords1.x === coords2.x
                );
            }
            const isAdjacent = horizontallyAdjacent || verticallyAdjacent;
            console.log("Is adjacent:", isAdjacent);
            return isAdjacent;
        }

        // 2. Implement confirmation popup
        function showConfirmationPopup(box1, box2) {
            return new Promise((resolve) => {
                // Create a simple popup
                const popup = d3.select('body').append('div')
                    .attr('class', 'popup')
                    .style('position', 'absolute')
                    .style('top', '50%')
                    .style('left', '50%')
                    .style('transform', 'translate(-50%, -50%)')
                    .style('background', 'white')
                    .style('padding', '20px')
                    .style('border', '1px solid black');

                popup.append('p')
                    .text('Do you want to merge these boxes?');

                popup.append('button')
                    .text('Yes')
                    .on('click', () => {
                        popup.remove();
                        resolve(true);
                    });

                popup.append('button')
                    .text('No')
                    .on('click', () => {
                        popup.remove();
                        resolve(false);
                    });
            });
        }

        // Function to help merge racks together
        async function mergeRacks(targetShape, draggedShape) {
            const shouldMerge = await showConfirmationPopup(targetShape, draggedShape);
            if (shouldMerge) {
                if(targetShape instanceof  SVGElement){
                    targetShape = d3.select(targetShape);
                }
                let mergedGroup: SVGGElement;
                // Check if targetShape is already a merged group
                if (targetShape.node() instanceof SVGGElement) {
                    mergedGroup = targetShape.node();
                } else {
                    // Create a new merged group
                    const tempGroup = layoutSvg.append('g')
                        .attr('class', 'merged-group draggable')
                        .attr('x', targetShape.attr('x'))
                        .attr('y', targetShape.attr('y'));

                    // Move targetShape into the new group
                    tempGroup.append(() => targetShape.node().cloneNode(true))
                        .attr('x', 0)
                        .attr('y', 0);
                    mergedGroup = tempGroup.node();
                    targetShape.remove();
                }
                // Add draggedShape to the group
                const draggedX = parseInt(draggedShape.attr('x'));
                const draggedY = parseInt(draggedShape.attr('y'));
                let clonedNode = draggedShape.node().cloneNode(true);
                mergedGroup.appendChild(clonedNode);
                mergedGroup.setAttribute('x', `${draggedX}`);
                mergedGroup.setAttribute('y', `${draggedY}`);

                console.log("XXY: ", mergedGroup)
                draggedShape.remove();

                // Update the bounding box of the merged group
                const bbox = mergedGroup.getBBox();
                mergedGroup.setAttribute('width', String(bbox.width));
                mergedGroup.setAttribute('height', String(bbox.height));

                // Make sure the merged group is draggable
                makeDraggable(mergedGroup);

                console.log("Merged group updated/created at:", {
                    x: mergedGroup.getAttribute('x'),
                    y: mergedGroup.getAttribute('y'),
                    width: bbox.width,
                    height: bbox.height
                });
            }
        }
        function makeDraggable(element) {
            const d3Element = d3.select(element);
            d3Element.call(d3.drag()
                .on('start', startDragInLayout)
                .on('drag', dragInLayout)
                .on('end', endDragInLayout));
        }

        function dragStarted(event: d3.D3DragEvent<SVGElement, any, any>) {
            console.log("Dragging");
            const shape = event.sourceEvent.target.cloneNode(true) as SVGElement;
            d3.select(shape)
                .style('pointer-events', 'none')
                .attr('class', 'dragging');
            d3.select(document.body).append(() => shape);

            d3.select(shape)
                .attr('transform', `translate(${event.x}, ${event.y})`);
        }

        function dragging(event) {
            console.log("dragging #2");
            d3.select('.dragging')
                .attr('transform', `translate(${event.x}, ${event.y})`);
        }

        function dragEnded(event) {
            const draggedShape = d3.select('.dragging');
            const svgRect = (layoutSvg.node() as SVGRectElement).getBoundingClientRect();
            const x = event.sourceEvent.clientX - svgRect.left;
            const y = event.sourceEvent.clientY - svgRect.top;
            const targetCell = getTargetCell(x, y);

            if (targetCell) {
                const cellX = +targetCell.attr('x');
                const cellY = +targetCell.attr('y');
                const rackSvgId = (draggedShape.node() as SVGElement).children['rack-template'].children[0].children.item(0).id;
                layoutSvg.append(() => draggedShape.node())
                    .attr('transform', `translate(${cellX + 50}, ${cellY + 50})`)
                    .attr('class', `draggable ${rackSvgId}`)
                    .style('pointer-events', "bounding-box")
                    .call(d3.drag().on('start', startDragInLayout)
                        .on('drag', dragInLayout)
                        .on('end', endDragInLayout));

                if(draggedShape.node().toString() === ""){

                }
            } else {
                draggedShape.remove();
            }
        }

        function getTargetCell(x: number, y: number) {
            const cells = layoutSvg.selectAll('.cell');
            let nearestCell = null;
            let minDistance = Infinity;

            cells.each(function() {
                const cell = d3.select(this);
                const cellX = +cell.attr('x');
                const cellY = +cell.attr('y');
                const cellCenterX = cellX + (gridSize / 2);  // half the cell width
                const cellCenterY = cellY + (gridSize / 2);  // half the cell height
                const dx = x - cellCenterX;
                const dy = y - cellCenterY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                //console.log(`Cell at (${cellX},${cellY}), distance: ${distance}`);

                if (distance < minDistance) {
                    minDistance = distance;
                    nearestCell = cell;
                }
            });


            console.log("Nearest cell:", nearestCell ? `at (${nearestCell.attr('x')},${nearestCell.attr('y')})` : "not found", "Distance:", minDistance);
            if (minDistance <= MAX_SNAP_DISTANCE) {
                console.log(`Snapping to cell at (${nearestCell.attr('x')},${nearestCell.attr('y')}), distance: ${minDistance}`);
                return nearestCell;
            } else {
                console.log(`No cell within snapping distance. Nearest was ${minDistance} away.`);
                return null;
            }
        }
        function startDragInLayout(event) {
            console.log("Drag Layout #1", d3.select(this));
            d3.select(this).raise().classed('active', true);
        }

        function dragInLayout(event) {
            console.log("Drag Layout #2", event.x, event.y);
            const x = event.x;
            const y = event.y;
            const element = d3.select(this);
            if(element.node() instanceof  SVGGElement){
                element.attr("transform", "translate(" + x + "," + y + ")");
            }else{
                element.attr('x', x)
                    .attr('y', y);
            }
            console.log("Elem: ", element);
        }

        function endDragInLayout(event) {

            const shape = d3.select(this);
            shape.classed('active', false);
            const targetCell = getTargetCell(event.x, event.y);

            if (targetCell) {
                console.log("Drag Layout #3", shape, targetCell);
                const cellX = +targetCell.attr('x');
                const cellY = +targetCell.attr('y');
                if (shape.node() instanceof SVGGElement) {
                    shape.attr("transform", `translate(${cellX},${cellY})`);
                    shape.attr('x', cellX)
                        .attr('y', cellY);
                } else {
                    shape.attr('x', cellX)
                        .attr('y', cellY);
                }
                // Only allow merging of individual rack to another indiv rack or a merged rack.
                // Don't allow merged racks to merge with other racks
                if(!(shape.node() instanceof SVGGElement)) { // Don't allow merging of already merged racks
                    layoutSvg.selectAll('.draggable, .merged-box').each(function () {
                       //TODO Check for groups here it glitches because ottherBox is a group
                        const otherBox = d3.select(this);
                        console.log("ADJ BOX: ", otherBox);
                        const parentNode = (otherBox.node() as SVGRectElement).parentNode;
                        if(parentNode instanceof  SVGGElement){
                            if (shape.node() !== otherBox.node() && checkAdjacent(parentNode, shape)) {
                                mergeRacks(parentNode, shape);
                            }
                        }
                        else{
                            if (shape.node() !== otherBox.node() && checkAdjacent(otherBox, shape)) {
                                mergeRacks(otherBox, shape);
                            }
                        }
                    });
                }

            } else {
                shape.remove();
            }
        }

        // Cleanup function
        return () => {
            layoutSvg.selectAll('.cell').remove();
        };
    }, [showGrid]);

    // Effect for handling the rotation of objects in the svg layout
    const drawGrid = () => {
        const gridLines = [];
        for (let i = 0; i < gridHeight; i++) {
            for (let j = 0; j < gridWidth; j++) {
                gridLines.push({
                    x: j * gridSize,
                    y: i * gridSize,
                    width: 30,
                    height: 30
                });
            }
        }
        return gridLines;
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
                <div className={'rack-templates'}>
                    <LayoutTooltip text={"2x2"}>
                        <RackTemplate
                            className={'draggable'}
                            fileName={"FourRack"}
                            selectedEditRect={selectedEditRect}
                            gridSize={gridSize}
                            localRoom={localRoom}
                            room={room}
                            addRack={addRack}
                            setAddingRack={setAddingRack}
                            rackType={RackTypes.TwoOfTwo}
                        />
                    </LayoutTooltip>
                    <LayoutTooltip text={"1x1 Vertical"}>
                        <RackTemplate
                            fileName={"TwoRackVertical"}
                            className={"draggable"}
                            selectedEditRect={selectedEditRect}
                            gridSize={gridSize}
                            localRoom={localRoom}
                            room={room}
                            addRack={addRack}
                            setAddingRack={setAddingRack}
                            rackType={RackTypes.OneOfOne}
                        />
                    </LayoutTooltip>
                    <LayoutTooltip text={"1x1 Horizontal"}>
                        <RackTemplate
                            fileName={"TwoRackHorizontal"}
                            className={"draggable"}
                            selectedEditRect={selectedEditRect}
                            gridSize={gridSize}
                            localRoom={localRoom}
                            room={room}
                            addRack={addRack}
                            setAddingRack={setAddingRack}
                            rackType={RackTypes.OneOfOne}
                        />
                    </LayoutTooltip>
                    <LayoutTooltip text={"1x0"}>
                        <RackTemplate
                            fileName={"SingleCageRack"}
                            className={"draggable"}
                            selectedEditRect={selectedEditRect}
                            gridSize={gridSize}
                            localRoom={localRoom}
                            room={room}
                            addRack={addRack}
                            setAddingRack={setAddingRack}
                            rackType={RackTypes.OneOfOne}
                        />
                    </LayoutTooltip>
                    <LayoutTooltip text={"Pen"}>
                        <RackTemplate
                            fileName={"Pen"}
                            className={"draggable"}
                            selectedEditRect={selectedEditRect}
                            gridSize={gridSize}
                            localRoom={localRoom}
                            room={room}
                            addRack={addRack}
                            setAddingRack={setAddingRack}
                            rackType={RackTypes.OneOfOne}
                        />
                    </LayoutTooltip>
                </div>
            </div>
            <div id={"layout-grid"} style={{width: gridWidth * gridSize, height: gridSize * gridHeight}}>
                <svg
                    ref={svgRef}
                    preserveAspectRatio="xMidYMid meet"
                    width={gridWidth * gridSize}
                    height={gridHeight * gridSize}
                    id="layout"
                />
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