import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { ActionURL } from '@labkey/api';
import { ReactSVG } from 'react-svg';
import { useLayoutContext } from './ContextManager';
import { RackTemplate } from './RackTemplate';
import { RackTypes, EndDragLayoutProps} from './typings';
import { LayoutTooltip } from './LayoutTooltip';
import { svg } from 'd3';
import { CageNumInput } from './CageNumInput';
import { getTargetCell, startDragInLayout, dragInLayout, createEndDragInLayout} from './LayoutEditorHelpers';
import { parseCage, parseRack } from './helpers';
interface PendingRackUpdate {
    draggedShape: any;
    cellX: number;
    cellY: number;
    id: number;
}
const Editor = () => {
    const MAX_SNAP_DISTANCE = 100;  // Adjust this value as needed
    const gridSize = 30; // Adjust based on your room size, in pixels the size of the grid square side
    const gridWidth = 43; // col of grid
    const gridHeight = 27; // row of grid
    const gridRatio = 4; // how many grid cells to equal the cage side length
    const svgRef = useRef(null);
    const utilsRef = useRef(null);
    const [showGrid, setShowGrid] = useState<boolean>(false);
    const [addingRack, setAddingRack] = useState<boolean>(false);
    const [editCageNum, setEditCageState] = useState<number | null>(null);
    const [clickedCageNum, setClickedCageNum] = useState<number>(null); // Cage number of svg id (rack specific)
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
        cageNumChange
    } = useLayoutContext();

    useEffect(() => {
        console.log("xxx Room: ", room);
        console.log("xxx LocalRoom: ", localRoom);
    }, [room, localRoom]);

    useEffect(() => {
        if (!svgRef.current || !utilsRef.current) return;
        const tempLayoutSvg = d3.select<SVGElement, any>('#layout')
            .attr('width', gridWidth * gridSize)
            .attr('height', gridHeight * gridSize);
        setLayoutSvg(tempLayoutSvg)
        setShowGrid(true);
    }, [svgRef, utilsRef.current]);

    useEffect(() => {
        if(!pendingRackUpdate) return;
        const {draggedShape, cellX, cellY, id} = pendingRackUpdate;
        draggedShape.classed('dragging', false);

        let group;
        if ((draggedShape.node() as SVGElement).children['rack-room-util']) {
            group = layoutSvg.append(() => draggedShape.node())
                .attr('transform', `translate(${cellX + 50}, ${cellY + 50})`)
                .attr('class', "draggable")
                .style('pointer-events', "bounding-box");
        } else {
            let rackSvgId = "";
            const rackGroup = draggedShape.select('#rack-x');
            const cageIdText = draggedShape.select('#name');

            // Change the id of the group in the pre-created svg img, and set class name for top level group.
            if(!rackGroup.empty()){
                const currentId = rackGroup.attr('id');
                if(currentId){
                    const newRackId = currentId.replace('rack-x', `rack-${id}`)
                    rackSvgId = newRackId;
                    rackGroup.attr('id', newRackId); // Set the new ID
                }
            }

            cageIdText.node().children[0].textContent = `${cageCount}`
            console.log("XXX: ", rackSvgId);

            group = layoutSvg.append('g')
                .attr('class', `draggable ${rackSvgId}`)
                .style('pointer-events', "bounding-box");
            group.append(() => draggedShape.node());
            group.attr('transform', `translate(${cellX + 50}, ${cellY + 50})`);

        }

        const addProps: EndDragLayoutProps = {
            gridSize: gridSize,
            gridRatio: gridRatio,
            MAX_SNAP_DISTANCE: MAX_SNAP_DISTANCE,
            layoutSvg: layoutSvg,
            delRack: delRack
        };
        // Reattach drag listeners for interaction within layout
        group.call(d3.drag().on('start', startDragInLayout)
            .on('drag', dragInLayout)
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
                setClickedCageNum(parseCage(((event.target as SVGTSpanElement).parentNode.parentNode as SVGGElement).getAttribute('id')));
                setClickedRackNum(parseRack(((event.target as SVGTSpanElement).parentNode.parentNode.parentNode as SVGGElement).getAttribute('id')));
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
            console.log("Dragging");
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
            console.log("dragging #2");
            d3.select('.dragging')
                .attr('transform', `translate(${event.x}, ${event.y})`);
        }
        // Drag end for dragging from the utilities to the layout
        function dragEnded(event) {
            const draggedShape = d3.select('.dragging');
            const svgRect = (layoutSvg.node() as SVGRectElement).getBoundingClientRect();
            const x = event.sourceEvent.clientX - svgRect.left;
            const y = event.sourceEvent.clientY - svgRect.top;
            const targetCell = getTargetCell(x, y, gridSize, MAX_SNAP_DISTANCE, layoutSvg);

            if (targetCell) {
                const cellX = +targetCell.attr('x');
                const cellY = +targetCell.attr('y');
                const newId = localRoom.length + 1;
                setPendingRackUpdate({draggedShape: draggedShape, cellX: cellX, cellY: cellY, id: newId});
                setAddingRack(true);
                addRack(newId, `rack-${newId}`);
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

    useEffect(() => {
        if(!layoutSvg) return;
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
                    <LayoutTooltip text={"1x0"}>
                        <RackTemplate
                            fileName={"SingleCageRack"}
                            className={"draggable"}
                            gridSize={gridSize}
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
                            gridSize={gridSize}
                            localRoom={localRoom}
                            room={room}
                            setAddingRack={setAddingRack}
                            rackType={RackTypes.OneOfOne}
                        />
                    </LayoutTooltip>
                </div>
            </div>
            <div id={"layout-grid"} style={{width: gridWidth * gridSize, height: gridSize * gridHeight}}>
                {editCageNum &&
                        <CageNumInput
                                onSubmit={(num) => {
                                    changeCageId(editCageNum, num);
                                }}
                                onClose={() => setEditCageState(null)}
                        />
                }
                <svg
                    ref={svgRef}
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