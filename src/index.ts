import * as THREE from 'three';
import { CameraHelper } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  velocity,
  direction,
  moveForward,
  moveBackward,
  moveLeft,
  moveRight,
} from './controls';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';

// SCENE
const scene = new THREE.Scene();
// scene.background = new THREE.Color(0xa8def0);

// CAMERA
const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(-0.85, 1.6, 1.8);

// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.5; // Adjust as needed

// CONTROLS
const controls = new PointerLockControls(camera, renderer.domElement);
scene.add(controls.getObject());

const startBtn = document.getElementById('startBtn');
const clickToPlayOverlay = document.getElementById('click-to-play-overlay');
const blurOverlay = document.getElementById('blur-overlay');

// Variable to track whether loading is complete
let isLoading = true;

if (!clickToPlayOverlay || !blurOverlay) {
  console.error('clickToPlayOverlay or blurOverlay element not found!');
} else {
  // Example event listeners for the overlay
  clickToPlayOverlay.style.pointerEvents = isLoading ? 'none' : 'auto';
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      if (!isLoading && !controls.isLocked) {
        controls.lock();
      }
    });
  }

  controls.addEventListener('lock', () => {
    if (!isLoading) {
      clickToPlayOverlay.style.display = 'none'; // Hide initial overlay when pointer is locked
      blurOverlay.style.display = 'none'; // Hide blur overlay when pointer is locked
    }
  });

  blurOverlay.addEventListener('click', () => {
    if (!isLoading && !controls.isLocked) {
      controls.lock();
    }
  });

  controls.addEventListener('unlock', () => {
    if (blurOverlay) {
      blurOverlay.style.display = 'flex'; // Show blur overlay when pointer is released
    }
  });
}

// LIGHTS
// light()

// FLOOR
// generateFloor()

const clock = new THREE.Clock();

// Variable to track if the video is playing
let isVideoPlaying = false;

// Variable to track if the position constraints are active
let positionConstraintsActive = true;

// Variables for position constraints
let minX = -1.2;
let maxX = 1.1;
let minZ = -2.5;
let maxZ = 1.8;

// Select the button element
const button = document.querySelector('span') as HTMLElement;

// Function to handle the "pressed" animation
const pressButton = () => {
  button.style.transform = 'translateY(5px)';
  button.style.boxShadow =
    'inset -8px 0 8px rgba(0,0,0,0.15), inset 0 -8px 8px rgba(0,0,0,0.25), 0 0 0 0px rgba(0,0,0,0.75), 5px 15px 20px rgba(0,0,0,0.4)';
};

// Function to reset the "pressed" animation
const releaseButton = () => {
  button.style.transform = 'translateY(0)';
  button.style.boxShadow =
    'inset -8px 0 8px rgba(0,0,0,0.15), inset 0 -8px 8px rgba(0,0,0,0.25), 0 0 0 0px rgba(0,0,0,0.75), 10px 20px 25px rgba(0,0,0,0.4)';
};

// Function to play the transition video
const playTransitionVideo = () => {
  // Check if the video is already playing
  if (isVideoPlaying) return;

  isVideoPlaying = true;
  // Call this function to load the PNG background
  loadPNGBackground();
  // Remove the position constraints or set them bigger
  minX = -4;
  maxX = 4;
  minZ = -3.5;
  maxZ = 3;

  // Create a video element
  const video = document.createElement('video');
  video.src = '/media/GAMETRANSITION.mp4'; // Path to your video file
  video.className = 'transition-video';
  video.autoplay = true;
  video.playsInline = true;
  video.style.position = 'fixed';
  video.style.top = '0';
  video.style.left = '0';
  video.style.width = '100%';
  video.style.height = '100%';
  video.style.objectFit = 'cover';
  video.style.zIndex = '1000';
  const audio = new Audio('/media/music.mp3'); // Path to your MP3 file
  video.onended = () => {
    // Remove the video element after playback
    if (video.parentNode) {
      video.parentNode.removeChild(video);
    }
    isVideoPlaying = false;

    audio.play();
    velocity.x = 0;
    velocity.y = 0;
    velocity.z = 0;
    // Set camera position y to 11.6
    camera.position.set(0, 11.6, 0); // Exact teleport position
    camera.lookAt(0, 11.6, 0);
  };
  document.body.appendChild(video);
};

// Add event listeners for the keyboard
document.addEventListener('keydown', (event) => {
  if (event.key === 'e' || event.key === 'E') {
    // Only proceed if blurOverlay is not visible
    if (blurOverlay && (blurOverlay.style.display === 'none' || !blurOverlay.style.display)) {
      pressButton();

      // Check if the button is visible
      if (button.style.display !== 'none') {
        playTransitionVideo();
      }
    }
  }
});

document.addEventListener('keyup', (event) => {
  if (event.key === 'e' || event.key === 'E') {
    releaseButton();
  }
});

