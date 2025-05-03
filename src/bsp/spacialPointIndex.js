// Two-layer hash map for spatial point lookup
// This class serves to store points and then return the list of points that sit on 
// a given line segment (horizontal and vertial segments only)
// This assumes integer values for coordinates

export class SpatialPointIndex {
    constructor() {
      // First layer indexed by x-coordinate
      this.xMap = {};
      // First layer indexed by y-coordinate
      this.yMap = {};
    }
  
    // Add a point to both indexes
    addPoint(point) {

      let x = point.x;
      let y = point.y;

      // Add to x-first index
      if (!this.xMap[x]) {
        this.xMap[x] = {};
      }
      this.xMap[x][y] = true;
  
      // Add to y-first index
      if (!this.yMap[y]) {
        this.yMap[y] = {};
      }
      this.yMap[y][x] = true;
    }
  
    // Remove a point from both indexes
    removePoint(x, y) {
      // Remove from x-first index
      if (this.xMap[x] && this.xMap[x][y]) {
        delete this.xMap[x][y];
        // Clean up empty inner maps
        if (Object.keys(this.xMap[x]).length === 0) {
          delete this.xMap[x];
        }
      }
  
      // Remove from y-first index
      if (this.yMap[y] && this.yMap[y][x]) {
        delete this.yMap[y][x];
        // Clean up empty inner maps
        if (Object.keys(this.yMap[y]).length === 0) {
          delete this.yMap[y];
        }
      }
    }
  
    // Find points on a horizontal segment (same y, x varies)
    findPointsOnHorizontalSegment(y, x1, x2) {
      const points = [];
      // Ensure x1 <= x2
      if (x1 > x2) [x1, x2] = [x2, x1];
      
      // If no points with this y-coordinate, return empty array
      if (!this.yMap[y]) return points;
      
      // Check all x-coordinates in the y map
      for (const x in this.yMap[y]) {
        const xNum = parseInt(x);
        if (xNum >= x1 && xNum <= x2) {
          points.push({ x: xNum, y });
        }
      }
      
      return points;
    }
  
    // Find points on a vertical segment (same x, y varies)
    findPointsOnVerticalSegment(x, y1, y2) {
      const points = [];
      // Ensure y1 <= y2
      if (y1 > y2) [y1, y2] = [y2, y1];
      
      // If no points with this x-coordinate, return empty array
      if (!this.xMap[x]) return points;
      
      // Check all y-coordinates in the x map
      for (const y in this.xMap[x]) {
        const yNum = parseInt(y);
        if (yNum >= y1 && yNum <= y2) {
          points.push({ x, y: yNum });
        }
      }
      
      return points;
    }
  
    // Helper method to find points on any segment
    findPointsOnSegment(x1, y1, x2, y2) {
      // For horizontal segments
      if (y1 === y2) {
        return this.findPointsOnHorizontalSegment(y1, x1, x2);
      } 
      // For vertical segments
      else if (x1 === x2) {
        return this.findPointsOnVerticalSegment(x1, y1, y2);
      } 
      // Not a horizontal or vertical segment
      else {
        throw new Error("Only horizontal or vertical segments are supported");
      }
    }
  }
  
  // // Example usage:
  // const pointIndex = new SpatialPointIndex();
  
  // // Add some points
  // pointIndex.addPoint(1, 5);
  // pointIndex.addPoint(2, 5);
  // pointIndex.addPoint(3, 5);
  // pointIndex.addPoint(4, 5);
  // pointIndex.addPoint(3, 1);
  // pointIndex.addPoint(3, 2);
  // pointIndex.addPoint(3, 3);
  
  // // Find points on a horizontal segment from (1,5) to (4,5)
  // const horizontalPoints = pointIndex.findPointsOnHorizontalSegment(5, 1, 4);
  // console.log("Points on horizontal segment:", horizontalPoints);
  
  // // Find points on a vertical segment from (3,1) to (3,5)
  // const verticalPoints = pointIndex.findPointsOnVerticalSegment(3, 1, 5);
  // console.log("Points on vertical segment:", verticalPoints);