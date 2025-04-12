import { Utils } from './utils.js';

export class BSPRenderer {
    constructor() {
        // Initialize guideLine as null in the constructor
        this.guideLine = null;
        this.guideText = null;
        this.topDistanceLine = null;
        this.bottomDistanceLine = null;
        this.topDistanceText = null;
        this.bottomDistanceText = null;
    }

    renderBSPTree(bsp) {
        // Clear existing items
        paper.project.activeLayer.removeChildren();

        // Create a new guideline
        try {
            this.guideLine = new Path({
                strokeColor: 'black',
                strokeWidth: 2
            });
            this.guideText = new PointText({
                fillColor: 'black',
                fontSize: 12,
                fontWeight: 'bold'
            });
            this.topDistanceLine = new Path({
                strokeColor: 'grey',
                strokeWidth: 1
            });
            this.bottomDistanceLine = new Path({
                strokeColor: 'grey',
                strokeWidth: 1
            });
            this.topDistanceText = new PointText({
                fillColor: 'grey',
                fontSize: 10,
                fontWeight: 'normal'
            });
            this.bottomDistanceText = new PointText({
                fillColor: 'grey',
                fontSize: 10,
                fontWeight: 'normal'
            });

        } catch (error) {
            console.error("Error creating guideline:", error);
        }

        // Draw all leaf compartments
        const leaves = bsp.getAllLeafNodes();
        for (const leaf of leaves) {
            this.drawCompartment(leaf, false);
        }

        // Draw dividers
        const dividers = bsp.getAllDividers();
        for (const [divType, pos, rect] of dividers) {
            this.drawDivider(divType, pos, rect);
        }

        // Update view
        paper.view.draw();
    }