// ANIMATE
function animate() {
  if (isVideoPlaying) {
    requestAnimationFrame(animate);
    return;
  }

  const delta = clock.getDelta();
  const elapsedTime = clock.getElapsedTime();

  // Only show the button if blurOverlay is not visible
  if (
    !isLoading && // Add this condition
    blurOverlay &&
    (blurOverlay.style.display === 'none' || !blurOverlay.style.display) && // Add this condition
    camera.position.x >= -1.2 &&
    camera.position.x <= 0.5 &&
    Math.abs(camera.position.y - 1.6) < 0.01 &&
    Math.abs(camera.position.z - -2.5) < 0.8
  ) {
    // Show the button
    button.style.display = 'block';
  } else {
    // Hide the button
    button.style.display = 'none';
  }

  if (controls.isLocked === true) {
    // Update movement
    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize();

    const speed = 30; // Movement speed
    if (moveForward || moveBackward) velocity.z -= direction.z * speed * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * speed * delta;

    controls.moveRight(-velocity.x * delta);
    controls.moveForward(-velocity.z * delta);

    // Constrain camera position
    const position = controls.getObject().position;
    position.x = THREE.MathUtils.clamp(position.x, minX, maxX); // Limit x
    position.z = THREE.MathUtils.clamp(position.z, minZ, maxZ); // Limit z
    // console.log(camera.position);

    // Check if camera is within specified coordinates
    // Only show the button if blurOverlay is not visible
    if (
      !isLoading &&
      blurOverlay &&
      (blurOverlay.style.display === 'none' || !blurOverlay.style.display) && // Add this condition
      camera.position.x >= -1.2 &&
      camera.position.x <= 0.5 &&
      Math.abs(camera.position.y - 1.6) < 0.01 &&
      Math.abs(camera.position.z - -2.5) < 0.8
    ) {
      // Show the button
      button.style.display = 'block';
    } else {
      // Hide the button
      button.style.display = 'none';
    }
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
document.body.appendChild(renderer.domElement);
animate();

// RESIZE HANDLER
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize);

function generateFloor() {
  // TEXTURES
  const textureLoader = new THREE.TextureLoader();
  const placeholder = textureLoader.load('./textures/placeholder/placeholder.png');
  const sandBaseColor = textureLoader.load('./textures/sand/Sand 002_COLOR.jpg');
  const sandNormalMap = textureLoader.load('./textures/sand/Sand 002_NRM.jpg');
  const sandHeightMap = textureLoader.load('./textures/sand/Sand 002_DISP.jpg');
  const sandAmbientOcclusion = textureLoader.load('./textures/sand/Sand 002_OCC.jpg');

  const WIDTH = 80;
  const LENGTH = 80;

  const geometry = new THREE.PlaneGeometry(WIDTH, LENGTH, 512, 512);
  const material = new THREE.MeshStandardMaterial({
    map: sandBaseColor,
    normalMap: sandNormalMap,
    displacementMap: sandHeightMap,
    displacementScale: 0.1,
    aoMap: sandAmbientOcclusion,
  });
  // Add null checks before wrapping textures
  if (material.map) wrapAndRepeatTexture(material.map);
  if (material.normalMap) wrapAndRepeatTexture(material.normalMap);
  if (material.displacementMap) wrapAndRepeatTexture(material.displacementMap);
  if (material.aoMap) wrapAndRepeatTexture(material.aoMap);
  // const material = new THREE.MeshPhongMaterial({ map: placeholder})

  const floor = new THREE.Mesh(geometry, material);
  floor.receiveShadow = true;
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);
}

function wrapAndRepeatTexture(map: THREE.Texture) {
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.x = map.repeat.y = 10;
}

function light() {
  scene.add(new THREE.AmbientLight(0xffffff, 0.7));

  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(0, 15, 0);
  dirLight.target.position.set(0, 0, 0);
  dirLight.castShadow = true;
  dirLight.shadow.camera.top = 3;
  dirLight.shadow.camera.bottom = -3;
  dirLight.shadow.camera.left = -3;
  dirLight.shadow.camera.right = 3;
  dirLight.shadow.camera.near = 0.1;
  dirLight.shadow.camera.far = 6;
  dirLight.shadow.mapSize.width = 4096;
  dirLight.shadow.mapSize.height = 4096;
  dirLight.shadow.bias = -0.005; // Reduce self-shadowing
  dirLight.shadow.normalBias = 0.05; // Smooth normals in shadows
  scene.add(dirLight.target);
  scene.add(dirLight);
  //   scene.add(new THREE.CameraHelper(dirLight.shadow.camera));
}

function light2() {
  // scene.add(new THREE.AmbientLight(0xffffff, 0.7))
  const pointLight = new THREE.PointLight(0xffffff, 1, 10); // Color, intensity, distance
  pointLight.position.set(0, 15, 0);
  pointLight.castShadow = true;

  // Shadow Settings
  pointLight.shadow.mapSize.width = 1024; // Shadow resolution
  pointLight.shadow.mapSize.height = 1024;
  pointLight.shadow.camera.near = 0.5; // Near plane
  pointLight.shadow.camera.far = 4;
  pointLight.shadow.bias = -0.005; // Far plane
  pointLight.shadow.normalBias = 0.05;
  scene.add(pointLight);

  // Helper to visualize shadow camera
  const pointLightHelper1 = new THREE.PointLightHelper(pointLight, 1); // 1 is the helper size
  //   scene.add(pointLightHelper1);
}
light2();

