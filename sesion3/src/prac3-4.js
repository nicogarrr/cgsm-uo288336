import * as THREE from "three";
import WEBGL from "three/examples/jsm/capabilities/WebGL.js";
import { FirstPersonControls } from "three/examples/jsm/controls/FirstPersonControls.js";

if (!WEBGL.isWebGL2Available()) {
    document.body.appendChild(WEBGL.getWebGL2ErrorMessage());
    throw new Error("WebGL2 is not available.");
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

renderer.domElement.addEventListener("contextmenu", (event) => {
    event.preventDefault();
});

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    4000
);
camera.position.set(0, 40, 260);

const helper = new THREE.GridHelper(800, 40, 0x444444, 0x444444);
helper.position.y = 0.1;
scene.add(helper);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(0, 0.5, 100);
scene.add(directionalLight);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0xf0f0f0, 0.6);
hemiLight.position.set(0, 500, 0);
scene.add(hemiLight);

const textureLoader = new THREE.TextureLoader();

const regularMap = textureLoader.load("./textures/descargar.jpg");
regularMap.colorSpace = THREE.SRGBColorSpace;
const regularBumpMap = textureLoader.load("./textures/descargar2.jpg");

const specialMap = textureLoader.load("./textures/textura2.png");
specialMap.colorSpace = THREE.SRGBColorSpace;
const specialBumpMap = textureLoader.load("./textures/textura1.png");

const regularFaceMaterial = new THREE.MeshPhongMaterial({
    map: regularMap,
    bumpMap: regularBumpMap,
    bumpScale: 2.2
});

const specialFaceMaterial = new THREE.MeshPhongMaterial({
    map: specialMap,
    bumpMap: specialBumpMap,
    bumpScale: 2.8
});

const cubeGeometry = new THREE.BoxGeometry(50, 50, 50);

// Box material order: +X, -X, +Y, -Y, +Z, -Z
const leftCubeMaterials = [
    specialFaceMaterial,
    regularFaceMaterial,
    regularFaceMaterial,
    regularFaceMaterial,
    regularFaceMaterial,
    regularFaceMaterial
];

const rightCubeMaterials = [
    regularFaceMaterial,
    specialFaceMaterial,
    regularFaceMaterial,
    regularFaceMaterial,
    regularFaceMaterial,
    regularFaceMaterial
];

const leftCube = new THREE.Mesh(cubeGeometry, leftCubeMaterials);
leftCube.position.set(-240, 25, 0);
scene.add(leftCube);

const rightCube = new THREE.Mesh(cubeGeometry, rightCubeMaterials);
rightCube.position.set(240, 25, 0);
scene.add(rightCube);

const controls = new FirstPersonControls(camera, renderer.domElement);
controls.movementSpeed = 70;
controls.lookSpeed = 0.05;
controls.noFly = false;
controls.lookVertical = false;

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    controls.update(delta);

    renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    controls.handleResize();
});

animate();