    drawCompartment(node, isSelected) {
        const rect = node.rectangle;

        // Create Paper.js rectangle
        const paperRect = new Path.Rectangle({
            point: [rect.x, rect.y],
            size: [rect.width, rect.height],
            strokeColor: isSelected ? '#ff0000' : '#000000',
            strokeWidth: isSelected ? 3 : 1,
            fillColor: Utils.generateColorFromId(rect.id),
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

    drawDivider(dividerType, position, rect) {
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

    updateNodeStyle(node, isSelected) {
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

    updateGuideLine(orientation, position, node) {

        // If guideLine is null or undefined, create it
        if (!this.guideLine) {
            try {
                this.guideLine = new Path({
                    strokeColor: 'black',
                    strokeWidth: 2
                });
            } catch (error) {
                return; // Exit the function if we can't create it
            }
        }

        if (!this.guideText) {
            try {
                this.guideText = new PointText({
                    fillColor: 'black',
                    fontSize: 12,
                    fontWeight: 'bold'
                });
            } catch (error) {
                return; // Exit the function if we can't create it
            }
        }

        // Create or get the top distance line
        if (!this.topDistanceLine) {
            try {
                this.topDistanceLine = new Path({
                    strokeColor: 'grey',
                    strokeWidth: 1,
                    dashArray: [2, 4]
                });
            } catch (error) {
                return;
            }
        }

        // Create or get the bottom distance line
        if (!this.bottomDistanceLine) {
            try {
                this.bottomDistanceLine = new Path({
                    strokeColor: 'grey',
                    strokeWidth: 1,
                    dashArray: [2, 4]
                });
            } catch (error) {
                return;
    }
        }

        // Create or get the top distance text
        if (!this.topDistanceText) {
            try {
                this.topDistanceText = new PointText({
                    fillColor: 'grey',
                    fontSize: 10,
                    fontWeight: 'normal'
                });
            } catch (error) {
                return;
            }
        }

        // Create or get the bottom distance text
        if (!this.bottomDistanceText) {
            try {
                this.bottomDistanceText = new PointText({
                    fillColor: 'grey',
                    fontSize: 10,
                    fontWeight: 'normal'
                });
            } catch (error) {
                return;
            }
        }

        try {
            // Clear the previous line
            this.guideLine.removeSegments();
            this.topDistanceLine.removeSegments();
            this.bottomDistanceLine.removeSegments();

                if (!node || !node.isLeaf()) {
                    console.log("No valid node provided or node is not a leaf");
                    return;
                }

            let midPoint;

            if (orientation === "vertical") {
                // Create a vertical line
                const startPoint = new Point(position.x, node.rectangle.y);
                const endPoint = new Point(position.x, node.rectangle.y + node.rectangle.height);
                this.guideLine.add(startPoint);
                this.guideLine.add(endPoint);

                // Calculate middle point for text
                midPoint = new Point(
                    position.x + 5, // Offset text to the right of the line
                    node.rectangle.y + (node.rectangle.height / 2)
                );
                // Update text content and position
                this.guideText.content = `height: ${node.rectangle.height} mm`;
                this.guideText.point = midPoint;
                this.guideText.rotation = 90; // Vertical text

                // Add horizontal distance lines
                // Top distance line (from cursor to top edge)
                const topDist = position.x - node.rectangle.x;
                this.topDistanceLine.add(new Point(node.rectangle.x, position.y));
                this.topDistanceLine.add(new Point(position.x, position.y));
                this.topDistanceText.content = `${topDist} mm`;
                this.topDistanceText.point = new Point(
                    node.rectangle.x + (topDist / 2),
                    position.y - 10 // Text above the line
                );
                this.topDistanceText.rotation = 0;

                // Bottom distance line (from cursor to bottom edge)
                const bottomDist = node.rectangle.x + node.rectangle.width - position.x;
                this.bottomDistanceLine.add(new Point(position.x, position.y));
                this.bottomDistanceLine.add(new Point(node.rectangle.x + node.rectangle.width, position.y));
                this.bottomDistanceText.content = `${bottomDist} mm`;
                this.bottomDistanceText.point = new Point(
                    position.x + (bottomDist / 2),
                    position.y + 15 // Text below the line
                );
                this.bottomDistanceText.rotation = 0;
            } else {
                // Create a horizontal line
                const startPoint = new Point(node.rectangle.x, position.y);
                const endPoint = new Point(node.rectangle.x + node.rectangle.width, position.y);
                this.guideLine.add(startPoint);
                this.guideLine.add(endPoint);

                // Calculate middle point for text
                midPoint = new Point(
                    node.rectangle.x + (node.rectangle.width / 2),
                    position.y - 5 // Offset text above the line
                );

                // Update text content and position
                this.guideText.content = `width: ${node.rectangle.width} mm`;
                this.guideText.point = midPoint;
                this.guideText.rotation = 0; // Horizontal text

                // Add vertical distance lines
                // Top distance line (from cursor to top edge)
                const topDist = position.y - node.rectangle.y;
                this.topDistanceLine.add(new Point(position.x, node.rectangle.y));
                this.topDistanceLine.add(new Point(position.x, position.y));
                this.topDistanceText.content = `${topDist} mm`;
                this.topDistanceText.point = new Point(
                    position.x + 5, // Text to the right of the line
                    node.rectangle.y + (topDist / 2)
                );
                this.topDistanceText.rotation = 90;

                // Bottom distance line (from cursor to bottom edge)
                const bottomDist = node.rectangle.y + node.rectangle.height - position.y;
                this.bottomDistanceLine.add(new Point(position.x, position.y));
                this.bottomDistanceLine.add(new Point(position.x, node.rectangle.y + node.rectangle.height));
                this.bottomDistanceText.content = `${bottomDist} mm`;
                this.bottomDistanceText.point = new Point(
                    position.x - 10, // Text to the left of the line
                    position.y + (bottomDist / 2)
                );
                this.bottomDistanceText.rotation = 90;
            }

            // Bring the line and text to the front
            this.guideLine.bringToFront();
            // console.log(this.guideLine);
            this.guideText.bringToFront();
            // console.log(this.guideText);
            this.topDistanceLine.bringToFront();
            // console.log(this.topDistanceLine);
            this.bottomDistanceLine.bringToFront();
            // console.log(this.bottomDistanceLine);
            this.topDistanceText.bringToFront();
            // console.log(this.topDistanceText);
            this.bottomDistanceText.bringToFront();
            // console.log(this.bottomDistanceText);

        } catch (error) {
            console.error("Error updating guideline:", error);
        }
    }
}
