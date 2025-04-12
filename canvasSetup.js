class CanvasSetup {
    constructor() {
        this.defaultWidth = 1000;
        this.defaultHeight = 600;
    }

    promptForDimensions() {
        return new Promise((resolve) => {
            const container = document.createElement('div');
            container.id = 'dimension-prompt';
            container.style.position = 'absolute';
            container.style.top = '50%';
            container.style.left = '50%';
            container.style.transform = 'translate(-50%, -50%)';
            container.style.backgroundColor = 'white';
            container.style.padding = '20px';
            container.style.borderRadius = '5px';
            container.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.2)';
            container.style.zIndex = '1000';

            container.innerHTML = `
                <h2>Canvas Dimensions</h2>
                <div>
                    <label for="canvas-width">Width (mm): </label>
                    <input type="number" id="canvas-width" value="${this.defaultWidth}" min="200" max="1200">
                </div>
                <div style="margin-top: 10px;">
                    <label for="canvas-height">Height (mm): </label>
                    <input type="number" id="canvas-height" value="${this.defaultHeight}" min="200" max="800">
                </div>
                <button id="dimension-submit" style="margin-top: 15px; padding: 5px 10px;">Create Canvas</button>
            `;

            document.body.appendChild(container);

            document.getElementById('dimension-submit').addEventListener('click', () => {
                const width = parseInt(document.getElementById('canvas-width').value) || this.defaultWidth;
                const height = parseInt(document.getElementById('canvas-height').value) || this.defaultHeight;
                
                document.body.removeChild(container);
                resolve({ width, height });
            });
        });
    }
}
