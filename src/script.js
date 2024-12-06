import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as dat from 'lil-gui';

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * Models
 */

const gltfLoader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();


gltfLoader.load('/bottle1.glb', (gltf) => {
    const bottle = gltf.scene;
    
    scene.add(bottle);

    // Center the light to the bottle's position
    const bottlePosition = bottle.position;
    directionalLight.position.set(bottlePosition.x + 5, bottlePosition.y + 5, bottlePosition.z + 5);

    // Add GUI for bottle spin
    const bottleFolder = gui.addFolder('Bottle');
    bottleFolder.add(bottle.rotation, 'y', 0, Math.PI * 2, 0.01).name('Spin');

    // Update light position when bottle moves
    const updateLightPosition = () => {
        directionalLight.position.set(bottlePosition.x + 5, bottlePosition.y + 5, bottlePosition.z + 5);
    };

    updateLightPosition()
    // Optional: If the bottle position changes dynamically, call `updateLightPosition()` as needed.
});


const snow = textureLoader.load('/Snow_pljfclkjj_1k_Albedo.jpg') 
const snowAO = textureLoader.load('/Snow_pljfclkjj_1k_AmbientOcclusion.jpg')

snow.wrapS = snow.wrapT = THREE.RepeatWrapping
snowAO.wrapS = snowAO.wrapT = THREE.RepeatWrapping
/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    new THREE.MeshStandardMaterial({
        map: snow,
        aoMap: snowAO,
        metalness: 0,
        roughness: 0.5,
    })
);
floor.receiveShadow = true;
floor.rotation.x = -Math.PI * 0.5;
scene.add(floor);

const ice = textureLoader.load('/others_0002_color_1k.jpg') 
const iceAO = textureLoader.load('/others_0002_ao_1k.jpg')

ice.wrapS = ice.wrapT = THREE.RepeatWrapping
iceAO.wrapS = iceAO.wrapT = THREE.RepeatWrapping

const wall = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    new THREE.MeshStandardMaterial({
        map: ice,
        aoMap: iceAO,
        metalness: 0,
        roughness: 0.5,
    })
);
wall.receiveShadow = true;
wall.rotation.y = Math.PI * 0.5;
wall.position.set (-5, 5, 0)
scene.add(wall);

const particleParams = {
    count: 1000, // Initial number of particles
    size: 0.1,   // Size of particles
    opacity: 0.8, // Opacity of particles
    fallSpeed: 0.03, // Speed of falling particles
};



// Function to create particles
let particleGeometry, particleMaterial, particles;

const createParticles = () => {
    // If particles already exist, remove them
    if (particles) scene.remove(particles);

    // Create particle geometry
    particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleParams.count * 3);

    // Generate random positions
    for (let i = 0; i < particleParams.count; i++) {
        const x = (Math.random() - 0.5) * 10;
        const y = Math.random() * 5 + 1;
        const z = (Math.random() - 0.5) * 10;
        particlePositions.set([x, y, z], i * 3);
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    // Create particle material
    particleMaterial = new THREE.PointsMaterial({
        size: particleParams.size,
        sizeAttenuation: true,
        color: 0xffffff,
        transparent: true,
        opacity: particleParams.opacity,
    });

    // Create and add particles to the scene
    particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
};

// Initialize particles
createParticles();

/**
 * Animate Particles (Snowfall Effect)
 */
const animateParticles = () => {
    const positions = particleGeometry.attributes.position.array;

    for (let i = 0; i < particleParams.count; i++) {
        positions[i * 3 + 1] -= particleParams.fallSpeed; // Move downwards

        // Reset particles that fall below the ground
        if (positions[i * 3 + 1] < 0) {
            positions[i * 3 + 1] = Math.random() * 5 + 1; // Reset to a random height
        }
    }
    particleGeometry.attributes.position.needsUpdate = true;
};

/**
 * Add GUI for Particles
 */
const particleFolder = gui.addFolder('Snow Particles');
particleFolder.add(particleParams, 'count', 100, 5000, 100).name('Count').onChange(createParticles);
particleFolder.add(particleParams, 'size', 0.01, 1, 0.01).name('Size').onChange(() => {
    particleMaterial.size = particleParams.size;
});
particleFolder.add(particleParams, 'opacity', 0, 1, 0.01).name('Opacity').onChange(() => {
    particleMaterial.opacity = particleParams.opacity;
});
particleFolder.add(particleParams, 'fallSpeed', 0.001, 0.1, 0.001).name('Fall Speed');




/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Increase intensity
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9); // Stronger light
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = -7;

// Position the light to face the bottle
directionalLight.position.set(0, 5, 5); // Higher position for direct lighting
scene.add(directionalLight);

// Add GUI for directional light position
const lightFolder = gui.addFolder('Directional Light');
lightFolder.add(directionalLight.position, 'x', -10, 10, 0.1).name('X Position');
lightFolder.add(directionalLight.position, 'y', -10, 10, 0.1).name('Y Position');
lightFolder.add(directionalLight.position, 'z', -10, 10, 0.1).name('Z Position');
lightFolder.add(directionalLight, 'intensity', 0, 10, 0.1).name('Intensity');

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
    75,
    sizes.width / sizes.height,
    0.1,
    100
);
camera.position.set(8, 4, 0);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 1, 0);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;

    animateParticles()

    // Update controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

tick();
