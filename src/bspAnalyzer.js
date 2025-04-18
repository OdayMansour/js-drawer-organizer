import { BSPTree } from './bsp.js';
import { SpatialPointIndex } from './spacialPointIndex.js';

export class BSPAnalyzer {
    constructor(bsp) {
        this.bsp = bsp;
        this.connectors = {};
        this.connectorsCount = { 'L': 0, 'T': 0, '+': 0 };
        this.pointIndex = new SpatialPointIndex();
        this.walls = [];
        this.connectorThickness = 3.2; // thickness in mm to subtract for each connector
    }
    
    // Helper function to convert a point to a consistent string key
    pointToKey(point) {
        return `${point.x},${point.y}`;
    }
    
    // Helper function to get connector type at a point
    getConnectorType(point) {
        return this.connectors[this.pointToKey(point)] || '';
    }

    gatherPointsAndConnectors() {

        this.connectors = {};
        this.connectorsCount = { 'L': 0, 'T': 0, '+': 0 };
        this.pointIndex = new SpatialPointIndex();

        // Adding corner L connectors
        this.connectors[this.pointToKey(new Point(0, 0))] = 'L';
        this.connectors[this.pointToKey(new Point(0, this.bsp.height))] = 'L';
        this.connectors[this.pointToKey(new Point(this.bsp.width, 0))] = 'L';
        this.connectors[this.pointToKey(new Point(this.bsp.width, this.bsp.height))] = 'L';

        // Adding corner points
        this.pointIndex.addPoint(new Point(0             , 0              ));
        this.pointIndex.addPoint(new Point(0             , this.bsp.height));
        this.pointIndex.addPoint(new Point(this.bsp.width, 0              ));
        this.pointIndex.addPoint(new Point(this.bsp.width, this.bsp.height));

        for (const [divType, pos, rect] of this.bsp.getAllDividers().slice(4)) {
            let startingPoint;
            let endingPoint;

            if (divType === 'vertical') {
                startingPoint = new Point(pos, rect.y);
                endingPoint = new Point(pos, rect.y + rect.height);
                // console.log(`  Vertical divider at x=${pos}, within ${rect}, from ${startingPoint} to ${endingPoint}`);
            } else {
                startingPoint = new Point(rect.x, pos);
                endingPoint = new Point(rect.x + rect.width, pos);
                // console.log(`  Horizontal divider at x=${pos}, within ${rect}, from ${startingPoint} to ${endingPoint}`);
            }

            const startKey = this.pointToKey(startingPoint);
            const endKey = this.pointToKey(endingPoint);
            
            if (!this.connectors[startKey])
                this.connectors[startKey] = 'T';
            else if (this.connectors[startKey] === 'T')
                this.connectors[startKey] = '+';

            if (!this.connectors[endKey])
                this.connectors[endKey] = 'T';
            else if (this.connectors[endKey] === 'T')
                this.connectors[endKey] = '+';

            this.pointIndex.addPoint(startingPoint);
            this.pointIndex.addPoint(endingPoint);
        }

        for (const key of Object.keys(this.connectors)) {
            this.connectorsCount[this.connectors[key]]++;
        }

        // console.log("Point Index");
        // console.log(this.pointIndex);
        // console.log("Connectors");
        // console.log(this.connectors);

    }

    describe() {

        console.log(`BSP Tree for ${this.bsp.width}x${this.bsp.height} canvas`);
        console.log(`Total compartments: ${this.bsp.getAllLeafNodes().length}`);
        console.log(`Total dividers: ${this.bsp.getAllDividers().length}`);
        console.log("Tree structure:");
        // this.bsp.traversePreorder();

        // console.log("Leaf nodes (compartments):");
        // for (const leaf of this.bsp.getAllLeafNodes()) {
        //     console.log(`  ${leaf}`);
        // }

        this.gatherPointsAndConnectors();

        console.log("Connectors needed: ")
        for (const key of Object.keys(this.connectorsCount)) {
            console.log(`  ${key}: ${this.connectorsCount[key]}`);
        }
    }

    generateWallsWood() {
        this.gatherPointsAndConnectors();
        
        let constantCoord = 'x';
        let wallLength = -1;
        let startCoord = -1;
        let endCoord = -1;

        let intersectingPoints = [];
        let sortedPoints = [];

        for (const [divType, pos, rect] of this.bsp.getAllDividers()) {
            if ( divType == 'vertical' ) {
                constantCoord = 'x'
                wallLength = rect.height
                startCoord = rect.y
                endCoord = startCoord + wallLength
                intersectingPoints = this.pointIndex.findPointsOnVerticalSegment(pos, startCoord, endCoord);
                sortedPoints = intersectingPoints.sort((a, b) => a.y - b.y);
            } else {
                constantCoord = 'y'
                wallLength = rect.width
                startCoord = rect.x
                endCoord = startCoord + wallLength
                intersectingPoints = this.pointIndex.findPointsOnHorizontalSegment(pos, startCoord, endCoord);
                sortedPoints = intersectingPoints.sort((a, b) => a.x - b.x);
            }

            // Get points on wall
            //   intersectingPoints;
            // Order points by the other coordinate
            //   sortedPoints;
            // Generate a new section between each two points
            for (let i=1; i<sortedPoints.length; i++) {
                const startPoint = sortedPoints[i-1];
                const endPoint = sortedPoints[i];
                const startConnType = this.getConnectorType(startPoint);
                const endConnType = this.getConnectorType(endPoint);
                
                // Calculate raw length between points
                const rawLength = divType === 'vertical' ? 
                    endPoint.y - startPoint.y : 
                    endPoint.x - startPoint.x;
                
                // Calculate length reduction based on connector types
                let reductionAmount = 0;
                
                // Apply reduction at start point if there's a connector
                if (startConnType) {
                    reductionAmount += this.connectorThickness / 2;
                }
                
                // Apply reduction at end point if there's a connector
                if (endConnType) {
                    reductionAmount += this.connectorThickness / 2;
                }
                
                // Calculate adjusted length
                const adjustedLength = Math.max(rawLength - reductionAmount, 0);
                
                this.walls.push({
                    "type": divType,
                    "rawLength": rawLength,
                    "length": adjustedLength,
                    "startingPoint": startPoint,
                    "endingPoint": endPoint,
                    "startConnector": startConnType,
                    "endConnector": endConnType
                })
            }

            // let sortedPoints = this.pointIndex.findPointsOnHorizontalSegment(pos, rect.x, rect.x + wallLength)

            // this.walls.push({
            //     "type": divType,
            //     "length": wallLength
            // });
        }
    
        // console.log(this.walls);
        // console.log(this.connectors);
        return this.walls;
    
    }

}