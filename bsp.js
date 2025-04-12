class Rectangle {
    constructor(x, y, width, height, id = null) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.id = id;
    }

    toString() {
        return `Rectangle(id=${this.id}, x=${this.x}, y=${this.y}, width=${this.width}, height=${this.height})`;
    }
    
    containsPoint(px, py) {
        return (this.x <= px && px < this.x + this.width && 
                this.y <= py && py < this.y + this.height);
    }
}

class BSPNode {
    constructor(rectangle, parent = null) {
        this.rectangle = rectangle;
        this.dividerType = null;
        this.dividerPosition = null;
        this.leftChild = null;
        this.rightChild = null;
        this.parent = parent;
    }
    
    isLeaf() {
        return this.leftChild === null && this.rightChild === null;
    }
    
    toString() {
        if (this.isLeaf()) {
            return `Leaf(${this.rectangle})`;
        } else {
            return `Node(${this.rectangle}, divider=${this.dividerType} at ${this.dividerPosition})`;
        }
    }
}

class BSPTree {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.nextId = 1;
        // Create root node with the entire canvas
        const rootRectangle = new Rectangle(0, 0, width, height, this.nextId);
        this.nextId += 1;
        this.root = new BSPNode(rootRectangle);
        this.history = [];
    }
    
    splitCompartmentOffset(node, dividerType, offset) {
        console.log("Splitting " + dividerType + " on offset " + offset);
        this.history.push(node)
        let position = 0;
        if (dividerType === 'vertical') {
            position = offset + node.rectangle.x;
        } else {  // horizontal
            position = offset + node.rectangle.y;
        }

        return this.splitCompartment(node, dividerType, position);
    }

    splitCompartment(node, dividerType, position) {
        /**
         * Split a compartment (node) with a divider.
         * 
         * @param node - The BSPNode to split
         * @param dividerType - 'horizontal' or 'vertical'
         * @param position - The position of the divider, relative to the node's rectangle
         * 
         * @returns A tuple of the two new nodes or false if the split failed
         */
        if (!node.isLeaf()) {
            console.log("Cannot split a non-leaf node");
            return false;
        }
        
        const rect = node.rectangle;
        
        // Validate the divider position
        if (dividerType === 'vertical') {
            if (position <= rect.x || position >= rect.x + rect.width) {
                console.log(`Invalid vertical divider position: ${position}`);
                return false;
            }
        } else {  // horizontal
            if (position <= rect.y || position >= rect.y + rect.height) {
                console.log(`Invalid horizontal divider position: ${position}`);
                return false;
            }
        }
        
        // Set divider information
        node.dividerType = dividerType;
        node.dividerPosition = position;
        
        let leftRect, rightRect;
        
        // Create child rectangles
        if (dividerType === 'vertical') {
            // Left rectangle
            const leftWidth = position - rect.x;
            leftRect = new Rectangle(rect.x, rect.y, leftWidth, rect.height, this.nextId);
            this.nextId += 1;
            
            // Right rectangle
            const rightWidth = rect.width - leftWidth;
            rightRect = new Rectangle(position, rect.y, rightWidth, rect.height, this.nextId);
            this.nextId += 1;
        } else {  // horizontal
            // Top rectangle
            const topHeight = position - rect.y;
            leftRect = new Rectangle(rect.x, rect.y, rect.width, topHeight, this.nextId);
            this.nextId += 1;
            
            // Bottom rectangle
            const bottomHeight = rect.height - topHeight;
            rightRect = new Rectangle(rect.x, position, rect.width, bottomHeight, this.nextId);
            this.nextId += 1;
        }
        
        // Create child nodes
        node.leftChild = new BSPNode(leftRect, node);
        node.rightChild = new BSPNode(rightRect, node);
        
        return [node.leftChild, node.rightChild];
    }
    
    findNodeById(id, node = null) {
        /**
         * Find a node by the ID of its rectangle.
         */
        if (node === null) {
            node = this.root;
        }
        
        if (node.rectangle.id === id) {
            return node;
        }
        
        if (node.isLeaf()) {
            return null;
        }
        
        const leftResult = this.findNodeById(id, node.leftChild);
        if (leftResult) {
            return leftResult;
        }
        
        return this.findNodeById(id, node.rightChild);
    }
    
    findNodeByPosition(x, y, node = null) {
        /**
         * Find the leaf node containing the position (x, y).
         */
        if (node === null) {
            node = this.root;
        }
            
        if (!node.rectangle.containsPoint(x, y)) {
            return null;
        }
            
        if (node.isLeaf()) {
            return node;
        }
            
        if (node.dividerType === 'vertical') {
            if (x < node.dividerPosition) {
                return this.findNodeByPosition(x, y, node.leftChild);
            } else {
                return this.findNodeByPosition(x, y, node.rightChild);
            }
        } else {  // horizontal
            if (y < node.dividerPosition) {
                return this.findNodeByPosition(x, y, node.leftChild);
            } else {
                return this.findNodeByPosition(x, y, node.rightChild);
            }
        }
    }
    
    traversePreorder(node = null, level = 0) {
        /**
         * Traverse the tree in preorder and print the structure.
         */
        if (node === null) {
            node = this.root;
        }
            
        const indent = "  ".repeat(level);
        console.log(`${indent}${node}`);
        
        if (!node.isLeaf()) {
            this.traversePreorder(node.leftChild, level + 1);
            this.traversePreorder(node.rightChild, level + 1);
        }
    }
    
    traverseInorder(node = null, callback = null, level = 0) {
        /**
         * Traverse the tree in order with optional callback function.
         */
        if (node === null) {
            node = this.root;
        }
            
        if (!node.isLeaf()) {
            this.traverseInorder(node.leftChild, callback, level + 1);
        }
            
        if (callback) {
            callback(node, level);
        }
        
        if (!node.isLeaf()) {
            this.traverseInorder(node.rightChild, callback, level + 1);
        }
    }
    
    getAllLeafNodes() {
        /**
         * Return all leaf nodes (compartments) in the tree.
         */
        const leaves = [];
        
        const collectLeaves = (node, level) => {
            if (node.isLeaf()) {
                leaves.push(node);
            }
        };
        
        this.traverseInorder(null, collectLeaves);
        return leaves;
    }
    
    getAllDividers() {
        /**
         * Return all dividers in the tree as (type, position, rect) tuples.
         */
        const dividers = [];
        
        const collectDividers = (node, level) => {
            if (!node.isLeaf() && node.dividerType && node.dividerPosition) {
                const rect = node.rectangle;
                dividers.push([node.dividerType, node.dividerPosition, rect]);
            }
        };
        
        this.traverseInorder(null, collectDividers);
        return dividers;
    }
    
    describe() {
        /**
         * Describe the tree structure.
         */
        console.log(`BSP Tree for ${this.width}x${this.height} canvas`);
        console.log(`Total compartments: ${this.getAllLeafNodes().length}`);
        console.log(`Total dividers: ${this.getAllDividers().length}`);
        console.log("Tree structure:");
        this.traversePreorder();
        
        console.log("Leaf nodes (compartments):");
        for (const leaf of this.getAllLeafNodes()) {
            console.log(`  ${leaf}`);
        }
        
        console.log("Dividers:");
        for (const [divType, pos, rect] of this.getAllDividers()) {
            if (divType === 'vertical') {
                console.log(`  Vertical divider at x=${pos} within ${rect}`);
            } else {
                console.log(`  Horizontal divider at y=${pos} within ${rect}`);
            }
        }
    }

    removeDivider(node) {
        /**
         * Remove a divider by merging its two child compartments.
         * 
         * @param node - The BSPNode that represents the divider to remove
         * 
         * @returns The updated node or false if the operation failed
         */
        // Check if this is a divider node (has children)
        if (node.isLeaf()) {
            console.log("Cannot remove a divider from a leaf node");
            return false;
        }
        
        // Check if both children are leaves
        if (!(node.leftChild?.isLeaf() && node.rightChild?.isLeaf())) {
            console.log("Cannot remove a divider if its children have dividers");
            return false;
        }
        
        // Turn this node back into a leaf by removing children
        node.leftChild = null;
        node.rightChild = null;
        node.dividerType = null;
        node.dividerPosition = null;
        
        // The rectangle dimensions stay the same, but let's assign a new ID
        node.rectangle.id = this.nextId;
        this.nextId += 1;
        
        return node;
    }

    undo() {
        let node = this.history.pop();
        return this.removeDivider(node)
    }
}
