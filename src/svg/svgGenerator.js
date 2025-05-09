export class SVGGenerator {
    constructor(depth, bspAnalyzer, options = {}) {
        this.depth = depth;
        this.bspAnalyzer = bspAnalyzer;
        
        this.maxPages = 2,
        this.svgWidth = 600,
        this.svgHeight = 400,
        this.margin = 5,
        this.padding = 2,
        this.backgroundColor = "#ffffff",
        this.cutColor = "#ff0000",
        this.engraveColor = "#000000",
        this.fontSize = 3
        
        document.getElementById('downloadSVG').addEventListener('click', () => {
            const walls = bspAnalyzer.generateWallsWood();
            walls.sort((a, b) => b.length - a.length);
            
            let pages = this.packWalls(walls);
            
            let svgs = this.generateSVGs(pages);
            
            let svgFiles = [];
            let counter = 1;
            for (const svg of svgs) {
                let filename = `svg_page_${counter}_of_${svgs.length}.svg`
                svgFiles.push({
                    filename: filename,
                    content: svg
                })
                counter += 1;
            }
            console.log(svgFiles);
            this.createAndDownloadZip(svgFiles);
        });
    }
    
    /**
    * Packs rectangles onto a canvas to minimize wasted space
    * @param {number} canvasWidth - Width of the canvas
    * @param {number} canvasHeight - Height of the canvas
    * @param {Array<{width: number, height: number}>} rectangles - Array of rectangles sorted by size (largest to smallest)
    * @returns {Array<{x: number, y: number, width: number, height: number}>} - Positioned rectangles
    */
    packWalls(walls) {
        let canvasWidth = this.svgWidth - this.margin*2;
        let canvasHeight = this.svgHeight - this.margin*2;
        
        // Result array with positioned rectangles
        let pages = [];
        let page = [];
        
        // If no rectangles, return empty array
        if (!walls.length) return pages;
        
        // Current y-coordinate (top of current row)
        let currentY = 0;
        // Maximum height of rectangles in the current row
        let currentRowHeight = 0;
        // Remaining width in the current row
        let remainingWidth = canvasWidth;
        // Current x-coordinate for placement
        let currentX = 0;
        
        // Copy rectangles to avoid modifying the original array
        let remainingRectangles = []
        for (const wall of walls) {
            remainingRectangles.push({width: wall.length + this.padding, height: this.depth + this.padding})
        }
        
        // Continue until we've placed all rectangles or run out of space
        while (remainingRectangles.length > 0) {
            // If we've reached the bottom of the canvas, stop
            if ( (currentY + this.depth + this.padding) >= canvasHeight) {
                console.log("Reached end of page");
                pages.push(page);
                console.log(pages);
                page = [];
                console.log(pages);
                // Current y-coordinate (top of current row)
                currentY = 0;
                // Maximum height of rectangles in the current row
                currentRowHeight = 0;
                // Remaining width in the current row
                remainingWidth = canvasWidth;
                // Current x-coordinate for placement
                currentX = 0;
            }
            
            // If this is the start of a new row
            if (remainingWidth === canvasWidth) {
                // Place the first rectangle (the largest remaining one)
                const rect = remainingRectangles.shift();
                
                // Check if it fits on the canvas
                if (rect.width > canvasWidth || currentY + rect.height > canvasHeight) {
                    // Skip this rectangle if it doesn't fit
                    continue;
                }
                
                // Place the rectangle
                page.push({
                    x: 0,
                    y: currentY,
                    width: rect.width,
                    height: rect.height
                });
                
                // Update variables
                currentX = rect.width;
                remainingWidth = canvasWidth - rect.width;
                currentRowHeight = rect.height;
            } else {
                // Find the best-fitting rectangle for the remaining space
                let bestFitIndex = -1;
                let bestWastedSpace = Number.MAX_VALUE;
                
                // Iterate through remaining rectangles to find the best fit
                for (let i = 0; i < remainingRectangles.length; i++) {
                    const rect = remainingRectangles[i];
                    
                    // Skip if the rectangle doesn't fit in the remaining width
                    if (rect.width > remainingWidth) {
                        continue;
                    }
                    
                    // Calculate wasted space (difference between remaining width and rectangle width)
                    const wastedSpace = remainingWidth - rect.width;
                    
                    // If this is the best fit so far, update bestFitIndex
                    if (wastedSpace < bestWastedSpace) {
                        bestFitIndex = i;
                        bestWastedSpace = wastedSpace;
                    }
                    
                    // If we found a perfect fit, no need to continue searching
                    if (wastedSpace === 0) {
                        break;
                    }
                }
                
                // If we found a fitting rectangle
                if (bestFitIndex !== -1) {
                    const rect = remainingRectangles.splice(bestFitIndex, 1)[0];
                    
                    // Place the rectangle
                    page.push({
                        x: currentX,
                        y: currentY,
                        width: rect.width,
                        height: rect.height
                    });
                    
                    // Update variables
                    currentX += rect.width;
                    remainingWidth -= rect.width;
                    currentRowHeight = Math.max(currentRowHeight, rect.height);
                } else {
                    // No more rectangles fit in this row, move to the next row
                    currentY += currentRowHeight;
                    currentX = 0;
                    remainingWidth = canvasWidth;
                    currentRowHeight = 0;
                }
            }
        }
        
        pages.push(page);
        return pages;
    }
    
    generateSVGs(pages) {
        const svgInitString = `<svg width="${this.svgWidth}mm" height="${this.svgHeight}mm" xmlns="http://www.w3.org/2000/svg" style="background-color: ${this.backgroundColor};">\n`;
        
        let svgs = [];
        
        for (const page of pages) {
            let svg = svgInitString;
            for (const box of page) {
                let paddedX = box.x;
                let paddedY = box.y;
                let offsetX = paddedX + this.padding/2 + this.margin;
                let offsetY = paddedY + this.padding/2 + this.margin;
                
                let width = box.width - this.padding;
                let height = box.height - this.padding;
                
                svg += `<rect x="${offsetX}mm" y="${offsetY}mm" width="${width}mm" height="${height}mm" fill="none" stroke="${this.cutColor}" stroke-width="1" />\n`;
                
                const textX = offsetX + this.padding;
                const textY = offsetY + this.padding;
                
                svg += `<text x="${textX}mm" y="${textY + this.fontSize * 1}mm" text-anchor="left" font-size="${this.fontSize}mm" fill="${this.engraveColor}">${width}mm</text>\n`;
                svg += `<text x="${textX}mm" y="${textY + this.fontSize * 2}mm" text-anchor="left" font-size="${this.fontSize}mm" fill="${this.engraveColor}">× ${height}mm</text>\n`;
            }
            
            svg += '</svg>';
            // console.log(svg)
            
            svgs.push(svg);
        }
        
        return svgs;
    }
    
    async createAndDownloadZip(files) {
        // Load JSZip library dynamically
        if (typeof JSZip === 'undefined') {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }
        
        // Create a new ZIP file
        const zip = new JSZip();
        
        // Add each file to the ZIP
        files.forEach(file => {
            zip.file(file.filename, file.content);
        });
        
        // Generate the ZIP file content as a blob
        const zipBlob = await zip.generateAsync({
            type: 'blob',
            compression: "DEFLATE",
            compressionOptions: {level: 9}});
        
        // Create a download link for the ZIP
        const downloadUrl = URL.createObjectURL(zipBlob);
        const downloadLink = document.createElement('a');
        downloadLink.href = downloadUrl;
        downloadLink.download = 'generated_SVG.zip';
        
        // Trigger download
        document.body.appendChild(downloadLink);
        downloadLink.click();
        
        // Clean up
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(downloadUrl);
    }
}