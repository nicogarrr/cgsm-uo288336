import * as THREE from "three";
import WEBGL from "three/examples/jsm/capabilities/WebGL.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import Stats from "three/examples/jsm/libs/stats.module.js";

if (!WEBGL.isWebGL2Available()) {
    document.body.appendChild(WEBGL.getWebGL2ErrorMessage());
    throw new Error("WebGL2 is not available.");
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1d1d1d);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const stats = new Stats();
stats.dom.style.position = "absolute";
stats.dom.style.top = "0px";
document.body.appendChild(stats.dom);

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    4000
);
camera.position.set(0, 25, 300);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1.6);
pointLight.position.set(120, 140, 160);
scene.add(pointLight);

const fillLight = new THREE.DirectionalLight(0xffffff, 0.6);
fillLight.position.set(-120, 60, -80);
scene.add(fillLight);

const textureLoader = new THREE.TextureLoader();
const colorTexture = textureLoader.load("./textures/descargar.jpg");
const bumpTexture = textureLoader.load("./textures/descargar2.jpg");

colorTexture.colorSpace = THREE.SRGBColorSpace;

const cubeGeometry = new THREE.BoxGeometry(100, 100, 100);

const leftMaterial = new THREE.MeshPhongMaterial({
    map: colorTexture
});
const leftCube = new THREE.Mesh(cubeGeometry, leftMaterial);
leftCube.position.x = -90;
scene.add(leftCube);

const material = new THREE.MeshPhongMaterial({
    map: colorTexture,
    bumpMap: bumpTexture,
    bumpScale: 2
});
const rightCube = new THREE.Mesh(cubeGeometry, material);
rightCube.position.x = 90;
scene.add(rightCube);

const controlData = {
    bumpScale: material.bumpScale
};

const gui = new GUI();
gui.title("Controles");
gui.add(controlData, "bumpScale", -4, 4).step(0.1).name("bumpScale");

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const elapsed = clock.getElapsedTime();
    leftCube.rotation.y = elapsed * 0.6;
    rightCube.rotation.y = elapsed * 0.6;

    material.bumpScale = controlData.bumpScale;

    controls.update();
    stats.update();
    renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
