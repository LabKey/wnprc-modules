// Layout Editor Helpers
import * as d3 from 'd3';
import { convertCageNumToNum, getTranslation, isTextEditable, parseRack, parseRoomItemType } from './helpers';
import {
    Cage,
    CageActionProps,
    EHRCage,
    GroupId,
    LayoutDragProps,
    LayoutHistoryData,
    LocationCoords,
    OffsetProps,
    Rack,
    RackActions,
    RackTypes,
    RoomItem,
    RoomItemType,
    RoomObject,
    RoomObjectTypes,
    StartDragProps
} from './typings';
import * as React from 'react';
import { testCagesInRoom } from '../layoutEditor/testData';

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
function showConfirmationPopup(): Promise<RackActions> {
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
            .text('What action would you like to perform?');

        // Merge button
        popup.append('button')
            .text('Merge')
            .on('click', () => {
                popup.remove();
                resolve('merge');
            });

        // Connect button
        popup.append('button')
            .text('Connect')
            .on('click', () => {
                popup.remove();
                resolve('connect');
            });

        // Cancel button
        popup.append('button')
            .text('Cancel')
            .on('click', () => {
                popup.remove();
                resolve('cancel');
            });
    });
}

// Confirmation popup for merging two racks
export function showLayoutEditorError(errorMsg: string) {
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
            .text(errorMsg);

        // Cancel button
        popup.append('button')
            .text('Ok')
            .on('click', () => {
                popup.remove();
                resolve(true);
            });
    });
}

