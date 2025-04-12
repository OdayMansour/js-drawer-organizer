// Initialize Paper.js
paper.install(window);
window.onload = async function() {
    // Setup Paper.js
    paper.setup('canvas');

    // Get canvas dimensions from user
    const canvasSetup = new CanvasSetup();
    const dimensions = await canvasSetup.promptForDimensions();

    // Canvas dimensions
    var canvasWidth = dimensions.width;
    var canvasHeight = dimensions.height;

    // Create a new BSP tree
    const bspTree = new BSPTree(canvasWidth, canvasHeight);

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
        bspTree.root = new BSPNode(new Rectangle(0, 0, canvasWidth, canvasHeight, 1));
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
