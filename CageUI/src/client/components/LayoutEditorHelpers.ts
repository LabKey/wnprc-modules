// Layout Editor Helpers
import * as d3 from 'd3';
import {
    convertCageNumToNum,
    getTranslation, getTypeClassFromElement,
    isTextEditable,
    parseGroupId,
    parseRack,
    parseRoomItemType
} from './helpers';
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
    RackActions, RackGroup,
    RackTypes,
    RoomItem,
    RoomItemClass,
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
            .text('Merge Cages')
            .on('click', () => {
                popup.remove();
                resolve('merge');
            });

        // Connect button
        popup.append('button')
            .text('Connect Racks')
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

// Function to help merge/connect racks together by resetting groups to local coords
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

    // Attach context menu to the lowest level group for that cage.
    const cageGroupElement: SVGGElement = element.closest(`[id^=${rackType}]`) as SVGGElement;
    console.log("Attach menu: ", cageGroupElement)
    d3.select(cageGroupElement).attr('style', 'pointer-events: bounding-box')
    cageGroupElement.addEventListener('contextmenu', handleContextMenu);

    return () => {
        cageGroupElement.removeEventListener('contextmenu', handleContextMenu);
    };
}

/*
    Helper function to either connect racks or merge cages

    One can think of a merge as at the cage level and connections are at a rack level.
    Even though cages can not be added/removed from racks in reality, for layout building purposes they can.

 */
