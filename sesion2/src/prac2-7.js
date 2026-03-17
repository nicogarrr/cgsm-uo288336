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
    0.1,
    4000
);
camera.position.set(0, 2, 12);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableZoom = true;

const textureLoader = new THREE.TextureLoader();

const earthGroup = new THREE.Object3D();
scene.add(earthGroup);

const earthRadius = 1;
const earthGeometry = new THREE.SphereGeometry(earthRadius, 64, 32);
const earthMapUrl = "../textures/earth_atmos_2048.jpg";
const earthMap = textureLoader.load(earthMapUrl, () => {
    renderer.render(scene, camera);
});
const earthMaterial = new THREE.MeshPhongMaterial({
    map: earthMap,
    shininess: 30,
    specular: 0x333333
});
const earthGlobe = new THREE.Mesh(earthGeometry, earthMaterial);
earthGroup.add(earthGlobe);

const atmosphereGeometry = new THREE.SphereGeometry(1.02, 64, 32);
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
earthGroup.add(atmosphere);

earthGroup.rotation.z = 0.36;

const moonMapUrl = "../textures/moon_1024.jpg";
const moonMap = textureLoader.load(moonMapUrl, () => {
    renderer.render(scene, camera);
});
const moonMaterial = new THREE.MeshLambertMaterial({ map: moonMap, color: 0x888888 });
const moon = new THREE.Mesh(new THREE.SphereGeometry(0.27, 48, 24), moonMaterial);

const distance = 20;
moon.position.set(Math.sqrt(distance / 2), 0, -Math.sqrt(distance / 2));
moon.rotation.y = Math.PI;

const moonGroup = new THREE.Object3D();
moonGroup.add(moon);
moonGroup.rotation.x = 0.089;
earthGroup.add(moonGroup);

const pointLight = new THREE.PointLight(0xffffff, 500, 0, 2);
pointLight.position.set(-60, 12, 24);
scene.add(pointLight);

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    controls.update();
}, false);

const clock = new THREE.Clock();

function animate() {
    const delta = clock.getDelta();

    const earthRotation = (delta * Math.PI * 2) / 24;
    earthGlobe.rotation.y += earthRotation;
    atmosphere.rotation.y += earthRotation * 0.95;

    const moonOrbitRotation = (delta * Math.PI * 2) / (24 * 28);
    moonGroup.rotation.y += moonOrbitRotation;

    controls.update();

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();
