import { CanvasSetup } from './canvasSetup.js';
import { BSPTree } from './bsp.js';
import { InteractionHandler } from './interactionHandler.js';
import { UIManager } from './uiManager.js';
import { BSPRenderer } from './bspRenderer.js';

document.oncontextmenu = document.body.oncontextmenu = function() {return false;}

// Initialize Paper.js
paper.install(window);
window.onload = async function() {
    const canvasSetup = new CanvasSetup();
    const dimensions = await canvasSetup.promptForDimensions();

    // Drawing dimensions
    var drawingWidth = dimensions.width;
    var drawingHeight = dimensions.height;

    // Setup Paper.js
    paper.setup('canvas');

    // Get size of drawing, size of canvas, and derive scaling factor needed to fill 90% of screen
    const scaleFactor = Math.min(
        window.innerWidth / drawingWidth,
        window.innerHeight / drawingHeight
    ) * 0.9;

    // Move the center of the drawing to prepare for scaling
    paper.view.center = new Point(
        paper.view.center.x / scaleFactor * 0.9,
        paper.view.center.y / scaleFactor * 0.9
    );

    // Scale the drawing (scaling happens relative to center of drawing, not top left {0,0})
    paper.view.scaling = scaleFactor;

    // Create a new BSP tree
    const bspTree = new BSPTree(drawingWidth, drawingHeight);

    // Initialize interaction handlers
    const interactionHandler = new InteractionHandler(bspTree);

    // Initialize renderer
    const renderer = new BSPRenderer();

    // Initialize UI manager
    const uiManager = new UIManager();

    // Render the initial tree
    renderer.renderBSPTree(bspTree);

    // Setup UI event listeners
    document.getElementById('change-orientation').addEventListener('click', function() {
        interactionHandler.toggleOrientation();
    });

    document.getElementById('reset').addEventListener('click', function() {
        bspTree.root = new BSPNode(new Rectangle(0, 0, drawingWidth, drawingHeight, 1));
        bspTree.nextId = 2;
        interactionHandler.selectedNode = null;
        renderer.renderBSPTree(bspTree);
        uiManager.updateInfoPanel(null);
    });

    // Optionally initialize an example tree
    // initializeExampleTree(bspTree, renderer);
};

function initializeExampleTree(bsp, renderer) {
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

    renderer.renderBSPTree(bsp);
}