export async function mergeRacks(targetRack: Rack, draggedRack: Rack, targetRackGroup: RackGroup, dragRackGroup: RackGroup, doRackAction, layoutDragProps: LayoutDragProps, cageActionProps: CageActionProps) {
    if(!d3.select('.popup').empty()) return;
    const action: RackActions = await showConfirmationPopup();
    const {
        layoutSvg,
        gridSize,
        MAX_SNAP_DISTANCE,
        delRack,
        moveItem,
        itemClass
    } = layoutDragProps;

    console.log("Performing Merge");
    //console.log("Racks: ", targetRack, draggedRack);
    //console.log("Cages: ", targetCage, draggedCage);

    // Start cage count at the first cage in the target shape
    // TODO fix this so that it matches correct types while maintaining their correct numbering system
    //let newCageNums = convertCageNumToNum(targetRack.cages.find(cage => cage.id === 1).cageNum);

    function isConnected(selectionNode){
        return !!selectionNode.closest(`[id*='group']`);
    }

    // Make sure cages don't have the wrong styles, give merged cages a grouped class
    function resetElementProperties(element, shapeType, action) {
        if(action === 'merge'){
            element.classList = `grouped-${shapeType}`;
            element.style = "";
        }
        const textEle = d3.select(element).selectAll('text').node() as SVGTextElement;
        setupEditCageEvent(textEle, cageActionProps.setEditCageNum, cageActionProps.setCtxMenuStyle, shapeType as RackTypes);
    }

    // add starting x and y for each group to then increment its local subgroup coords by.
    // Example: 2 nodes, 0,0 and 120,0 start at 0,0 add 120,0
    // second 2 nodes, 0,0 and 120,0 start at 240,0 add 0,0 and 120,0. etc
    function processChildNodes(element: SVGGElement, mergedGroup, action: RackActions) {
        const {x: startX, y: startY} = getTranslation(element.getAttribute('transform'))
        d3.select(element).selectAll(':scope > g').each(function () {
            const targetShape = d3.select(this);
            let shapeType;
            if(action === 'merge'){
                shapeType = parseRoomItemType(targetShape.attr('id'));
            }else{
                shapeType = getTypeClassFromElement(targetShape.node());
            }
            const {x: localX, y: localY} = getTranslation(targetShape.attr('transform'));
            const newX = startX + localX;
            const newY = startY + localY;
            targetShape.attr('transform', `translate(${newX},${newY})`);

            // When connecting merged groups that have been connected before make sure to reset each cage but
            // add the rack shape instead of cage shape
            const mergedChildren = d3.select(this).selectAll(':scope > g');
            if(!mergedChildren.empty()){
                mergedChildren.each(function () {
                    resetElementProperties(this, shapeType, action);
                })
            }else{
                resetElementProperties(this, shapeType, action);
            }
            mergedGroup.node().appendChild(this);
        });
    }

    function processShape(shape, action, mergedGroup) {
        if(action === 'merge'){
            processChildNodes(shape, mergedGroup, action);
        }else{
            if(shape.getAttribute('class').includes('rack-group')){
                processChildNodes(shape, mergedGroup, action);
            }else{// When connecting racks for the first time
                // this iteration is for connecting a merged rack, have to reset each cage in the rack but add the rack shape not the cage shape
                d3.select(shape).selectAll(':scope > g').each(function () {
                    resetElementProperties(this, getTypeClassFromElement(shape), action);
                });

                mergedGroup.node().appendChild(shape);
            }
        }
    }
    if (action !== 'cancel') {
        let targetRackShape: d3.Selection<SVGGElement, {}, HTMLElement, any>
            = layoutSvg.select(`[id^=${targetRack.itemId}]`);

        let draggedRackShape: d3.Selection<SVGGElement, {}, HTMLElement, any>
            = layoutSvg.select(`[id^=${draggedRack.itemId}]`);

        let newGroup: d3.Selection<SVGGElement, {}, HTMLElement, any>;

        console.log("Merge: ", targetRackShape.node(), draggedRackShape.node());

        // Clone the target and dragged shapes before using
        let clonedTargetShape = targetRackShape.node().cloneNode(true) as Element;
        let clonedDraggedShape = draggedRackShape.node().cloneNode(true) as Element;

        let targetRackId = clonedTargetShape.id;
        let draggedRackId = clonedDraggedShape.id;

        if(action === 'merge'){
            if(isConnected(draggedRackShape.node()) || isConnected(targetRackShape.node())){
                await showLayoutEditorError("Invalid Configuration: Please do not merge connected racks");
                return;
            }
            if(draggedRack.type.type !== targetRack.type.type){
                await showLayoutEditorError("Invalid Configuration: Please do not merge cages of different types, use connection instead");
                return;
            }
            newGroup = layoutSvg.append('g')
                .attr('class', targetRackShape.attr('class'))
                .attr('id', targetRackShape.attr('id'));
            //Reset translates to new local group
            resetNodeTranslationsWithZoom(clonedTargetShape, clonedDraggedShape, layoutSvg);

            processShape(clonedTargetShape, action, newGroup);
            processShape(clonedDraggedShape, action, newGroup);

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

        }
        else{ // action = connect

            // If connecting already connected groups these will be populated
            const connectedTargetGroupShape: d3.Selection<SVGGElement, {}, HTMLElement, any>
                = layoutSvg.select(`#${targetRackGroup.groupId}`);

            const connectedDragGroupShape: d3.Selection<SVGGElement, {}, HTMLElement, any>
                = layoutSvg.select(`#${dragRackGroup.groupId}`);

            if(!connectedTargetGroupShape.empty()){
                clonedTargetShape = connectedTargetGroupShape.node().cloneNode(true) as Element;
                targetRackShape = connectedTargetGroupShape;
            }

            if(!connectedDragGroupShape.empty()){
                clonedDraggedShape = connectedDragGroupShape.node().cloneNode(true) as Element;
                draggedRackShape = connectedDragGroupShape;
            }

            newGroup = layoutSvg.append('g')
                .attr('class', 'draggable rack-group')
                .attr('id', targetRackGroup.groupId);

            resetNodeTranslationsWithZoom(clonedTargetShape, clonedDraggedShape, layoutSvg);

            d3.select(clonedTargetShape).classed('draggable', false);
            d3.select(clonedDraggedShape).classed('draggable', false);

            processShape(clonedTargetShape, action, newGroup);
            processShape(clonedDraggedShape,action, newGroup);

            console.log("End Processing: ", newGroup);
        }

        // Copy the transform attribute from the targetShape to the merged group
        const transformAttr = targetRackShape.attr('transform');
        if (transformAttr) {
            newGroup.attr('transform', transformAttr);
        }


        const addProps: LayoutDragProps = {
            gridSize: gridSize,
            MAX_SNAP_DISTANCE: MAX_SNAP_DISTANCE,
            layoutSvg: layoutSvg,
            delRack: delRack,
            moveItem: moveItem,
            itemClass: itemClass
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
                itemClass
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
                moveItem(shape.attr('id'), itemClass, cellX, cellY, transform.k);

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


export const buildNewLocalRoom = (layoutData: LayoutHistoryData[], rackData) => {
    const newLocalRoom: RoomItem[] = [];
    let groupId: number = 1;

    // generates rack state from layout history data
    const generateRack = (rack: LayoutHistoryData): Rack => {
        // TODO query cages table and find the cages in rack.objectId
        const cagesInRack: EHRCage[] = testCagesInRoom.filter((cage) => cage.rack === rack.objectId);
        /*
        const cageState: Cage[] = cagesInRack.map((cage) => ({
            id: cage.rackNum,
            cageNum: cage.cageNum,
            rack: cage.rack,
            cageState: undefined,
            position: cage.position,
            type: cage.cagetype,
            adjCages: undefined, //TODO add adjCages here for cage modifications if required
            x: cage.x,
            y: cage.y,
            length: cage.length,
            width: cage.width,
            height: cage.height,
            sqft: cage.sqft
        }) as Cage);
        console.log("Gen Layout Data Rack: ", rack, cageState);*/
        let newRackState: Rack;
        /*newRackState: Rack = {
            cages: cageState,
            itemId: rack.objectId, // TODO fix this so that it is correct id of rack, need list of rack ids managed by center or naming convention for them
            groupInfo: {
                groupId: `rack-group-${groupId}` as GroupId,
                x: rack.x,
                y: rack.y
            },
            isActive: true,
            scale: rack.scale,
            type: rack.objectType as RackTypes,
            x: rack.x,
            y: rack.y
        }*/
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
    //TODO Fix this
    // First parse through layout data to get rack and room object coords
    /*layoutData.forEach((roomItem) => {
        if(isRack(roomItem.objectType)){ // Room object is an enclosure for animals
            newLocalRoom.push(generateRack(roomItem));
        } else{ // Room object is something else in the room, ex. Door
            newLocalRoom.push(generateRoomObj(roomItem))
        }
    })*/

    return(newLocalRoom);
}

export const isRack = (itemType: RackTypes | RoomObjectTypes): itemType is RackTypes => {
    return Object.values(RackTypes).includes(itemType as RackTypes);
}

export const findSelectObjRack = (racks: Rack[], obj: string): Rack => {
    return racks.find(rack => {
        return rack.cages.find((cage) => cage.cageNum === obj)
    });
}

// Finds the next avail group id number
export const findNextGroupId = (groups: GroupId[]): number => {
    const groupNumbers = groups
        .map(group => parseGroupId(group))
        .filter(num => num !== undefined)
        .sort((a, b) => a - b);

    // return 1 if no groups exist
    if (groupNumbers.length === 0) {
        return 1;
    }

    // Find the first missing number/group id in case gaps exist
    // Ex. groups = [rack-group-1, rack-group-4] returns 2
    for (let i = 0; i < groupNumbers.length; i++) {
        if (groupNumbers[i] !== i + 1) {
            return i + 1; // Return the missing number
        }
    }

    // If no gaps were found, return the next number
    return groupNumbers[groupNumbers.length - 1] + 1;
};

export const findRackInGroup = (targetId: string, groups: RackGroup[]): {rack: Rack, rackGroup: RackGroup} | undefined => {
    let targetRack: Rack | undefined;
    let targetGroup: RackGroup | undefined;

    targetGroup = groups.find((group: RackGroup) =>
        group.racks.some((rack: Rack) => rack.itemId === targetId)
    );

    if (targetGroup) {
        targetRack = targetGroup.racks.find((rack: Rack) => rack.itemId === targetId);
    }
    return {rack: targetRack, rackGroup: targetGroup};
}