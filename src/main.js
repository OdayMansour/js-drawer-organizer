// Web page things
import { CanvasSetup } from './html/canvasSetup.js';

// BSP things
import { BSPTree } from './bsp/bsp.js';
import { InteractionHandler } from './bsp/interactionHandler.js';
import { BSPRenderer } from './bsp/bspRenderer.js';
import { BSPAnalyzer } from './bsp/bspAnalyzer.js';

// STL things
import { STLGenerator } from './stl/stlGenerator.js';

// SVG things
import { SVGGenerator } from './svg/svgGenerator.js';

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

    // Initialize STL Generator
    const stlGenerator = new STLGenerator(drawingDepth);

    // Initialize SVG Generator
    const svgGenerator = new SVGGenerator(drawingDepth, new BSPAnalyzer(bspTree));
    console.log(svgGenerator);

    let debug = true;
    // let debug = false;
    if (debug) { // Do an initial slice-up
        let node = bspTree.findNodeByPosition(165, 340);
        bspTree.splitCompartmentOffset(node, 'horizontal', 340);
        node = bspTree.findNodeByPosition(175, 260);
        bspTree.splitCompartmentOffset(node, 'horizontal', 260);
        node = bspTree.findNodeByPosition(180, 180);
        bspTree.splitCompartmentOffset(node, 'horizontal', 180);
        node = bspTree.findNodeByPosition(135, 115);
        bspTree.splitCompartmentOffset(node, 'vertical', 135);
        node = bspTree.findNodeByPosition(180, 120);
        bspTree.splitCompartmentOffset(node, 'horizontal', 120);
        node = bspTree.findNodeByPosition(70, 60);
        bspTree.splitCompartmentOffset(node, 'horizontal', 60);
    }
    // Render the initial tree
    renderer.renderBSPTree(bspTree, interactionHandler.showRawLengths);
};