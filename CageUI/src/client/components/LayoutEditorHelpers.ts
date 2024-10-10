// Layout Editor Helpers
import * as d3 from 'd3';
import { getRackFromClass, getTranslation, isTextEditable, parseCage, parseRack } from './helpers';
import { CageActionProps, CageLocations, LayoutDragProps, OffsetProps } from './typings';
import { zoom, zoomTransform } from 'd3';
import { cloneElement } from 'react';
import { id } from '@labkey/api/dist/labkey/Utils';
import * as React from 'react';

export const drawGrid = (layoutSvg: d3.Selection<SVGElement, unknown, any, any>, updateGridProps) => {
    layoutSvg.append("g").attr("class", "grid");
    updateGrid(d3.zoomIdentity, updateGridProps.width, updateGridProps.height, updateGridProps.gridSize); // Draw grid with the initial view
}

export const updateGrid = (transform, width, height, gridSize) => {
    const g = d3.select("g.grid");
    g.selectAll(".cell").remove(); // Clear existing grid

    // Calculate grid bounds (starting and ending points) based on transform
    const xMin = Math.floor(-transform.x / transform.k / gridSize) * gridSize;
    const yMin = Math.floor(-transform.y / transform.k / gridSize) * gridSize;
    const xMax = Math.ceil((width - transform.x) / transform.k / gridSize) * gridSize;
    const yMax = Math.ceil((height - transform.y) / transform.k / gridSize) * gridSize;

    // Draw the grid within the current visible area
    for (let x = xMin; x < xMax; x += gridSize) {
        for (let y = yMin; y < yMax; y += gridSize) {
            g.append("rect")
                .attr("x", x)
                .attr("y", y)
                .attr("class", "cell")
                .attr("width", gridSize)
                .attr("height", gridSize)
                .attr("fill", "none")
                .attr("stroke", "lightgray");
        }
    }
}
// Confirmation popup for merging two racks
function showConfirmationPopup() {
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

// This function makes the element draggable in the layout editor
function makeDraggable(element, props) {
    const d3Element = d3.select(element);
    d3Element.call(d3.drag()
        .on('start', startDragInLayout)
        .on('drag', createDragInLayout({layoutSvg: props.layoutSvg}))
        .on('end', createEndDragInLayout(props)));
}
// Function to help merge racks together by resetting groups to local coords
function resetNodeTranslationsWithZoom(targetNode, draggedNode, layoutSvg) {

    // Get the zoom transform of the layout SVG
    const layoutTransform = d3.zoomTransform(layoutSvg.node());

    if(targetNode.childNodes.length > 1){

    }

    // Get the translations of the two nodes (current positions)
    const {x: translateX1, y: translateY1} = getTranslation(targetNode.getAttribute('transform'));
    const {x: translateX2, y: translateY2} = getTranslation(draggedNode.getAttribute('transform'));

    // Calculate the dynamic distance between the two nodes before resetting
    // Remove the zoom scale from the distance to keep it zoom-independent
    const distanceX = (translateX2 - translateX1) / layoutTransform.k;  // Correct the distance using zoom scale
    const distanceY = (translateY2 - translateY1) / layoutTransform.k;  // Correct Y in case there's any Y translation

    // Reset the first node to (0, 0) in the new group
    targetNode.setAttribute("transform", `translate(0, 0)`);

    // Set the second node to be exactly at the dynamic distance relative to the first node
    draggedNode.setAttribute("transform", `translate(${distanceX}, ${distanceY})`);
}

function findNestedCageElement(parentId) {
    // Find the parent element (in this case, the outermost <g> element)
    const parentElement = document.getElementById(parentId);

    if (!parentElement) {
        console.error('Parent element not found');
        return null;
    }

    // Use a recursive function to search through all nested elements
    function searchNestedElements(element) {
        // Check if the current element's ID starts with 'cage-'
        if (element.id && element.id.startsWith('cage-')) {
            return element;
        }

        // If not found, search through child elements
        for (let child of element.children) {
            const result = searchNestedElements(child);
            if (result) return result;
        }

        return null;
    }

    // Start the search from the parent element
    return searchNestedElements(parentElement);
}

export function setupEditCageNumEvent(
    element: SVGTextElement,
    setClickedCageNum: (num: number) => void,
    setClickedRackNum: (num: number) => void,
    setCtxMenuStyle:  React.Dispatch<React.SetStateAction<{ display: string, top: string, left: string }>>,
): () => void {

    const handleContextMenu = function(this: SVGTextElement, event: MouseEvent) {
        event.preventDefault();
        console.log("Open Menu: ", this)
        const rackGroupElement = this.closest('[id^="rack-"]') as SVGGElement | null;
        const cageGroupElement = this.closest('[id^="cage-"]') as SVGGElement | null;

        const cageNum = parseCage(cageGroupElement.id);
        const rackNum = parseRack(rackGroupElement.id);
        setClickedCageNum(cageNum);
        setClickedRackNum(rackNum);

        setCtxMenuStyle({
            display: 'block',
            left: `${event.pageX - 10}px`,
            top: `${event.pageY - 10}px`,
        });
    }

    // find the cage sibling element of text to attach context menu to
    const cageElement = element.closest('[id^="cage-"]');

    d3.select(cageElement).attr('style', 'pointer-events: bounding-box')
    cageElement.addEventListener('contextmenu', handleContextMenu);
    //element.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.addEventListener('contextmenu', handleContextMenu);

    // Return a function to remove the event listener if needed
    return () => {
        cageElement.removeEventListener('contextmenu', handleContextMenu);
    };
}

export async function mergeRacks(targetShape, draggedShape, mergeLocalRacks, layoutDragProps: LayoutDragProps, cageActionProps: CageActionProps) {
    let newCageNums = parseCage((findNestedCageElement(targetShape.attr('id')) as SVGElement).getAttribute('id'));
    // Make sure cages don't have the wrong styles/classes and correct cage numbering for merge
    function resetElementProperties(element) {
        element.classList = "";
        element.style = "";
        element.id = `cage-${newCageNums}`;
        const textEle = d3.select(element).selectAll('text').node() as SVGTextElement;
        setupEditCageNumEvent(textEle, cageActionProps.setEditCageNum, cageActionProps.setClickedRackNum, cageActionProps.setCtxMenuStyle);
        newCageNums++;
    }

    // add starting x and y for each group to then increment its local subgroup coords by.
    // Example: 2 nodes, 0,0 and 120,0 start at 0,0 add 120,0
    // second 2 nodes, 0,0 and 120,0 start at 240,0 add 0,0 and 120,0. etc
    function processChildNodes(element: SVGGElement, mergedGroup) {
        const {x: startX, y: startY} = getTranslation(element.getAttribute('transform'))
        d3.select(element).selectAll(':scope > g').each(function () {
            const targetCage = d3.select(this);
            const {x: localX, y: localY} = getTranslation(targetCage.attr('transform'));
            const newX = startX + localX
            const newY = startY + localY
            targetCage.attr('transform', `translate(${newX},${newY})`)
            resetElementProperties(this);
            mergedGroup.node().appendChild(this);
            console.log("More than 1 merge: ", targetCage);
        });
    }

    function processShape(shape, mergedGroup) {
        if (shape.childNodes.length <= 1) {
            const tempCage = d3.select(shape).select('[id^=cage-]');
            // id of svg group (cage-x) that is the one we manage in SingleCageRack.svg
            tempCage.attr("id", 'grouped-cage');
            resetElementProperties(shape);
            mergedGroup.node().appendChild(shape);
        } else {
            processChildNodes(shape, mergedGroup);
        }
    }
    // return if another merge option is available,
    // prevents double merging when adding cages to a rack surrounded by multiple target points (aka other cages)
    if(!d3.select('.popup').empty()) return;
    const shouldMerge = await showConfirmationPopup();
    const {
        layoutSvg,
        gridSize,
        gridRatio,
        MAX_SNAP_DISTANCE,
        delRack,
        moveCage,
        setCurrCage
    } = layoutDragProps
    if (shouldMerge) {
        console.log("Merge: ", targetShape.node(), draggedShape.node());

        const mergedGroup = layoutSvg.append('g')
            .attr('class', targetShape.attr('class'))
            .attr('id', targetShape.attr('id'));
        //newCageNums = 1;


        // Clone the target and dragged shapes before appending
        let clonedTargetShape = targetShape.node().cloneNode(true);
        let clonedDraggedShape = draggedShape.node().cloneNode(true);
        //Reset translates to new local group
        resetNodeTranslationsWithZoom(clonedTargetShape, clonedDraggedShape, layoutSvg)

        processShape(clonedTargetShape, mergedGroup);
        processShape(clonedDraggedShape, mergedGroup);


        console.log("merge racks: ", targetShape.node().closest('[id^=rack-]'), draggedShape.node().closest('[id^=rack-]'))
        // Append the cloned shapes to the new group
        const targetRackNum = parseRack(targetShape.node().closest('[id^=rack-]').getAttribute('id'))
        const draggedRackNum = parseRack(draggedShape.node().closest('[id^=rack-]').getAttribute('id'))
        mergeLocalRacks(targetRackNum, draggedRackNum)

        // Copy the transform attribute from the targetShape to the merged group
        const transformAttr = targetShape.attr('transform');
        if (transformAttr) {
            mergedGroup.attr('transform', transformAttr);
        }

        // Copy any inline styles from the targetShape to the merged group
        const styleAttr = targetShape.attr('style');
        if (styleAttr) {
            mergedGroup.attr('style', styleAttr);
        }

        //Attach data from target to new shape
        const targetData = targetShape.datum()
        if(targetData) {
            mergedGroup.data([{x: targetData.x, y: targetData.y}])
        }


        const addProps: LayoutDragProps = {
            gridSize: gridSize,
            gridRatio: gridRatio,
            MAX_SNAP_DISTANCE: MAX_SNAP_DISTANCE,
            layoutSvg: layoutSvg,
            delRack: delRack,
            moveCage: moveCage,
            setCurrCage: setCurrCage
        };
        mergedGroup.call(d3.drag().on('start', startDragInLayout)
            .on('drag', createDragInLayout({layoutSvg: layoutSvg}))
            .on('end', createEndDragInLayout(addProps)));
        // Remove the original shapes from the DOM
        targetShape.remove();
        draggedShape.remove();
    }
}

// This checks the adjacency of two racks to determine if they can be merged
export function checkAdjacent(targetCage: CageLocations, draggedCage: CageLocations, gridSize: number, gridRatio: number) {

    console.log("Adj Cage ", targetCage, draggedCage)

    const boxWidth = gridSize * gridRatio;

    let horizontallyAdjacent = false;
    let verticallyAdjacent = false;

    // Check for horizontal adjacency
    if (Math.abs(targetCage.cellX - draggedCage.cellX) === boxWidth &&
        targetCage.cellY === draggedCage.cellY) {
        console.log("Adj found: x");
        horizontallyAdjacent = true;
    }// Check for vertical adjacency
    else if (Math.abs(targetCage.cellY - draggedCage.cellY) === boxWidth &&
        targetCage.cellX === draggedCage.cellX)  {
        console.log("Adj found: y");
        verticallyAdjacent = true;
    }
    const isAdjacent = horizontallyAdjacent || verticallyAdjacent;
    console.log("Is adjacent:", isAdjacent);
    return isAdjacent;
}

//Offset for the top left corner of the layout, without doing this objects will randomly jump when dragging and placing
export const getLayoutOffset = (props: OffsetProps) => {
    const {layoutSvg, clientX, clientY} = props;
    const svgRect = (layoutSvg.node() as SVGRectElement).getBoundingClientRect();
    const x = clientX - svgRect.left;
    const y = clientY - svgRect.top;
    return {x: x, y: y};
}

export const getTargetRect =(x, y, gridSize, transform) => {
    // Adjust the grid size according to the current zoom level
    const adjustedGridSize = gridSize;

    // Adjust the coordinates based on the current zoom and pan transform
    const adjustedX = transform.invertX(x);
    const adjustedY = transform.invertY(y);

    // Calculate the column and row index based on the adjusted grid size
    const col = Math.floor(adjustedX / adjustedGridSize);
    const row = Math.floor(adjustedY / adjustedGridSize);
    // Return the top-left corner coordinates of the rectangle
    return {
        x: col * adjustedGridSize,
        y: row * adjustedGridSize,
    };
}

// Layout Drag Helpers
export function startDragInLayout(event) {
    // Check if the parent <text> element is editable, return if not
    if (isTextEditable(event)) {
        event.on('drag', null).on('end', null); // Detach drag and end events
        return;
    }
    console.log('Drag Layout #1', d3.select(this));
    d3.select(this).raise().classed('active', true);
}

export function createDragInLayout(dragProps) {
    return(
        function dragInLayout(event) {
            const {layoutSvg} = dragProps;
            console.log('Drag Layout #2', event.x, event.y);
            const element = d3.select(this);
            const transform = d3.zoomTransform(layoutSvg.node());
            const scale = transform.k;
            const {x,y} = getLayoutOffset({
                clientX: event.sourceEvent.clientX,
                clientY: event.sourceEvent.clientY,
                layoutSvg: layoutSvg})
            element.attr('transform', `translate(${x},${y}) scale(${scale})`);
        }
    )
}

export function createEndDragInLayout(props: LayoutDragProps) {
    return (
        function endDragInLayout(event) {
            const {
                gridSize,
                layoutSvg,
                delRack,
                moveCage,
                setCurrCage
            } = props;
            const shape = d3.select(this);
            shape.classed('active', false);
            const transform = d3.zoomTransform(layoutSvg.node());

            const {x,y} = getLayoutOffset({
                clientX: event.sourceEvent.clientX,
                clientY: event.sourceEvent.clientY,
                layoutSvg: layoutSvg})

            const targetCell = getTargetRect(x, y, gridSize, transform);

            if (targetCell) {
                console.log('Drag Layout #3', shape, targetCell);
                const cellX = targetCell.x;
                const cellY = targetCell.y;
                placeAndScaleGroup(shape, cellX, cellY, transform);

                //Update all shape placements
                if(shape.selectChildren().size() > 1) {
                    //group of groups
                    shape.selectChildren().each(function (d, index) {
                        const currChild = d3.select(this);
                        const cageNum = parseCage(currChild.attr('id'));
                        if(index === 0){ // When in a rack, only the cage at index 0 can snap to other cages
                            setCurrCage(cageNum);
                        }
                        const currCoords = getTranslation(currChild.attr('transform'));
                        const newX = currCoords.x + cellX;
                        const newY = currCoords.y + cellY;
                        moveCage(cageNum, newX, newY, transform.k);
                    });
                }else{
                    // group of svg
                    const currCage = shape.select( '[id*="cage-"]');
                    const cageNum = parseCage(currCage.attr('id'));
                    setCurrCage(cageNum);
                    moveCage(cageNum, cellX, cellY, transform.k);
                }
            } else {
                // remove rack from room
                console.log("deleting cage from room", getRackFromClass(shape.attr('class')));
                const idToDel = parseInt(getRackFromClass(shape.attr('class')));
                delRack(idToDel);
                shape.remove();
            }
        }
    );
}

export const placeAndScaleGroup = (group, x, y, transform) => {
    // Scale the group to match the grid size relative to the current zoom level
    const scale = transform.k;  // Scale inversely to zoom

    // Adjust x and y for transform
    const newX = transform.applyX(x);
    const newY = transform.applyY(y);
    // Apply the transform (translate to snap to the grid, and scale)
    group.attr("transform", `translate(${newX}, ${newY}) scale(${scale})`)
        .data([{x: x, y: y}]); // keep data x and y because these are pre transform coords
}