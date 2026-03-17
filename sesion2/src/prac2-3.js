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
camera.position.set(0, 0, 320);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableZoom = true;
controls.addEventListener("change", () => {
    renderer.render(scene, camera);
});

const textureLoader = new THREE.TextureLoader();

const earthGeometry = new THREE.SphereGeometry(100, 64, 32);
const earthMapUrl = "../textures/earth_atmos_2048.jpg";
const earthMap = textureLoader.load(earthMapUrl, () => {
    renderer.render(scene, camera);
});
const earthMaterial = new THREE.MeshPhongMaterial({
    map: earthMap,
    shininess: 30,
    specular: 0x333333
});
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earth);

const atmosphereGeometry = new THREE.SphereGeometry(102, 64, 32);
const atmosphereMapUrl = "../textures/earth_clouds_1024.png";
const atmosphereMap = textureLoader.load(atmosphereMapUrl, () => {
    renderer.render(scene, camera);
});
const atmosphereMaterial = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    map: atmosphereMap,
    transparent: true
});
const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
scene.add(atmosphere);

const pointLight = new THREE.PointLight(0xffffff, 120000, 0, 2);
pointLight.position.set(-450, 0, 0);
scene.add(pointLight);

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    controls.update();
    renderer.render(scene, camera);
}, false);

renderer.render(scene, camera);