// Function to help merge racks together by resetting groups to local coords
function resetNodeTranslationsWithZoom(targetNode, draggedNode, layoutSvg) {

    // Get the zoom transform of the layout SVG
    const layoutTransform = d3.zoomTransform(layoutSvg.node());

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

export function setupEditCageEvent(
    element: SVGTextElement,
    setClickedCage: (cageId: string) => void,
    setCtxMenuStyle:  React.Dispatch<React.SetStateAction<{ display: string, top: string, left: string }>>,
    rackType: RackTypes
): () => void {
    const handleContextMenu = function(this: SVGGElement, event: MouseEvent) {
        event.preventDefault();
        const cageGroupElement = this.closest(`[id^=${rackType}-]`) as SVGGElement | null;
        console.log("Open Menu: ", cageGroupElement)

        setClickedCage(cageGroupElement.id);

        setCtxMenuStyle({
            display: 'block',
            left: `${event.pageX - 10}px`,
            top: `${event.pageY - 10}px`,
        });
    }

    // Attach context menu to the parent
    const cageGroupElement: SVGGElement = element.closest(`[id^=${rackType}]`) as SVGGElement;

    d3.select(cageGroupElement).attr('style', 'pointer-events: bounding-box')
    cageGroupElement.addEventListener('contextmenu', handleContextMenu);

    return () => {
        cageGroupElement.removeEventListener('contextmenu', handleContextMenu);
    };
}

export async function mergeRacks(targetRack: Rack, draggedRack: Rack, doRackAction, layoutDragProps: LayoutDragProps, cageActionProps: CageActionProps, targetCage: Cage, draggedCage: Cage) {
    if(!d3.select('.popup').empty()) return;
    const action: RackActions = await showConfirmationPopup();
    const {
        layoutSvg,
        gridSize,
        gridRatio,
        MAX_SNAP_DISTANCE,
        delRack,
        moveItem,
        itemType
    } = layoutDragProps;

    const targetType = targetCage.type;
    const draggedType = draggedCage.type;

    // Start cage count at the first cage in the target shape
    // TODO fix this so that it matches correct types while maintaining their correct numbering system
    let newCageNums = convertCageNumToNum(targetRack.cages.find(cage => cage.id === 1).cageNum);

    function isConnected(selectionNode){
        return !!selectionNode.closest(`[id*='group']`);
    }

    // Make sure cages don't have the wrong styles/classes and correct cage numbering for merge
    function resetElementProperties(element, shapeType) {
        element.classList = `grouped-${shapeType}`;
        element.style = "";
        element.id = `${shapeType}-${newCageNums}`;
        const textEle = d3.select(element).selectAll('text').node() as SVGTextElement;
        setupEditCageEvent(textEle, cageActionProps.setEditCageNum, cageActionProps.setCtxMenuStyle, itemType as RackTypes);
        newCageNums++;
    }

    // add starting x and y for each group to then increment its local subgroup coords by.
    // Example: 2 nodes, 0,0 and 120,0 start at 0,0 add 120,0
    // second 2 nodes, 0,0 and 120,0 start at 240,0 add 0,0 and 120,0. etc
    function processChildNodes(element: SVGGElement, mergedGroup) {
        const {x: startX, y: startY} = getTranslation(element.getAttribute('transform'))
        d3.select(element).selectAll(':scope > g').each(function () {
            const targetCage = d3.select(this);
            const shapeType = parseRoomItemType(targetCage.attr('id'));
            const {x: localX, y: localY} = getTranslation(targetCage.attr('transform'));
            const newX = startX + localX
            const newY = startY + localY
            targetCage.attr('transform', `translate(${newX},${newY})`)
            resetElementProperties(this, shapeType);
            mergedGroup.node().appendChild(this);
            console.log("More than 1 merge: ", targetCage);
        });
    }

    function processShape(shape, shapeType, mergedGroup) {
        processChildNodes(shape, mergedGroup);

        /*if (shape.childNodes.length <= 1) {

            const tempCage = d3.select(shape).select(`[id^=${shapeType.type}-]`);
            //tempCage.classed(`grouped-${shapeType.type}`, true); // add grouped class to indicate its part of a group
            resetElementProperties(tempCage.node(), shapeType);
            mergedGroup.node().appendChild(tempCage.node());
        } else { // for groups of multiple shapes/cages
            processChildNodes(shape, mergedGroup);
        }*/
    }
    // return if another merge option is available,
    // prevents double merging when adding cages to a rack surrounded by multiple target points (aka other cages)

    if (action !== 'cancel') {
        const targetRackShape: d3.Selection<SVGGElement, {}, HTMLElement, any>
            = layoutSvg.select(`[id^=${targetRack.itemId}]`);

        const draggedRackShape: d3.Selection<SVGGElement, {}, HTMLElement, any>
            = layoutSvg.select(`[id^=${draggedRack.itemId}]`);

        let newGroup: d3.Selection<SVGGElement, {}, HTMLElement, any>;

        console.log("Merge: ", targetRackShape.node(), draggedRackShape.node());

        // Clone the target and dragged shapes before using
        let clonedTargetShape = targetRackShape.node().cloneNode(true) as Element;
        let clonedDraggedShape = draggedRackShape.node().cloneNode(true) as Element;

        if(action === 'merge'){
            if(isConnected(draggedRackShape.node()) || isConnected(targetRackShape.node())){
                await showLayoutEditorError("Invalid Configuration: Please do not merge connected racks");
                return;
            }
            newGroup = layoutSvg.append('g')
                .attr('class', targetRackShape.attr('class'))
                .attr('id', targetRackShape.attr('id'));
            //Reset translates to new local group
            resetNodeTranslationsWithZoom(clonedTargetShape, clonedDraggedShape, layoutSvg);

            processShape(clonedTargetShape, targetType, newGroup);
            processShape(clonedDraggedShape, draggedType, newGroup);




            // Copy any inline styles from the targetShape to the merged group
            const styleAttr = targetRackShape.attr('style');
            if (styleAttr) {
                newGroup.attr('style', styleAttr);
            }

            //Attach data from target to new shape
            const targetData = targetRackShape.datum() as { x: number; y: number };
            if(targetData) {
                newGroup.data([{x: targetData.x, y: targetData.y}])
            }

        }else{ // action = connect
            newGroup = layoutSvg.append('g')
                .attr('class', 'draggable rack-group')
                .attr('id', targetRack.groupId);

            resetNodeTranslationsWithZoom(clonedTargetShape, clonedDraggedShape, layoutSvg);

            d3.select(clonedTargetShape).classed('draggable', false);
            d3.select(clonedDraggedShape).classed('draggable', false);

            newGroup.node().appendChild(clonedTargetShape);
            newGroup.node().appendChild(clonedDraggedShape);

        }
        // Append the cloned shapes to the new group
        const targetRackId = targetRackShape.node().closest('[id*=rack]').getAttribute('id');
        const draggedRackId = draggedRackShape.node().closest('[id*=rack]').getAttribute('id');

        // Copy the transform attribute from the targetShape to the merged group
        const transformAttr = targetRackShape.attr('transform');
        if (transformAttr) {
            newGroup.attr('transform', transformAttr);
        }


        const addProps: LayoutDragProps = {
            gridSize: gridSize,
            gridRatio: gridRatio,
            MAX_SNAP_DISTANCE: MAX_SNAP_DISTANCE,
            layoutSvg: layoutSvg,
            delRack: delRack,
            moveItem: moveItem,
            itemType: itemType
        };
        newGroup.call(d3.drag().on('start', createStartDragInLayout({setRoomItem: cageActionProps.setEditCageNum}))
            .on('drag', createDragInLayout({layoutSvg: layoutSvg}))
            .on('end', createEndDragInLayout(addProps)));

        doRackAction(action,targetRackId, draggedRackId, newGroup);

        // Remove the original shapes from the DOM
        targetRackShape.remove();
        draggedRackShape.remove();
    }
}

// This checks the adjacency of two racks to determine if they can be merged
export function checkAdjacent(targetCage: LocationCoords, draggedCage: LocationCoords, gridSize: number, gridRatio: number) {

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
export function createStartDragInLayout(startDragProps: StartDragProps) {
    return(
        function startDragInLayout(event) {
            const {setRoomItem} = startDragProps;
            // Check if the parent <text> element is editable, return if not
            if (isTextEditable(event)) {
                event.on('drag', null).on('end', null); // Detach drag and end events
                return;
            }
            setRoomItem(d3.select(this).attr('id'));
            console.log('Drag Layout #1', parseRack(d3.select(this).attr('id')));
            d3.select(this).raise().classed('active', true);
        }
    );
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
                moveItem,
                itemType
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

                console.log("#3: ", cellX, cellY, shape.node());
                moveItem(shape.attr('id'), itemType, cellX, cellY, transform.k);

                // Set rack state correctly with move/updated coords


                /*
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
                }*/
            } else {
                // remove rack from room
                /*console.log("deleting cage from room", getRackFromClass(shape.attr('class')));
                const idToDel = parseInt(getRackFromClass(shape.attr('class')));
                delRack(idToDel);
                shape.remove();*/
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

export const areCagesInSameRack = (rack: Rack, cage1: LocationCoords, cage2: LocationCoords) => {
    if (!rack.cages || !Array.isArray(rack.cages)) {
        return false;
    }

    const nums = rack.cages.map(item => item.cageNum);
    return nums.includes(cage1.num) && nums.includes(cage2.num);
}




export const buildNewLocalRoom = (layoutData: LayoutHistoryData[], rackData, roomObjData) => {
    const newLocalRoom: RoomItem[] = [];
    let groupId: number = 1;

    // generates rack state from layout history data
    const generateRack = (rack: LayoutHistoryData): Rack => {
        // TODO query cages table and find the cages in rack.objectId
        const cagesInRack: EHRCage[] = testCagesInRoom.filter((cage) => cage.rack === rack.objectId);

        const cageState: Cage[] = cagesInRack.map((cage) => ({
            id: cage.rackNum,
            cageNum: cage.cageNum,
            rack: cage.rack,
            cageState: undefined,
            position: cage.position,
            type: cage.cagetype,
            adjCages: undefined, //TODO add adjCages here for cage modifications if required
            x: cage.x,
            y: cage.y
        }) as Cage);
        console.log("Gen Layout Data Rack: ", rack, cageState);

        const newRackState: Rack = {
            cages: cageState,
            itemId: rack.objectId, // TODO fix this so that it is correct id of rack, need list of rack ids managed by center or naming convention for them
            groupId: `rack-group-${groupId}` as GroupId,
            isActive: true,
            scale: rack.scale,
            type: rack.objectType as RackTypes,
            x: rack.x,
            y: rack.y
        }
        groupId++;
        return newRackState;
    }

    // generates room object state for room objects from layout history data
    const generateRoomObj = (roomObj: LayoutHistoryData): RoomObject => {

        return({
            itemId: roomObj.objectId,
            type: roomObj.objectType as RoomObjectTypes,
            x: roomObj.x,
            y: roomObj.y,
            scale: roomObj.scale
        });

    }

    // First parse through layout data to get rack and room object coords
    layoutData.forEach((roomItem) => {
        if(isRack(roomItem.objectType)){ // Room object is an enclosure for animals
            newLocalRoom.push(generateRack(roomItem));
        } else{ // Room object is something else in the room, ex. Door
            newLocalRoom.push(generateRoomObj(roomItem))
        }
    })

    return(newLocalRoom);
}

export const isRack = (itemType: RoomItemType): itemType is RackTypes => {
    return Object.values(RackTypes).includes(itemType as RackTypes);
}

export const findSelectObjRack = (racks: Rack[], obj: string): Rack => {
    return racks.find(rack => {
        return rack.cages.find((cage) => cage.cageNum === obj)
    });
}