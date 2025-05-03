import { UIManager } from './uiManager.js';
import { BSPRenderer } from './bspRenderer.js';
import { Rectangle, BSPNode } from './bsp.js';
import { BSPAnalyzer } from './bspAnalyzer.js';

export class InteractionHandler {
    constructor(bspTree) {
        this.bspTree = bspTree;
        this.bspAnalyzer = new BSPAnalyzer(this.bspTree)
        this.selectedNode = null;
        this.guideOrientation = "horizontal";
        this.snapGrid = 5; // Snap to grid of 3.3 pixels
        this.showRawLengths = false; // Toggle for showing raw vs. adjusted wall lengths
        this.uiManager = new UIManager();
        this.renderer = new BSPRenderer();

        this.initializeTools();
        this.setupKeyboardEvents();
    }

    initializeTools() {
        const tool = new Tool();
        const self = this;

        // Handle mouse down (selection)
        tool.onMouseDown = function(event) {
            if (event.event.button == 0) {
                self.handleLeftClick(event);
            } else {
                self.handleRightClick(event);
            }
        };

        // Handle mouse move (guide line)
        tool.onMouseMove = function(event) {
            self.handleMouseMove(event);
        };
    }

    setupKeyboardEvents() {
        const self = this;
        document.addEventListener('keydown', function(event) {
            self.handleKeyPress(event);
        });
    }

    handleLeftClick(event) {
        // Snap mouse position to grid
        const snappedX = Math.round(event.point.x / this.snapGrid) * this.snapGrid;
        const snappedY = Math.round(event.point.y / this.snapGrid) * this.snapGrid;

        // Find the node at the clicked position
        const node = this.bspTree.findNodeByPosition(snappedX, snappedY);

        // Select new node
        this.selectedNode = node;

        // Split the clicked node
        if (this.selectedNode && this.selectedNode.isLeaf()) {
            if (this.guideOrientation === "vertical") {
                const rect = this.selectedNode.rectangle;
                const offset = snappedX - rect.x;
                this.bspTree.splitCompartmentOffset(this.selectedNode, 'vertical', offset);
            } else {
                const rect = this.selectedNode.rectangle;
                const offset = snappedY - rect.y;
                this.bspTree.splitCompartmentOffset(this.selectedNode, 'horizontal', offset);
            }

            this.renderer.renderBSPTree(this.bspTree, this.showRawLengths);
        } else {
            console.log("Please select a leaf compartment to split");
        }
    }

    handleRightClick(event) {
        this.toggleOrientation();
        this.handleMouseMove(event);
    }

    handleMouseMove(event) {
        // Snap mouse position to grid
        const snappedX = Math.round(event.point.x / this.snapGrid) * this.snapGrid;
        const snappedY = Math.round(event.point.y / this.snapGrid) * this.snapGrid;

        // Get the node we're over, using the snapped position
        const node = this.bspTree.findNodeByPosition(snappedX, snappedY);

        // Update the information pane
        let info = "";
        info += "mousex = " + snappedX + " - mousey = " + snappedY + "<br/>";
        info += "asd";
        this.uiManager.setInfoContent(info);

        if (node && node.isLeaf()) {
            this.renderer.updateGuideLine(
                this.guideOrientation, 
                new Point(snappedX, snappedY),
                // this.guideOrientation === "vertical" ? snappedX : snappedY, 
                node
            );
        } else {
            this.renderer.removeGuideLine();
        }
    }

    handleKeyPress(event) {
        // Check which key was pressed
        if (event.key === 'z') {
            this.toggleOrientation();
        } else if (event.key === 'r' || event.key === 'R') {
            this.resetTree();
        } else if (event.key === 'u' || event.key === 'U') {
            this.bspTree.undo();
            this.renderer.renderBSPTree(this.bspTree);
        } else if (event.key === 'd' || event.key === 'D') {
            this.bspAnalyzer.describe();
        } else if (event.key === 'w' || event.key === 'W') {
            this.bspAnalyzer.generateWallsWood();
        } else if (event.key === 't' || event.key === 'T') {
            this.renderer.toggleWallLengths();
            this.renderer.renderBSPTree(this.bspTree);
        }
    }

    toggleOrientation() {
        this.guideOrientation = this.guideOrientation === "vertical" ? "horizontal" : "vertical";
    }

    resetTree() {
        this.bspTree.root = new BSPNode(new Rectangle(0, 0, this.bspTree.width, this.bspTree.height, 1)); // Use constants from main
        this.bspTree.nextId = 2;
        this.selectedNode = null;
        this.renderer.renderBSPTree(this.bspTree);
        this.uiManager.setDefaultInfoContent();
    }
}