function light3() {
  scene.add(new THREE.AmbientLight(0xffff00, 0.1));
  const pointLight1 = new THREE.PointLight(0xffffff, 1, 8); // Color, intensity, distance
  pointLight1.position.set(-1, 1.5, -2.8);
  pointLight1.castShadow = true;

  // Shadow Settings
  pointLight1.shadow.mapSize.width = 1024; // Shadow resolution
  pointLight1.shadow.mapSize.height = 1024;
  pointLight1.shadow.camera.near = 0.5; // Near plane
  pointLight1.shadow.camera.far = 4;
  pointLight1.shadow.bias = -0.005; // Far plane
  pointLight1.shadow.normalBias = 0.05;
  scene.add(pointLight1);

  // Helper to visualize shadow camera
  const pointLightHelper = new THREE.PointLightHelper(pointLight1, 1); // 1 is the helper size
  // scene.add(pointLightHelper);
}
light3();

function loadModel() {
  const loader = new GLTFLoader();
  const blocker = document.getElementById('blocker');

  loader.load(
    './models/FINALMAP.gltf', // Adjust the path as needed
    function (gltf) {
      const model = gltf.scene;

      model.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          child.material.transparent = false;
          child.material.opacity = 1;
          child.material.depthWrite = true; // Ensure correct rendering order
          child.material.depthTest = true;
        }
      });

      // Optional: Adjust model position, rotation, scale
      model.position.set(0, 0, 0);
      model.scale.set(1, 1, 1);

      scene.add(model);
      if (blocker) {
        blocker.style.display = 'none';
      }
      // Update loading status
      isLoading = false;

      if (!clickToPlayOverlay) {
        console.error('clickToPlayOverlay element not found!');
      } else {
        clickToPlayOverlay.style.pointerEvents = 'auto'; // Enable clicks on overlay
      }
    },
    undefined,
    function (error) {
      console.error('An error occurred while loading the model:', error);
    }
  );
}

loadModel();

// Function to load PNG background
function loadPNGBackground() {
  const textureLoader = new THREE.TextureLoader();
  textureLoader.load(
    './textures/kloofendal_48d_partly_cloudy_puresky_1k.png', // Path to your PNG file
    function (texture) {
      texture.mapping = THREE.EquirectangularReflectionMapping;

      // Set the environment map and background
      scene.environment = texture;
      scene.background = texture;

      console.log('PNG background loaded successfully:', texture);
    },
    undefined,
    function (error) {
      console.error('An error occurred while loading the PNG:', error);
    }
  );
}
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';

// ADD REFLECTOR PLANE
addReflectorPlane(); // **Added Reflector Plane**

function addReflectorPlane() {
  // Custom dimensions based on desired coordinate spans
  const WIDTH = 16.5; // From x = -5 to x = +15
  const LENGTH = 12.9; // From z = -4 to z = +10

  // Create the plane geometry with the specified width and length
  const geometry = new THREE.PlaneGeometry(WIDTH, LENGTH);

  // Create the Reflector with desired properties
  const reflector = new Reflector(geometry, {
    clipBias: 0.003,
    textureWidth: window.innerWidth * window.devicePixelRatio,
    textureHeight: window.innerHeight * window.devicePixelRatio,
    color: 0x777777,
  });

  // Rotate the plane to lie horizontally (on the XZ plane)
  reflector.rotation.x = -Math.PI / 2;

  // Position the reflector to cover from x = -5 to x = +15 and z = -4 to z = +10
  reflector.position.set(1, 10.15, 1); // x=5, y=10.15, z=3

  // Optional: If you need to adjust further (e.g., scaling), you can do so here
  // reflector.scale.set(1, 1, 1);

  // Add the reflector to the scene
  scene.add(reflector);
}

const planeGeometry = new THREE.PlaneGeometry(16.5, 12.7);
const planeMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff, // White color
  roughness: 0.3, // Adjust roughness (0 = smooth, 1 = rough)
  metalness: 1, // Adjust metalness (0 = non-metal, 1 = metal)
  transparent: true,
  opacity: 0.9,
});

const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2; // Rotate to lie horizontally
plane.position.set(1, 10.2, 1);
scene.add(plane);

const contactAddresses = document.querySelectorAll<HTMLElement>('.contact-address');

if (contactAddresses.length > 0) {
  contactAddresses.forEach((addressElement) => {
    addressElement.addEventListener('mouseover', () => {
      addressElement.style.opacity = '0.5';
    });

    addressElement.addEventListener('mouseout', () => {
      addressElement.style.opacity = '1';
    });

    addressElement.addEventListener('click', () => {
      const textToCopy = addressElement.innerText;

      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          alert('Copied to clipboard: ' + textToCopy);
        })
        .catch((err) => {
          console.error('Error copying text: ', err);
        });
    });
  });
} else {
  console.warn("No elements with class '.contact-address' were found.");
}
