import * as THREE from "three";
import WEBGL from "three/examples/jsm/capabilities/WebGL.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

if (!WEBGL.isWebGL2Available()) {
    document.body.appendChild(WEBGL.getWebGL2ErrorMessage());
    throw new Error("WebGL2 is not available.");
}

const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    4000
);
camera.position.set(0, 0, 300);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableZoom = true;
controls.addEventListener("change", () => {
    renderer.render(scene, camera);
});

const geometry = new THREE.BoxGeometry(100, 100, 100);
const mapUrl = "../textures/crate.gif";   // The file used as texture
const textureLoader = new THREE.TextureLoader();  // The object used to load textures
const map = textureLoader.load(mapUrl, (loaded) => {
    renderer.render(scene, camera);
});
const material = new THREE.MeshBasicMaterial({ map: map });
const box = new THREE.Mesh(geometry, material);
box.rotation.set(Math.PI / 5, Math.PI / 5, 0);
scene.add(box);

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    controls.update();
    renderer.render(scene, camera);
}, false);

renderer.render(scene, camera);
