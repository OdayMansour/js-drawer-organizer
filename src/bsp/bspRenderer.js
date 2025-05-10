import { BSPAnalyzer } from './bspAnalyzer.js';
import { Utils } from './utils.js';

export class BSPRenderer {
    constructor() {
        // Initialize guideLine as null in the constructor
        this.guideLine = new Path({ strokeColor: 'black', strokeWidth: 2 });
        this.topDistanceLine = new Path({ strokeColor: 'grey', strokeWidth: 1 });
        this.bottomDistanceLine = new Path({ strokeColor: 'grey', strokeWidth: 1 });
        this.guideText = new PointText({ fillColor: 'black' });
        this.topDistanceText = new PointText({ fillColor: 'grey' });
        this.bottomDistanceText = new PointText({ fillColor: 'grey' });
        this.showRawLengths = true;
    }

    renderBSPTree(bsp) {
        // Load Analyzer (for walls) with 3mm connector thickness
        const bspAnalyzer = new BSPAnalyzer(bsp);

        // Clear existing items
        paper.project.activeLayer.removeChildren();

        // Draw all leaf compartments
        for (const leaf of bsp.getAllLeafNodes()) {
            this.drawCompartment(leaf);
        }

        // Draw wall labels
        for (const wall of bspAnalyzer.generateWallsWood()) {
            this.drawWallLabel(wall);
        }

        // Update view
        paper.view.draw();
    }

    drawCompartment(node) {
        const rect = node.rectangle;

        // Create Paper.js rectangle
        const paperRect = new Path.Rectangle({
            point: [rect.x, rect.y],
            size: [rect.width, rect.height],
            strokeColor: '#000000',
            strokeWidth: 3,
            fillColor: Utils.generateRectColorFromId(rect.id),
            opacity: 0.5
        });

        // Store reference to node for interaction
        paperRect.data = { node: node };

        return { rect: paperRect };
    }

    // drawWallLabel(type, length, startingPoint, endingPoint, rawLength) {
    drawWallLabel(wall) {
        // Determine which length value to display
        const displayLength = this.showRawLengths ? wall.rawLength : wall.length;
        
        const wallLabel = new PointText({ 
            fillColor: Utils.generateDivColorFromId(displayLength), 
            
            fontWeight: this.showRawLengths ? 'normal' : 'italic'
        });
        
        let midPoint, position;

        let labelContent = `${displayLength} mm`
        // labelContent = 'dddsmm'

        if (wall.type === 'vertical') {
            position = wall.startingPoint.x - labelContent.length * 2;
            midPoint = new Point(position + 6, wall.startingPoint.y + displayLength/2.0 + 2);

            wallLabel.content = labelContent;
            wallLabel.point = midPoint;
            wallLabel.rotation = 90;
    
        } else { // horizontal
            position = wall.startingPoint.y;
            midPoint = new Point(wall.startingPoint.x + displayLength/2.0 - labelContent.length * 2, position - 4);

            wallLabel.content = labelContent;
            wallLabel.point = midPoint;
            wallLabel.rotation = 0;
        }
    }

    removeGuideLine() {
        this.guideLine.remove();
        this.topDistanceLine.remove();
        this.bottomDistanceLine.remove();
        this.guideText.remove();
        this.topDistanceText.remove();
        this.bottomDistanceText.remove();
    }

