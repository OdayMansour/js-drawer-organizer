// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controls for viewing (Note: when loaded via script tag, OrbitControls is attached to THREE)
const controls = new THREE.OrbitControls(camera, renderer.domElement);
camera.position.z = 10;

// Add lights
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 1, 1);
scene.add(light);
scene.add(new THREE.AmbientLight(0x404040));

// Create connected rectangles
function createConnectedRectangles() {
    // Create a group to hold our shapes
    const group = new THREE.Group();
    
    // Base rectangle (BoxGeometry is a cube/rectangle)
    const baseRect = new THREE.Mesh(
        new THREE.BoxGeometry(5, 1, 3),
        new THREE.MeshStandardMaterial({ color: 0x6699ff })
    );
    group.add(baseRect);
    
    // Second rectangle connected to the right
    const rightRect = new THREE.Mesh(
        new THREE.BoxGeometry(2, 1, 2),
        new THREE.MeshStandardMaterial({ color: 0x66ff99 })
    );
    rightRect.position.set(3.5, 0, 0); // Position to connect to the right of the base
    group.add(rightRect);
    
    // Third rectangle on top
    const topRect = new THREE.Mesh(
        new THREE.BoxGeometry(3, 1, 2),
        new THREE.MeshStandardMaterial({ color: 0xff9966 })
    );
    topRect.position.set(0, 1, 0); // Position on top of the base
    group.add(topRect);
    
    return group;
}

// Add the shape to the scene
const shape = createConnectedRectangles();
scene.add(shape);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

// Handle window resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Download STL function
document.getElementById('downloadSTL').addEventListener('click', () => {
    // When loaded via script tag, STLExporter is attached to THREE
    const exporter = new THREE.STLExporter();
    
    // Option 'binary' for binary STL, 'ascii' for ASCII STL
    const stlData = exporter.parse(scene, { binary: true });
    
    downloadSTL(stlData);
});

function downloadSTL(stlData) {
    const blob = new Blob([stlData], { type: 'application/octet-stream' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'connected_rectangles.stl';
    link.click();
}