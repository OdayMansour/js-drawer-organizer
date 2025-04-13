import { BSPTree } from './bsp.js';
import { SpatialPointIndex } from './spacialPointIndex.js';

export class BSPAnalyzer {
    constructor(bsp) {
        this.bsp = bsp;
        this.connectors = {};
        this.connectorsCount = { 'L': 0, 'T': 0, '+': 0 };
        this.pointIndex = new SpatialPointIndex();
    }

    gatherPointsAndConnectors() {

        this.connectors = {};
        this.connectorsCount = { 'L': 0, 'T': 0, '+': 0 };
        this.pointIndex = new SpatialPointIndex();

        // Adding corner L connectors
        this.connectors[`{ x: 0, y: 0 }`] = 'L';
        this.connectors[`{ x: 0, y: ${this.bsp.height} }`] = 'L';
        this.connectors[`{ x: ${this.bsp.width}, y: 0 }`] = 'L';
        this.connectors[`{ x: ${this.bsp.width}, y: ${this.bsp.height} }`] = 'L';

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
                console.log(`  Vertical divider at x=${pos}, within ${rect}, from ${startingPoint} to ${endingPoint}`);
            } else {
                startingPoint = new Point(rect.x, pos);
                endingPoint = new Point(rect.x + rect.width, pos);
                console.log(`  Horizontal divider at x=${pos}, within ${rect}, from ${startingPoint} to ${endingPoint}`);
            }

            if (!this.connectors[startingPoint])
                this.connectors[startingPoint] = 'T';
            else if (this.connectors[startingPoint] == 'T')
                this.connectors[startingPoint] = '+';

            if (!this.connectors[endingPoint])
                this.connectors[endingPoint] = 'T';
            else if (this.connectors[endingPoint] == 'T')
                this.connectors[endingPoint] = '+';

            this.pointIndex.addPoint(startingPoint)
            this.pointIndex.addPoint(endingPoint)
        }

        for (const key of Object.keys(this.connectors)) {
            this.connectorsCount[this.connectors[key]]++;
        }

        console.log("Point Index")
        console.log(this.pointIndex)
        console.log("Connectors")
        console.log(this.connectors)

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

        this.gatherPointsAndConnectors()

        console.log("Connectors needed: ")
        for (const key of Object.keys(this.connectorsCount)) {
            console.log(`  ${key}: ${this.connectorsCount[key]}`);
        }
    }

    generateWallsAcrylic() {
        this.gatherPointsAndConnectors()

        console.log(this.bsp.getAllDividers())
        for (const [divType, pos, rect] of this.bsp.getAllDividers()) {
            console.log(`Found a ${divType} wall:`)
            if ( divType == 'vertical' ) {
                console.log(`  It's at x = ${pos} and has size of ${rect.height}`)
                console.log('  It is intersected by these points')
                console.log(this.pointIndex.findPointsOnVerticalSegment(pos, rect.y, rect.y + rect.height))
            } else {
                console.log(`  It's at y = ${pos} and has size of ${rect.width}`)
                console.log('  It is intersected by these points')
                console.log(this.pointIndex.findPointsOnHorizontalSegment(pos, rect.x, rect.x + rect.width))
            }
        }
    }

}