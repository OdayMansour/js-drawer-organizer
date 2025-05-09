export class SVGGenerator {
    constructor(depth, bspAnalyzer) {
        this.depth = depth;
        this.bspAnalyzer = bspAnalyzer;

        document.getElementById('downloadSVG').addEventListener('click', () => {
            const walls = bspAnalyzer.generateWallsWood();
            console.log(walls);

            let wallCounts = walls.reduce( (wallCounts, wall) => {
                const length = wall.length;
                wallCounts[length] = (wallCounts[length] || 0) + 1;
                return wallCounts;
            }, {});

            // console.log("Walls needed: ");
            let rectangles = []
            // Sorting wall lenghts from longest to shortest
            for (const wallLength of Object.keys(wallCounts).sort((a, b) => Number(b) - Number(a))) {
                rectangles.push({ width: parseInt(wallLength), height: this.depth, count: wallCounts[wallLength]});
                console.log(`  ${wallCounts[wallLength]} walls of length ${wallLength}`);
            }

            let count = 0;
            for (const svg of this.generateRectanglesSVG(rectangles)) {
                count += 1;
                console.log(`SVG #${count}`);
                console.log(svg);
            }
        });
    }

    /**
    * Generates an SVG with rectangles based on the provided specifications
    * @param {Array<Object>} rectangles - Array of rectangle objects with width, height, and count properties
    * @param {Object} options - Optional configuration for the SVG
    * @returns {string} SVG markup as a string
    */
    generateRectanglesSVG(rectangles, options = {}) {
        const {
            svgWidth = 600,
            svgHeight = 400,
            margin = 5,
            padding = 2,
            backgroundColor = "#ffffff",
            cutColor = "#ff0000",
            engraveColor = "#000000",
            fontSize = 3
        } = options;

        const svgInitString = `<svg width="${svgWidth}mm" height="${svgHeight}mm" xmlns="http://www.w3.org/2000/svg" style="background-color: ${backgroundColor};">\n`

        let svgs = [];

        let svg = svgInitString;

        // Initialize position tracking
        let currentX = margin;
        let currentY = margin;
        let maxHeightInRow = 0;

        let rectIndex = 0;

        // Draw each rectangle the specified number of times
        rectangles.forEach((rectSpec, specIndex) => {
            const { width, height, count } = rectSpec;

            for (let i = 0; i < count; i++) {
                // Check if we need to move to the next row
                if ((currentX + width + padding) > (svgWidth - margin)) {
                    currentY += maxHeightInRow + padding;
                        // But first, check if we need to go to the next page
                    if ((currentY + height + padding) > (svgHeight - margin)) {
                        // We need a new page! Close this svg and push it to the list
                        svg += '</svg>';
                        svgs.push(svg);

                        // Then create a new svg and continue on it
                        svg = svgInitString;
                        currentX = margin;
                        currentY = margin;
                        maxHeightInRow = 0;
                    } else {
                        // We just need to go to the next line
                        currentX = margin;
                        maxHeightInRow = 0;
                    }
                }
                
                // Add rectangle to SVG
                svg += `<rect x="${currentX}mm" y="${currentY}mm" width="${width}mm" height="${height}mm" fill="none" stroke="${cutColor}" stroke-width="1" data-index="${specIndex}" data-instance="${i}"/>\n`;

                // Calculate the center of the rectangle for text placement
                // const textX = currentX + (width / 2);
                // const textY = currentY + (height / 2);
                const textX = currentX + padding;
                const textY = currentY + padding;

                // Add text displaying dimensions and count
                svg += `<text x="${textX}mm" y="${textY + fontSize * 1}mm" text-anchor="left" font-size="${fontSize}mm" fill="${engraveColor}">${width}mm</text>\n`;
                svg += `<text x="${textX}mm" y="${textY + fontSize * 2}mm" text-anchor="left" font-size="${fontSize}mm" fill="${engraveColor}">× ${height}mm</text>\n`;
                svg += `<text x="${textX}mm" y="${textY + fontSize * 3}mm" text-anchor="left" font-size="${fontSize}mm" fill="${engraveColor}">#${i+1}/${count}</text>\n`;

                // Update position for next rectangle
                currentX += width + padding;
                maxHeightInRow = Math.max(maxHeightInRow, height);
                rectIndex++;
            }
        });

        // Close SVG tag
        svg += '</svg>';
        svgs.push(svg)
        return svgs;
    }

    /**
    * Downloads the generated SVG as a file
    * @param {Array<Object>} rectangles - Array of rectangle objects
    * @param {Object} options - Optional configuration
    */
    downloadRectanglesSVG(rectangles, options = {}) {
        const svgMarkup = generateRectanglesSVG(rectangles, options);
        const filename = options.filename || 'rectangles.svg';

        // Create download link
        const link = document.createElement('a');
        const blob = new Blob([svgMarkup], { type: 'image/svg+xml' });
        link.href = URL.createObjectURL(blob);
        link.download = filename;

        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Display in the page
    // displayRectanglesSVG(exampleRectangles, { containerId: 'svg-container' });

    // Download as SVG file
    // downloadRectanglesSVG(exampleRectangles, { filename: 'my-rectangles.svg' });
}