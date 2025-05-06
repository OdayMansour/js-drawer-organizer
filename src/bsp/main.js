import { CanvasSetup } from './canvasSetup.js';
import { BSPTree } from './bsp.js';
import { InteractionHandler } from './interactionHandler.js';
import { UIManager } from './uiManager.js';
import { BSPRenderer } from './bspRenderer.js';
import { STLGenerator } from './stlGenerator.js';

document.oncontextmenu = document.body.oncontextmenu = function() {return false;}

// Initialize Paper.js
paper.install(window);
window.onload = async function() {
    const canvasSetup = new CanvasSetup();
    const dimensions = await canvasSetup.promptForDimensions();

    // Drawing dimensions
    var drawingWidth = dimensions.width;
    var drawingHeight = dimensions.height;
    var drawingDepth = dimensions.depth;

    // Setup Paper.js
    paper.setup('canvas');

    // Get size of drawing, size of canvas, and derive scaling factor needed to fill 90% of screen
    const scaleFactor = Math.min(
        window.innerWidth / drawingWidth,
        window.innerHeight / drawingHeight
    ) * 0.85;

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

    // Initialize STL Generator
    const stlGenerator = new STLGenerator(drawingDepth);

    // Render the initial tree
    renderer.renderBSPTree(bspTree, interactionHandler.showRawLengths);

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
};