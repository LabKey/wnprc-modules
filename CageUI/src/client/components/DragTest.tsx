import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { ActionURL } from '@labkey/api';
import { addNewRack, changeStyleProperty } from './helpers';
import { ReactSVG } from 'react-svg';
import { useCurrentContext, useLayoutContext } from './ContextManager';
import { RackTemplate } from './RackTemplate';
import { RackTypes } from './typings';
import { LayoutTooltip } from './LayoutTooltip';

const DragAndDropGrid = () => {
    const MAX_SNAP_DISTANCE = 100;  // Adjust this value as needed
    const gridSize = 30; // Adjust based on your room size, in pixels the size of the grid square side
    const gridWidth = 43; // col of grid
    const gridHeight = 27; // row of grid
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
            console.log("Adjusted coordinates:", x, y);
            const targetCell = getTargetCell(x, y);

            if (targetCell) {
                console.log("drag #3", draggedShape.node().toString());
                const cellX = +targetCell.attr('x');
                const cellY = +targetCell.attr('y');
                layoutSvg.append(() => draggedShape.node())
                    .attr('transform', `translate(${cellX + 50}, ${cellY + 50})`)
                    .attr('class', "draggable")
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
            d3.select(this)
                .attr('x', event.x)
                .attr('y', event.y);
        }

        function endDragInLayout(event) {

            const shape = d3.select(this);
            shape.classed('active', false);

            const targetCell = getTargetCell(event.x, event.y);

            if (targetCell) {
                console.log("Drag Layout #3", shape, targetCell);
                const cellX = +targetCell.attr('x');
                const cellY = +targetCell.attr('y');
                shape.attr('x', cellX)
                    .attr('y', cellY);
            } else {
                shape.remove();
            }
        }

        // Cleanup function
        return () => {
            layoutSvg.selectAll('.cell').remove();
        };
    }, [showGrid]);

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
                    <LayoutTooltip text={"1x1"}>
                        <RackTemplate
                            fileName={"TwoRack"}
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
                    onClick={handleSave}
                >Save
                </button>
                <button
                    className={"layout-toolbar-btn"}
                    onClick={handleDefaultSave}
                >Save As Default
                </button>
            </div>
        </div>
    );
};

export default DragAndDropGrid;