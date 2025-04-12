// Initialize Paper.js
paper.install(window);
window.onload = function() {
    // Setup Paper.js
    paper.setup('canvas');

    // Canvas dimensions 
    const canvasWidth = 600;
    const canvasHeight = 400;

    // Create a new BSP tree
    const bspTree = new BSPTree(canvasWidth, canvasHeight);

    // Initial generation of the example tree
    // initializeExampleTree(bspTree);

    // Render the tree
    renderBSPTree(bspTree);

    // Global state variables
    let selectedNode = null;

    // Set up tool for interaction
    const tool = new Tool();

    // Handle mouse down (selection)
    tool.onMouseDown = function(event) {
        // Find the node at the clicked position
        const node = bspTree.findNodeByPosition(event.point.x, event.point.y);

        // Select new node
        selectedNode = node;
        if (node) {
            updateNodeStyle(node, true);
            updateInfoPanel(node);
        } else {
            document.getElementById('info-content').innerHTML = "No compartment selected";
        }

        // Split the clicked node
        if (selectedNode && selectedNode.isLeaf()) {
            if (guide_orientation == "vertical") {
                const rect = selectedNode.rectangle;
                const offset = event.point.x - rect.x;
                bspTree.splitCompartmentOffset(selectedNode, 'vertical', offset);
            } else {
                const rect = selectedNode.rectangle;
                const offset = event.point.y - rect.y;
                bspTree.splitCompartmentOffset(selectedNode, 'horizontal', offset);
            }

            redrawTree(bspTree);
        } else {
            console.log("Please select a leaf compartment to split");
        }
    };

    var guide_orientation = "horizontal"
    var guide_line = new Path({
        strokeColor: 'black',
        strokeWidth: 2
    });

    tool.onMouseMove = function(event) {
        // Snap mouse position to grid of n pixels
        let n = 3.3
        const snappedX = Math.round(event.point.x / n) * n;
        const snappedY = Math.round(event.point.y / n) * n;
        // Get the node we're over, using the snapped position
        const node = bspTree.findNodeByPosition(snappedX, snappedY);

        // Update the information pane
        info = ""
        info += "mousex = " + snappedX + " - mousey = " + snappedY + "<br/>"
        info += "asd"

        document.getElementById('info-content').innerHTML = info;


        if (node && node.isLeaf()) {

            // Clear the previous line
            guide_line.removeSegments();

            if (guide_orientation == "vertical") {
                // Create a vertical line at snapped x position
                // from top to bottom of the rectangle
                guide_line.add(new Point(snappedX, node.rectangle.y));
                guide_line.add(new Point(snappedX, node.rectangle.y + node.rectangle.height));
            } else {
                // Create a horizontal line at snapped y position
                // from left to right of the rectangle
                guide_line.add(new Point(node.rectangle.x, snappedY));
                guide_line.add(new Point(node.rectangle.x + node.rectangle.width, snappedY));
            }

            // Bring the line to the front
            guide_line.bringToFront();
        }
    };

    function handleKeyPress(event) {
        // Check which key was pressed
        if (event.key === 'z') {
            if (guide_orientation == "vertical") {
                guide_orientation = "horizontal"
            } else {
                guide_orientation = "vertical"
            }
        } else if (event.key === 'r' || event.key === 'R') {
            bspTree.root = new BSPNode(new Rectangle(0, 0, canvasWidth, canvasHeight, 1));
            bspTree.nextId = 2;
            selectedNode = null;
            redrawTree(bspTree);
            document.getElementById('info-content').innerHTML = "Click on a compartment to see details";    
        } else if (event.key === 'u' || event.key === 'U') {
            bspTree.undo();
            redrawTree(bspTree);
        } else if (event.key === 'd' || event.key === 'D') {
            bspTree.describe();
        }
}

    // Add event listener to the document
    document.addEventListener('keydown', handleKeyPress);


    // Button event handlers
    document.getElementById('change-orientation').addEventListener('click', function() {
        if (guide_orientation == "vertical") {
            guide_orientation = "horizontal"
        } else {
            guide_orientation = "vertical"
        }
    });

    document.getElementById('reset').addEventListener('click', function() {
        bspTree.root = new BSPNode(new Rectangle(0, 0, canvasWidth, canvasHeight, 1));
        bspTree.nextId = 2;
        selectedNode = null;
        redrawTree(bspTree);
        document.getElementById('info-content').innerHTML = "Click on a compartment to see details";
    });

    function initializeExampleTree(bsp) {
        // Split the root node with a vertical divider at x=250
        bsp.splitCompartment(bsp.root, 'vertical', 250);

        // Find the left compartment (id=2) and split it horizontally at y=300
        const leftNode = bsp.findNodeById(2);
        if (leftNode) {
            bsp.splitCompartment(leftNode, 'horizontal', 300);
        }

        // Find the right compartment (id=3) and split it horizontally at y=200
        const rightNode = bsp.findNodeById(3);
        if (rightNode) {
            bsp.splitCompartment(rightNode, 'horizontal', 200);
        }
    }

    function renderBSPTree(bsp) {
        // Clear existing items
        paper.project.activeLayer.removeChildren();

        guide_line = new Path({
            strokeColor: 'black',
            strokeWidth: 2
        });

        // Draw all leaf compartments
        const leaves = bsp.getAllLeafNodes();
        for (const leaf of leaves) {
            drawCompartment(leaf, false);
        }

        // Draw dividers
        const dividers = bsp.getAllDividers();
        for (const [divType, pos, rect] of dividers) {
            drawDivider(divType, pos, rect);
        }

        // Update view
        paper.view.draw();
    }

    function drawCompartment(node, isSelected) {
        const rect = node.rectangle;

        // Create Paper.js rectangle
        const paperRect = new Path.Rectangle({
            point: [rect.x, rect.y],
            size: [rect.width, rect.height],
            strokeColor: isSelected ? '#ff0000' : '#000000',
            strokeWidth: isSelected ? 3 : 1,
            fillColor: generateColorFromId(rect.id),
            opacity: 0.5
        });

        // Add ID text to the compartment
        const text = new PointText({
            point: [rect.x + rect.width/2, rect.y + rect.height/2],
            content: `ID: ${rect.id}`,
            fillColor: 'black',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fontSize: 14,
            justification: 'center'
        });

        // Store reference to node for interaction
        paperRect.data = { node: node };

        return { rect: paperRect, text: text };
    }

    function generateColorFromId(id) {
        // Simple hash function to generate colors
        const hue = (id * 137) % 360;
        return {
            hue: hue,
            saturation: 0.6,
            brightness: 0.9
        };
    }

    function drawDivider(dividerType, position, rect) {
        let from, to;

        if (dividerType === 'vertical') {
            from = new Point(position, rect.y);
            to = new Point(position, rect.y + rect.height);
        } else { // horizontal
            from = new Point(rect.x, position);
            to = new Point(rect.x + rect.width, position);
        }

        const dividerLine = new Path.Line({
            from: from,
            to: to,
            strokeColor: '#0000ff',
            strokeWidth: 2.5,
            dashArray: [5, 3]
        });

        return dividerLine;
    }

    function updateNodeStyle(node, isSelected) {
        // Find the Paper.js item corresponding to this node
        const items = paper.project.activeLayer.children;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item instanceof Path.Rectangle && item.data && item.data.node === node) {
                // Update the style
                item.strokeColor = isSelected ? '#ff0000' : '#000000';
                item.strokeWidth = isSelected ? 3 : 1;

                // Ensure the selected item is on top
                if (isSelected) {
                    item.bringToFront();
                }

                break;
            }
        }
    }

    function updateInfoPanel(node) {
        const rect = node.rectangle;
        let html = `
            <p><strong>ID:</strong> ${rect.id}</p>
            <p><strong>Position:</strong> (${rect.x}, ${rect.y})</p>
            <p><strong>Size:</strong> ${rect.width} x ${rect.height}</p>
            <p><strong>Type:</strong> ${node.isLeaf() ? 'Leaf' : 'Internal Node'}</p>
        `;

        if (!node.isLeaf()) {
            html += `
                <p><strong>Divider:</strong> ${node.dividerType} at position ${node.dividerPosition}</p>
            `;
        }

        document.getElementById('info-content').innerHTML = html;
    }

    function redrawTree(bsp) {
        renderBSPTree(bsp);
    }
};

// Convert TypeScript BSP code to JavaScript (assuming it's been compiled)
// Include the compiled JS or convert it manually here if needed
// This assumes you've exported the bsp.ts to bsp.js

// Include the compiled JS or convert it manually here if needed
// This assumes you've exported the bsp.ts to bsp.js

