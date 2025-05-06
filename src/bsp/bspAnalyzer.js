import { SpatialPointIndex } from './spacialPointIndex.js';

export class BSPAnalyzer {
    constructor(bsp) {
        this.bsp = bsp;
        this.connectors = {};
        this.connectorsCount = { 'L': 0, 'T': 0, 'X': 0 };
        this.pointIndex = new SpatialPointIndex();
        this.walls = [];
        this.connectorCompensation = { // thickness in mm to subtract for each connector
            'L': 6.0/2,
            'T': 6.0/2,
            'X': 6.0/2
        }
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
        this.connectorsCount = { 'L': 0, 'T': 0, 'X': 0 };
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
                this.connectors[startKey] = 'X';

            if (!this.connectors[endKey])
                this.connectors[endKey] = 'T';
            else if (this.connectors[endKey] === 'T')
                this.connectors[endKey] = 'X';

            this.pointIndex.addPoint(startingPoint);
            this.pointIndex.addPoint(endingPoint);
        }

        for (const key of Object.keys(this.connectors)) {
            this.connectorsCount[this.connectors[key]]++;
        }
    }

    describe() {
        let leafnodes = this.bsp.getAllLeafNodes();

        console.log(`Dividers for a ${this.bsp.width}mm by ${this.bsp.height}mm space`);
        console.log(`Total compartments: ${leafnodes.length}`);

        this.generateWallsWood();
        let wallCounts = this.walls.reduce( (wallCounts, wall) => {
            const length = wall.length;
            wallCounts[length] = (wallCounts[length] || 0) + 1;
            return wallCounts;
        }, {});

        console.log("Walls needed: ");
        // Sorting wall lenghts from longest to shortest
        for (const wallLength of Object.keys(wallCounts).sort((a, b) => Number(b) - Number(a))) {
            console.log(`  ${wallCounts[wallLength]} walls of length ${wallLength}`);
        }
        
        this.gatherPointsAndConnectors();

        console.log("Connectors needed: ");
        for (const key of Object.keys(this.connectorsCount)) {
            console.log(`  ${key}: ${this.connectorsCount[key]}`);
        }
    }

    generateWallsWood() {
        this.walls = [];
        this.gatherPointsAndConnectors();
        
        let wallLength = -1;
        let startCoord = -1;
        let endCoord = -1;

        let intersectingPoints = [];
        let sortedPoints = [];

        for (const [divType, pos, rect] of this.bsp.getAllDividers()) {
            if ( divType == 'vertical' ) {
                wallLength = rect.height
                startCoord = rect.y
                endCoord = startCoord + wallLength
                intersectingPoints = this.pointIndex.findPointsOnVerticalSegment(pos, startCoord, endCoord);
                sortedPoints = intersectingPoints.sort((a, b) => a.y - b.y);
            } else {
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
                reductionAmount += this.connectorCompensation[startConnType];
                reductionAmount += this.connectorCompensation[endConnType];
                                
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
        }
    
        return this.walls;
    }

}