    updateGuideLine(orientation, position, node) {

        // Calculate distances
        const leftDist = position.x - node.rectangle.x;
        const rightDist = node.rectangle.x + node.rectangle.width - position.x;
        const topDist = position.y - node.rectangle.y;
        const bottomDist = node.rectangle.y + node.rectangle.height - position.y;

        // Indicate in green when splitting down the middle
        let distanceLineColor = 'grey';
        let distanceLineWidth = 1;
        let distanceLineDashArray = [2,4]

        if ( ( orientation === "vertical" && (leftDist == rightDist) ) || 
             ( orientation === "horizontal" && (topDist == bottomDist) ) ) {
            distanceLineColor = 'green';
            distanceLineWidth = 2;
            distanceLineDashArray = [1,0]
        }

        this.guideLine.remove();
        this.topDistanceLine.remove();
        this.bottomDistanceLine.remove();
        this.guideText.remove();
        this.topDistanceText.remove();
        this.bottomDistanceText.remove();

        this.guideLine = new Path({ strokeColor: 'black', strokeWidth: 3 });
        this.topDistanceLine = new Path({ strokeColor: distanceLineColor, strokeWidth: distanceLineWidth, dashArray: distanceLineDashArray });
        this.bottomDistanceLine = new Path({ strokeColor: distanceLineColor, strokeWidth: distanceLineWidth, dashArray: distanceLineDashArray });
        this.guideText = new PointText({ fillColor: 'black' });
        this.topDistanceText = new PointText({ fillColor: distanceLineColor });
        this.bottomDistanceText = new PointText({ fillColor: distanceLineColor });

        try {
            if (!node || !node.isLeaf()) {
                console.log("No valid node provided or node is not a leaf");
                return;
            }

            let midPoint;

            if (orientation === "vertical") {
                let labelContent = `height: ${node.rectangle.height} mm`;
                // Create a vertical line
                const startPoint = new Point(position.x, node.rectangle.y);
                const endPoint = new Point(position.x, node.rectangle.y + node.rectangle.height);
                this.guideLine.add(startPoint);
                this.guideLine.add(endPoint);

                // Calculate middle point for text
                midPoint = new Point(
                    position.x - labelContent.length * 2 + 6, // Offset text to the right of the line
                    node.rectangle.y + (node.rectangle.height / 2)
                );
                // Update text content and position
                this.guideText.content = labelContent;
                this.guideText.point = midPoint;
                this.guideText.rotation = 90; // Vertical text

                // Add horizontal distance lines
                // Top distance line (from cursor to top edge)
                let topDistanceLabelContent = `${leftDist} mm`;
                this.topDistanceLine.add(new Point(node.rectangle.x, position.y));
                this.topDistanceLine.add(new Point(position.x, position.y));
                this.topDistanceText.content = topDistanceLabelContent;
                this.topDistanceText.point = new Point(
                    node.rectangle.x + (leftDist / 2) - topDistanceLabelContent.length * 2,
                    position.y - 4 // Text above the line
                );
                this.topDistanceText.rotation = 0;

                // Bottom distance line (from cursor to bottom edge)
                let bottomDistanceLabelContent = `${rightDist} mm`;
                this.bottomDistanceLine.add(new Point(position.x, position.y));
                this.bottomDistanceLine.add(new Point(node.rectangle.x + node.rectangle.width, position.y));
                this.bottomDistanceText.content = bottomDistanceLabelContent;
                this.bottomDistanceText.point = new Point(
                    position.x + (rightDist / 2) - bottomDistanceLabelContent.length * 2,
                    position.y - 4 // Text below the line
                );
                this.bottomDistanceText.rotation = 0;
            } else {
                let labelContent = `width: ${node.rectangle.width} mm`;
                // Create a horizontal line
                const startPoint = new Point(node.rectangle.x, position.y);
                const endPoint = new Point(node.rectangle.x + node.rectangle.width, position.y);
                this.guideLine.add(startPoint);
                this.guideLine.add(endPoint);

                // Calculate middle point for text
                midPoint = new Point(
                    node.rectangle.x + (node.rectangle.width / 2) - labelContent.length * 2,
                    position.y - 4 // Offset text above the line
                );

                // Update text content and position
                this.guideText.content = labelContent;
                this.guideText.point = midPoint;
                this.guideText.rotation = 0; // Horizontal text

                // Add vertical distance lines
                // Top distance line (from cursor to top edge)
                this.topDistanceLine.add(new Point(position.x, node.rectangle.y));
                this.topDistanceLine.add(new Point(position.x, position.y));
                this.topDistanceText.content = `${topDist} mm`;
                this.topDistanceText.point = new Point(
                    position.x - 5, // Text to the right of the line
                    node.rectangle.y + (topDist / 2)
                );
                this.topDistanceText.rotation = 90;

                // Bottom distance line (from cursor to bottom edge)
                this.bottomDistanceLine.add(new Point(position.x, position.y));
                this.bottomDistanceLine.add(new Point(position.x, node.rectangle.y + node.rectangle.height));
                this.bottomDistanceText.content = `${bottomDist} mm`;
                this.bottomDistanceText.point = new Point(
                    position.x - 5, // Text to the right of the line
                    position.y + (bottomDist / 2)
                );
                this.bottomDistanceText.rotation = 90;
            }

        } catch (error) {
            console.error("Error updating guideline:", error);
        }
    }

    toggleWallLengths() {
        // Toggle between showing raw and adjusted wall lengths
        this.showRawLengths = !this.showRawLengths;
        if (this.showRawLengths)
            console.log("Showing raw lengths.")
        else
            console.log("Showing adjusted lengths.")
    }

}
