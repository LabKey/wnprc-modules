// Layout Editor Helpers
import * as d3 from 'd3';
import { getRackFromClass, getTranslation, isTextEditable } from './helpers';
import { EndDragLayoutProps, HandleZoomProps } from './typings';

/*export const  drawGrid = (scale, visibleWidth, visibleHeight, gridSize) => {
    const gridLines = [];

    // Calculate the number of rows and columns to fill the visible area
    const numRows = Math.ceil(visibleHeight / (gridSize * scale));  // Rows based on visible height
    const numCols = Math.ceil(visibleWidth / (gridSize * scale));   // Columns based on visible width

    // Generate grid cells to fill the entire visible area
    for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numCols; j++) {
            gridLines.push({
                x: j * gridSize * scale,    // Adjust the cell position based on zoom scale
                y: i * gridSize * scale,
                width: gridSize * scale,    // Adjust cell size based on zoom scale
                height: gridSize * scale
            });
        }
    }
    return gridLines;
};
*/
export const drawGrid = (layoutSvg: d3.Selection<SVGElement, unknown, any, any>, updateGridProps) => {
    layoutSvg.append("g").attr("class", "grid");
    updateGrid(d3.zoomIdentity, updateGridProps.width, updateGridProps.height, updateGridProps.gridSize); // Draw grid with the initial view
}

export const updateGrid = (transform, width, height, gridSize) => {
    const g = d3.select("g.grid");
    g.selectAll(".cell").remove(); // Clear existing grid

    // Compute the current visible area based on the transformation
    const visibleWidth = width / transform.k;
    const visibleHeight = height / transform.k;

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

// This function makes the element draggable in the layout editor
function makeDraggable(element, props) {
    const d3Element = d3.select(element);
    d3Element.call(d3.drag()
        .on('start', startDragInLayout)
        .on('drag', createDragInLayout({layoutSvg: props.layoutSvg}))
        .on('end', createEndDragInLayout(props)));
}
/* Function to help merge racks together
/ This function strips the transforms from the individual svg groups then applies
/ x and y attributes to the group children. these x and y coords are relative to the new group
/ meaning they should be starting at 0,0 and placed every grid ratio * grid size * number of previous racks
/ pixels apart, Example, (0,0) (0,120) (0,240) if every cage is 4 cells in length and 30 pixel cells
*/
async function mergeRacks(targetShape, draggedShape, gridSize, gridRatio, MAX_SNAP_DISTANCE, layoutSvg) {
    const shouldMerge = await showConfirmationPopup(targetShape, draggedShape);
    if (shouldMerge) {
        const targetChildren = targetShape.node().children;
        const draggedChildren = draggedShape.node().children;

        // Function to convert transform to x and y attributes
        const convertTransformToXY = (element, curIdx) => {
            const transform = d3.select(element).attr('transform');
            if(!transform) return;
            const {x: targetX, y: targetY} = getTranslation(targetShape.attr('transform'));
            const {x: dragX, y: dragY} = getTranslation(draggedShape.attr('transform'));
            let direction = 1; // determines direction if place on other side of target


            if(element.parentElement.getAttribute('class').includes("horizontal")) {
                let children: number = 1;
                if(curIdx === 0){
                    children = 0;
                }
                else if(dragY < targetY){
                    direction = -1;
                    for (let i = 1; i < targetShape.node().children.length; i++) {
                        if(parseInt(targetShape.node().children[i].getAttribute('y')) < 0){
                            children++;
                        }
                    }
                }else{
                    for (let i = 1; i < targetShape.node().children.length; i++) {
                        if(parseInt(targetShape.node().children[i].getAttribute('y')) > 0){
                            children++;
                        }
                    }
                }
                d3.select(element)
                    .attr('x', 0)
                    .attr('y', (children * gridRatio * gridSize * direction))
                    .attr('transform', null);
            }else{
                let children: number = 1;
                if(curIdx === 0){
                    children = 0;
                }
                else if(dragX < targetX){
                    direction = -1;
                    for (let i = 1; i < targetShape.node().children.length; i++) {
                        if(parseInt(targetShape.node().children[i].getAttribute('x')) < 0){
                            children++;
                        }
                    }
                }else{
                    for (let i = 1; i < targetShape.node().children.length; i++) {
                        if(parseInt(targetShape.node().children[i].getAttribute('x')) > 0){
                            children++;
                        }
                    }
                }
                d3.select(element)
                    .attr('x', (children * gridRatio * gridSize * direction))
                    .attr('y', 0)
                    .attr('transform', null);
            }
        }

        // Convert target group's children
        Array.from(targetChildren).forEach(((child, idx) => convertTransformToXY(child, idx)));

        // Convert dragged group's children and append to the target group
        Array.from(draggedChildren).forEach((child) => {
            convertTransformToXY(child, targetChildren.length); // just length since idx start at 0
            targetShape.append(() => (child as SVGElement).cloneNode(true));
        });

        // Remove the original dragged group
        draggedShape.remove();

        // Update the bounding box of the merged group
        const bbox = targetShape.node().getBBox();
        targetShape.attr('width', bbox.width)
            .attr('height', bbox.height);

        // Ensure the group is draggable
        const addProps = {gridSize: gridSize, MAX_SNAP_DISTANCE: MAX_SNAP_DISTANCE, layoutSvg: layoutSvg}
        makeDraggable(targetShape.node(), addProps);

        console.log("Merged group updated/created at:", {
            x: targetShape.attr('x'),
            y: targetShape.attr('y'),
            width: bbox.width,
            height: bbox.height
        });
    }
}

// This checks the adjacency of two racks to determine if they can be merged
function checkAdjacent(targetShape, draggedShape, gridSize, gridRatio) {

    const targetTransform = targetShape.attr('transform');
    const dragTransoform = draggedShape.attr('transform');

    const coords1 = getTranslation(targetTransform);
    const coords2 = getTranslation(dragTransoform);

    console.log("Checking adjacency:", coords1, coords2);

    const boxWidth = gridSize * gridRatio;  // Assuming each box is 4 grid cells wide
    let horizontallyAdjacent;
    let verticallyAdjacent;

    if(targetShape.attr('class').includes("vertical")){
        let children: number = 1; // start at 1 for origin because we skip it in the loops
        if(coords1.x < coords2.x){ // mark children on the right of origin
            // Start at 1 because 0 is always origin (0,0)
            for (let i = 1; i < targetShape.node().children.length; i++) {
                if(parseInt(targetShape.node().children[i].getAttribute('x')) > 0){
                    children++;
                }
            }
        }else{// mark children on the left of origin
            for (let i = 1; i < targetShape.node().children.length; i++) {
                if(parseInt(targetShape.node().children[i].getAttribute('x')) < 0){
                    children++;
                }
            }
        }
        verticallyAdjacent = (
            Math.abs(coords1.x - coords2.x) === (boxWidth * children) &&
            coords1.y === coords2.y
        );
    }else{
        let children: number = 1;
        if(coords1.y < coords2.y){ // mark children on the right of origin
            for (let i = 1; i < targetShape.node().children.length; i++) {
                if(parseInt(targetShape.node().children[i].getAttribute('y')) > 0){
                    children++;
                }
            }
        }else{// mark children on the left of origin
            for (let i = 1; i < targetShape.node().children.length; i++) {
                if(parseInt(targetShape.node().children[i].getAttribute('y')) < 0){
                    children++;
                }
            }
        }
        horizontallyAdjacent = (
            Math.abs(coords1.y - coords2.y) === (boxWidth * children) &&
            coords1.x === coords2.x
        );
    }
    const isAdjacent = horizontallyAdjacent || verticallyAdjacent;
    console.log("Is adjacent:", isAdjacent);
    return isAdjacent;
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
            // Adjust position for the zoom/pan transform
            const newX = transform.applyX(event.x); // Apply zoom and pan to x
            const newY = transform.applyY(event.y); // Apply zoom and pan to y
            element.attr('transform', `translate(${newX},${newY}) scale(${scale})`);
        }
    )
}


