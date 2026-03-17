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
camera.position.set(0, 4, 28);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableZoom = true;

const textureLoader = new THREE.TextureLoader();
const NOISEMAP = "../textures/cloud.png";
const SUNMAP = "../textures/lavatile.jpg";

const earthMoonGroup = new THREE.Object3D();
const sunPivot = new THREE.Object3D();
scene.add(sunPivot);
sunPivot.add(earthMoonGroup);

const sunEarthDistance = 10;
earthMoonGroup.position.set(sunEarthDistance, 0, 0);

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
earthMoonGroup.add(earthGlobe);

const uniforms = {
    fogDensity: { value: 0.0 },
    fogColor: { value: new THREE.Vector3(0, 0, 0) },
    time: { value: 1.0 },
    uvScale: { value: new THREE.Vector2(3.0, 1.0) },
    texture1: { value: textureLoader.load(NOISEMAP) },
    texture2: { value: textureLoader.load(SUNMAP) }
};

uniforms["texture1"].value.wrapS = uniforms["texture1"].value.wrapT = THREE.RepeatWrapping;
uniforms["texture2"].value.wrapS = uniforms["texture2"].value.wrapT = THREE.RepeatWrapping;

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
earthMoonGroup.add(atmosphere);

earthMoonGroup.rotation.z = 0.36;

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
earthMoonGroup.add(moonGroup);

const orbitRadius = Math.sqrt(distance);
const orbitCurve = new THREE.EllipseCurve(0, 0, orbitRadius, orbitRadius, 0, Math.PI * 2);
const orbitPoints = orbitCurve.getPoints(180).map((point) => new THREE.Vector3(point.x, 0, point.y));
const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
const lunarOrbit = new THREE.LineLoop(orbitGeometry, orbitMaterial);
lunarOrbit.rotation.x = moonGroup.rotation.x;
earthMoonGroup.add(lunarOrbit);

const pointLight = new THREE.PointLight(0xffffff, 500, 0, 2);
pointLight.position.set(0, 0, 0);
scene.add(pointLight);

const vertexShader = require("../shaders/vertex.glsl");
const fragmentShader = require("../shaders/fragment.glsl");

const sunMaterial = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader
});

const sunVisualScale = 3;
const sun = new THREE.Mesh(new THREE.SphereGeometry(earthRadius * sunVisualScale, 64, 32), sunMaterial);
sun.position.copy(pointLight.position);
scene.add(sun);

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

    const earthOrbitRotation = (delta * Math.PI * 2) / (24 * 365);
    sunPivot.rotation.y += earthOrbitRotation;

    const moonOrbitRotation = (delta * Math.PI * 2) / (24 * 28);
    moonGroup.rotation.y += moonOrbitRotation;

    uniforms["time"].value += 0.2 * delta;
    sun.rotation.y += 0.1 * delta;

    controls.update();

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();
