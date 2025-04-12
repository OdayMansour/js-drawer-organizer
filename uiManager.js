class UIManager {
    constructor() {
        this.infoPanel = document.getElementById('info-content');
    }

    updateInfoPanel(node) {
        if (!node) {
            this.clearInfoPanel();
            return;
        }

        const rect = node.rectangle;
        let html = `
            <p><strong>ID:</strong> ${rect.id}</p>
            <p><strong>Position:</strong> (${rect.x}, ${rect.y})</p>
            <p><strong>Size:</strong> ${rect.width} x ${rect.height}</p>
            <p><strong>Type:</strong> ${node.isLeaf() ? 'Leaf' : 'Internal Node'}</p>
        `;

        if (!node.isLeaf()) {
            html += `
                <p><strong>Divider:</strong> ${node.dividerType} at position ${node.dividerPosition}</p>
            `;
        }

        this.infoPanel.innerHTML = html;
    }

    clearInfoPanel() {
        this.infoPanel.innerHTML = "No compartment selected";
    }

    setDefaultInfoContent() {
        this.infoPanel.innerHTML = "Click on a compartment to see details";
    }

    setInfoContent(html) {
        this.infoPanel.innerHTML = html;
    }
}