// TODO add data for x and y new coords to svg group .data()

export function createEndDragInLayout(props: EndDragLayoutProps) {
    return (
        function endDragInLayout(event) {
            const {gridSize, gridRatio, MAX_SNAP_DISTANCE, layoutSvg, delRack} = props;
            const shape = d3.select(this);
            shape.classed('active', false);
            const transform = d3.zoomTransform(layoutSvg.node());
            console.log('Drag Layout event #3', event.x, event.y);

            const targetCell = getTargetRect(event.x, event.y, gridSize, transform);

            if (targetCell) {
                console.log('Drag Layout #3', shape, targetCell);
                const cellX = targetCell.x;
                const cellY = targetCell.y;
                placeAndScaleGroup(shape, cellX, cellY, transform);

                // Only allow merging of individual rack to another single rack or a merged rack.
                if ((shape.node() as SVGGElement).children.length < 2) {
                    layoutSvg.selectAll('.draggable, .merged-box').each(function () {
                        const otherBox = d3.select(this);
                        console.log('ADJ BOX: ', otherBox);
                        if (shape.node() !== otherBox.node() && checkAdjacent(otherBox, shape, gridSize, gridRatio)) {
                            mergeRacks(otherBox, shape, gridSize, gridRatio, MAX_SNAP_DISTANCE, layoutSvg);
                        }
                    });
                }
            } else {
                // remove rack from room
                console.log("deleting rack from room", getRackFromClass(shape.attr('class')));
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
